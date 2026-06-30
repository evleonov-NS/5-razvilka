import { NextRequest, NextResponse } from "next/server";
import { getViewDbClient } from "@/lib/view-db/client";
import { getDatabaseUrl, maskDatabaseUrl } from "@/lib/view-db/config";
import { isViewDbEnabled, viewDbDisabledResponse } from "@/lib/view-db/guard";
import { resolveDbProfile } from "@/lib/view-db/request";
import { apiErrorMessage, listPublicTables } from "@/lib/view-db/sql";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isViewDbEnabled()) return viewDbDisabledResponse();

  try {
    const profile = await resolveDbProfile(
      request.nextUrl.searchParams.get("profile"),
    );
    const client = getViewDbClient(profile);
    const tables = await listPublicTables(client);
    const url = getDatabaseUrl(profile);

    return NextResponse.json({
      profile,
      connection: maskDatabaseUrl(url),
      tables,
    });
  } catch (error) {
    return NextResponse.json({ error: apiErrorMessage(error) }, { status: 500 });
  }
}
