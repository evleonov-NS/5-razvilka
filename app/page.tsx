import { prisma } from "@/lib/prisma";
import { versionLabel } from "@/lib/version";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

const HORIZON_LABELS: Record<string, string> = {
  THREE_MONTHS: "3 месяца",
  ONE_YEAR: "1 год",
  FIVE_YEARS: "5 лет",
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: "открыто",
  RESOLVED: "решено",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function HomePage() {
  let decisions: {
    id: string;
    title: string;
    horizon: string;
    status: string;
    createdAt: Date;
    _count: { scenarios: number; failureModes: number };
  }[] = [];
  let dbError: string | null = null;

  try {
    decisions = await prisma.decision.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { scenarios: true, failureModes: true } },
      },
    });
  } catch (error) {
    console.error("Ошибка чтения Decision из БД:", error);
    dbError =
      "Не удалось подключиться к базе данных. Проверьте DATABASE_URL и DIRECT_URL в .env.";
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12">
      <Header />

      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Развилка</h1>
        <p className="mt-2 text-[var(--muted)]">
          Посмотри, куда ведёт каждый выбор
        </p>
      </div>

      <main className="flex-1">
        <h2 className="mb-4 text-lg font-semibold">Решения в базе</h2>

        {dbError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {dbError}
          </div>
        ) : decisions.length === 0 ? (
          <p className="text-[var(--muted)]">
            Решений пока нет. Запустите{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
              npm run db:seed
            </code>
            .
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-white">
            {decisions.map((decision) => (
              <li key={decision.id} className="px-4 py-3">
                <p className="font-medium">{decision.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {HORIZON_LABELS[decision.horizon] ?? decision.horizon}
                  {" · "}
                  {STATUS_LABELS[decision.status] ?? decision.status}
                  {" · "}
                  {decision._count.scenarios} сценариев,{" "}
                  {decision._count.failureModes} рисков
                </p>
                <time
                  className="text-xs text-[var(--muted)]"
                  dateTime={decision.createdAt.toISOString()}
                >
                  {formatDate(decision.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="mt-12 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
        v{versionLabel}
      </footer>
    </div>
  );
}
