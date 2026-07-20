/** Общие классы геометрии лендинга. */
export const landingContainer = "mx-auto w-full max-w-6xl px-6 md:px-10";

export const landingSection = `${landingContainer} scroll-mt-24 py-16 md:py-24`;

export const landingH2 =
  "font-[family-name:var(--font-landing-serif)] text-3xl md:text-4xl tracking-tight text-text";

export const landingLead =
  "mt-3 max-w-[62ch] text-base md:text-lg leading-relaxed text-text-muted";

export const landingBody =
  "max-w-[62ch] text-base leading-relaxed text-text-muted";

export const landingFocus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-ink";

/** Карточка: граница + поверхность; тень только в .light (см. .elevate-card). */
export const landingCard =
  "border border-border bg-surface p-6 elevate-card";
