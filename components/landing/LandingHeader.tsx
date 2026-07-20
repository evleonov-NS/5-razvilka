"use client";

import Link from "next/link";
import { LandingThemeToggle } from "@/components/landing/LandingThemeToggle";

/** Шапка лендинга — client, чтобы переключатель темы был в том же дереве, что и Provider. */
export function LandingHeader() {
  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
      <Link
        href="/"
        className="font-[family-name:var(--font-landing-serif)] text-lg tracking-tight text-[var(--landing-fg)] transition-colors duration-200 hover:text-[var(--landing-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
      >
        Развилка
      </Link>
      <nav className="flex items-center gap-3 sm:gap-5" aria-label="Навигация лендинга">
        <LandingThemeToggle />
        <Link
          href="/login"
          className="text-sm text-[var(--landing-muted)] transition-colors duration-200 hover:text-[var(--landing-fg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
        >
          Войти
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-[var(--landing-accent)] px-3.5 py-2 text-sm font-medium text-[var(--landing-accent-fg)] transition-colors duration-200 hover:bg-[var(--landing-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
        >
          Разобрать решение
        </Link>
      </nav>
    </header>
  );
}
