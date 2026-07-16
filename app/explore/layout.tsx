import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { CabinetSidebar } from "@/components/cabinet/CabinetSidebar";
import { ExploreGuestBar } from "@/components/explore/ExploreGuestBar";

export default async function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user) {
    return (
      <div className="flex min-h-screen bg-[var(--background)]">
        <CabinetSidebar user={user} />
        <div className="flex min-h-screen flex-1 flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <ExploreGuestBar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
