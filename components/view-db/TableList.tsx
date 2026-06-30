import Link from "next/link";
import type { DbProfile } from "@/lib/view-db/config";
import type { TableInfo } from "@/lib/view-db/sql";

type Props = {
  tables: TableInfo[];
  profile: DbProfile;
  connection: string;
  error?: string | null;
};

export function TableList({ tables, profile, connection, error }: Props) {
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
      >
        {error}
      </div>
    );
  }

  return (
    <div>
      <p className="mb-4 text-sm text-[var(--muted)]">
        Подключение: <code className="text-xs">{connection}</code>
      </p>

      {tables.length === 0 ? (
        <p className="text-[var(--muted)]">Таблиц в схеме public нет.</p>
      ) : (
        <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-white">
          {tables.map((table) => (
            <li
              key={table.name}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div>
                <p className="font-medium">{table.name}</p>
                <p className="text-sm text-[var(--muted)]">
                  {table.rowCount}{" "}
                  {table.rowCount === 1 ? "строка" : table.rowCount < 5 ? "строки" : "строк"}
                </p>
              </div>
              <Link
                href={`/view-db/${encodeURIComponent(table.name)}?profile=${profile}`}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Открыть
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
