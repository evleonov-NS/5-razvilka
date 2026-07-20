/** SVG-развилка для hero: один узел, три ветви (подписи — HTML рядом). */
export function ForkHeroSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M200 340 V190"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M200 190 C200 130 110 110 70 48"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M200 190 C200 120 200 80 200 36"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M200 190 C200 130 290 110 330 48"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="200" cy="190" r="7" fill="currentColor" />
      <circle cx="70" cy="48" r="5" fill="currentColor" opacity="0.75" />
      <circle cx="200" cy="36" r="5" fill="currentColor" opacity="0.75" />
      <circle cx="330" cy="48" r="5" fill="currentColor" opacity="0.75" />
    </svg>
  );
}
