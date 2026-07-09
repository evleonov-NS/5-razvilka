import { CabinetJournal } from "@/components/cabinet/CabinetJournal";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default function CabinetPage({ searchParams }: PageProps) {
  return (
    <CabinetJournal
      sectionTitle="Мои решения"
      basePath="/cabinet"
      searchParams={searchParams}
    />
  );
}
