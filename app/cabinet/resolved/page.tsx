import { CabinetJournal } from "@/components/cabinet/CabinetJournal";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default function CabinetResolvedPage({ searchParams }: PageProps) {
  return (
    <CabinetJournal
      sectionTitle="Решённые"
      basePath="/cabinet/resolved"
      statusFilter="RESOLVED"
      searchParams={searchParams}
    />
  );
}
