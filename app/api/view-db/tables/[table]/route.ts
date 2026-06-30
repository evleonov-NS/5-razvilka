import { NextRequest, NextResponse } from "next/server";
import { getViewDbClient } from "@/lib/view-db/client";
import { isViewDbEnabled, viewDbDisabledResponse } from "@/lib/view-db/guard";
import { resolveDbProfile } from "@/lib/view-db/request";
import { paginationSchema, rowPayloadSchema } from "@/lib/view-db/schemas";
import {
  apiErrorMessage,
  assertValidTableName,
  deleteRow,
  fetchTableRows,
  getPrimaryKeyColumn,
  insertRow,
  updateRow,
} from "@/lib/view-db/sql";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ table: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  if (!isViewDbEnabled()) return viewDbDisabledResponse();

  try {
    const { table } = await context.params;
    assertValidTableName(table);

    const profile = await resolveDbProfile(
      request.nextUrl.searchParams.get("profile"),
    );
    const { page, pageSize } = paginationSchema.parse({
      page: request.nextUrl.searchParams.get("page") ?? 1,
      pageSize: request.nextUrl.searchParams.get("pageSize") ?? 20,
    });

    const client = getViewDbClient(profile);
    const data = await fetchTableRows(client, table, page, pageSize);

    return NextResponse.json({ profile, table, ...data });
  } catch (error) {
    return NextResponse.json({ error: apiErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  if (!isViewDbEnabled()) return viewDbDisabledResponse();

  try {
    const { table } = await context.params;
    assertValidTableName(table);

    const body = await request.json();
    const profile = await resolveDbProfile(body.profile);
    const data = rowPayloadSchema.parse(body.data);

    const client = getViewDbClient(profile);
    const row = await insertRow(client, table, data);

    return NextResponse.json({ row }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: apiErrorMessage(error) }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!isViewDbEnabled()) return viewDbDisabledResponse();

  try {
    const { table } = await context.params;
    assertValidTableName(table);

    const body = await request.json();
    const profile = await resolveDbProfile(body.profile);
    const id = String(body.id ?? "");
    const data = rowPayloadSchema.parse(body.data);

    if (!id) {
      return NextResponse.json({ error: "id обязателен" }, { status: 400 });
    }

    const client = getViewDbClient(profile);
    const primaryKey = await getPrimaryKeyColumn(client, table);
    const row = await updateRow(client, table, primaryKey, id, data);

    return NextResponse.json({ row });
  } catch (error) {
    return NextResponse.json({ error: apiErrorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!isViewDbEnabled()) return viewDbDisabledResponse();

  try {
    const { table } = await context.params;
    assertValidTableName(table);

    const body = await request.json();
    const profile = await resolveDbProfile(body.profile);
    const id = String(body.id ?? "");

    if (!id) {
      return NextResponse.json({ error: "id обязателен" }, { status: 400 });
    }

    const client = getViewDbClient(profile);
    const primaryKey = await getPrimaryKeyColumn(client, table);
    await deleteRow(client, table, primaryKey, id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: apiErrorMessage(error) }, { status: 400 });
  }
}
