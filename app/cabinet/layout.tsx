import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CabinetShell } from "@/components/cabinet/CabinetShell";

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/cabinet");
  }

  return <CabinetShell user={user}>{children}</CabinetShell>;
}
