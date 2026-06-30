"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { DbProfile } from "@/lib/view-db/config";
import type { ColumnInfo } from "@/lib/view-db/sql";
import { RowModal } from "./RowModal";

type TableData = {
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  columns: ColumnInfo[];
  primaryKey: string;
};

type Props = {
  tableName: string;
  profile: DbProfile;
};

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function TableViewer({ tableName, profile }: Props) {
  const [data, setData] = useState<TableData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editingRow, setEditingRow] = useState<Record<string, unknown> | null>(
    null,
  );

  const pageSize = 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        profile,
        page: String(page),
        pageSize: String(pageSize),
      });
      const res = await fetch(
        `/api/view-db/tables/${encodeURIComponent(tableName)}?${params}`,
      );
      const json = (await res.json()) as TableData & { error?: string };

      if (!res.ok) {
        throw new Error(json.error ?? "Ошибка загрузки");
      }

      setData({
        rows: json.rows,
        total: json.total,
        page: json.page,
        pageSize: json.pageSize,
        columns: json.columns,
        primaryKey: json.primaryKey,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [tableName, profile, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDelete(row: Record<string, unknown>) {
    if (!data) return;
    const id = String(row[data.primaryKey] ?? "");
    if (!id) return;

    if (!window.confirm(`Удалить запись ${id}?`)) return;

    const res = await fetch(
      `/api/view-db/tables/${encodeURIComponent(tableName)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, id }),
      },
    );

    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      alert(json.error ?? "Ошибка удаления");
      return;
    }

    await load();
  }

  async function handleSave(payload: Record<string, unknown>) {
    const isEdit = modalMode === "edit" && editingRow && data;

    const res = await fetch(
      `/api/view-db/tables/${encodeURIComponent(tableName)}`,
      {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit
            ? {
                profile,
                id: String(editingRow[data.primaryKey]),
                data: payload,
              }
            : { profile, data: payload },
        ),
      },
    );

    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      throw new Error(json.error ?? "Ошибка сохранения");
    }

    setModalMode(null);
    setEditingRow(null);
    await load();
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/view-db?profile=${profile}`}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            ← К списку таблиц
          </Link>
          <h2 className="mt-1 text-xl font-semibold">{tableName}</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingRow(null);
            setModalMode("create");
          }}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Создать
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {loading && !data ? (
        <p className="text-[var(--muted)]">Загрузка…</p>
      ) : data ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-white">
            <table className="min-w-full text-sm">
              <thead className="border-b border-[var(--border)] bg-neutral-50">
                <tr>
                  {data.columns.map((col) => (
                    <th
                      key={col.name}
                      className="whitespace-nowrap px-3 py-2 text-left font-medium"
                    >
                      {col.name}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right font-medium">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={data.columns.length + 1}
                      className="px-3 py-6 text-center text-[var(--muted)]"
                    >
                      Нет записей
                    </td>
                  </tr>
                ) : (
                  data.rows.map((row) => {
                    const rowKey = String(row[data.primaryKey] ?? Math.random());
                    return (
                      <tr key={rowKey} className="hover:bg-neutral-50">
                        {data.columns.map((col) => (
                          <td
                            key={col.name}
                            className="max-w-xs truncate px-3 py-2 align-top"
                            title={formatCell(row[col.name])}
                          >
                            {formatCell(row[col.name])}
                          </td>
                        ))}
                        <td className="whitespace-nowrap px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRow(row);
                              setModalMode("edit");
                            }}
                            className="mr-2 text-[var(--accent)] hover:underline"
                          >
                            Изменить
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleDelete(row)}
                            className="text-red-600 hover:underline"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-[var(--muted)]">
              Всего: {data.total} · стр. {data.page} из {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 disabled:opacity-40"
              >
                ← Назад
              </button>
              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 disabled:opacity-40"
              >
                Вперёд →
              </button>
            </div>
          </div>
        </>
      ) : null}

      {modalMode && data && (
        <RowModal
          mode={modalMode}
          columns={data.columns}
          primaryKey={data.primaryKey}
          initialRow={editingRow ?? undefined}
          onClose={() => {
            setModalMode(null);
            setEditingRow(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
