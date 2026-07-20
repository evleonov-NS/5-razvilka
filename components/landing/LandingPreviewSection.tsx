import Link from "next/link";
import { PublicDecisionCard } from "@/components/PublicDecisionCard";
import type { PublicDecisionItem } from "@/lib/public-decisions";

type Props = {
  title: string;
  viewAllHref: string;
  decisions: PublicDecisionItem[];
};

/** Блок превью публичных разборов на гостевом лендинге. */
export function LandingPreviewSection({ title, viewAllHref, decisions }: Props) {
  if (decisions.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-[var(--accent)] transition hover:underline"
        >
          Смотреть все
        </Link>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {decisions.map((decision) => (
          <li key={decision.id}>
            <PublicDecisionCard decision={decision} />
          </li>
        ))}
      </ul>
    </section>
  );
}
