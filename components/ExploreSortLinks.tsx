import Link from "next/link";
import type { PublicDecisionSort } from "@/lib/public-decisions";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  current: PublicDecisionSort;
};

const SORT_OPTIONS: { value: PublicDecisionSort; label: string }[] = [
  { value: "recent", label: "Новые" },
  { value: "popular", label: "Популярные" },
];

export function ExploreSortLinks({ current }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {SORT_OPTIONS.map((option) => (
        <Link
          key={option.value}
          href={`/explore?sort=${option.value}`}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${landingFocus} ${
            current === option.value
              ? "bg-accent text-accent-contrast"
              : "border border-border bg-surface text-text-muted hover:border-border-strong hover:bg-surface-2 hover:text-text"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
