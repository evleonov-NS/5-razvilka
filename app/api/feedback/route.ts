import { NextResponse } from "next/server";
import { z } from "zod";
import { validateHoneypot } from "react-honeypot-field/validate";
import { trackEvent } from "@/lib/analytics";
import { getCurrentUser } from "@/lib/auth";
import { forbiddenResponse, requireOwner } from "@/lib/owner";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const postSchema = z.object({
  message: z.string().trim().min(1, "Сообщение обязательно").max(5000),
  email: z
    .string()
    .trim()
    .email("Некорректный email")
    .max(320)
    .optional()
    .or(z.literal("")),
  // honeypot: боты заполняют; люди не видят
  website: z.string().optional().default(""),
  _mountedAt: z.number().finite().optional(),
});

/** Публичная отправка ОС. Auth необязателен. */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = postSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Некорректные данные",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // Тихий отказ: боту отвечаем успехом, в БД не пишем
    if (parsed.data._mountedAt == null) {
      return NextResponse.json({ ok: true });
    }
    const hp = validateHoneypot({
      fieldValue: parsed.data.website,
      mountedAt: parsed.data._mountedAt,
      submittedAt: Date.now(),
      timeThreshold: 1500,
    });
    if (!hp.ok) {
      return NextResponse.json({ ok: true });
    }

    const user = await getCurrentUser();
    const email =
      parsed.data.email && parsed.data.email.length > 0
        ? parsed.data.email
        : null;

    const row = await prisma.feedbackMessage.create({
      data: {
        message: parsed.data.message,
        email,
        userId: user?.id ?? null,
      },
    });

    await trackEvent("SUBMIT_FEEDBACK", user?.id ?? null, {
      feedbackId: row.id,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/feedback:", err);
    return NextResponse.json(
      { error: "Не удалось отправить сообщение" },
      { status: 500 },
    );
  }
}

/** Inbox — только владелец. */
export async function GET() {
  try {
    await requireOwner();
    const items = await prisma.feedbackMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        message: true,
        email: true,
        userId: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    });

    return NextResponse.json({
      items: items.map((item) => ({
        id: item.id,
        message: item.message,
        email: item.email,
        userEmail: item.user?.email ?? null,
        createdAt: item.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return forbiddenResponse();
    }
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }
    console.error("GET /api/feedback:", err);
    return NextResponse.json(
      { error: "Не удалось загрузить сообщения" },
      { status: 500 },
    );
  }
}
