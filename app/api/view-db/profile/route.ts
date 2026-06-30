import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDbProfileInfos } from "@/lib/view-db/config";
import { dbProfileCookieOptions } from "@/lib/view-db/cookies";
import { isViewDbEnabled, viewDbDisabledResponse } from "@/lib/view-db/guard";
import { parseDbProfile } from "@/lib/view-db/schemas";

export const runtime = "nodejs";

export async function GET() {
  if (!isViewDbEnabled()) return viewDbDisabledResponse();

  return NextResponse.json({ profiles: getDbProfileInfos() });
}

export async function POST(request: NextRequest) {
  if (!isViewDbEnabled()) return viewDbDisabledResponse();

  try {
    const body = await request.json();
    const profile = parseDbProfile(body.profile);
    const infos = getDbProfileInfos();
    const info = infos.find((p) => p.id === profile);

    if (!info?.configured) {
      return NextResponse.json(
        { error: `Профиль «${profile}» не настроен в .env` },
        { status: 400 },
      );
    }

    const store = await cookies();
    store.set(dbProfileCookieOptions(profile));

    return NextResponse.json({ ok: true, profile });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Ошибка запроса" },
      { status: 400 },
    );
  }
}
