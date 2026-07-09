import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { versionLabel } from "@/lib/version";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/cabinet");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12">
      <header className="mb-16 flex items-center justify-between">
        <span className="text-lg font-semibold tracking-tight">Развилка</span>
        <Link
          href="/login"
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-white"
        >
          Войти
        </Link>
      </header>

      <main className="flex flex-1 flex-col justify-center">
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
            href="/login"
            className="inline-flex justify-center rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Разобрать решение
          </Link>
          <div className="w-full max-w-xs sm:w-auto">
            <GoogleSignInButton callbackUrl="/cabinet" />
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--muted)]">
          Первый разбор — бесплатно.
        </p>
      </main>

      <footer className="mt-16 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
        v{versionLabel}
      </footer>
    </div>
  );
}
