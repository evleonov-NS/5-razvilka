import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { ProfileAvatar } from "@/components/cabinet/ProfileAvatar";
import { LlmSettingsPanel } from "@/components/cabinet/LlmSettingsPanel";
import { versionLabel } from "@/lib/version";

export default async function CabinetSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/cabinet/settings");
  }

  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <div className="flex flex-1 flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 md:px-8 md:py-10">
        <header className="mb-8">
          <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text md:text-3xl">
            Настройки
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Профиль, API для разборов, стоимость запросов и тема.
          </p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start">
          <section className="space-y-8">
            <div className="rounded-lg border border-border bg-surface p-5">
              <h2 className="text-sm font-medium text-text">Профиль</h2>
              <p className="mt-1 text-xs text-text-faint">Только чтение · Google</p>
              <div className="mt-4 flex items-center gap-3">
                <ProfileAvatar name={displayName} image={user.image} size={48} />
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

          <LlmSettingsPanel />
        </div>
      </div>

      <footer className="border-t border-border px-6 py-4 text-sm text-text-muted md:px-8">
        <div className="mx-auto w-full max-w-4xl">v{versionLabel}</div>
      </footer>
    </div>
  );
}
