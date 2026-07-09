import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { CabinetSidebar } from "@/components/cabinet/CabinetSidebar";

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/cabinet");
  }

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <CabinetSidebar user={user} />
      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}
