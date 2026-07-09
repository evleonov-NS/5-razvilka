import Link from "next/link";
import { Suspense } from "react";
import type { DecisionStatus } from "@prisma/client";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { listUserDecisions } from "@/lib/decisions";
import { versionLabel } from "@/lib/version";
import { DecisionCard } from "@/components/cabinet/DecisionCard";
import { DecisionPagination } from "@/components/cabinet/DecisionPagination";
import { DecisionSearchInput } from "@/components/cabinet/DecisionSearchInput";
import { EmptyState } from "@/components/EmptyState";

type Props = {
  sectionTitle: string;
  basePath: string;
  statusFilter?: DecisionStatus;
  searchParams: Promise<{ q?: string; page?: string }>;
};

export async function CabinetJournal({
  sectionTitle,
  basePath,
  statusFilter,
  searchParams,
}: Props) {
  const user = await getCurrentUser();
  if (!user) return null;

  const params = await searchParams;
  const q = params.q?.trim();
  const page = Math.max(1, Number(params.page) || 1);

  const { items, total, totalPages, page: currentPage } = await listUserDecisions(
    user.id,
    { status: statusFilter, q, page },
  );

  const emptyTitle =
    q
      ? "Ничего не найдено"
      : statusFilter === "OPEN"
        ? "Нет открытых решений"
        : statusFilter === "RESOLVED"
          ? "Нет решённых решений"
          : "У вас пока нет решений";

  const emptyDescription =
    q
      ? "Попробуйте другой запрос или сбросьте поиск."
      : "Разберите первое решение — увидите сценарии и риски.";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex-1 px-8 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Личный кабинет</h1>
          <h2 className="mt-1 text-lg text-[var(--muted)]">{sectionTitle}</h2>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <Suspense fallback={<div className="h-10 max-w-md flex-1 rounded-lg bg-neutral-100" />}>
            <DecisionSearchInput />
          </Suspense>
          <Link
            href="/decisions/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Новое решение
          </Link>
        </div>

        {items.length === 0 ? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        ) : (
          <>
            <p className="mb-4 text-sm text-[var(--muted)]">
              {total === 1 ? "1 решение" : `${total} решений`}
              {q ? ` по запросу «${q}»` : ""}
            </p>
            <ul className="flex flex-col gap-3">
              {items.map((decision) => (
                <li key={decision.id}>
                  <DecisionCard decision={decision} />
                </li>
              ))}
            </ul>
            <DecisionPagination
              page={currentPage}
              totalPages={totalPages}
              basePath={basePath}
              query={q}
            />
          </>
        )}
      </div>

      <footer className="border-t border-[var(--border)] px-8 py-4 text-sm text-[var(--muted)]">
        v{versionLabel}
      </footer>
    </div>
  );
}
