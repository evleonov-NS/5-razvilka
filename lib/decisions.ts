import type { DecisionStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const DECISIONS_PAGE_SIZE = 10;

export type DecisionListItem = {
  id: string;
  title: string;
  context: string;
  horizon: string;
  status: string;
  createdAt: Date;
};

export type DecisionListResult = {
  items: DecisionListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Список решений текущего пользователя с фильтром, поиском и пагинацией. */
export async function listUserDecisions(
  userId: string,
  opts: {
    status?: DecisionStatus;
    q?: string;
    page?: number;
  } = {},
): Promise<DecisionListResult> {
  const page = Math.max(1, opts.page ?? 1);
  const q = opts.q?.trim();

  const where: Prisma.DecisionWhereInput = {
    userId,
    ...(opts.status ? { status: opts.status } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { context: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.decision.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * DECISIONS_PAGE_SIZE,
      take: DECISIONS_PAGE_SIZE,
      select: {
        id: true,
        title: true,
        context: true,
        horizon: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.decision.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize: DECISIONS_PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / DECISIONS_PAGE_SIZE)),
  };
}
