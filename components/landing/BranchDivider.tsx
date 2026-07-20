/** Тонкий разделитель-ветка между секциями. */
export function BranchDivider() {
  return (
    <div className="mx-auto flex max-w-3xl justify-center px-6 py-2" aria-hidden="true">
      <svg
        viewBox="0 0 200 24"
        className="h-6 w-48 text-[var(--landing-line)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <path
          d="M10 12 H90"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx="100" cy="12" r="2.5" fill="currentColor" />
        <path
          d="M110 12 C130 12 145 6 190 4"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M110 12 C130 12 145 18 190 20"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
