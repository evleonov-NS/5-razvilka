import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { versionLabel } from "@/lib/version";
import { VisibilityToggle } from "@/components/VisibilityToggle";
import { LikeButton } from "@/components/LikeButton";
import { landingFocus } from "@/components/landing/landingLayout";

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
      isPublic: true,
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

  return (
    <div className="flex flex-1 flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 md:px-8 md:py-10">
        <Link
          href="/cabinet"
          className={`mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text ${landingFocus}`}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          В журнал
        </Link>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text md:text-3xl">
            {decision.title}
          </h1>
          <VisibilityToggle
            decisionId={decision.id}
            initialIsPublic={decision.isPublic}
          />
        </div>

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

        <p className="mt-4 text-sm text-text-muted">
          Экран результата (сценарии, pre-mortem, дерево) — следующий этап.
          Карточка решения уже в журнале.
        </p>

        <div className="mt-8 rounded-lg border border-border bg-surface px-6 py-12 text-center">
          <p className="text-lg font-medium text-text">Разбор готовится</p>
          <p className="mt-2 text-sm text-text-muted">
            Здесь появятся три сценария, pre-mortem и дерево развилок — после
            подключения LLM-слоя.
          </p>
          <Link
            href="/demo"
            className={`mt-6 inline-block text-sm text-accent-ink hover:underline ${landingFocus}`}
          >
            Посмотреть пример целиком
          </Link>
        </div>
      </div>

      <footer className="border-t border-border px-6 py-4 text-sm text-text-muted md:px-8">
        <div className="mx-auto w-full max-w-2xl">v{versionLabel}</div>
      </footer>
    </div>
  );
}
