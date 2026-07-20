import Link from "next/link";
import {
  landingContainer,
  landingFocus,
} from "@/components/landing/landingLayout";
import { versionLabel } from "@/lib/version";

export function LandingFooter() {
  return (
    <footer className={`${landingContainer} border-t border-border py-8`}>
      <div className="flex flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
        <p className="text-text-muted">
          <span className="font-[family-name:var(--font-landing-serif)] text-text">
            Развилка
          </span>
          <span className="mx-2 text-text-faint" aria-hidden="true">
            ·
          </span>
          <span>v{versionLabel}</span>
        </p>
        <nav className="flex gap-5" aria-label="Ссылки в футере">
          <Link
            href="/login"
            className={`text-text-muted transition-colors hover:text-text ${landingFocus}`}
          >
            Войти
          </Link>
          <Link
            href="/register"
            className={`text-text-muted transition-colors hover:text-text ${landingFocus}`}
          >
            Регистрация
          </Link>
        </nav>
      </div>
    </footer>
  );
}
