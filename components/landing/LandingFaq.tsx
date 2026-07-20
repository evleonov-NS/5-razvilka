import {
  landingFocus,
  landingH2,
  landingSection,
} from "@/components/landing/landingLayout";

const faqs = [
  {
    q: "Чем это отличается от разговора с ChatGPT?",
    a: "Структура разбора зафиксирована: сценарии, pre-mortem, дерево развилок, журнал и ревью по факту. Ответы сохраняются и сверяются с исходом — это не разовый чат, а накопление решений.",
  },
  {
    q: "Почему нет процентов вероятности?",
    a: "Проценты создают ложную точность. Мы используем только метки LOW, MEDIUM и HIGH — этого достаточно, чтобы сравнивать сценарии без имитации прогноза.",
  },
  {
    q: "Что происходит с моими данными?",
    a: "Разборы хранятся в вашем журнале и по умолчанию доступны только вам. Публикация в сообщество — отдельное действие владельца, не автоматический режим.",
  },
  {
    q: "Сколько занимает один разбор?",
    a: "Описание решения — несколько минут. Генерация сценариев и pre-mortem обычно укладывается в короткое ожидание на сервере; дерево развилок можно запросить отдельно.",
  },
  {
    q: "Нужно ли платить?",
    a: "Первый разбор — бесплатно. Оплата в MVP не входит: сейчас достаточно войти и разобрать решение в рамках доступного лимита.",
  },
] as const;

export function LandingFaq() {
  return (
    <section className={landingSection}>
      <h2 className={landingH2}>Вопросы</h2>
      <div className="mt-10 max-w-3xl border-t border-border md:mt-12">
        {faqs.map((item) => (
          <details
            key={item.q}
            className="group border-b border-border py-5"
          >
            <summary
              className={`cursor-pointer list-none text-base font-medium text-text transition-colors hover:text-accent-ink ${landingFocus} [&::-webkit-details-marker]:hidden`}
            >
              <span className="flex items-start justify-between gap-4">
                {item.q}
                <span
                  className="mt-1 shrink-0 text-text-faint transition-transform duration-200 group-open:rotate-45"
                  aria-hidden="true"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 1 V13 M1 7 H13"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </summary>
            <p className="max-w-[62ch] pt-3 text-sm leading-relaxed text-text-muted">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
