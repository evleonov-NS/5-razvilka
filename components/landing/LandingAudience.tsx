const audiences = [
  "Основатели и управленцы, которым нужно видеть развилки до того, как выбор зафиксирован.",
  "Инвесторы и те, кто оценивает риск в условиях неполной информации.",
  "Любой, кто стоит перед развилкой в карьере, деньгах или личной жизни.",
] as const;

export function LandingAudience() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <h2 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight text-[var(--landing-fg)] sm:text-4xl">
        Для кого
      </h2>
      <p className="mt-4 max-w-[40ch] text-[var(--landing-muted)]">
        Для тех, кто принимает важные решения и хочет заранее увидеть, где выбор
        может сломаться.
      </p>
      <ul className="mt-10 max-w-xl space-y-5">
        {audiences.map((line) => (
          <li
            key={line}
            className="border-t border-[var(--landing-border)] pt-5 text-sm leading-relaxed text-[var(--landing-fg)] sm:text-base"
          >
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
