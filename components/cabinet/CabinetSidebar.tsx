"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitBranch, Clock, CheckCircle } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileAvatar } from "@/components/cabinet/ProfileAvatar";
import { landingFocus } from "@/components/landing/landingLayout";
import type { CabinetCounts } from "@/lib/cabinet-counts";

type CabinetUser = {
  name: string | null;
  email: string;
  image: string | null;
};

const NAV = [
  { href: "/cabinet", label: "Журнал", icon: GitBranch, exact: true, countKey: null },
  {
    href: "/cabinet/open",
    label: "Открытые",
    icon: Clock,
    exact: false,
    countKey: "open" as const,
  },
  {
    href: "/cabinet/resolved",
    label: "Решённые",
    icon: CheckCircle,
    exact: false,
    countKey: "resolved" as const,
  },
] as const;

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  user: CabinetUser;
  counts?: CabinetCounts;
  open?: boolean;
  panelId?: string;
  onNavigate?: () => void;
};

/**
 * Панель: на md+ sticky + self-start + h-[100dvh].
 * transform только на mobile (drawer); на md — transform-none, иначе sticky ломается.
 */
export function CabinetSidebar({
  user,
  counts,
  open = false,
  panelId,
  onNavigate,
}: Props) {
  const pathname = usePathname();
  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <aside
      id={panelId}
      className={[
        "z-50 flex w-56 shrink-0 flex-col border-r border-border bg-surface",
        // Mobile: fixed drawer + transform
        "fixed inset-y-0 left-0 transition-transform duration-200 ease-out",
        open ? "translate-x-0" : "-translate-x-full",
        // Desktop: sticky к окну; self-start снимает stretch; без transform
        "md:sticky md:inset-auto md:left-auto md:top-0 md:z-auto md:h-[100dvh] md:self-start md:translate-x-0 md:transform-none md:overflow-y-auto",
      ].join(" ")}
    >
      <div className="flex h-full flex-col px-3 py-5">
        <Link
          href="/"
          onClick={onNavigate}
          className={`mb-6 px-2 font-[family-name:var(--font-landing-serif)] text-lg tracking-tight text-text transition-colors hover:text-accent-ink ${landingFocus}`}
        >
          Развилка
        </Link>

        <Link
          href="/cabinet/settings"
          onClick={onNavigate}
          className={`mb-6 flex items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-surface-2 ${landingFocus}`}
        >
          <ProfileAvatar name={displayName} image={user.image} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">{displayName}</p>
            <p className="truncate text-xs text-text-muted">{user.email}</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-1" aria-label="Разделы кабинета">
          {NAV.map(({ href, label, icon: Icon, exact, countKey }) => {
            const active = isActive(pathname, href, exact);
            const count = countKey && counts ? counts[countKey] : 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  landingFocus,
                  active
                    ? "bg-surface-2 text-text before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-accent"
                    : "text-text-muted hover:bg-surface-2/70 hover:text-text",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {count > 0 ? (
                  <span className="tabular-nums text-xs text-text-faint">
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <span className="text-xs text-text-faint">Тема</span>
            <ThemeToggle />
          </div>
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
