import Link from "next/link";

/** Верхняя полоска для гостей на /explore — без сайдбара, но в той же палитре. */
export function ExploreGuestBar() {
  return (
    <header className="border-b border-[var(--border)] bg-white px-8 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Развилка
          </Link>
          <span className="text-sm text-[var(--muted)]">Сообщество</span>
        </nav>
        <Link
          href="/login?callbackUrl=/explore"
          className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium transition hover:bg-neutral-50"
        >
          Войти
        </Link>
      </div>
    </header>
  );
}
