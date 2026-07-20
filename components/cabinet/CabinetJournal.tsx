import Link from "next/link";
import { Suspense } from "react";
import type { DecisionStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { listUserDecisions } from "@/lib/decisions";
import { versionLabel } from "@/lib/version";
import { DecisionCard } from "@/components/cabinet/DecisionCard";
import { DecisionPagination } from "@/components/cabinet/DecisionPagination";
import { DecisionSearchInput } from "@/components/cabinet/DecisionSearchInput";
import { FilterEmptyState } from "@/components/cabinet/FilterEmptyState";
import { JournalEmptyState } from "@/components/cabinet/JournalEmptyState";
import { landingFocus } from "@/components/landing/landingLayout";

export type CabinetSection = "journal" | "open" | "resolved";

type Props = {
  section: CabinetSection;
  basePath: string;
  statusFilter?: DecisionStatus;
  searchParams: Promise<{ q?: string; page?: string }>;
};

const SECTION_META: Record<
  CabinetSection,
  { title: string; description: string }
> = {
  journal: {
    title: "Журнал",
    description: "Все ваши разборы — открытые и с известным исходом.",
  },
  open: {
    title: "Открытые",
    description: "Решения, исход которых ещё не известен.",
  },
  resolved: {
    title: "Решённые",
    description: "Разборы с отмеченным фактическим исходом.",
  },
};

export async function CabinetJournal({
  section,
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

  const meta = SECTION_META[section];
  const showSearch = total >= 5 || Boolean(q);
  const isEmpty = items.length === 0;
  const isSearchEmpty = isEmpty && Boolean(q);
  const isPristineJournal = section === "journal" && isEmpty && !q;

  return (
    <div className="flex flex-1 flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 md:px-8 md:py-10">
        {/* Пустой журнал — без дубля «Журнал» / «С чего начнём?» */}
        {!isPristineJournal ? (
          <>
            <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text md:text-3xl">
                  {meta.title}
                </h1>
                <p className="mt-2 text-sm text-text-muted">{meta.description}</p>
              </div>
              <Link
                href="/decisions/new"
                className={`inline-flex h-10 w-full shrink-0 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 sm:w-auto ${landingFocus}`}
              >
                Новое решение
              </Link>
            </header>

            {showSearch ? (
              <div className="mb-6">
                <Suspense
                  fallback={
                    <div className="h-10 max-w-md rounded-md bg-surface-2" />
                  }
                >
                  <DecisionSearchInput />
                </Suspense>
              </div>
            ) : null}
          </>
        ) : null}

        {isPristineJournal ? (
          <JournalEmptyState />
        ) : isSearchEmpty ? (
          <p className="py-12 text-sm text-text-muted">
            Ничего не найдено по запросу «{q}». Попробуйте другой запрос.
          </p>
        ) : isEmpty && section === "open" ? (
          <FilterEmptyState
            variant="open"
            title="Пока нет открытых разборов"
            description="Решение считается открытым, пока вы не отметили, что вышло по факту."
          />
        ) : isEmpty && section === "resolved" ? (
          <FilterEmptyState
            variant="resolved"
            title="Пока нет разборов с исходом"
            description="Когда отметите факт, сервис сверит его с прогнозом и выделит один урок."
          />
        ) : isEmpty ? (
          <JournalEmptyState />
        ) : (
          <>
            <p className="mb-4 text-sm text-text-muted">
              {total === 1 ? "1 решение" : `${total} решений`}
              {q ? ` по запросу «${q}»` : ""}
            </p>
            <ul className="space-y-3">
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

      <footer className="border-t border-border px-6 py-4 text-sm text-text-muted md:px-8">
        <div className="mx-auto w-full max-w-4xl">v{versionLabel}</div>
      </footer>
    </div>
  );
}
