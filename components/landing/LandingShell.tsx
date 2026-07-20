import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SiteHeader } from "@/components/SiteHeader";

/** Оболочка лендинга: липкая шапка, футер, кнопка «наверх». */
export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div className="bg-bg text-text">
      <SiteHeader variant="full" />
      {children}
      <LandingFooter />
      <ScrollToTop />
    </div>
  );
}
