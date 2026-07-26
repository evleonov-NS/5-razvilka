import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { versionLabel } from "@/lib/version";
import {
  HORIZON_LABELS,
  SCENARIO_KIND_ORDER,
  TYPE_LABELS,
} from "@/lib/decision-labels";
import { VisibilityToggle } from "@/components/VisibilityToggle";
import { LikeButton } from "@/components/LikeButton";
import { ScenarioCard } from "@/components/ScenarioCard";
import { FailureModeList } from "@/components/FailureModeList";
import { EmptyState } from "@/components/EmptyState";
import { TreeSection } from "@/components/TreeSection";
import { landingFocus } from "@/components/landing/landingLayout";
import { TreeResponseSchema } from "@/lib/validators";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function DecisionDetailPage({ params }: PageProps) {
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
      context: true,
      horizon: true,
      type: true,
      isPublic: true,
      tree: true,
      scenarios: {
        select: {
          id: true,
          kind: true,
          likelihood: true,
          narrative: true,
          orderIdx: true,
        },
        orderBy: { orderIdx: "asc" },
      },
      failureModes: {
        select: {
          id: true,
          cause: true,
          prevention: true,
          orderIdx: true,
        },
        orderBy: { orderIdx: "asc" },
      },
      _count: { select: { likes: true } },
    },
  });

  if (!decision) {
    notFound();
  }

  const liked = decision.isPublic
    ? await prisma.decisionLike.findUnique({
        where: {
          userId_decisionId: { userId: user.id, decisionId: decision.id },
        },
        select: { id: true },
      })
    : null;

  const kindRank = new Map(
    SCENARIO_KIND_ORDER.map((k, i) => [k, i] as const),
  );
  const scenarios = [...decision.scenarios].sort(
    (a, b) =>
      (kindRank.get(a.kind as (typeof SCENARIO_KIND_ORDER)[number]) ??
        a.orderIdx) -
      (kindRank.get(b.kind as (typeof SCENARIO_KIND_ORDER)[number]) ??
        b.orderIdx),
  );

  const hasScenarios = scenarios.length > 0;
  const hasFailureModes = decision.failureModes.length > 0;
  const analysisReady = hasScenarios || hasFailureModes;

  const treeParsed = TreeResponseSchema.safeParse(decision.tree);
  const initialTree = treeParsed.success ? treeParsed.data : null;

  return (
    <div className="flex flex-1 flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 md:px-8 md:py-10">
        <Link
          href="/cabinet"
          className={`mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text ${landingFocus}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          В журнал
        </Link>

        <header className="mb-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text md:text-3xl">
              {decision.title}
            </h1>
            <VisibilityToggle
              decisionId={decision.id}
              initialIsPublic={decision.isPublic}
            />
          </div>

          <p className="mt-3 text-sm text-text-muted">
            {HORIZON_LABELS[decision.horizon] ?? decision.horizon}
            {" · "}
            {TYPE_LABELS[decision.type] ?? decision.type}
          </p>

          {decision.isPublic ? (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <LikeButton
                decisionId={decision.id}
                initialLiked={Boolean(liked)}
                initialCount={decision._count.likes}
              />
              <Link
                href={`/explore/${decision.id}`}
                className={`text-sm text-accent-ink hover:underline ${landingFocus}`}
              >
                Как видят другие
              </Link>
            </div>
          ) : null}

          <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-text-muted whitespace-pre-wrap">
            {decision.context}
          </p>
        </header>

        {!analysisReady ? (
          <div className="rounded-lg border border-border bg-surface">
            <EmptyState
              title="Разбор ещё не готов"
              description="Сценарии и сценарий провала появятся после успешной генерации. Создайте новое решение или откройте пример."
              actionLabel="Новое решение"
              actionHref="/decisions/new"
            />
            <p className="pb-10 text-center text-sm text-text-muted">
              <Link
                href="/demo"
                className={`text-accent-ink hover:underline ${landingFocus}`}
              >
                Посмотреть пример
              </Link>
            </p>
          </div>
        ) : (
          <>
            <section className="mt-4">
              <h2 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text">
                Сценарии будущего
              </h2>
              {hasScenarios ? (
                <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
                  {scenarios.map((s) => (
                    <li key={s.id} className="min-w-0">
                      <ScenarioCard scenario={s} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-text-muted">
                  Сценарии не сохранились.
                </p>
              )}
            </section>

            <section className="mt-12">
              <h2 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text">
                Сценарий провала
              </h2>
              <p className="mt-2 text-sm text-text-muted">
                Допустим, всё пошло не по плану. Почему это произошло — и что
                сделать сейчас, чтобы этого избежать.
              </p>
              <div className="mt-6">
                <FailureModeList items={decision.failureModes} />
              </div>
            </section>

            <TreeSection
              decisionId={decision.id}
              initialTree={initialTree}
            />
          </>
        )}

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/cabinet"
            className={`inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 ${landingFocus}`}
          >
            В журнал
          </Link>
          {hasScenarios ? (
            <Link
              href={`/decisions/${decision.id}/review`}
              className={`inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm text-text transition-colors hover:border-border-strong hover:bg-surface-2 ${landingFocus}`}
            >
              Что получилось?
            </Link>
          ) : null}
          <Link
            href="/decisions/new"
            className={`inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm text-text transition-colors hover:border-border-strong hover:bg-surface-2 ${landingFocus}`}
          >
            Новое решение
          </Link>
        </div>
      </div>

      <footer className="border-t border-border px-6 py-4 text-sm text-text-muted md:px-8">
        <div className="mx-auto w-full max-w-4xl">v{versionLabel}</div>
      </footer>
    </div>
  );
}
