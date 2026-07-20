import {
  landingCard,
  landingH2,
  landingLead,
  landingSection,
} from "@/components/landing/landingLayout";

const audiences = [
  {
    role: "Основатели и управленцы",
    body: "Нужно видеть развилки до того, как выбор зафиксирован.",
  },
  {
    role: "Инвесторы",
    body: "Оценивают риск в условиях неполной информации.",
  },
  {
    role: "Личные решения",
    body: "Стоят перед развилкой в карьере, деньгах или личной жизни.",
  },
] as const;

export function LandingAudience() {
  return (
    <section className={landingSection}>
      <h2 className={landingH2}>Для кого</h2>
      <p className={landingLead}>
        Для тех, кто принимает важные решения и хочет заранее увидеть, где выбор
        может сломаться.
      </p>
      <ul className="mt-10 grid gap-6 md:mt-12 md:grid-cols-3">
        {audiences.map((item) => (
          <li key={item.role} className={landingCard}>
            <p className="text-sm uppercase tracking-wider text-accent-ink">
              {item.role}
            </p>
            <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-text">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
