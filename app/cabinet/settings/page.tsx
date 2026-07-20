import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { versionLabel } from "@/lib/version";

export default async function CabinetSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/cabinet/settings");
  }

  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 md:px-8 md:py-10">
        <header className="mb-8">
          <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text md:text-3xl">
            Настройки
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Профиль из Google и оформление — без лишнего.
          </p>
        </header>

        <section className="max-w-md space-y-8">
          <div className="rounded-lg border border-border bg-surface p-5">
            <h2 className="text-sm font-medium text-text">Профиль</h2>
            <p className="mt-1 text-xs text-text-faint">Только чтение · Google</p>
            <div className="mt-4 flex items-center gap-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={48}
                  height={48}
                  className="rounded-full ring-1 ring-border"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-base font-semibold text-accent-ink">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate font-medium text-text">{displayName}</p>
                <p className="truncate text-sm text-text-muted">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-medium text-text">Тема</h2>
                <p className="mt-1 text-xs text-text-muted">
                  Светлая или тёмная — как на лендинге
                </p>
              </div>
              <ThemeToggle />
            </div>
          </div>

          <div className="max-w-xs">
            <SignOutButton />
          </div>
        </section>
      </div>

      <footer className="border-t border-border px-6 py-4 text-sm text-text-muted md:px-8">
        v{versionLabel}
      </footer>
    </div>
  );
}
