import Link from "next/link";
import { landingFocus } from "@/components/landing/landingLayout";

/** Верхняя полоска для гостей на /explore. */
export function ExploreGuestBar() {
  return (
    <header className="border-b border-border bg-surface px-6 py-4 md:px-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className={`font-[family-name:var(--font-landing-serif)] text-lg tracking-tight text-text transition-colors hover:text-accent-ink ${landingFocus}`}
          >
            Развилка
          </Link>
          <span className="text-sm text-text-muted">Сообщество</span>
        </nav>
        <Link
          href="/login?callbackUrl=/explore"
          className={`rounded-md border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:border-border-strong hover:bg-surface-2 ${landingFocus}`}
        >
          Войти
        </Link>
      </div>
    </header>
  );
}
