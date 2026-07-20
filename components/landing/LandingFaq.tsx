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
    <section className="mx-auto w-full max-w-5xl px-6 py-16 sm:py-24">
      <h2 className="font-[family-name:var(--font-landing-serif)] text-3xl tracking-tight text-[var(--landing-fg)] sm:text-4xl">
        Вопросы
      </h2>
      <div className="mt-10 max-w-2xl divide-y divide-[var(--landing-border)] border-y border-[var(--landing-border)]">
        {faqs.map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="cursor-pointer list-none text-base font-medium text-[var(--landing-fg)] transition-colors duration-200 hover:text-[var(--landing-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--landing-accent)] [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.q}
                <span
                  className="mt-1 shrink-0 text-[var(--landing-muted)] transition-transform duration-200 group-open:rotate-45"
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
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-[var(--landing-muted)]">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
