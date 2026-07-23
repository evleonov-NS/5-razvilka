import { z } from "zod";
import { NextResponse } from "next/server";
import type { LlmProviderKind } from "@prisma/client";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  encryptSecret,
  getQuotaStatus,
  getUsageSummary,
  listProvidersPublic,
  maskApiKey,
  decryptSecret,
  getModel,
  getProvider,
} from "@/lib/llm";

export const runtime = "nodejs";

const putSchema = z.object({
  provider: z.enum(["DEEPSEEK", "QWEN", "OPENAI"]),
  model: z.string().trim().min(1).max(120),
  /** Новое значение ключа; null/undefined — не менять; "" — удалить. */
  apiKey: z.string().max(500).nullable().optional(),
});

function keyPreview(enc: string | null): string | null {
  if (!enc) return null;
  try {
    return maskApiKey(decryptSecret(enc));
  } catch {
    return "****";
  }
}

export async function GET() {
  try {
    const sessionUser = await requireUser();
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: sessionUser.id },
      select: {
        email: true,
        llmProvider: true,
        llmModel: true,
        llmApiKeyEnc: true,
        platformCreditsUsed: true,
      },
    });

    const quota = getQuotaStatus(user);
    const usage = await getUsageSummary(sessionUser.id);

    return NextResponse.json({
      providers: listProvidersPublic(),
      settings: {
        provider: user.llmProvider,
        model: user.llmModel,
        hasApiKey: Boolean(user.llmApiKeyEnc),
        apiKeyPreview: keyPreview(user.llmApiKeyEnc),
      },
      quota: {
        isOwner: quota.isOwner,
        hasOwnKey: quota.hasOwnKey,
        canGenerate: quota.canGenerate,
        freeLimit: quota.freeLimit,
        freeRemaining: quota.freeRemaining,
        platformCreditsUsed: quota.platformCreditsUsed,
        message: quota.message ?? null,
        reason: quota.reason ?? null,
      },
      usage,
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("GET /api/settings/llm:", err);
    return NextResponse.json(
      { error: "Не удалось загрузить настройки LLM" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const sessionUser = await requireUser();
    const body: unknown = await request.json();
    const parsed = putSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Некорректные данные",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { provider, model, apiKey } = parsed.data;
    const providerInfo = getProvider(provider as LlmProviderKind);

    if (!getModel(provider as LlmProviderKind, model)) {
      return NextResponse.json(
        {
          error: `Модель «${model}» недоступна для ${providerInfo.label}`,
        },
        { status: 400 },
      );
    }

    const data: {
      llmProvider: LlmProviderKind;
      llmModel: string;
      llmApiKeyEnc?: string | null;
    } = {
      llmProvider: provider as LlmProviderKind,
      llmModel: model,
    };

    if (apiKey !== undefined && apiKey !== null) {
      const trimmed = apiKey.trim();
      data.llmApiKeyEnc = trimmed ? encryptSecret(trimmed) : null;
    }

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data,
      select: {
        email: true,
        llmProvider: true,
        llmModel: true,
        llmApiKeyEnc: true,
        platformCreditsUsed: true,
      },
    });

    const quota = getQuotaStatus(updated);

    return NextResponse.json({
      ok: true,
      settings: {
        provider: updated.llmProvider,
        model: updated.llmModel,
        hasApiKey: Boolean(updated.llmApiKeyEnc),
        apiKeyPreview: keyPreview(updated.llmApiKeyEnc),
      },
      quota: {
        isOwner: quota.isOwner,
        hasOwnKey: quota.hasOwnKey,
        canGenerate: quota.canGenerate,
        freeLimit: quota.freeLimit,
        freeRemaining: quota.freeRemaining,
        platformCreditsUsed: quota.platformCreditsUsed,
        message: quota.message ?? null,
        reason: quota.reason ?? null,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return unauthorizedResponse();
    }
    console.error("PUT /api/settings/llm:", err);
    return NextResponse.json(
      { error: "Не удалось сохранить настройки LLM" },
      { status: 500 },
    );
  }
}
