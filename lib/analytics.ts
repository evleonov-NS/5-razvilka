/**
 * Лог интереса: визиты и события. Писать только с сервера.
 */
import type { AnalyticsEventType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function trackEvent(
  type: AnalyticsEventType,
  userId?: string | null,
  meta?: Prisma.InputJsonValue,
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        type,
        userId: userId ?? null,
        meta: meta ?? undefined,
      },
    });
    if (userId) {
      await touchVisitSession(userId);
    }
  } catch (err) {
    console.error("analytics.trackEvent:", type, err);
  }
}

/** Открыть новый визит при логине; предыдущие открытые — закрыть. */
export async function startVisitSession(userId: string): Promise<void> {
  try {
    const now = new Date();
    await prisma.visitSession.updateMany({
      where: { userId, endedAt: null },
      data: { endedAt: now, lastSeenAt: now },
    });
    await prisma.visitSession.create({
      data: { userId, startedAt: now, lastSeenAt: now },
    });
  } catch (err) {
    console.error("analytics.startVisitSession:", err);
  }
}

export async function endVisitSessions(userId: string): Promise<void> {
  try {
    const now = new Date();
    await prisma.visitSession.updateMany({
      where: { userId, endedAt: null },
      data: { endedAt: now, lastSeenAt: now },
    });
  } catch (err) {
    console.error("analytics.endVisitSessions:", err);
  }
}

async function touchVisitSession(userId: string): Promise<void> {
  const open = await prisma.visitSession.findFirst({
    where: { userId, endedAt: null },
    orderBy: { startedAt: "desc" },
    select: { id: true },
  });
  if (open) {
    await prisma.visitSession.update({
      where: { id: open.id },
      data: { lastSeenAt: new Date() },
    });
  }
}

export type StatsSummary = {
  usersTotal: number;
  visitsDay: number;
  visitsWeek: number;
  avgDurationMsDay: number | null;
  avgDurationMsWeek: number | null;
  eventCountsDay: Array<{ type: AnalyticsEventType; count: number }>;
  eventCountsWeek: Array<{ type: AnalyticsEventType; count: number }>;
  recentVisits: Array<{
    id: string;
    userId: string;
    email: string;
    startedAt: string;
    endedAt: string | null;
    durationMs: number;
  }>;
};

function since(ms: number): Date {
  return new Date(Date.now() - ms);
}

function durationMs(startedAt: Date, endedAt: Date | null, lastSeenAt: Date): number {
  const end = endedAt ?? lastSeenAt;
  return Math.max(0, end.getTime() - startedAt.getTime());
}

async function avgVisitDuration(from: Date): Promise<number | null> {
  const rows = await prisma.visitSession.findMany({
    where: { startedAt: { gte: from } },
    select: { startedAt: true, endedAt: true, lastSeenAt: true },
  });
  if (rows.length === 0) return null;
  const sum = rows.reduce(
    (acc, r) => acc + durationMs(r.startedAt, r.endedAt, r.lastSeenAt),
    0,
  );
  return Math.round(sum / rows.length);
}

async function eventCounts(from: Date) {
  const grouped = await prisma.analyticsEvent.groupBy({
    by: ["type"],
    where: { createdAt: { gte: from } },
    _count: { _all: true },
  });
  return grouped
    .map((g) => ({ type: g.type, count: g._count._all }))
    .sort((a, b) => b.count - a.count);
}

/** Агрегаты для owner-only UI. Email пользователей — только здесь. */
export async function getStatsSummary(): Promise<StatsSummary> {
  const day = since(24 * 60 * 60 * 1000);
  const week = since(7 * 24 * 60 * 60 * 1000);

  const [usersTotal, visitsDay, visitsWeek, avgDurationMsDay, avgDurationMsWeek, eventCountsDay, eventCountsWeek, recent] =
    await Promise.all([
      prisma.user.count({
        where: { email: { not: "community@razvilka.local" } },
      }),
      prisma.visitSession.count({ where: { startedAt: { gte: day } } }),
      prisma.visitSession.count({ where: { startedAt: { gte: week } } }),
      avgVisitDuration(day),
      avgVisitDuration(week),
      eventCounts(day),
      eventCounts(week),
      prisma.visitSession.findMany({
        orderBy: { startedAt: "desc" },
        take: 30,
        include: { user: { select: { email: true } } },
      }),
    ]);

  return {
    usersTotal,
    visitsDay,
    visitsWeek,
    avgDurationMsDay,
    avgDurationMsWeek,
    eventCountsDay,
    eventCountsWeek,
    recentVisits: recent.map((v) => ({
      id: v.id,
      userId: v.userId,
      email: v.user.email,
      startedAt: v.startedAt.toISOString(),
      endedAt: v.endedAt?.toISOString() ?? null,
      durationMs: durationMs(v.startedAt, v.endedAt, v.lastSeenAt),
    })),
  };
}
