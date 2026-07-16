import { notFound } from "next/navigation";
import { ExploreDetail } from "@/components/explore/ExploreDetail";
import { getCurrentUser } from "@/lib/auth";
import { getPublicDecision } from "@/lib/public-decisions";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ExploreDetailPage({ params }: PageProps) {
  const user = await getCurrentUser();
  const { id } = await params;
  const decision = await getPublicDecision(id, user?.id);

  if (!decision) {
    notFound();
  }

  return <ExploreDetail decision={decision} />;
}
