import {
  landingH2,
  landingLead,
  landingSection,
} from "@/components/landing/landingLayout";

const limits = [
  "Не предсказывает будущее и не обещает точность прогноза.",
  "Не даёт готовый ответ «делай / не делай».",
  "Не использует проценты вероятности — только метки LOW / MEDIUM / HIGH.",
  "Не заменяет юридическую, медицинскую и финансовую консультацию.",
] as const;

export function LandingHonesty() {
  return (
    <section className={landingSection}>
      <div className="border-l-2 border-accent pl-6 md:pl-8">
        <h2 className={landingH2}>Честная рамка</h2>
        <p className={`${landingLead} mt-3`}>
          Развилка раскладывает варианты и риски. Это инструмент мышления, а не
          оракул и не замена профессиональной экспертизы.
        </p>
        <ul className="mt-10 space-y-3 md:mt-12">
          {limits.map((line) => (
            <li
              key={line}
              className="flex max-w-[62ch] gap-3 text-base leading-relaxed text-text"
            >
              <span
                className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent"
                aria-hidden="true"
              />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
