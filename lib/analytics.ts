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
  /** Средняя длительность визитов, усреднённая по пользователям. */
  avgDurationMsPerUser: number | null;
  /** Все события с начала учёта — для «лога использования». */
  eventCountsAll: Array<{ type: AnalyticsEventType; count: number }>;
  eventsTotal: number;
  trackingSince: string | null;
  unusedEventTypes: AnalyticsEventType[];
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

/** Все типы событий — для подписей и «ни разу не использовалось». */
export const ANALYTICS_EVENT_TYPES: AnalyticsEventType[] = [
  "LOGIN",
  "LOGOUT",
  "CREATE_DECISION",
  "GENERATE_TREE",
  "RESOLVE",
  "OPEN_SETTINGS",
  "SUBMIT_FEEDBACK",
  "LOAD_DEMO",
  "DELETE_DEMO",
];

export const ANALYTICS_EVENT_LABELS: Record<AnalyticsEventType, string> = {
  LOGIN: "Вход",
  LOGOUT: "Выход",
  CREATE_DECISION: "Новый разбор",
  GENERATE_TREE: "Дерево развилок",
  RESOLVE: "Ревью по исходу",
  OPEN_SETTINGS: "Настройки",
  SUBMIT_FEEDBACK: "Обратная связь",
  LOAD_DEMO: "Загрузка демо",
  DELETE_DEMO: "Удаление демо",
};

function since(ms: number): Date {
  return new Date(Date.now() - ms);
}

function durationMs(startedAt: Date, endedAt: Date | null, lastSeenAt: Date): number {
  const end = endedAt ?? lastSeenAt;
  return Math.max(0, end.getTime() - startedAt.getTime());
}

async function avgVisitDurationPerUser(): Promise<number | null> {
  const rows = await prisma.visitSession.findMany({
    select: {
      userId: true,
      startedAt: true,
      endedAt: true,
      lastSeenAt: true,
    },
  });
  if (rows.length === 0) return null;

  const byUser = new Map<string, number[]>();
  for (const r of rows) {
    const list = byUser.get(r.userId) ?? [];
    list.push(durationMs(r.startedAt, r.endedAt, r.lastSeenAt));
    byUser.set(r.userId, list);
  }

  let sumOfUserAvgs = 0;
  for (const durations of byUser.values()) {
    const userAvg =
      durations.reduce((acc, d) => acc + d, 0) / durations.length;
    sumOfUserAvgs += userAvg;
  }

  return Math.round(sumOfUserAvgs / byUser.size);
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

  const [
    usersTotal,
    visitsDay,
    visitsWeek,
    avgDurationMsPerUser,
    eventCountsDay,
    eventCountsWeek,
    eventCountsAll,
    firstEvent,
    recent,
  ] = await Promise.all([
    prisma.user.count({
      where: { email: { not: "community@razvilka.local" } },
    }),
    prisma.visitSession.count({ where: { startedAt: { gte: day } } }),
    prisma.visitSession.count({ where: { startedAt: { gte: week } } }),
    avgVisitDurationPerUser(),
    eventCounts(day),
    eventCounts(week),
    eventCounts(new Date(0)),
    prisma.analyticsEvent.findFirst({
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.visitSession.findMany({
      orderBy: { startedAt: "desc" },
      take: 30,
      include: { user: { select: { email: true } } },
    }),
  ]);

  const used = new Set(eventCountsAll.map((e) => e.type));
  const unusedEventTypes = ANALYTICS_EVENT_TYPES.filter((t) => !used.has(t));
  const eventsTotal = eventCountsAll.reduce((acc, e) => acc + e.count, 0);

  return {
    usersTotal,
    visitsDay,
    visitsWeek,
    avgDurationMsPerUser,
    eventCountsAll,
    eventsTotal,
    trackingSince: firstEvent?.createdAt.toISOString() ?? null,
    unusedEventTypes,
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
