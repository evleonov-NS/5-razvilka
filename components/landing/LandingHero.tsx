import Link from "next/link";
import { ForkHeroSvg } from "@/components/landing/ForkHeroSvg";
import {
  landingContainer,
  landingFocus,
} from "@/components/landing/landingLayout";

const branchLabels = [
  { name: "Оптимистичный", likelihood: "LOW", pos: "left-[2%] top-[2%]" },
  { name: "Базовый", likelihood: "HIGH", pos: "left-1/2 top-0 -translate-x-1/2" },
  { name: "Пессимистичный", likelihood: "MEDIUM", pos: "right-[2%] top-[2%]" },
] as const;

export function LandingHero() {
  return (
    <section
      className={`relative ${landingContainer} grid items-center gap-12 pt-20 pb-16 md:pt-28 md:pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16`}
    >
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-border opacity-60"
        viewBox="0 0 800 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M-20 400 C120 380 180 300 220 220 C260 140 320 80 420 60"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          d="M220 220 C280 200 360 210 480 160"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          d="M220 220 C240 280 200 340 160 420"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle cx="220" cy="220" r="2.5" fill="currentColor" />
      </svg>

      <div>
        <h1 className="font-[family-name:var(--font-landing-serif)] text-6xl leading-[0.95] tracking-tight text-text md:text-7xl lg:text-8xl">
          Развилка
        </h1>
        <p className="mt-3 max-w-[62ch] font-[family-name:var(--font-landing-serif)] text-xl text-accent-ink md:text-2xl">
          Посмотри, куда ведёт каждый выбор
        </p>
        <p className="mt-6 max-w-[62ch] text-base leading-relaxed text-text-muted">
          Опиши решение или привычку — увидишь сценарии будущего, узнаешь, где всё
          может сломаться, и что сделать уже сейчас, чтобы этого избежать.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className={`inline-flex h-12 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 ${landingFocus}`}
          >
            Разобрать решение
          </Link>
          <Link
            href="/login"
            className={`inline-flex h-12 items-center justify-center rounded-md border border-border px-6 text-sm text-text transition-colors hover:border-border-strong hover:bg-surface ${landingFocus}`}
          >
            Войти
          </Link>
        </div>
        <p className="mt-4 text-xs uppercase tracking-wider text-text-faint">
          Первый разбор — бесплатно.
        </p>
      </div>

      <div className="relative w-full">
        <ForkHeroSvg className="h-auto w-full text-accent" />
        {branchLabels.map((label) => (
          <div
            key={label.name}
            className={`absolute ${label.pos} flex flex-col gap-1`}
          >
            <span className="text-xs uppercase tracking-wider text-text">
              {label.name}
            </span>
            <span className="text-xs uppercase tracking-wider text-accent-ink">
              {label.likelihood}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
