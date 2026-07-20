import Link from "next/link";
import Image from "next/image";
import {
  formatDecisionDate,
  HORIZON_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/decision-labels";
import type { PublicDecisionItem } from "@/lib/public-decisions";
import { LikeButton } from "@/components/LikeButton";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  decision: PublicDecisionItem;
  showLike?: boolean;
};

export function PublicDecisionCard({ decision, showLike = true }: Props) {
  const resolved = decision.status === "RESOLVED";

  return (
    <article className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-strong">
      <Link
        href={`/explore/${decision.id}`}
        className={`text-base font-medium leading-snug text-text transition-colors hover:text-accent-ink ${landingFocus}`}
      >
        <span className="line-clamp-2">{decision.title}</span>
      </Link>

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

      <p className="mt-3 line-clamp-2 text-sm text-text-muted">{decision.context}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          {decision.author.image ? (
            <Image
              src={decision.author.image}
              alt=""
              width={24}
              height={24}
              className="rounded-full ring-1 ring-border"
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
    </article>
  );
}
