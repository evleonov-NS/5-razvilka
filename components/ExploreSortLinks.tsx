import Link from "next/link";
import type { PublicDecisionSort } from "@/lib/public-decisions";

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
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            current === option.value
              ? "bg-[var(--accent)] text-white"
              : "border border-[var(--border)] bg-white text-[var(--muted)] hover:bg-neutral-50"
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}
