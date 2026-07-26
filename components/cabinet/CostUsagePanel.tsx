"use client";

import Link from "next/link";

export type PeriodCostRow = {
  key: string;
  label: string;
  requestCount: number;
  costUsdLabel: string;
  costRubLabel: string | null;
};

export type CostUsageProps = {
  rateLabel: string | null;
  personal: PeriodCostRow[];
  platform: PeriodCostRow[] | null;
  totals: {
    requestCount: number;
    costLabel: string;
    promptTokens: number;
    completionTokens: number;
  };
  recent: Array<{
    id: string;
    provider: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    costLabel: string;
    billedTo: string;
    createdAt: string;
  }>;
};

/** Блок стоимости: периоды карточками + широкая таблица + недавние. */
export function CostUsagePanel({
  rateLabel,
  personal,
  platform,
  totals,
  recent,
}: CostUsageProps) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-text">Стоимость запросов</h2>
          <p className="mt-1 text-xs text-text-muted">
            Оценка по прайсу каталога (не чек провайдера). Окна: сутки / 7 дней /
            30 дней.
            {rateLabel
              ? ` ${rateLabel}.`
              : " Курс ₽ не задан (USD_RUB_RATE)."}
          </p>
        </div>
        <span className="rounded-md bg-surface-2 px-3 py-1 text-xs text-text-muted">
          Всего:{" "}
          <span className="font-medium tabular-nums text-text">
            {totals.costLabel}
          </span>
        </span>
      </div>

      <PeriodTable title="Ваши запросы" rows={personal} />

      {platform ? (
        <PeriodTable
          title="Платформа (все пользователи)"
          hint="billedTo = PLATFORM"
          rows={platform}
          className="mt-8"
        />
      ) : null}

      <dl className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryChip label="Запросов" value={String(totals.requestCount)} />
        <SummaryChip label="Оценка" value={totals.costLabel} />
        <SummaryChip
          label="Токены in"
          value={totals.promptTokens.toLocaleString("ru-RU")}
        />
        <SummaryChip
          label="Токены out"
          value={totals.completionTokens.toLocaleString("ru-RU")}
        />
      </dl>

      {recent.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">
          Пока нет учтённых запросов.{" "}
          <Link
            href="/decisions/new"
            className="text-accent-ink underline-offset-2 hover:underline"
          >
            Создать разбор
          </Link>
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {recent.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-baseline justify-between gap-3 rounded-md bg-surface-2/80 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-text">
                  {row.provider} · {row.model}
                </p>
                <p className="text-xs text-text-faint">
                  {new Date(row.createdAt).toLocaleString("ru-RU")} ·{" "}
                  {row.billedTo === "USER" ? "свой ключ" : "платформа"} ·{" "}
                  {row.promptTokens + row.completionTokens} ток.
                </p>
              </div>
              <p className="shrink-0 text-sm font-medium tabular-nums text-accent-ink">
                {row.costLabel}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface-2/80 px-3 py-3">
      <dt className="text-xs text-text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium tabular-nums text-text">
        {value}
      </dd>
    </div>
  );
}

function PeriodTable({
  title,
  hint,
  rows,
  className = "",
}: {
  title: string;
  hint?: string;
  rows: PeriodCostRow[];
  className?: string;
}) {
  return (
    <div className={`mt-6 ${className}`.trim()}>
      <div className="mb-3 flex flex-wrap items-baseline gap-2">
        <h3 className="text-sm font-medium text-text">{title}</h3>
        {hint ? (
          <span className="text-xs text-text-faint">{hint}</span>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-[28rem] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[18%]" />
            <col className="w-[27%]" />
            <col className="w-[27%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-border bg-surface-2/60 text-xs text-text-faint">
              <th className="px-4 py-3 font-medium">Период</th>
              <th className="px-4 py-3 font-medium text-right">Запросов</th>
              <th className="px-4 py-3 font-medium text-right">USD</th>
              <th className="px-4 py-3 font-medium text-right">RUB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.key} className="hover:bg-surface-2/40">
                <td className="px-4 py-3.5 text-text">{row.label}</td>
                <td className="px-4 py-3.5 text-right tabular-nums text-text">
                  {row.requestCount}
                </td>
                <td className="px-4 py-3.5 text-right font-medium tabular-nums text-accent-ink">
                  {row.costUsdLabel}
                </td>
                <td className="px-4 py-3.5 text-right tabular-nums text-text-muted">
                  {row.costRubLabel ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
