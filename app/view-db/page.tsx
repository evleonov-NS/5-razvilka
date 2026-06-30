import { DbSelector } from "@/components/view-db/DbSelector";
import { TableList } from "@/components/view-db/TableList";
import { getViewDbClient } from "@/lib/view-db/client";
import {
  getDatabaseUrl,
  getDbProfileInfos,
  maskDatabaseUrl,
} from "@/lib/view-db/config";
import { resolveDbProfile } from "@/lib/view-db/request";
import { apiErrorMessage, listPublicTables } from "@/lib/view-db/sql";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ profile?: string }>;
};

export default async function ViewDbPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const profiles = getDbProfileInfos();
  const profile = await resolveDbProfile(params.profile);

  let tables: Awaited<ReturnType<typeof listPublicTables>> = [];
  let connection = "";
  let error: string | null = null;

  try {
    const client = getViewDbClient(profile);
    tables = await listPublicTables(client);
    connection = maskDatabaseUrl(getDatabaseUrl(profile));
  } catch (err) {
    error = apiErrorMessage(err);
  }

  return (
    <div className="space-y-8">
      <DbSelector profiles={profiles} current={profile} />
      <section>
        <h2 className="mb-4 text-lg font-semibold">Таблицы</h2>
        <TableList
          tables={tables}
          profile={profile}
          connection={connection}
          error={error}
        />
      </section>
    </div>
  );
}
