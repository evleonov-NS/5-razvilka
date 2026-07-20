"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { GitBranch, Clock, CheckCircle } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { landingFocus } from "@/components/landing/landingLayout";

type CabinetUser = {
  name: string | null;
  email: string;
  image: string | null;
};

const NAV = [
  { href: "/cabinet", label: "Журнал", icon: GitBranch, exact: true },
  { href: "/cabinet/open", label: "Открытые", icon: Clock, exact: false },
  {
    href: "/cabinet/resolved",
    label: "Решённые",
    icon: CheckCircle,
    exact: false,
  },
] as const;

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type Props = {
  user: CabinetUser;
  open?: boolean;
  panelId?: string;
  onNavigate?: () => void;
};

export function CabinetSidebar({ user, open = false, panelId, onNavigate }: Props) {
  const pathname = usePathname();
  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <aside
      id={panelId}
      className={[
        "fixed inset-y-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-surface",
        "transition-transform duration-200 ease-out md:sticky md:top-0 md:z-auto md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
      aria-label="Навигация кабинета"
    >
      <div className="flex flex-1 flex-col px-3 py-5">
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
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={40}
              height={40}
              className="rounded-full ring-1 ring-border"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold text-accent-ink">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">{displayName}</p>
            <p className="truncate text-xs text-text-muted">{user.email}</p>
          </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(pathname, href, exact);
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                className={[
                  "relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  landingFocus,
                  active
                    ? "bg-surface-2 text-text before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-accent"
                    : "text-text-muted hover:bg-surface-2/70 hover:text-text",
                ].join(" ")}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 space-y-3 border-t border-border pt-4">
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
