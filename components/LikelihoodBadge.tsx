type Likelihood = "LOW" | "MEDIUM" | "HIGH";

const likelihoodClass: Record<Likelihood, string> = {
  LOW: "border-border text-text-muted",
  MEDIUM: "border-accent text-accent-ink",
  HIGH: "border-accent bg-accent/15 text-accent-ink",
};

type Props = {
  value: Likelihood | string;
  className?: string;
};

/** Метка LOW/MEDIUM/HIGH — без процентов, по насыщенности акцента. */
export function LikelihoodBadge({ value, className = "" }: Props) {
  const key = value.toUpperCase() as Likelihood;
  const styles = likelihoodClass[key] ?? likelihoodClass.MEDIUM;

  return (
    <span
      className={`inline-block shrink-0 rounded border px-2 py-0.5 text-xs uppercase tracking-wider ${styles} ${className}`}
    >
      {key}
    </span>
  );
}
