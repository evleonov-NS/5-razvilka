import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SiteHeader } from "@/components/SiteHeader";

/** Оболочка login/register: общая шапка (minimal) + центрированная карточка + футер. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <SiteHeader variant="minimal" />
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center px-6 py-12">
        <div className="elevate-card w-full max-w-sm rounded-lg border border-border bg-surface p-8">
          {children}
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
