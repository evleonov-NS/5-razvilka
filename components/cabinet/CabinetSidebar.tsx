"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  GitBranch,
  Clock,
  CheckCircle,
  Settings,
  Users,
} from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

type CabinetUser = {
  name: string | null;
  email: string;
  image: string | null;
};

const NAV = [
  { href: "/cabinet", label: "Журнал", icon: GitBranch, exact: true },
  { href: "/cabinet/open", label: "Открытые", icon: Clock, exact: false },
  { href: "/cabinet/resolved", label: "Решённые", icon: CheckCircle, exact: false },
  { href: "/explore", label: "Сообщество", icon: Users, exact: false },
  { href: "/cabinet/settings", label: "Настройки", icon: Settings, exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean): boolean {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function CabinetSidebar({ user }: { user: CabinetUser }) {
  const pathname = usePathname();
  const displayName = user.name ?? user.email.split("@")[0];

  return (
    <aside className="flex w-[280px] shrink-0 flex-col bg-gradient-to-b from-sky-50 to-sky-100/80 px-4 py-6">
      <Link href="/cabinet" className="mb-8 flex items-center gap-3 px-2">
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={44}
            height={44}
            className="rounded-full ring-2 ring-white/80"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-200 text-sm font-semibold text-sky-800">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-sky-950">{displayName}</p>
          <p className="truncate text-xs text-sky-700/80">{user.email}</p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(pathname, href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white text-sky-900 shadow-sm"
                  : "text-sky-800/90 hover:bg-white/60 hover:text-sky-900"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 border-t border-sky-200/80 pt-4 px-2">
        <SignOutButton />
      </div>
    </aside>
  );
}
