import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  consumePlatformCredit,
  getQuotaStatus,
  isLlmConfigured,
  isOwnerEmail,
} from "@/lib/llm";
import { CreateDecisionInputSchema } from "@/lib/validators";

export const runtime = "nodejs";

/**
 * Создание решения. Полная генерация Scenario/FailureMode — этап 4.
 * Квота: owner безлимит; свой ключ — безлимит; иначе 1 бесплатный разбор.
 */
export async function POST(request: Request) {
  try {
    const sessionUser = await requireUser();
    const body: unknown = await request.json();
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
        llmApiKeyEnc: true,
        platformCreditsUsed: true,
      },
    });

    const quota = getQuotaStatus(dbUser);
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

    const { title, context, horizon, type } = parsed.data;

    const decision = await prisma.decision.create({
      data: {
        userId: sessionUser.id,
        title,
        context,
        horizon,
        type,
      },
      select: { id: true },
    });

    // Пока нет этапа 4: списываем бесплатный кредит при создании карточки
    // (owner и свой ключ — не трогаем счётчик платформы).
    const usesPlatformSlot =
      !dbUser.llmApiKeyEnc && !isOwnerEmail(dbUser.email);
    if (usesPlatformSlot) {
      await consumePlatformCredit(sessionUser.id);
    }

    return NextResponse.json({
      id: decision.id,
      generated: false,
      llmReady: isLlmConfigured() || Boolean(dbUser.llmApiKeyEnc),
      quota: {
        freeRemaining: usesPlatformSlot
          ? Math.max(0, (quota.freeRemaining ?? 1) - 1)
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
