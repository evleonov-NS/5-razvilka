import Link from "next/link";
import {
  formatDecisionDate,
  HORIZON_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/decision-labels";
import type { DecisionListItem } from "@/lib/decisions";
import { DeleteDecisionButton } from "@/components/cabinet/DeleteDecisionButton";
import { landingFocus } from "@/components/landing/landingLayout";

export function DecisionCard({ decision }: { decision: DecisionListItem }) {
  const resolved = decision.status === "RESOLVED";
  const preview =
    decision.baseScenarioPreview?.trim() ||
    decision.context.split(/\n/)[0]?.trim() ||
    "";

  return (
    <article className="group relative rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong">
      <Link
        href={`/decisions/${decision.id}`}
        className={`absolute inset-0 z-0 rounded-lg ${landingFocus}`}
        aria-label={`Открыть: ${decision.title}`}
      />

      <div className="relative z-10 pointer-events-none">
        <h3 className="line-clamp-2 text-base font-medium leading-snug text-text">
          {decision.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text-muted">
          <span>{HORIZON_LABELS[decision.horizon] ?? decision.horizon}</span>
          <span aria-hidden="true" className="text-text-faint">
            ·
          </span>
          <span>{TYPE_LABELS[decision.type] ?? decision.type}</span>
          <span aria-hidden="true" className="text-text-faint">
            ·
          </span>
          <span className="inline-flex items-center gap-1.5">
            {resolved ? (
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-accent"
                aria-hidden="true"
              />
            ) : null}
            {STATUS_LABELS[decision.status] ?? decision.status}
          </span>
          <span aria-hidden="true" className="text-text-faint">
            ·
          </span>
          <time dateTime={decision.createdAt.toISOString()}>
            {formatDecisionDate(decision.createdAt)}
          </time>
        </div>

        {preview ? (
          <p className="mt-3 line-clamp-1 text-sm text-text-muted">{preview}</p>
        ) : null}
      </div>

      <div className="relative z-10 mt-3 flex justify-end pointer-events-auto">
        <DeleteDecisionButton
          decisionId={decision.id}
          decisionTitle={decision.title}
        />
      </div>
    </article>
  );
}
