import type { Likelihood, ScenarioKind } from "@prisma/client";
import { LikelihoodBadge } from "@/components/LikelihoodBadge";
import { SCENARIO_KIND_LABELS } from "@/lib/decision-labels";

export type ScenarioCardData = {
  kind: ScenarioKind;
  likelihood: Likelihood;
  narrative: string;
};

type Props = {
  scenario: ScenarioCardData;
};

/** Карточка одного сценария будущего (оптимистичный / базовый / пессимистичный). */
export function ScenarioCard({ scenario }: Props) {
  const label = SCENARIO_KIND_LABELS[scenario.kind] ?? scenario.kind;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-base font-medium text-text">{label}</h3>
        <LikelihoodBadge value={scenario.likelihood} />
      </div>
      <p className="mt-4 text-sm leading-relaxed text-text-muted whitespace-pre-wrap">
        {scenario.narrative}
      </p>
    </div>
  );
}
