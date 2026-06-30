import { PrismaClient, Prisma } from "@prisma/client";

export type TableInfo = {
  name: string;
  rowCount: number;
};

export type ColumnInfo = {
  name: string;
  dataType: string;
  udtName: string;
  isNullable: boolean;
  columnDefault: string | null;
};

const TABLE_NAME_RE = /^[A-Za-z][A-Za-z0-9_]*$/;
const COLUMN_NAME_RE = /^[A-Za-z][A-Za-z0-9_]*$/;

export function assertValidTableName(name: string): void {
  if (!TABLE_NAME_RE.test(name)) {
    throw new Error(`Недопустимое имя таблицы: ${name}`);
  }
}

export function assertValidColumnName(name: string): void {
  if (!COLUMN_NAME_RE.test(name)) {
    throw new Error(`Недопустимое имя колонки: ${name}`);
  }
}

export async function listPublicTables(
  client: PrismaClient,
): Promise<TableInfo[]> {
  const tables = await client.$queryRaw<{ tablename: string }[]>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;

  const result: TableInfo[] = [];

  for (const { tablename } of tables) {
    if (!TABLE_NAME_RE.test(tablename)) continue;
    const countRows = await client.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count FROM "${tablename}"`,
    );
    result.push({
      name: tablename,
      rowCount: Number(countRows[0]?.count ?? 0),
    });
  }

  return result;
}

export async function getTableColumns(
  client: PrismaClient,
  tableName: string,
): Promise<ColumnInfo[]> {
  assertValidTableName(tableName);

  const columns = await client.$queryRaw<
    {
      column_name: string;
      data_type: string;
      udt_name: string;
      is_nullable: string;
      column_default: string | null;
    }[]
  >`
    SELECT column_name, data_type, udt_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${tableName}
    ORDER BY ordinal_position
  `;

  return columns.map((col) => ({
    name: col.column_name,
    dataType: col.data_type,
    udtName: col.udt_name,
    isNullable: col.is_nullable === "YES",
    columnDefault: col.column_default,
  }));
}

export async function tableExists(
  client: PrismaClient,
  tableName: string,
): Promise<boolean> {
  assertValidTableName(tableName);
  const rows = await client.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public' AND tablename = ${tableName}
    ) AS exists
  `;
  return rows[0]?.exists ?? false;
}

export async function getPrimaryKeyColumn(
  client: PrismaClient,
  tableName: string,
): Promise<string> {
  assertValidTableName(tableName);

  const rows = await client.$queryRaw<{ column_name: string }[]>`
    SELECT a.attname AS column_name
    FROM pg_index i
    JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
    JOIN pg_class c ON c.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE i.indisprimary
      AND n.nspname = 'public'
      AND c.relname = ${tableName}
    LIMIT 1
  `;

  const pk = rows[0]?.column_name;
  if (!pk) {
    throw new Error(`Первичный ключ не найден для таблицы ${tableName}`);
  }
  assertValidColumnName(pk);
  return pk;
}

function orderColumn(columns: ColumnInfo[]): string {
  const preferred = ["createdAt", "id"];
  for (const name of preferred) {
    if (columns.some((c) => c.name === name)) return name;
  }
  return columns[0]?.name ?? "id";
}

export type PaginatedRows = {
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  columns: ColumnInfo[];
  primaryKey: string;
  orderBy: string;
};

export async function fetchTableRows(
  client: PrismaClient,
  tableName: string,
  page: number,
  pageSize: number,
): Promise<PaginatedRows> {
  assertValidTableName(tableName);
  if (!(await tableExists(client, tableName))) {
    throw new Error(`Таблица не найдена: ${tableName}`);
  }

  const columns = await getTableColumns(client, tableName);
  if (columns.length === 0) {
    throw new Error(`Нет колонок у таблицы ${tableName}`);
  }

  const primaryKey = await getPrimaryKeyColumn(client, tableName);
  const orderBy = orderColumn(columns);
  assertValidColumnName(orderBy);

  const offset = (page - 1) * pageSize;

  const countRows = await client.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*)::bigint AS count FROM "${tableName}"`,
  );
  const total = Number(countRows[0]?.count ?? 0);

  const rows = await client.$queryRawUnsafe<Record<string, unknown>[]>(
    `SELECT * FROM "${tableName}" ORDER BY "${orderBy}" DESC NULLS LAST LIMIT $1 OFFSET $2`,
    pageSize,
    offset,
  );

  return {
    rows: rows.map(serializeRow),
    total,
    page,
    pageSize,
    columns,
    primaryKey,
    orderBy,
  };
}

function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    out[key] = serializeValue(value);
  }
  return out;
}

function serializeValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "bigint") return value.toString();
  if (value !== null && typeof value === "object") return value;
  return value;
}

function parseFieldValue(
  raw: unknown,
  column: ColumnInfo,
): unknown {
  if (raw === null || raw === "") {
    if (column.isNullable) return null;
    throw new Error(`Поле ${column.name} обязательно`);
  }

  const str = String(raw);

  if (column.dataType === "json" || column.dataType === "jsonb") {
    try {
      return JSON.parse(str);
    } catch {
      throw new Error(`Поле ${column.name}: некорректный JSON`);
    }
  }

  if (column.dataType === "boolean") {
    if (str === "true" || str === "1") return true;
    if (str === "false" || str === "0") return false;
    throw new Error(`Поле ${column.name}: ожидается boolean`);
  }

  if (
    column.dataType === "integer" ||
    column.dataType === "bigint" ||
    column.dataType === "smallint"
  ) {
    const num = Number(str);
    if (Number.isNaN(num)) throw new Error(`Поле ${column.name}: ожидается число`);
    return num;
  }

  if (
    column.dataType === "numeric" ||
    column.dataType === "double precision" ||
    column.dataType === "real"
  ) {
    const num = Number(str);
    if (Number.isNaN(num)) throw new Error(`Поле ${column.name}: ожидается число`);
    return num;
  }

  if (column.dataType === "USER-DEFINED") {
    return str;
  }

  if (column.dataType.includes("timestamp")) {
    const date = new Date(str);
    if (Number.isNaN(date.getTime())) {
      throw new Error(`Поле ${column.name}: некорректная дата`);
    }
    return date;
  }

  return str;
}

function buildInsertPayload(
  data: Record<string, unknown>,
  columns: ColumnInfo[],
  primaryKey: string,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  for (const column of columns) {
    if (column.name === primaryKey) {
      const raw = data[column.name];
      if (raw === undefined || raw === null || raw === "") {
        payload[column.name] = crypto.randomUUID();
      } else {
        payload[column.name] = parseFieldValue(raw, column);
      }
      continue;
    }

    if (column.name === "updatedAt" && column.dataType.includes("timestamp")) {
      payload[column.name] = new Date();
      continue;
    }

    if (!(column.name in data)) {
      if (!column.isNullable && column.columnDefault === null) {
        if (column.name === "createdAt") {
          payload[column.name] = new Date();
          continue;
        }
        throw new Error(`Поле ${column.name} обязательно`);
      }
      continue;
    }

    payload[column.name] = parseFieldValue(data[column.name], column);
  }

  return payload;
}

export async function insertRow(
  client: PrismaClient,
  tableName: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  assertValidTableName(tableName);
  const columns = await getTableColumns(client, tableName);
  const primaryKey = await getPrimaryKeyColumn(client, tableName);
  const payload = buildInsertPayload(data, columns, primaryKey);

  const keys = Object.keys(payload);
  keys.forEach(assertValidColumnName);

  const colList = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const values = keys.map((k) => payload[k]);

  const sql = `INSERT INTO "${tableName}" (${colList}) VALUES (${placeholders}) RETURNING *`;
  const rows = await client.$queryRawUnsafe<Record<string, unknown>[]>(
    sql,
    ...values,
  );

  return serializeRow(rows[0] ?? {});
}

export async function updateRow(
  client: PrismaClient,
  tableName: string,
  primaryKey: string,
  id: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  assertValidTableName(tableName);
  assertValidColumnName(primaryKey);

  const columns = await getTableColumns(client, tableName);
  const columnMap = new Map(columns.map((c) => [c.name, c]));

  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, raw] of Object.entries(data)) {
    if (key === primaryKey) continue;
    assertValidColumnName(key);
    const column = columnMap.get(key);
    if (!column) continue;

    sets.push(`"${key}" = $${idx}`);
    values.push(parseFieldValue(raw, column));
    idx += 1;
  }

  if (columns.some((c) => c.name === "updatedAt")) {
    sets.push(`"updatedAt" = $${idx}`);
    values.push(new Date());
    idx += 1;
  }

  if (sets.length === 0) {
    throw new Error("Нет полей для обновления");
  }

  values.push(id);
  const sql = `UPDATE "${tableName}" SET ${sets.join(", ")} WHERE "${primaryKey}" = $${idx} RETURNING *`;
  const rows = await client.$queryRawUnsafe<Record<string, unknown>[]>(
    sql,
    ...values,
  );

  if (rows.length === 0) {
    throw new Error("Запись не найдена");
  }

  return serializeRow(rows[0]);
}

export async function deleteRow(
  client: PrismaClient,
  tableName: string,
  primaryKey: string,
  id: string,
): Promise<void> {
  assertValidTableName(tableName);
  assertValidColumnName(primaryKey);

  const result = await client.$executeRawUnsafe(
    `DELETE FROM "${tableName}" WHERE "${primaryKey}" = $1`,
    id,
  );

  if (result === 0) {
    throw new Error("Запись не найдена");
  }
}

export function apiErrorMessage(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Неизвестная ошибка";
}
