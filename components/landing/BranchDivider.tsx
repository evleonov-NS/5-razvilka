/** Разделитель-ветка: длиннее, тоньше, по левому краю контейнера. */
export function BranchDivider() {
  return (
    <div
      className="mx-auto w-full max-w-6xl px-6 py-1 md:px-10"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 420 16"
        className="h-3.5 w-full max-w-lg text-border-strong"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        focusable="false"
      >
        <path
          d="M0 8 H220"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinecap="round"
        />
        <circle cx="228" cy="8" r="2" fill="currentColor" />
        <path
          d="M236 8 C280 8 320 3 400 1"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinecap="round"
        />
        <path
          d="M236 8 C280 8 320 13 400 15"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
