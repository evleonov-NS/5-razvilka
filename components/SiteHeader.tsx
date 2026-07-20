"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  landingContainer,
  landingFocus,
} from "@/components/landing/landingLayout";

type Variant = "full" | "minimal";

type Props = {
  /** full — лендинг (Войти + CTA); minimal — login/register */
  variant?: Variant;
};

/**
 * Липкая шапка: матовое стекло после прокрутки, скрытие при скролле вниз.
 * sticky (не fixed) — без скачка контента.
 */
export function SiteHeader({ variant = "full" }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const rafId = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(() => {
        rafId.current = 0;
        const y = window.scrollY;
        const delta = y - lastY.current;

        setScrolled(y >= 8);

        if (y < 8) {
          setHidden(false);
        } else if (Math.abs(delta) >= 6) {
          if (y > 400 && delta > 0) {
            setHidden(true);
          } else if (delta < 0) {
            setHidden(false);
          }
        }

        lastY.current = y;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <header
      className={[
        "sticky top-0 z-50 w-full",
        "transition-[height,background-color,border-color,transform] duration-300 ease-out",
        scrolled
          ? "site-header-glass h-14 border-b border-border bg-[rgb(var(--bg-rgb)/0.72)] md:h-16"
          : "h-16 border-b border-transparent bg-transparent md:h-20",
        hidden ? "-translate-y-full" : "translate-y-0",
      ].join(" ")}
    >
      <div
        className={`${landingContainer} flex h-full items-center justify-between`}
      >
        <Link
          href="/"
          className={`font-[family-name:var(--font-landing-serif)] text-lg tracking-tight text-text transition-colors hover:text-accent-ink ${landingFocus}`}
        >
          Развилка
        </Link>
        <nav
          className="flex items-center gap-3 sm:gap-5"
          aria-label="Навигация"
        >
          <ThemeToggle />
          {variant === "full" ? (
            <>
              <Link
                href="/login"
                className={`text-sm text-text-muted transition-colors hover:text-text ${landingFocus}`}
              >
                Войти
              </Link>
              <Link
                href="/register"
                className={`inline-flex h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 ${landingFocus}`}
              >
                Разобрать решение
              </Link>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
