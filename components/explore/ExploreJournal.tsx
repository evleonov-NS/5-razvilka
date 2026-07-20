import { EmptyState } from "@/components/EmptyState";
import { ExploreSortLinks } from "@/components/ExploreSortLinks";
import { PublicDecisionCard } from "@/components/PublicDecisionCard";
import { getCurrentUser } from "@/lib/auth";
import {
  listPublicDecisions,
  type PublicDecisionSort,
} from "@/lib/public-decisions";
import { versionLabel } from "@/lib/version";

type Props = {
  sort: PublicDecisionSort;
};

export async function ExploreJournal({ sort }: Props) {
  const user = await getCurrentUser();
  const decisions = await listPublicDecisions(sort, user?.id);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 md:px-8 md:py-10">
        <header className="mb-8">
          <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight md:text-3xl">
            Сообщество
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
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
            <p className="mb-4 text-sm text-text-muted">
              {decisions.length === 1
                ? "1 публичный разбор"
                : `${decisions.length} публичных разборов`}
            </p>
            <ul className="space-y-3">
              {decisions.map((decision) => (
                <li key={decision.id}>
                  <PublicDecisionCard decision={decision} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <footer className="border-t border-border px-6 py-4 text-sm text-text-muted md:px-8">
        v{versionLabel}
      </footer>
    </div>
  );
}
