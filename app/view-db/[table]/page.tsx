import { notFound } from "next/navigation";
import { TableViewer } from "@/components/view-db/TableViewer";
import { assertValidTableName } from "@/lib/view-db/sql";
import { resolveDbProfile } from "@/lib/view-db/request";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ table: string }>;
  searchParams: Promise<{ profile?: string }>;
};

export default async function ViewDbTablePage({
  params,
  searchParams,
}: PageProps) {
  const { table } = await params;
  const query = await searchParams;

  try {
    assertValidTableName(decodeURIComponent(table));
  } catch {
    notFound();
  }

  const tableName = decodeURIComponent(table);
  const profile = await resolveDbProfile(query.profile);

  return <TableViewer tableName={tableName} profile={profile} />;
}
