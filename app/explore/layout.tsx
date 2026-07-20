import { getCurrentUser } from "@/lib/auth";
import { CabinetShell } from "@/components/cabinet/CabinetShell";
import { ExploreGuestBar } from "@/components/explore/ExploreGuestBar";

export default async function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user) {
    return <CabinetShell user={user}>{children}</CabinetShell>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <ExploreGuestBar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
