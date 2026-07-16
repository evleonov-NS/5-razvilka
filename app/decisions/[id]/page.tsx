import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { versionLabel } from "@/lib/version";
import { VisibilityToggle } from "@/components/VisibilityToggle";
import { LikeButton } from "@/components/LikeButton";

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
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12">
      <Link
        href="/cabinet"
        className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        В журнал
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">{decision.title}</h1>
        <VisibilityToggle decisionId={decision.id} initialIsPublic={decision.isPublic} />
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
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Как видят другие
          </Link>
        </div>
      ) : null}

      <p className="mt-2 text-[var(--muted)]">
        Экран результата (сценарии, pre-mortem, дерево) — этап 5.
      </p>

      <div className="mt-8 rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-12 text-center">
        <p className="text-lg font-medium">Скоро…</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Здесь появятся три сценария, pre-mortem и дерево развилок.
        </p>
      </div>

      <footer className="mt-auto pt-12 text-sm text-[var(--muted)]">
        v{versionLabel}
      </footer>
    </div>
  );
}
