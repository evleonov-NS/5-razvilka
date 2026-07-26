import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getAppSettings,
  setPlatformKeyEnabled,
} from "@/lib/app-settings";
import { forbiddenResponse, requireOwner } from "@/lib/owner";

export const runtime = "nodejs";

const putSchema = z.object({
  platformKeyEnabled: z.boolean(),
});

/** Owner-only: флаг «токен по умолчанию» / платформенный ключ для остальных. */
export async function GET() {
  try {
    await requireOwner();
    const settings = await getAppSettings();
    return NextResponse.json({
      platformKeyEnabled: settings.platformKeyEnabled,
      updatedAt: settings.updatedAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return forbiddenResponse();
    }
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }
    console.error("GET /api/settings/app:", err);
    return NextResponse.json(
      { error: "Не удалось загрузить настройки" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    await requireOwner();
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

    const settings = await setPlatformKeyEnabled(
      parsed.data.platformKeyEnabled,
    );
    return NextResponse.json({
      ok: true,
      platformKeyEnabled: settings.platformKeyEnabled,
      updatedAt: settings.updatedAt.toISOString(),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return forbiddenResponse();
    }
    if (err instanceof Error && err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });
    }
    console.error("PUT /api/settings/app:", err);
    return NextResponse.json(
      { error: "Не удалось сохранить настройки" },
      { status: 500 },
    );
  }
}
