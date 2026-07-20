import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCabinetCounts } from "@/lib/cabinet-counts";
import { CabinetShell } from "@/components/cabinet/CabinetShell";

/** Форма и результат — тот же сайдбар, без скачка вёрстки. */
export default async function DecisionsLayout({
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
    <CabinetShell user={user} counts={counts}>
      {children}
    </CabinetShell>
  );
}
