import Link from "next/link";
import {
  landingContainer,
  landingFocus,
} from "@/components/landing/landingLayout";

export function LandingCta() {
  return (
    <section className={`${landingContainer} scroll-mt-24 py-16 md:py-24`}>
      <div className="elevate-card rounded-lg border border-border bg-surface p-10 md:p-16">
        <h2 className="font-[family-name:var(--font-landing-serif)] text-4xl tracking-tight text-text md:text-5xl">
          Разберите следующее решение
        </h2>
        <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-text-muted md:text-lg">
          Опишите выбор — получите сценарии, pre-mortem и точку, с которой можно
          сверить факт позже.
        </p>
        <Link
          href="/register"
          className={`mt-10 inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 ${landingFocus}`}
        >
          Разобрать решение
        </Link>
      </div>
    </section>
  );
}
