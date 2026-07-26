import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { versionLabel } from "@/lib/version";
import { landingFocus } from "@/components/landing/landingLayout";

type PageProps = {
  params: Promise<{ id: string }>;
};

/** Заглушка ревью по исходу — полноценная форма на этапе 8. */
export default async function DecisionReviewStubPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    notFound();
  }

  const { id } = await params;

  const decision = await prisma.decision.findFirst({
    where: { id, userId: user.id },
    select: { id: true, title: true },
  });

  if (!decision) {
    notFound();
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

        <div className="rounded-lg border border-border bg-surface px-6 py-10">
          <p className="text-lg font-medium text-text">Скоро</p>
          <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-text-muted">
            Здесь можно будет коротко описать, чем всё закончилось: какой
            сценарий ближе к реальности и какой урок вынести. Пока этот шаг в
            разработке — вернитесь к разбору или в журнал.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href={`/decisions/${decision.id}`}
            className={`inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 ${landingFocus}`}
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
