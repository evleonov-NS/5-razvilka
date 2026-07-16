import Link from "next/link";
import Image from "next/image";
import { GitBranch } from "lucide-react";
import {
  formatDecisionDate,
  HORIZON_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/decision-labels";
import type { PublicDecisionItem } from "@/lib/public-decisions";
import { LikeButton } from "@/components/LikeButton";

type Props = {
  decision: PublicDecisionItem;
  showLike?: boolean;
};

export function PublicDecisionCard({ decision, showLike = true }: Props) {
  return (
    <article className="flex gap-4 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
        <GitBranch className="h-5 w-5" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <Link
          href={`/explore/${decision.id}`}
          className="font-semibold leading-snug hover:text-[var(--accent)]"
        >
          {decision.title}
        </Link>

        <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
          {decision.context}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-neutral-700">
            {HORIZON_LABELS[decision.horizon] ?? decision.horizon}
          </span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-neutral-700">
            {TYPE_LABELS[decision.type] ?? decision.type}
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

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            {decision.author.image ? (
              <Image
                src={decision.author.image}
                alt=""
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : null}
            <span>{decision.author.name ?? "Аноним"}</span>
          </div>
          {showLike ? (
            <LikeButton
              decisionId={decision.id}
              initialLiked={decision.likedByMe}
              initialCount={decision.likesCount}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
