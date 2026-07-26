import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SignOutButton } from "@/components/SignOutButton";
import { ProfileAvatar } from "@/components/cabinet/ProfileAvatar";
import { DemoDataPanel } from "@/components/cabinet/DemoDataPanel";
import { LlmSettingsPanel } from "@/components/cabinet/LlmSettingsPanel";
import {
  cabinetFooterInner4xl,
  cabinetMain4xl,
} from "@/components/cabinet/cabinetLayout";
import { isOwnerEmail } from "@/lib/owner";
import { versionLabel } from "@/lib/version";
import Link from "next/link";

export default async function CabinetSettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/cabinet/settings");
  }

  const displayName = user.name ?? user.email.split("@")[0];
  const isOwner = isOwnerEmail(user.email);

  return (
    <div className="flex flex-1 flex-col bg-bg text-text">
      <div className={cabinetMain4xl}>
        <header className="mb-8">
          <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text md:text-3xl">
            Настройки
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Профиль, API для разборов, демо-данные, стоимость запросов и тема.
          </p>
        </header>

        {/*
          Две колонки одной ширины внутри себя:
          слева — профиль/тема/владелец; справа — все рабочие панели на всю ширину колонки.
        */}
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-10">
          <aside className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
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

            {isOwner ? (
              <div className="rounded-lg border border-border bg-surface p-5">
                <h2 className="text-sm font-medium text-text">Владелец</h2>
                <Link
                  href="/cabinet/stats"
                  className="mt-3 inline-block text-sm text-accent-ink underline-offset-2 hover:underline"
                >
                  Статистика и обратная связь
                </Link>
              </div>
            ) : null}

            <SignOutButton />
          </aside>

          <div className="min-w-0">
            <LlmSettingsPanel demoSlot={<DemoDataPanel />} />
          </div>
        </div>
      </div>

      <footer className="border-t border-border px-6 py-4 text-sm text-text-muted md:px-8">
        <div className={cabinetFooterInner4xl}>v{versionLabel}</div>
      </footer>
    </div>
  );
}
