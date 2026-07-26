import { FeedbackForm } from "@/components/feedback/FeedbackForm";
import { LandingShell } from "@/components/landing/LandingShell";
import { getCurrentUser } from "@/lib/auth";

export default async function FeedbackPage() {
  const user = await getCurrentUser();

  return (
    <LandingShell>
      <div className="mx-auto w-full max-w-lg px-6 py-12 md:px-8">
        <h1 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight text-text">
          Обратная связь
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          Напишите, что улучшить или что сломалось. Ответ не публикуется.
        </p>
        <div className="mt-8">
          <FeedbackForm defaultEmail={user?.email ?? null} />
        </div>
      </div>
    </LandingShell>
  );
}
