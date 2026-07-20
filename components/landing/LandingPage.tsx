import { BranchDivider } from "@/components/landing/BranchDivider";
import { LandingAudience } from "@/components/landing/LandingAudience";
import { LandingCta } from "@/components/landing/LandingCta";
import { LandingExample } from "@/components/landing/LandingExample";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingHonesty } from "@/components/landing/LandingHonesty";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingProblem } from "@/components/landing/LandingProblem";
import { LandingShell } from "@/components/landing/LandingShell";

/** Гостевой лендинг: секции собираются здесь, маршрутизация — в app/page.tsx. */
export function LandingPage() {
  return (
    <LandingShell>
      <main>
        <LandingHero />
        {/* sentinel для ScrollToTop: пока в зоне видимости — кнопка скрыта */}
        <div
          data-scroll-top-sentinel
          className="h-px w-full"
          aria-hidden="true"
        />
        <LandingProblem />
        <LandingHowItWorks />
        <LandingFeatures />
        <BranchDivider />
        <LandingExample />
        <LandingHonesty />
        <LandingAudience />
        <LandingFaq />
        <BranchDivider />
        <LandingCta />
      </main>
    </LandingShell>
  );
}
