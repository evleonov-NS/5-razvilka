import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { RegisterShell } from "@/components/landing/RegisterShell";
import { versionLabel } from "@/lib/version";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

/** Регистрация = вход через Google (email/пароль вне scope MVP). */
export default async function RegisterPage({ searchParams }: PageProps) {
  const session = await auth();
  if (session?.user) {
    redirect("/cabinet");
  }

  const params = await searchParams;
  const callbackUrl = params.callbackUrl ?? "/cabinet";

  return (
    <RegisterShell>
      <h1 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight">
        Регистрация
      </h1>
      <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-[var(--landing-muted)]">
        Создайте аккаунт через Google, чтобы сохранить разбор в журнале решений.
        Первый разбор — бесплатно.
      </p>

      <div className="mt-8">
        <GoogleSignInButton callbackUrl={callbackUrl} />
      </div>

      <p className="mt-6 text-sm text-[var(--landing-muted)]">
        Уже есть аккаунт?{" "}
        <Link
          href="/login"
          className="text-[var(--landing-accent)] transition-colors duration-200 hover:text-[var(--landing-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)]"
        >
          Войти
        </Link>
      </p>

      <footer className="mt-12 text-sm text-[var(--landing-muted)]">
        v{versionLabel}
      </footer>
    </RegisterShell>
  );
}
