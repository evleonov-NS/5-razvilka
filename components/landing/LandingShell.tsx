import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";

/** Оболочка лендинга: тема на <html>, здесь только разметка. */
export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-bg text-text">
      <LandingHeader />
      {children}
      <LandingFooter />
    </div>
  );
}
