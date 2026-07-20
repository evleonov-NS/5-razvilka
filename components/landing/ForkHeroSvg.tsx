/** SVG-развилка для hero: один узел, три расходящиеся ветви. */
export function ForkHeroSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      {/* ствол */}
      <path
        d="M160 260 V150"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {/* три ветви */}
      <path
        d="M160 150 C160 110 100 90 70 40"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M160 150 C160 100 160 70 160 28"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M160 150 C160 110 220 90 250 40"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {/* узел развилки */}
      <circle cx="160" cy="150" r="5" fill="currentColor" />
      {/* конечные узлы */}
      <circle cx="70" cy="40" r="3.5" fill="currentColor" opacity="0.7" />
      <circle cx="160" cy="28" r="3.5" fill="currentColor" opacity="0.7" />
      <circle cx="250" cy="40" r="3.5" fill="currentColor" opacity="0.7" />
      {/* метки веток */}
      <text
        x="48"
        y="28"
        fill="currentColor"
        opacity="0.45"
        fontSize="10"
        fontFamily="var(--font-landing-sans), system-ui, sans-serif"
      >
        оптим.
      </text>
      <text
        x="168"
        y="22"
        fill="currentColor"
        opacity="0.45"
        fontSize="10"
        fontFamily="var(--font-landing-sans), system-ui, sans-serif"
      >
        базовый
      </text>
      <text
        x="256"
        y="28"
        fill="currentColor"
        opacity="0.45"
        fontSize="10"
        fontFamily="var(--font-landing-sans), system-ui, sans-serif"
      >
        пессим.
      </text>
    </svg>
  );
}
