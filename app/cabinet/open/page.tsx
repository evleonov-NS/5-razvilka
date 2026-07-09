import { CabinetJournal } from "@/components/cabinet/CabinetJournal";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default function CabinetOpenPage({ searchParams }: PageProps) {
  return (
    <CabinetJournal
      sectionTitle="Открытые"
      basePath="/cabinet/open"
      statusFilter="OPEN"
      searchParams={searchParams}
    />
  );
}
