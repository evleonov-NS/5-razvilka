import Link from "next/link";
import { notFound } from "next/navigation";
import { getStatsSummary } from "@/lib/analytics";
import { getOwnerUser } from "@/lib/owner";
import { prisma } from "@/lib/prisma";
import { landingFocus } from "@/components/landing/landingLayout";

export const dynamic = "force-dynamic";

function formatDuration(ms: number | null): string {
  if (ms == null) return "—";
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec} с`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} мин`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h} ч ${m} мин`;
}

export default async function CabinetStatsPage() {
  const owner = await getOwnerUser();
  if (!owner) notFound();

  const [stats, feedback] = await Promise.all([
    getStatsSummary(),
    prisma.feedbackMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        message: true,
        email: true,
        createdAt: true,
        user: { select: { email: true } },
      },
    }),
  ]);

  return (
    <div className="flex flex-1 flex-col bg-bg text-text">
      <div className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 md:px-8 md:py-10">
        <header className="mb-8">
          <h1 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight md:text-3xl">
            Статистика
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Интерес к продукту: визиты, длительности, события. Только для
            владельца.
          </p>
          <p className="mt-2">
            <Link
              href="/cabinet/settings"
              className={`text-sm text-accent-ink underline-offset-2 hover:underline ${landingFocus}`}
            >
              ← Настройки
            </Link>
          </p>
        </header>

        <section className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Пользователей" value={String(stats.usersTotal)} />
          <StatCard label="Визиты / сутки" value={String(stats.visitsDay)} />
          <StatCard label="Визиты / 7 дней" value={String(stats.visitsWeek)} />
          <StatCard
            label="Ср. длительность / сутки"
            value={formatDuration(stats.avgDurationMsDay)}
          />
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-medium text-text">События за сутки</h2>
          {stats.eventCountsDay.length === 0 ? (
            <p className="mt-2 text-sm text-text-muted">Пока пусто</p>
          ) : (
            <ul className="mt-3 divide-y divide-border border-t border-border">
              {stats.eventCountsDay.map((row) => (
                <li
                  key={row.type}
                  className="flex justify-between py-2 text-sm"
                >
                  <span className="text-text">{row.type}</span>
                  <span className="tabular-nums text-text-muted">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-medium text-text">События за 7 дней</h2>
          {stats.eventCountsWeek.length === 0 ? (
            <p className="mt-2 text-sm text-text-muted">Пока пусто</p>
          ) : (
            <ul className="mt-3 divide-y divide-border border-t border-border">
              {stats.eventCountsWeek.map((row) => (
                <li
                  key={row.type}
                  className="flex justify-between py-2 text-sm"
                >
                  <span className="text-text">{row.type}</span>
                  <span className="tabular-nums text-text-muted">
                    {row.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mb-10">
          <h2 className="text-sm font-medium text-text">Недавние визиты</h2>
          <ul className="mt-3 divide-y divide-border border-t border-border">
            {stats.recentVisits.map((v) => (
              <li key={v.id} className="py-2.5 text-sm">
                <p className="text-text">{v.email}</p>
                <p className="text-xs text-text-faint">
                  {new Date(v.startedAt).toLocaleString("ru-RU")} ·{" "}
                  {formatDuration(v.durationMs)}
                  {v.endedAt ? "" : " · активен"}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-medium text-text">Обратная связь</h2>
          {feedback.length === 0 ? (
            <p className="mt-2 text-sm text-text-muted">Сообщений пока нет</p>
          ) : (
            <ul className="mt-3 space-y-4">
              {feedback.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <p className="whitespace-pre-wrap text-sm text-text">
                    {item.message}
                  </p>
                  <p className="mt-2 text-xs text-text-faint">
                    {new Date(item.createdAt).toLocaleString("ru-RU")}
                    {item.email || item.user?.email
                      ? ` · ${item.email ?? item.user?.email}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs text-text-faint">{label}</p>
      <p className="mt-1 text-xl font-medium tabular-nums text-text">{value}</p>
    </div>
  );
}
