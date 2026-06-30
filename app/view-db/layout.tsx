import Link from "next/link";
import { notFound } from "next/navigation";
import { isViewDbEnabled } from "@/lib/view-db/guard";

export default function ViewDbLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isViewDbEnabled()) {
    notFound();
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Dev-утилита
          </p>
          <h1 className="text-2xl font-bold">view-db</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Просмотр и редактирование таблиц PostgreSQL
          </p>
        </div>
        <Link
          href="/"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          ← На главную
        </Link>
      </header>
      {children}
    </div>
  );
}
