import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCabinetCounts } from "@/lib/cabinet-counts";
import { CabinetShell } from "@/components/cabinet/CabinetShell";
import { isOwnerEmail } from "@/lib/owner";

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/cabinet");
  }

  const counts = await getCabinetCounts(user.id);

  return (
    <CabinetShell
      user={user}
      counts={counts}
      isOwner={isOwnerEmail(user.email)}
    >
      {children}
    </CabinetShell>
  );
}
