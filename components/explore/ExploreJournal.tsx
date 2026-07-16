import { EmptyState } from "@/components/EmptyState";
import { ExploreSortLinks } from "@/components/ExploreSortLinks";
import { PublicDecisionCard } from "@/components/PublicDecisionCard";
import { getCurrentUser } from "@/lib/auth";
import { listPublicDecisions, type PublicDecisionSort } from "@/lib/public-decisions";
import { versionLabel } from "@/lib/version";

type Props = {
  sort: PublicDecisionSort;
};

export async function ExploreJournal({ sort }: Props) {
  const user = await getCurrentUser();
  const decisions = await listPublicDecisions(sort, user?.id);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex-1 px-8 py-8">
        <header className="mb-8">
          {user ? (
            <>
              <h1 className="text-2xl font-bold tracking-tight">Личный кабинет</h1>
              <h2 className="mt-1 text-lg text-[var(--muted)]">Сообщество</h2>
            </>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight">Сообщество</h1>
          )}
          <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
            Публичные разборы решений — без данных ревью, контекст с обрезкой.
          </p>
        </header>

        <div className="mb-6">
          <ExploreSortLinks current={sort} />
        </div>

        {decisions.length === 0 ? (
          <EmptyState
            title="Пока пусто"
            description="Публичных разборов ещё нет. Опубликуйте свой в кабинете."
            actionLabel={user ? "В кабинет" : "Войти"}
            actionHref={user ? "/cabinet" : "/login?callbackUrl=/explore"}
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-[var(--muted)]">
              {decisions.length === 1
                ? "1 публичный разбор"
                : `${decisions.length} публичных разборов`}
            </p>
            <ul className="flex flex-col gap-3">
              {decisions.map((decision) => (
                <li key={decision.id}>
                  <PublicDecisionCard decision={decision} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <footer className="border-t border-[var(--border)] px-8 py-4 text-sm text-[var(--muted)]">
        v{versionLabel}
      </footer>
    </div>
  );
}
