/**
 * Запись и агрегация стоимости LLM-запросов.
 */
import type { LlmProviderKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  estimateCostUsdMicros,
  formatUsd,
  microsToUsd,
} from "@/lib/llm/providers";

/** Скользящие окна: 24ч / 7д / 30д (ADR-027). */
export type UsagePeriodKey = "day" | "week" | "month";

const PERIOD_MS: Record<UsagePeriodKey, number> = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
};

export function getUsdRubRate(): number | null {
  const raw = process.env.USD_RUB_RATE?.trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function formatRub(usdMicros: number, rate: number): string {
  const rub = microsToUsd(usdMicros) * rate;
  if (rub < 0.01 && rub > 0) return `≈₽${rub.toFixed(2)}`;
  return `₽${rub.toFixed(2)}`;
}

export type PeriodCost = {
  key: UsagePeriodKey;
  label: string;
  requestCount: number;
  costUsdMicros: number;
  costUsdLabel: string;
  costRubLabel: string | null;
};

async function aggregatePeriod(
  where: { userId?: string; billedTo?: string; createdAt: { gte: Date } },
  key: UsagePeriodKey,
  rate: number | null,
): Promise<PeriodCost> {
  const labels: Record<UsagePeriodKey, string> = {
    day: "Сутки",
    week: "7 дней",
    month: "30 дней",
  };
  const agg = await prisma.llmUsage.aggregate({
    where,
    _count: { _all: true },
    _sum: { costUsdMicros: true },
  });
  const costUsdMicros = agg._sum.costUsdMicros ?? 0;
  return {
    key,
    label: labels[key],
    requestCount: agg._count._all,
    costUsdMicros,
    costUsdLabel: formatUsd(costUsdMicros),
    costRubLabel: rate ? formatRub(costUsdMicros, rate) : null,
  };
}

export type UsagePeriodsSummary = {
  rate: number | null;
  rateLabel: string | null;
  personal: PeriodCost[];
  /** Только для владельца: сумма billedTo=PLATFORM. */
  platform: PeriodCost[] | null;
};

export async function getUsagePeriodsSummary(
  userId: string,
  options: { includePlatform?: boolean } = {},
): Promise<UsagePeriodsSummary> {
  const rate = getUsdRubRate();
  const rateLabel = rate
    ? `оценка по курсу USD/RUB = ${rate} (env USD_RUB_RATE)`
    : null;

  const personal = await Promise.all(
    (["day", "week", "month"] as const).map((key) =>
      aggregatePeriod(
        { userId, createdAt: { gte: new Date(Date.now() - PERIOD_MS[key]) } },
        key,
        rate,
      ),
    ),
  );

  let platform: PeriodCost[] | null = null;
  if (options.includePlatform) {
    platform = await Promise.all(
      (["day", "week", "month"] as const).map((key) =>
        aggregatePeriod(
          {
            billedTo: "PLATFORM",
            createdAt: { gte: new Date(Date.now() - PERIOD_MS[key]) },
          },
          key,
          rate,
        ),
      ),
    );
  }

  return { rate, rateLabel, personal, platform };
}

export type RecordUsageInput = {
  userId: string;
  provider: LlmProviderKind;
  model: string;
  promptTokens: number;
  completionTokens: number;
  billedTo: "PLATFORM" | "USER";
  decisionId?: string | null;
};

export async function recordLlmUsage(input: RecordUsageInput) {
  const costUsdMicros = estimateCostUsdMicros(
    input.provider,
    input.model,
    input.promptTokens,
    input.completionTokens,
  );

  const row = await prisma.llmUsage.create({
    data: {
      userId: input.userId,
      provider: input.provider,
      model: input.model,
      promptTokens: input.promptTokens,
      completionTokens: input.completionTokens,
      costUsdMicros,
      billedTo: input.billedTo,
      decisionId: input.decisionId ?? null,
    },
  });

  // Списываем платформенный кредит только при явном consumePlatformCredit
  return row;
}

/** Списать один платформенный кредит (лимит FREE_PLATFORM_CREDITS). */
export async function consumePlatformCredit(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { platformCreditsUsed: { increment: 1 } },
  });
}

export type UsageSummary = {
  requestCount: number;
  promptTokens: number;
  completionTokens: number;
  costUsdMicros: number;
  costLabel: string;
  recent: Array<{
    id: string;
    provider: LlmProviderKind;
    model: string;
    promptTokens: number;
    completionTokens: number;
    costUsdMicros: number;
    costLabel: string;
    billedTo: string;
    createdAt: string;
  }>;
};

export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const [agg, recent] = await Promise.all([
    prisma.llmUsage.aggregate({
      where: { userId },
      _count: { _all: true },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        costUsdMicros: true,
      },
    }),
    prisma.llmUsage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        provider: true,
        model: true,
        promptTokens: true,
        completionTokens: true,
        costUsdMicros: true,
        billedTo: true,
        createdAt: true,
      },
    }),
  ]);

  const costUsdMicros = agg._sum.costUsdMicros ?? 0;

  return {
    requestCount: agg._count._all,
    promptTokens: agg._sum.promptTokens ?? 0,
    completionTokens: agg._sum.completionTokens ?? 0,
    costUsdMicros,
    costLabel: formatUsd(costUsdMicros),
    recent: recent.map((r) => ({
      id: r.id,
      provider: r.provider,
      model: r.model,
      promptTokens: r.promptTokens,
      completionTokens: r.completionTokens,
      costUsdMicros: r.costUsdMicros,
      costLabel: formatUsd(r.costUsdMicros),
      billedTo: r.billedTo,
      createdAt: r.createdAt.toISOString(),
    })),
  };
}
