import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { LikeButton } from "@/components/LikeButton";
import {
  formatDecisionDate,
  HORIZON_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/decision-labels";
import type { PublicDecisionItem } from "@/lib/public-decisions";
import { versionLabel } from "@/lib/version";
import { landingFocus } from "@/components/landing/landingLayout";

type Props = {
  decision: PublicDecisionItem;
};

export async function ExploreDetail({ decision }: Props) {
  const resolved = decision.status === "RESOLVED";

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 md:px-8 md:py-10">
        <Link
          href="/explore"
          className={`mb-6 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text ${landingFocus}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          К ленте
        </Link>

        <header className="mb-8">
          <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight md:text-3xl">
            Сообщество
          </h1>
        </header>

        <article>
          <h2 className="text-xl font-medium leading-snug text-text">
            {decision.title}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text-muted">
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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-text-muted">
              {decision.author.image ? (
                <Image
                  src={decision.author.image}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full ring-1 ring-border"
                />
              ) : null}
              <span>{decision.author.name ?? "Аноним"}</span>
            </div>
            <LikeButton
              decisionId={decision.id}
              initialLiked={decision.likedByMe}
              initialCount={decision.likesCount}
            />
          </div>

          <section className="mt-8 rounded-lg border border-border bg-surface p-6">
            <h3 className="text-sm font-medium text-text-muted">Контекст</h3>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-text">
              {decision.context}
            </p>
          </section>
        </article>
      </div>

      <footer className="border-t border-border px-6 py-4 text-sm text-text-muted md:px-8">
        v{versionLabel}
      </footer>
    </div>
  );
}
