import Link from "next/link";

export function LandingCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <div className="max-w-xl">
        <h2 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight text-[var(--landing-fg)] sm:text-4xl">
          Разберите следующее решение
        </h2>
        <p className="mt-4 max-w-[40ch] text-[var(--landing-muted)]">
          Опишите выбор — получите сценарии, pre-mortem и точку, с которой можно
          сверить факт позже.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex rounded-md bg-[var(--landing-accent)] px-6 py-3 text-sm font-medium text-[var(--landing-accent-fg)] transition-colors duration-200 hover:bg-[var(--landing-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
        >
          Разобрать решение
        </Link>
      </div>
    </section>
  );
}
