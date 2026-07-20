import { getCurrentUser } from "@/lib/auth";
import { getCabinetCounts } from "@/lib/cabinet-counts";
import { CabinetShell } from "@/components/cabinet/CabinetShell";
import { ExploreGuestBar } from "@/components/explore/ExploreGuestBar";

export default async function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user) {
    const counts = await getCabinetCounts(user.id);
    return (
      <CabinetShell user={user} counts={counts}>
        {children}
      </CabinetShell>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-bg text-text">
      <ExploreGuestBar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
