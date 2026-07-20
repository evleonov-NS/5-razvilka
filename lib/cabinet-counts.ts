import { prisma } from "@/lib/prisma";

export type CabinetCounts = {
  open: number;
  resolved: number;
};

/** Счётчики для сайдбара: открытые / решённые. */
export async function getCabinetCounts(userId: string): Promise<CabinetCounts> {
  const [open, resolved] = await Promise.all([
    prisma.decision.count({ where: { userId, status: "OPEN" } }),
    prisma.decision.count({ where: { userId, status: "RESOLVED" } }),
  ]);
  return { open, resolved };
}
