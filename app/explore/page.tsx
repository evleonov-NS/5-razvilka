import { ExploreJournal } from "@/components/explore/ExploreJournal";
import type { PublicDecisionSort } from "@/lib/public-decisions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ sort?: string }>;
};

function parseSort(value?: string): PublicDecisionSort {
  return value === "popular" ? "popular" : "recent";
}

export default async function ExplorePage({ searchParams }: PageProps) {
  const { sort: sortParam } = await searchParams;
  return <ExploreJournal sort={parseSort(sortParam)} />;
}
