import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  landingContainer,
  landingFocus,
} from "@/components/landing/landingLayout";

export function LandingHeader() {
  return (
    <header
      className={`${landingContainer} flex items-center justify-between py-5`}
    >
      <Link
        href="/"
        className={`font-[family-name:var(--font-landing-serif)] text-lg tracking-tight text-text transition-colors hover:text-accent-ink ${landingFocus}`}
      >
        Развилка
      </Link>
      <nav
        className="flex items-center gap-3 sm:gap-5"
        aria-label="Навигация лендинга"
      >
        <ThemeToggle />
        <Link
          href="/login"
          className={`text-sm text-text-muted transition-colors hover:text-text ${landingFocus}`}
        >
          Войти
        </Link>
        <Link
          href="/register"
          className={`inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-contrast transition-colors hover:opacity-90 ${landingFocus}`}
        >
          Разобрать решение
        </Link>
      </nav>
    </header>
  );
}
