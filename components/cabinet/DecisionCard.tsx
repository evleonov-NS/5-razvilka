import Link from "next/link";
import { GitBranch, ExternalLink } from "lucide-react";
import {
  formatDecisionDate,
  HORIZON_LABELS,
  STATUS_LABELS,
} from "@/lib/decision-labels";
import type { DecisionListItem } from "@/lib/decisions";
import { DeleteDecisionButton } from "@/components/cabinet/DeleteDecisionButton";

export function DecisionCard({ decision }: { decision: DecisionListItem }) {
  return (
    <article className="flex gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
        <GitBranch className="h-5 w-5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold leading-snug">{decision.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
          {decision.context}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-neutral-700">
            {HORIZON_LABELS[decision.horizon] ?? decision.horizon}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 ${
              decision.status === "RESOLVED"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            {STATUS_LABELS[decision.status] ?? decision.status}
          </span>
          <time className="text-[var(--muted)]" dateTime={decision.createdAt.toISOString()}>
            {formatDecisionDate(decision.createdAt)}
          </time>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1">
        <Link
          href={`/decisions/${decision.id}`}
          title="Открыть"
          className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-sky-50 hover:text-[var(--accent)]"
        >
          <ExternalLink className="h-4 w-4" aria-hidden />
          <span className="sr-only">Открыть</span>
        </Link>
        <DeleteDecisionButton
          decisionId={decision.id}
          decisionTitle={decision.title}
        />
      </div>
    </article>
  );
}
