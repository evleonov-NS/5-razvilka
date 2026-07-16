import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { LikeButton } from "@/components/LikeButton";
import { getCurrentUser } from "@/lib/auth";
import {
  formatDecisionDate,
  HORIZON_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/lib/decision-labels";
import type { PublicDecisionItem } from "@/lib/public-decisions";
import { versionLabel } from "@/lib/version";

type Props = {
  decision: PublicDecisionItem;
};

export async function ExploreDetail({ decision }: Props) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex-1 px-8 py-8">
        <Link
          href="/explore"
          className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          К ленте
        </Link>

        <header className="mb-8">
          {user ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Личный кабинет</h1>
              <h2 className="mt-1 text-lg text-[var(--muted)]">Сообщество</h2>
            </>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">Сообщество</h1>
          )}
        </header>

        <article>
          <h3 className="text-xl font-semibold leading-snug">{decision.title}</h3>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
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

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
              {decision.author.image ? (
                <Image
                  src={decision.author.image}
                  alt=""
                  width={32}
                  height={32}
                  className="rounded-full"
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

          <section className="mt-8 rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h4 className="text-sm font-medium text-[var(--muted)]">Контекст</h4>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed">{decision.context}</p>
          </section>
        </article>
      </div>

      <footer className="border-t border-[var(--border)] px-8 py-4 text-sm text-[var(--muted)]">
        v{versionLabel}
      </footer>
    </div>
  );
}
