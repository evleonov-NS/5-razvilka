import { z } from "zod";
import { NextResponse } from "next/server";
import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const createDecisionSchema = z.object({
  title: z.string().trim().min(1, "Укажите название").max(200),
  context: z.string().trim().min(1, "Опишите контекст").max(12_000),
  horizon: z.enum(["THREE_MONTHS", "ONE_YEAR", "FIVE_YEARS"]),
  type: z.enum(["DECISION", "HABIT"]),
});

/**
 * Создание решения. LLM-генерация сценариев — этап 3–4;
 * сейчас сохраняем карточку и возвращаем id для перехода на экран результата.
 */
export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body: unknown = await request.json();
    const parsed = createDecisionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Некорректные данные",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { title, context, horizon, type } = parsed.data;

    const decision = await prisma.decision.create({
      data: {
        userId: user.id,
        title,
        context,
        horizon,
        type,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: decision.id, generated: false });
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
