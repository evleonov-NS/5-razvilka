"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CabinetSidebar } from "@/components/cabinet/CabinetSidebar";
import { landingFocus } from "@/components/landing/landingLayout";

type CabinetUser = {
  name: string | null;
  email: string;
  image: string | null;
};

type Props = {
  user: CabinetUser;
  children: ReactNode;
};

/** Оболочка кабинета: сайдбар + мобильный drawer. */
export function CabinetShell({ user, children }: Props) {
  const [open, setOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const close = useCallback(() => {
    setOpen(false);
    // Фокус обратно на бургер после закрытия drawer
    requestAnimationFrame(() => burgerRef.current?.focus());
  }, []);

  const openDrawer = useCallback(() => setOpen(true), []);

  useEffect(() => {
    if (!open) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <div className="flex min-h-screen bg-bg text-text">
      {/* Мобильная шапка */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-bg px-4 md:hidden">
        <button
          ref={burgerRef}
          type="button"
          onClick={openDrawer}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-text-muted transition-colors hover:border-border-strong hover:text-text ${landingFocus}`}
          aria-expanded={open}
          aria-controls={titleId}
          aria-label="Открыть меню"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 5h12M3 9h12M3 13h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span className="font-[family-name:var(--font-landing-serif)] text-lg tracking-tight">
          Развилка
        </span>
      </header>

      {/* Overlay */}
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[rgb(0_0_0/0.45)] md:hidden"
          aria-label="Закрыть меню"
          onClick={close}
        />
      ) : null}

      <CabinetSidebar
        user={user}
        open={open}
        panelId={titleId}
        onNavigate={close}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col pt-14 md:pt-0">
        {children}
      </div>
    </div>
  );
}
