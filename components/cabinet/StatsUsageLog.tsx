"use client";

import { useState } from "react";
import { landingFocus } from "@/components/landing/landingLayout";

type UsedRow = {
  type: string;
  label: string;
  count: number;
};

type Props = {
  trackingSinceLabel: string;
  eventsTotal: number;
  used: UsedRow[];
  unused: string[];
  reportText: string;
};

/** Лог использования в стиле «что реально кликают» — только owner. */
export function StatsUsageLog({
  trackingSinceLabel,
  eventsTotal,
  used,
  unused,
  reportText,
}: Props) {
  const [copied, setCopied] = useState(false);

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-medium tracking-tight text-text">
            Лог использования
          </h2>
          <p className="mt-1 text-sm text-text-muted">
            Считается с {trackingSinceLabel}. Что реально используется.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-surface-2 px-3 py-1 text-xs text-text-muted">
            Всего действий:{" "}
            <span className="font-medium tabular-nums text-text">
              {eventsTotal}
            </span>
          </span>
          <button
            type="button"
            onClick={() => void copyReport()}
            className={`rounded-full border border-border bg-bg px-3 py-1 text-xs text-text transition-colors hover:border-border-strong hover:bg-surface-2 ${landingFocus}`}
          >
            {copied ? "Скопировано" : "Копировать отчёт"}
          </button>
        </div>
      </div>

      {used.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">
          Пока нет событий — зайдите в разбор или настройки под учётом.
        </p>
      ) : (
        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {used.map((row) => (
            <li
              key={row.type}
              className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/80 px-4 py-3"
            >
              <span className="min-w-0 truncate text-sm text-text">
                {row.label}
              </span>
              <span className="shrink-0 text-sm font-medium tabular-nums text-accent-ink">
                {row.count}
              </span>
            </li>
          ))}
        </ul>
      )}

      {unused.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm text-text-muted">
            Ни разу не использовалось ({unused.length}):
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {unused.map((label) => (
              <li
                key={label}
                className="rounded-full border border-border bg-bg px-3 py-1 text-xs text-text-muted"
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      ) : used.length > 0 ? (
        <p className="mt-6 text-sm text-text-muted">
          Все отслеживаемые функции хотя бы раз срабатывали.
        </p>
      ) : null}
    </section>
  );
}
