import { NextResponse } from "next/server";
import type { ScenarioKind } from "@prisma/client";
import { trackEvent } from "@/lib/analytics";
import { getPlatformKeyEnabled } from "@/lib/app-settings";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { parseJsonSafe } from "@/lib/json";
import {
  chatCompletion,
  consumePlatformCredit,
  getQuotaStatus,
  isOwnerEmail,
  LlmResolveError,
  recordLlmUsage,
  resolveLlmCredentials,
} from "@/lib/llm";
import { prisma } from "@/lib/prisma";
import { buildScenariosSystemPrompt } from "@/lib/prompts";
import {
  CreateDecisionInputSchema,
  ScenarioResponseSchema,
} from "@/lib/validators";
import { SCENARIO_KIND_ORDER } from "@/lib/decision-labels";

export const runtime = "nodejs";

const SCENARIO_ORDER_IDX: Record<ScenarioKind, number> = {
  OPTIMISTIC: 0,
  BASE: 1,
  PESSIMISTIC: 2,
};

/**
 * Создание решения: промпт 9.1 → Zod → транзакция Decision + Scenario + FailureMode.
 * При невалидном LLM — не сохраняем, логируем сырой ответ.
 */
export async function POST(request: Request) {
  try {
    const sessionUser = await requireUser();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Ожидается JSON-тело запроса" },
        { status: 400 },
      );
    }

    const parsed = CreateDecisionInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Некорректные данные",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const dbUser = await prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: {
        email: true,
        llmProvider: true,
        llmModel: true,
        llmApiKeyEnc: true,
        platformCreditsUsed: true,
      },
    });

    const platformKeyEnabled = await getPlatformKeyEnabled();
    const quota = getQuotaStatus(dbUser, { platformKeyEnabled });
    if (!quota.canGenerate) {
      return NextResponse.json(
        {
          error: quota.message ?? "Нет доступа к генерации",
          code: quota.reason ?? "NEED_API_KEY",
          settingsPath: "/cabinet/settings",
        },
        { status: 403 },
      );
    }

    let credentials;
    try {
      credentials = await resolveLlmCredentials(dbUser, { platformKeyEnabled });
    } catch (err) {
      if (err instanceof LlmResolveError) {
        return NextResponse.json(
          {
            error: err.message,
            code: err.code,
            settingsPath: "/cabinet/settings",
          },
          { status: 403 },
        );
      }
      throw err;
    }

    const { title, context, horizon, type } = parsed.data;

    const systemPrompt = buildScenariosSystemPrompt({
      title,
      context,
      horizon,
      type,
    });

    let llmResult;
    try {
      llmResult = await chatCompletion(
        [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              "Верни только JSON по схеме из инструкции. Без пояснений и markdown.",
          },
        ],
        credentials,
        { temperature: 0.7, timeoutMs: 90_000 },
      );
    } catch (err) {
      console.error("POST /api/decisions: ошибка вызова LLM", err);
      return NextResponse.json(
        {
          error:
            "Не удалось получить ответ модели. Проверьте ключ API или попробуйте снова.",
          code: "LLM_REQUEST_FAILED",
        },
        { status: 502 },
      );
    }

    const jsonParsed = parseJsonSafe(llmResult.content);
    if (!jsonParsed.ok) {
      console.error(
        "POST /api/decisions: невалидный JSON от LLM",
        jsonParsed.error,
        "\n--- raw ---\n",
        jsonParsed.raw,
      );
      return NextResponse.json(
        {
          error:
            "Не удалось разобрать ответ модели. Попробуйте ещё раз.",
          code: "LLM_JSON_INVALID",
        },
        { status: 502 },
      );
    }

    const validated = ScenarioResponseSchema.safeParse(jsonParsed.data);
    if (!validated.success) {
      console.error(
        "POST /api/decisions: ответ LLM не прошёл Zod",
        validated.error.flatten(),
        "\n--- raw ---\n",
        llmResult.content,
      );
      return NextResponse.json(
        {
          error:
            "Ответ модели не соответствует ожидаемой схеме. Попробуйте ещё раз.",
          code: "LLM_SCHEMA_INVALID",
        },
        { status: 422 },
      );
    }

    const { scenarios, failure_modes } = validated.data;

    // Фиксированный порядок kind, даже если модель переставила элементы
    const scenariosSorted = [...scenarios].sort(
      (a, b) =>
        (SCENARIO_ORDER_IDX[a.kind as ScenarioKind] ?? 99) -
        (SCENARIO_ORDER_IDX[b.kind as ScenarioKind] ?? 99),
    );

    const decision = await prisma.$transaction(async (tx) => {
      const created = await tx.decision.create({
        data: {
          userId: sessionUser.id,
          title,
          context,
          horizon,
          type,
          scenarios: {
            create: scenariosSorted.map((s, index) => ({
              kind: s.kind as ScenarioKind,
              likelihood: s.likelihood,
              narrative: s.narrative,
              orderIdx:
                SCENARIO_ORDER_IDX[s.kind as ScenarioKind] ?? index,
            })),
          },
          failureModes: {
            create: failure_modes.map((fm, index) => ({
              cause: fm.cause,
              prevention: fm.prevention,
              orderIdx: index,
            })),
          },
        },
        select: {
          id: true,
          scenarios: {
            select: {
              id: true,
              kind: true,
              likelihood: true,
              narrative: true,
              orderIdx: true,
            },
            orderBy: { orderIdx: "asc" },
          },
          failureModes: {
            select: {
              id: true,
              cause: true,
              prevention: true,
              orderIdx: true,
            },
            orderBy: { orderIdx: "asc" },
          },
        },
      });

      return created;
    });

    // Платформенный ключ: пишем usage и (для не-owner) списываем бесплатный кредит.
    // Свой ключ (USER) — usage тоже пишем для блока стоимости в настройках, кредит не трогаем.
    await recordLlmUsage({
      userId: sessionUser.id,
      provider: llmResult.provider,
      model: llmResult.model,
      promptTokens: llmResult.promptTokens,
      completionTokens: llmResult.completionTokens,
      billedTo: llmResult.billedTo,
      decisionId: decision.id,
    });

    const usesPlatformSlot =
      llmResult.billedTo === "PLATFORM" && !isOwnerEmail(dbUser.email);
    if (usesPlatformSlot) {
      await consumePlatformCredit(sessionUser.id);
    }

    // Убедиться, что на экране порядок OPTIMISTIC → BASE → PESSIMISTIC
    const kindRank = new Map(
      SCENARIO_KIND_ORDER.map((k, i) => [k, i] as const),
    );
    const scenariosOut = [...decision.scenarios].sort(
      (a, b) =>
        (kindRank.get(a.kind as (typeof SCENARIO_KIND_ORDER)[number]) ?? 99) -
        (kindRank.get(b.kind as (typeof SCENARIO_KIND_ORDER)[number]) ?? 99),
    );

    await trackEvent("CREATE_DECISION", sessionUser.id, {
      decisionId: decision.id,
    });

    return NextResponse.json({
      id: decision.id,
      generated: true,
      scenarios: scenariosOut,
      failureModes: decision.failureModes,
      quota: {
        freeRemaining: usesPlatformSlot
          ? Math.max(0, (quota.freeRemaining ?? 0) - 1)
          : quota.freeRemaining,
        hasOwnKey: quota.hasOwnKey,
        isOwner: quota.isOwner,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("POST /api/decisions:", err);
    return NextResponse.json(
      { error: "Не удалось сохранить решение. Попробуйте снова." },
      { status: 500 },
    );
  }
}
