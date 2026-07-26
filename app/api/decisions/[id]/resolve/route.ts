import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { parseJsonSafe } from "@/lib/json";
import {
  chatCompletion,
  LlmResolveError,
  recordLlmUsage,
  resolveLlmCredentials,
} from "@/lib/llm";
import { prisma } from "@/lib/prisma";
import { buildReviewSystemPrompt } from "@/lib/prompts";
import {
  ResolveDecisionInputSchema,
  ReviewResponseSchema,
} from "@/lib/validators";

export const runtime = "nodejs";

const idSchema = z.string().uuid();

type RouteContext = {
  params: Promise<{ id: string }>;
};

function reviewPayload(data: {
  outcome: string;
  reviewClosestScenario: "OPTIMISTIC" | "BASE" | "PESSIMISTIC";
  reviewMissed: string;
  lesson: string;
}) {
  return {
    outcome: data.outcome,
    closestScenario: data.reviewClosestScenario,
    missed: data.reviewMissed,
    lesson: data.lesson,
  };
}

/**
 * Ревью по исходу (промпт 9.3): outcome → closest + missed + lesson, status=RESOLVED.
 * Кредит платформы не списываем — follow-up к уже созданному разбору.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const sessionUser = await requireUser();
    const { id: rawId } = await context.params;

    const idParsed = idSchema.safeParse(rawId);
    if (!idParsed.success) {
      return NextResponse.json(
        { error: "Некорректный идентификатор" },
        { status: 400 },
      );
    }

    const decisionId = idParsed.data;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Ожидается JSON-тело запроса" },
        { status: 400 },
      );
    }

    const inputParsed = ResolveDecisionInputSchema.safeParse(body);
    if (!inputParsed.success) {
      return NextResponse.json(
        {
          error: "Некорректные данные",
          details: inputParsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { outcome } = inputParsed.data;

    const decision = await prisma.decision.findFirst({
      where: { id: decisionId, userId: sessionUser.id },
      select: {
        id: true,
        title: true,
        status: true,
        outcome: true,
        lesson: true,
        reviewClosestScenario: true,
        reviewMissed: true,
        scenarios: {
          select: {
            kind: true,
            likelihood: true,
            narrative: true,
            orderIdx: true,
          },
          orderBy: { orderIdx: "asc" },
        },
      },
    });

    if (!decision) {
      return NextResponse.json(
        { error: "Решение не найдено" },
        { status: 404 },
      );
    }

    if (decision.scenarios.length === 0) {
      return NextResponse.json(
        {
          error: "Сначала нужен разбор со сценариями",
          code: "ANALYSIS_REQUIRED",
        },
        { status: 409 },
      );
    }

    // Идемпотентность: уже RESOLVED с полным ревью — отдаём без LLM
    if (
      decision.status === "RESOLVED" &&
      decision.outcome &&
      decision.lesson &&
      decision.reviewClosestScenario &&
      decision.reviewMissed
    ) {
      return NextResponse.json({
        ...reviewPayload({
          outcome: decision.outcome,
          reviewClosestScenario: decision.reviewClosestScenario,
          reviewMissed: decision.reviewMissed,
          lesson: decision.lesson,
        }),
        alreadyExists: true,
      });
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

    let credentials;
    try {
      credentials = resolveLlmCredentials(dbUser, {
        skipFreeCreditCheck: true,
      });
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

    const systemPrompt = buildReviewSystemPrompt({
      title: decision.title,
      scenarios: decision.scenarios.map((s) => ({
        kind: s.kind,
        likelihood: s.likelihood,
        narrative: s.narrative,
      })),
      outcome,
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
        { temperature: 0.5, timeoutMs: 90_000 },
      );
    } catch (err) {
      console.error("POST /api/decisions/[id]/resolve: ошибка вызова LLM", err);
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
        "POST /api/decisions/[id]/resolve: невалидный JSON от LLM",
        jsonParsed.error,
        "\n--- raw ---\n",
        jsonParsed.raw,
      );
      return NextResponse.json(
        {
          error: "Не удалось разобрать ответ модели. Попробуйте ещё раз.",
          code: "LLM_JSON_INVALID",
        },
        { status: 502 },
      );
    }

    const validated = ReviewResponseSchema.safeParse(jsonParsed.data);
    if (!validated.success) {
      console.error(
        "POST /api/decisions/[id]/resolve: ответ LLM не прошёл Zod",
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

    const review = validated.data;
    const now = new Date();

    await prisma.decision.update({
      where: { id: decisionId },
      data: {
        outcome,
        reviewClosestScenario: review.closest_scenario,
        reviewMissed: review.missed,
        lesson: review.lesson,
        status: "RESOLVED",
        resolvedAt: now,
      },
    });

    await recordLlmUsage({
      userId: sessionUser.id,
      provider: llmResult.provider,
      model: llmResult.model,
      promptTokens: llmResult.promptTokens,
      completionTokens: llmResult.completionTokens,
      billedTo: llmResult.billedTo,
      decisionId,
    });

    return NextResponse.json({
      outcome,
      closestScenario: review.closest_scenario,
      missed: review.missed,
      lesson: review.lesson,
      alreadyExists: false,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("POST /api/decisions/[id]/resolve:", err);
    return NextResponse.json(
      { error: "Не удалось сохранить ревью. Попробуйте снова." },
      { status: 500 },
    );
  }
}
