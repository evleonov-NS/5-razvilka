import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getCabinetCounts } from "@/lib/cabinet-counts";
import { DEMO_DECISION, type DemoLikelihood } from "@/lib/demo-decision";
import { versionLabel } from "@/lib/version";
import { CabinetShell } from "@/components/cabinet/CabinetShell";
import { landingFocus } from "@/components/landing/landingLayout";
import { HORIZON_LABELS, TYPE_LABELS } from "@/lib/decision-labels";

const MAX_TREE_DEPTH = 3;

const likelihoodClass: Record<DemoLikelihood, string> = {
  LOW: "border-border text-text-muted",
  MEDIUM: "border-accent text-accent-ink",
  HIGH: "border-accent bg-accent/15 text-accent-ink",
};

function LikelihoodBadge({ value }: { value: DemoLikelihood }) {
  return (
    <span
      className={`inline-block shrink-0 rounded border px-2 py-0.5 text-xs uppercase tracking-wider ${likelihoodClass[value]}`}
    >
      {value}
    </span>
  );
}

type TreeNode = {
  label: string;
  likelihood: DemoLikelihood;
  consequence: string;
  children: readonly TreeNode[];
};

/** Дерево: метка рядом с подписью; вложенность — линия + точка; глубина ≤ 3. */
function DemoTree({
  node,
  depth = 0,
}: {
  node: TreeNode;
  depth?: number;
}) {
  if (depth >= MAX_TREE_DEPTH) return null;

  const isRoot = depth === 0;
  const children =
    depth + 1 < MAX_TREE_DEPTH
      ? node.children
      : ([] as readonly TreeNode[]);

  return (
    <li className={isRoot ? undefined : "relative border-l border-border pl-5"}>
      {!isRoot ? (
        <span
          className="absolute top-2 -left-[3px] h-1.5 w-1.5 rounded-full bg-border-strong"
          aria-hidden="true"
        />
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <p className="font-medium text-text">{node.label}</p>
        <LikelihoodBadge value={node.likelihood} />
      </div>
      <p className="mt-1 text-sm text-text-muted">{node.consequence}</p>

      {children.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {children.map((child) => (
            <DemoTree key={child.label} node={child} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function DemoContent() {
  const d = DEMO_DECISION;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 md:px-8 md:py-10">
      <div className="sticky top-[4.25rem] z-10 mb-8 rounded-lg border border-accent/40 bg-surface px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4 md:top-4">
        <p className="text-sm text-text">
          Это пример разбора. Чтобы разобрать своё решение, нажмите «Разобрать
          своё решение».
        </p>
        <Link
          href="/decisions/new"
          className={`mt-3 inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 sm:mt-0 ${landingFocus}`}
        >
          Разобрать своё решение
        </Link>
      </div>

      <header className="mb-12">
        <p className="text-xs uppercase tracking-wider text-text-faint">
          Демо-разбор
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text md:text-3xl">
          {d.title}
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          {HORIZON_LABELS[d.horizon]} · {TYPE_LABELS[d.type]}
        </p>
        <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-text-muted">
          {d.context}
        </p>
      </header>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text">
          Сценарии будущего
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          {d.scenarios.map((s) => (
            <li key={s.kind} className="min-w-0">
              <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-base font-medium text-text">{s.label}</h3>
                  <LikelihoodBadge value={s.likelihood} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-text-muted">
                  {s.narrative}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text">
          Pre-mortem
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Если разбор «провалится» — почему, и что сделать сейчас.
        </p>
        <ul className="mt-6 space-y-6">
          {d.preMortem.map((item) => (
            <li
              key={item.cause}
              className="space-y-1 border-l-2 border-border pl-4 text-sm leading-relaxed"
            >
              <p className="text-text">
                <span className="font-semibold text-accent-ink">Причина.</span>{" "}
                {item.cause}
              </p>
              <p className="text-text-muted">
                <span className="font-semibold text-accent-ink">Сейчас.</span>{" "}
                {item.prevention}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text">
          Дерево развилок
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Ключевые точки выбора и куда они ведут.
        </p>
        <ul className="mt-6">
          <DemoTree node={d.tree} />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-[family-name:var(--font-landing-serif)] text-2xl tracking-tight text-text">
          Ревью по исходу
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Пример отметки факта — в демо не сохраняется.
        </p>
        <div className="mt-6 space-y-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-text-faint">
              Что вышло
            </p>
            <p className="mt-2 text-base leading-relaxed text-text">
              {d.review.outcome}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-text-faint">
              Ближе к сценарию
            </p>
            <p className="mt-2">
              <span className="inline-block rounded border border-accent bg-accent/15 px-2 py-0.5 text-xs uppercase tracking-wider text-accent-ink">
                {d.review.closestScenario}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-text-faint">
              Один урок
            </p>
            <p className="mt-2 rounded-md bg-surface-2 p-4 text-base leading-relaxed text-text">
              {d.review.lesson}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/decisions/new"
          className={`inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-contrast transition-opacity hover:opacity-90 ${landingFocus}`}
        >
          Разобрать своё решение
        </Link>
        <Link
          href="/cabinet"
          className={`inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm text-text transition-colors hover:border-border-strong hover:bg-surface-2 ${landingFocus}`}
        >
          В журнал
        </Link>
      </div>

      <footer className="mt-12 text-sm text-text-muted">v{versionLabel}</footer>
    </div>
  );
}

export default async function DemoPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/demo");
  }

  const counts = await getCabinetCounts(user.id);

  return (
    <CabinetShell user={user} counts={counts}>
      <DemoContent />
    </CabinetShell>
  );
}
