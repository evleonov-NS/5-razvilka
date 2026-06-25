import { prisma } from "@/lib/prisma";
import { versionLabel } from "@/lib/version";

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function HomePage() {
  let notes: { id: string; title: string; createdAt: Date }[] = [];
  let dbError: string | null = null;

  try {
    notes = await prisma.note.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Ошибка чтения Note из БД:", error);
    dbError =
      "Не удалось подключиться к базе данных. Проверьте DATABASE_URL и DIRECT_URL в .env.";
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Развилка</h1>
        <p className="mt-2 text-[var(--muted)]">
          Посмотри, куда ведёт каждый выбор
        </p>
        <p className="mt-4 rounded-lg border border-[var(--border)] bg-white px-4 py-3 text-sm">
          Smoke-тест Этап 0: главная читает заметки из PostgreSQL (Neon).
        </p>
      </header>

      <main className="flex-1">
        <h2 className="mb-4 text-lg font-semibold">Заметки из базы</h2>

        {dbError ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {dbError}
          </div>
        ) : notes.length === 0 ? (
          <p className="text-[var(--muted)]">
            Заметок пока нет. Запустите{" "}
            <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-sm">
              npm run db:seed
            </code>
            .
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-white">
            {notes.map((note) => (
              <li key={note.id} className="px-4 py-3">
                <p className="font-medium">{note.title}</p>
                <time
                  className="text-sm text-[var(--muted)]"
                  dateTime={note.createdAt.toISOString()}
                >
                  {formatDate(note.createdAt)}
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
