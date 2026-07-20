import Link from "next/link";
import { versionLabel } from "@/lib/version";
import { NewDecisionForm } from "@/components/cabinet/NewDecisionForm";
import { landingFocus } from "@/components/landing/landingLayout";

type PageProps = {
  searchParams: Promise<{ preset?: string }>;
};

export default async function NewDecisionPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className="flex flex-1 flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 md:px-8 md:py-10">
        <Link
          href="/cabinet"
          className={`mb-8 inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text ${landingFocus}`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 3 L5 8 L10 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          В журнал
        </Link>

        <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text md:text-3xl">
          Какое решение разбираем?
        </h1>

        <div className="mt-8">
          <NewDecisionForm presetId={params.preset} />
        </div>
      </div>

      <footer className="border-t border-border px-6 py-4 text-sm text-text-muted md:px-8">
        <div className="mx-auto w-full max-w-2xl">v{versionLabel}</div>
      </footer>
    </div>
  );
}
