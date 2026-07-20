import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  // авторизованный пользователь — в журнал (кабинет), как сейчас
  if (user) {
    redirect("/cabinet");
  }

  return <LandingPage />;
}
