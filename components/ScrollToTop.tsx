"use client";

import { useEffect, useState } from "react";
import { landingFocus } from "@/components/landing/landingLayout";

/**
 * Кнопка «наверх»: у правого края контента, но снаружи колонки (в gutter),
 * чтобы не наезжать на карточки. На узком экране — right: 1.5rem.
 */
export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.querySelector("[data-scroll-top-sentinel]");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  function scrollUp() {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Наверх"
      className={[
        "scroll-top-btn fixed z-40 flex h-11 w-11 items-center justify-center rounded-full",
        "border border-border bg-surface text-text-muted transition-all duration-200",
        "hover:text-accent-ink",
        landingFocus,
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
      ].join(" ")}
      style={{
        bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        /* max-w-6xl = 72rem; кнопка в gutter слева от края экрана, снаружи колонки */
        right:
          "max(1.5rem, calc((100vw - 72rem) / 2 - 3.5rem))",
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M9 14 V4 M4.5 8.5 L9 4 L13.5 8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
