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
import { buildTreeSystemPrompt } from "@/lib/prompts";
import { TreeResponseSchema } from "@/lib/validators";

export const runtime = "nodejs";

const idSchema = z.string().uuid();

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Генерация дерева развилок (промпт 9.2).
 * Кредит платформы не списываем — follow-up к уже созданному разбору.
 */
export async function POST(_request: Request, context: RouteContext) {
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

    const decision = await prisma.decision.findFirst({
      where: { id: decisionId, userId: sessionUser.id },
      select: {
        id: true,
        title: true,
        context: true,
        horizon: true,
        tree: true,
        scenarios: { select: { id: true }, take: 1 },
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

    // Идемпотентность: дерево уже есть — отдаём без повторного вызова LLM
    if (decision.tree != null) {
      const existing = TreeResponseSchema.safeParse(decision.tree);
      if (existing.success) {
        return NextResponse.json({
          tree: existing.data,
          alreadyExists: true,
        });
      }
      // Битый JSON в БД — перегенерируем ниже
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

    const systemPrompt = buildTreeSystemPrompt({
      title: decision.title,
      context: decision.context,
      horizon: decision.horizon,
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
      console.error("POST /api/decisions/[id]/tree: ошибка вызова LLM", err);
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
        "POST /api/decisions/[id]/tree: невалидный JSON от LLM",
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

    const validated = TreeResponseSchema.safeParse(jsonParsed.data);
    if (!validated.success) {
      console.error(
        "POST /api/decisions/[id]/tree: ответ LLM не прошёл Zod",
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

    const tree = validated.data;

    await prisma.decision.update({
      where: { id: decisionId },
      data: { tree },
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

    return NextResponse.json({ tree, alreadyExists: false });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("POST /api/decisions/[id]/tree:", err);
    return NextResponse.json(
      { error: "Не удалось сохранить дерево. Попробуйте снова." },
      { status: 500 },
    );
  }
}
