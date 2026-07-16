import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { SignOutButton } from "@/components/SignOutButton";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export async function Header() {
  const session = await auth();

  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
      <nav className="flex flex-wrap items-center gap-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Развилка
        </Link>
        <Link
          href="/explore"
          className="text-sm text-[var(--muted)] transition hover:text-[var(--foreground)]"
        >
          Сообщество
        </Link>
      </nav>

      {session?.user ? (
        <div className="flex items-center gap-3">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt=""
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : null}
          <span className="text-sm text-[var(--muted)]">
            {session.user.name ?? session.user.email}
          </span>
          <SignOutButton />
        </div>
      ) : (
        <div className="w-full max-w-xs sm:w-auto">
          <GoogleSignInButton />
        </div>
      )}
    </header>
  );
}
