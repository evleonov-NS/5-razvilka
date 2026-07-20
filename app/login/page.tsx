import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthShell } from "@/components/AuthShell";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

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
    <AuthShell>
      <h1 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight text-text">
        Вход в Развилку
      </h1>
      <p className="mt-2 text-sm text-text-muted">
        Войдите через Google, чтобы сохранять решения в своём журнале.
      </p>

      <div className="mt-8">
        <GoogleSignInButton callbackUrl={callbackUrl} />
      </div>
    </AuthShell>
  );
}
