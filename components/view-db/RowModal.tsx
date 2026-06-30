"use client";

import { useState } from "react";
import type { ColumnInfo } from "@/lib/view-db/sql";

type Props = {
  mode: "create" | "edit";
  columns: ColumnInfo[];
  primaryKey: string;
  initialRow?: Record<string, unknown>;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
};

function initialValue(column: ColumnInfo, row?: Record<string, unknown>): string {
  if (row && row[column.name] !== undefined && row[column.name] !== null) {
    const val = row[column.name];
    if (typeof val === "object") return JSON.stringify(val, null, 2);
    return String(val);
  }
  if (column.columnDefault?.includes("now()")) return "";
  return "";
}

function isJsonColumn(column: ColumnInfo): boolean {
  return column.dataType === "json" || column.dataType === "jsonb";
}

function isReadOnlyInEdit(name: string, primaryKey: string, mode: string): boolean {
  return mode === "edit" && name === primaryKey;
}

export function RowModal({
  mode,
  columns,
  primaryKey,
  initialRow,
  onClose,
  onSave,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const col of columns) {
      init[col.name] = initialValue(col, initialRow);
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {};
      for (const col of columns) {
        if (isReadOnlyInEdit(col.name, primaryKey, mode)) continue;
        const raw = values[col.name];
        if (raw === "" && col.isNullable) {
          payload[col.name] = null;
        } else if (raw !== "") {
          payload[col.name] = raw;
        }
      }
      await onSave(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--border)] bg-white p-6 shadow-lg">
        <h3 className="text-lg font-semibold">
          {mode === "create" ? "Новая запись" : "Редактирование"}
        </h3>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-3">
          {columns.map((col) => {
            const readOnly = isReadOnlyInEdit(col.name, primaryKey, mode);
            const skipOnCreate =
              mode === "create" &&
              col.name === primaryKey &&
              !values[col.name];

            if (skipOnCreate && col.columnDefault === null) {
              return (
                <div key={col.name}>
                  <label className="mb-1 block text-sm font-medium">
                    {col.name}{" "}
                    <span className="text-[var(--muted)]">(UUID автоматически)</span>
                  </label>
                </div>
              );
            }

            return (
              <div key={col.name}>
                <label htmlFor={col.name} className="mb-1 block text-sm font-medium">
                  {col.name}
                  <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                    {col.udtName}
                    {!col.isNullable ? " · обяз." : ""}
                  </span>
                </label>
                {isJsonColumn(col) ? (
                  <textarea
                    id={col.name}
                    rows={4}
                    readOnly={readOnly}
                    value={values[col.name] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [col.name]: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 font-mono text-sm disabled:bg-neutral-100"
                  />
                ) : (
                  <input
                    id={col.name}
                    type="text"
                    readOnly={readOnly}
                    value={values[col.name] ?? ""}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [col.name]: e.target.value }))
                    }
                    className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm disabled:bg-neutral-100"
                  />
                )}
              </div>
            );
          })}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Сохранение…" : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
