/**
 * Запись и агрегация стоимости LLM-запросов.
 */
import type { LlmProviderKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { estimateCostUsdMicros, formatUsd } from "@/lib/llm/providers";

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

/** Один бесплатный/платформенный разбор для обычного пользователя. */
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
