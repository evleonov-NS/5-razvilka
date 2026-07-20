import Link from "next/link";
import { ForkHeroSvg } from "@/components/landing/ForkHeroSvg";

export function LandingHero() {
  return (
    <section className="relative mx-auto grid w-full max-w-5xl gap-12 px-6 pb-20 pt-10 sm:pb-28 sm:pt-16 lg:grid-cols-[1fr_minmax(240px,320px)] lg:items-center lg:gap-16">
      {/* фоновый мотив ветвей */}
      <svg
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-[var(--landing-line)] opacity-40"
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
        <h1 className="font-[family-name:var(--font-landing-serif)] text-5xl leading-[1.05] tracking-tight text-[var(--landing-fg)] sm:text-6xl lg:text-7xl">
          Развилка
        </h1>
        <p className="mt-5 max-w-[28rem] font-[family-name:var(--font-landing-serif)] text-xl leading-snug text-[var(--landing-accent)] sm:text-2xl">
          Посмотри, куда ведёт каждый выбор
        </p>
        <p className="mt-6 max-w-[36ch] text-base leading-relaxed text-[var(--landing-muted)] sm:text-lg">
          Опиши решение или привычку — увидишь сценарии будущего, узнаешь, где всё
          может сломаться, и что сделать уже сейчас, чтобы этого избежать.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/register"
            className="inline-flex justify-center rounded-md bg-[var(--landing-accent)] px-6 py-3 text-sm font-medium text-[var(--landing-accent-fg)] transition-colors duration-200 hover:bg-[var(--landing-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
          >
            Разобрать решение
          </Link>
          <Link
            href="/login"
            className="inline-flex justify-center rounded-md border border-[var(--landing-border)] px-6 py-3 text-sm text-[var(--landing-fg)] transition-colors duration-200 hover:border-[var(--landing-muted)] hover:bg-[var(--landing-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
          >
            Войти
          </Link>
        </div>
        <p className="mt-4 text-sm text-[var(--landing-muted)]">
          Первый разбор — бесплатно.
        </p>
      </div>

      <div className="flex justify-center lg:justify-end">
        <ForkHeroSvg className="h-56 w-auto text-[var(--landing-accent)] sm:h-64 lg:h-72" />
      </div>
    </section>
  );
}
