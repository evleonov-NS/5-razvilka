import { LikelihoodBadge } from "@/components/LikelihoodBadge";
import type { TreeBranch, TreeResponse } from "@/lib/validators";

const MAX_TREE_DEPTH = 3;

type BranchProps = {
  branch: TreeBranch;
  depth: number;
};

/** Вложенная ветка: сворачиваемая, глубина отображения ≤ 3. */
function TreeBranchNode({ branch, depth }: BranchProps) {
  if (depth >= MAX_TREE_DEPTH) return null;

  const children =
    depth + 1 < MAX_TREE_DEPTH ? branch.branches : ([] as TreeBranch[]);
  const hasChildren = children.length > 0;

  const header = (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {hasChildren ? (
          <span
            className="text-xs text-text-faint transition-transform group-open:rotate-90"
            aria-hidden
          >
            ▶
          </span>
        ) : null}
        <p className="font-medium text-text">{branch.choice}</p>
        <LikelihoodBadge value={branch.likelihood} />
      </div>
      <p className="mt-1 text-sm text-text-muted">{branch.consequence}</p>
    </>
  );

  const nested = hasChildren ? (
    <ul className="mt-4 space-y-3">
      {children.map((child, i) => (
        <TreeBranchNode
          key={`${depth}-${i}-${child.choice.slice(0, 24)}`}
          branch={child}
          depth={depth + 1}
        />
      ))}
    </ul>
  ) : null;

  return (
    <li className="relative border-l border-border pl-5">
      <span
        className="absolute top-2 -left-[3px] h-1.5 w-1.5 rounded-full bg-border-strong"
        aria-hidden="true"
      />
      {hasChildren ? (
        <details open className="group">
          <summary className="cursor-pointer list-none marker:content-none [&::-webkit-details-marker]:hidden">
            {header}
          </summary>
          {nested}
        </details>
      ) : (
        header
      )}
    </li>
  );
}

type Props = {
  tree: TreeResponse;
};

/** Дерево развилок: корень + сворачиваемые ветки (глубина до 3). */
export function DecisionTree({ tree }: Props) {
  return (
    <div className="rounded-lg border border-border bg-surface px-5 py-5">
      <p className="font-medium text-text">{tree.label}</p>
      {tree.branches.length > 0 ? (
        <ul className="mt-4 space-y-4">
          {tree.branches.map((branch, i) => (
            <TreeBranchNode
              key={`root-${i}-${branch.choice.slice(0, 24)}`}
              branch={branch}
              depth={1}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-text-muted">Ветки не заданы.</p>
      )}
    </div>
  );
}
