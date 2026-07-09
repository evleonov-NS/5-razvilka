import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { versionLabel } from "@/lib/version";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await auth();
  if (session?.user) {
    redirect("/cabinet");
  }

  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/cabinet";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-2xl font-bold tracking-tight">Вход в Развилку</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Войдите через Google, чтобы сохранять решения в своём журнале.
      </p>

      <div className="mt-8">
        <GoogleSignInButton callbackUrl={callbackUrl} />
      </div>

      <footer className="mt-12 text-sm text-[var(--muted)]">v{versionLabel}</footer>
    </div>
  );
}
