export type FailureModeItem = {
  id?: string;
  cause: string;
  prevention: string;
};

type Props = {
  items: FailureModeItem[];
};

/** Сценарий провала: причина + предупреждающее действие «сейчас». */
export function FailureModeList({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-text-muted">Причины провала пока не сформированы.</p>
    );
  }

  return (
    <ul className="space-y-6">
      {items.map((item, index) => (
        <li
          key={item.id ?? `${index}-${item.cause.slice(0, 24)}`}
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
  );
}
