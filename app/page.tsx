import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Header } from "@/components/Header";
import { LandingPreviewSection } from "@/components/landing/LandingPreviewSection";
import { listPublicDecisions } from "@/lib/public-decisions";
import { versionLabel } from "@/lib/version";

const LANDING_PREVIEW_TAKE = 10;

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/cabinet");
  }

  const [recentDecisions, popularDecisions] = await Promise.all([
    listPublicDecisions("recent", null, { take: LANDING_PREVIEW_TAKE }),
    listPublicDecisions("popular", null, { take: LANDING_PREVIEW_TAKE }),
  ]);

  const hasAnyPreview = recentDecisions.length > 0 || popularDecisions.length > 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-6 py-8 sm:py-12">
      <Header />

      <main className="flex-1">
        <section className="py-8 sm:py-12">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Развилка</h1>
          <p className="mt-4 text-xl text-[var(--muted)]">
            Посмотри, куда ведёт каждый выбор
          </p>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-700">
            Опиши решение или привычку — увидишь сценарии будущего, узнаешь, где всё
            может сломаться, и что сделать уже сейчас, чтобы этого избежать.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/login?callbackUrl=/cabinet"
              className="inline-flex justify-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Разобрать решение
            </Link>
            <div className="w-full max-w-xs sm:w-auto">
              <GoogleSignInButton callbackUrl="/cabinet" />
            </div>
          </div>

          <p className="mt-4 text-sm text-[var(--muted)]">
            Войдите, чтобы создать свой разбор. Первый разбор — бесплатно.
          </p>
        </section>

        {hasAnyPreview ? (
          <>
            <LandingPreviewSection
              title="Новые разборы"
              viewAllHref="/explore?sort=recent"
              decisions={recentDecisions}
            />
            <LandingPreviewSection
              title="Популярные"
              viewAllHref="/explore?sort=popular"
              decisions={popularDecisions}
            />
          </>
        ) : (
          <section className="mt-12 rounded-xl border border-dashed border-[var(--border)] bg-white px-6 py-10 text-center">
            <p className="text-lg font-medium">Пока нет публичных разборов</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Загляните позже или войдите и опубликуйте свой в кабинете.
            </p>
            <Link
              href="/explore"
              className="mt-6 inline-block text-sm font-medium text-[var(--accent)] hover:underline"
            >
              Перейти в Сообщество
            </Link>
          </section>
        )}
      </main>

      <footer className="mt-16 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
        v{versionLabel}
      </footer>
    </div>
  );
}
