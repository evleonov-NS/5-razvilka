import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { versionLabel } from "@/lib/version";
import { EmptyState } from "@/components/EmptyState";
import { landingFocus } from "@/components/landing/landingLayout";
import {
  ReviewSection,
  type ReviewResult,
} from "@/components/ReviewSection";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Ревью по исходу: форма факта → ближайший сценарий + упущение + урок. */
export default async function DecisionReviewPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const { id } = await params;

  const decision = await prisma.decision.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      title: true,
      status: true,
      outcome: true,
      lesson: true,
      reviewClosestScenario: true,
      reviewMissed: true,
      scenarios: { select: { id: true }, take: 1 },
    },
  });

  if (!decision) {
    notFound();
  }

  const hasScenarios = decision.scenarios.length > 0;

  let initialReview: ReviewResult | null = null;
  if (
    decision.status === "RESOLVED" &&
    decision.outcome &&
    decision.lesson &&
    decision.reviewClosestScenario &&
    decision.reviewMissed
  ) {
    initialReview = {
      outcome: decision.outcome,
      closestScenario: decision.reviewClosestScenario,
      missed: decision.reviewMissed,
      lesson: decision.lesson,
    };
  }

  return (
    <div className="flex flex-1 flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 md:px-8 md:py-10">
        <Link
          href={`/decisions/${decision.id}`}
          className={`mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text ${landingFocus}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Назад к разбору
        </Link>

        <header className="mb-8">
          <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text md:text-3xl">
            Что получилось
          </h1>
          <p className="mt-2 text-sm text-text-muted">{decision.title}</p>
        </header>

        {!hasScenarios ? (
          <div className="rounded-lg border border-border bg-surface">
            <EmptyState
              title="Разбор ещё не готов"
              description="Сначала нужны три сценария — без них не с чем сверять исход."
              actionLabel="К разбору"
              actionHref={`/decisions/${decision.id}`}
            />
          </div>
        ) : (
          <ReviewSection
            decisionId={decision.id}
            initialReview={initialReview}
          />
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/decisions/${decision.id}`}
            className={`inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm text-text transition-colors hover:border-border-strong hover:bg-surface-2 ${landingFocus}`}
          >
            Назад к разбору
          </Link>
          <Link
            href="/cabinet"
            className={`inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm text-text transition-colors hover:border-border-strong hover:bg-surface-2 ${landingFocus}`}
          >
            В журнал
          </Link>
        </div>
      </div>

      <footer className="border-t border-border px-6 py-4 text-sm text-text-muted md:px-8">
        <div className="mx-auto w-full max-w-4xl">v{versionLabel}</div>
      </footer>
    </div>
  );
}
