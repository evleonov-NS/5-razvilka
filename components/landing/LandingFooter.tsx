import Link from "next/link";
import { versionLabel } from "@/lib/version";

export function LandingFooter() {
  return (
    <footer className="mx-auto w-full max-w-5xl border-t border-[var(--landing-border)] px-6 py-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-landing-serif)] text-lg text-[var(--landing-fg)]">
            Развилка
          </p>
          <p className="mt-1 text-sm text-[var(--landing-muted)]">
            v{versionLabel}
          </p>
        </div>
        <nav className="flex gap-5 text-sm" aria-label="Ссылки в футере">
          <Link
            href="/login"
            className="text-[var(--landing-muted)] transition-colors duration-200 hover:text-[var(--landing-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
          >
            Войти
          </Link>
          <Link
            href="/register"
            className="text-[var(--landing-muted)] transition-colors duration-200 hover:text-[var(--landing-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
          >
            Регистрация
          </Link>
        </nav>
      </div>
    </footer>
  );
}
