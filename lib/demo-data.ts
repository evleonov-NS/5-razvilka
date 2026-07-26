/**
 * Демо-решения с префиксом [Демо]: загрузка/удаление для текущего пользователя.
 * CLI: prisma/seed-demo-decisions.ts → те же функции.
 */
import {
  ScenarioKind,
  Likelihood,
  Horizon,
  DecisionType,
  DecisionStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Префикс — повторный запуск пересоздаёт только демо-записи. */
export const DEMO_PREFIX = "[Демо] ";

const COMMUNITY_USER_EMAIL = "community@razvilka.local";

type DemoCase = {
  title: string;
  context: string;
  horizon: Horizon;
  type: DecisionType;
  status: DecisionStatus;
  isPublic: boolean;
  scenarios: { kind: ScenarioKind; likelihood: Likelihood; narrative: string }[];
  failureModes: { cause: string; prevention: string }[];
  outcome?: string;
  lesson?: string;
};

const DEMO_CASES: DemoCase[] = [
  {
    title: `${DEMO_PREFIX}Сменить работу в течение года`,
    context:
      "Работаю на текущем месте, но чувствую потолок по развитию и доходу. " +
      "Есть страх потерять стабильность. Семья и финансовые обязательства.",
    horizon: "ONE_YEAR",
    type: "DECISION",
    status: "OPEN",
    isPublic: true,
    scenarios: [
      {
        kind: ScenarioKind.OPTIMISTIC,
        likelihood: Likelihood.LOW,
        narrative: "Новая роль с ростом дохода и комфортной командой.",
      },
      {
        kind: ScenarioKind.BASE,
        likelihood: Likelihood.HIGH,
        narrative: "Переход за 4–6 месяцев, доход +10–15%, без резких потерь.",
      },
      {
        kind: ScenarioKind.PESSIMISTIC,
        likelihood: Likelihood.MEDIUM,
        narrative: "Долгий поиск, просадка дохода, стресс в семье.",
      },
    ],
    failureModes: [
      {
        cause: "Уход без финансовой подушки",
        prevention: "Накопить 3–6 месяцев расходов до старта поиска",
      },
      {
        cause: "Согласие на первое предложение из страха",
        prevention: "Зафиксировать минимальные критерии до собеседований",
      },
    ],
  },
  {
    title: `${DEMO_PREFIX}Взять ипотеку`,
    context:
      "Рассматриваю покупку квартиры: первый взнос есть, но ставка высокая. " +
      "Неясно, стоит ли ждать или фиксировать условия сейчас.",
    horizon: "FIVE_YEARS",
    type: "DECISION",
    status: "OPEN",
    isPublic: true,
    scenarios: [
      {
        kind: ScenarioKind.OPTIMISTIC,
        likelihood: Likelihood.LOW,
        narrative:
          "Ставки снижаются, платёж остаётся комфортным, квартира дорожает медленнее инфляции дохода.",
      },
      {
        kind: ScenarioKind.BASE,
        likelihood: Likelihood.MEDIUM,
        narrative:
          "Платёж ощутимый, но терпимый; через 2–3 года доход догоняет нагрузку.",
      },
      {
        kind: ScenarioKind.PESSIMISTIC,
        likelihood: Likelihood.MEDIUM,
        narrative:
          "Рост расходов и ставки давят на бюджет, приходится резать другие цели.",
      },
    ],
    failureModes: [
      {
        cause: "Занижение скрытых расходов (ремонт, налоги, страховки)",
        prevention: "Составить полный бюджет владения до подписания",
      },
      {
        cause: "Решение только по эмоции «пора своё жильё»",
        prevention: "Сравнить с арендой на горизонте 5 лет в таблице",
      },
    ],
  },
  {
    title: `${DEMO_PREFIX}Скальпинг по 4 часа в день`,
    context:
      "Хочу выделить 4 часа ежедневно на трейдинг как дополнительный доход. " +
      "Основная работа остаётся. Опыт — начальный.",
    horizon: "THREE_MONTHS",
    type: "HABIT",
    status: "OPEN",
    isPublic: true,
    scenarios: [
      {
        kind: ScenarioKind.OPTIMISTIC,
        likelihood: Likelihood.LOW,
        narrative: "Дисциплина держится, небольшой стабильный результат без просадок.",
      },
      {
        kind: ScenarioKind.BASE,
        likelihood: Likelihood.MEDIUM,
        narrative: "Переменный результат, главный урок — риск-менеджмент.",
      },
      {
        kind: ScenarioKind.PESSIMISTIC,
        likelihood: Likelihood.HIGH,
        narrative: "Выгорание, потери депозита, просадка на основной работе.",
      },
    ],
    failureModes: [
      {
        cause: "Торговля без лимита потерь",
        prevention: "Жёсткий дневной стоп до первой сделки",
      },
      {
        cause: "Смешение обучения и реальных денег",
        prevention: "Первый месяц — только демо-счёт",
      },
    ],
  },
  {
    title: `${DEMO_PREFIX}Переехать в другой город`,
    context:
      "Предложение удалённой работы с релокацией. Нравится город, но нет круга общения и неизвестен рынок аренды.",
    horizon: "ONE_YEAR",
    type: "DECISION",
    status: "OPEN",
    isPublic: true,
    scenarios: [
      {
        kind: ScenarioKind.OPTIMISTIC,
        likelihood: Likelihood.LOW,
        narrative: "Быстрая адаптация, новые связи, рост качества жизни.",
      },
      {
        kind: ScenarioKind.BASE,
        likelihood: Likelihood.MEDIUM,
        narrative: "Полгода на обустройство, затем стабильный ритм.",
      },
      {
        kind: ScenarioKind.PESSIMISTIC,
        likelihood: Likelihood.MEDIUM,
        narrative: "Одиночество и сожаление, возврат через год.",
      },
    ],
    failureModes: [
      {
        cause: "Переезд без пробного периода",
        prevention: "Пожить 2–4 недели на съёмной до смены прописки",
      },
    ],
  },
  {
    title: `${DEMO_PREFIX}Запустить side-проект`,
    context:
      "Идея SaaS для своей ниши. Есть прототип, но мало времени после основной работы.",
    horizon: "ONE_YEAR",
    type: "DECISION",
    status: "OPEN",
    isPublic: false,
    scenarios: [
      {
        kind: ScenarioKind.OPTIMISTIC,
        likelihood: Likelihood.LOW,
        narrative: "MVP находит первых платящих клиентов за 6 месяцев.",
      },
      {
        kind: ScenarioKind.BASE,
        likelihood: Likelihood.MEDIUM,
        narrative: "Медленный рост, проект остаётся подработкой.",
      },
      {
        kind: ScenarioKind.PESSIMISTIC,
        likelihood: Likelihood.HIGH,
        narrative: "Заброс после выгорания, без выручки.",
      },
    ],
    failureModes: [
      {
        cause: "Строить фичи без разговоров с пользователями",
        prevention: "10 интервью до следующей разработки",
      },
    ],
  },
  {
    title: `${DEMO_PREFIX}Внедрить новый материал на производстве`,
    context:
      "Поставщик предлагает замену сырья — дешевле, но нужны испытания и риск брака на первой партии.",
    horizon: "THREE_MONTHS",
    type: "DECISION",
    status: "RESOLVED",
    isPublic: false,
    outcome:
      "Пилотная партия дала 8% брака — выше порога. Остались на старом материале.",
    lesson:
      "Проверять не только цену, но и стабильность партий на малом объёме.",
    scenarios: [
      {
        kind: ScenarioKind.OPTIMISTIC,
        likelihood: Likelihood.LOW,
        narrative: "Экономия 15% без потери качества.",
      },
      {
        kind: ScenarioKind.BASE,
        likelihood: Likelihood.MEDIUM,
        narrative: "Экономия есть, но нужна доработка процесса.",
      },
      {
        kind: ScenarioKind.PESSIMISTIC,
        likelihood: Likelihood.HIGH,
        narrative: "Брак и простой линии перекрывают экономию.",
      },
    ],
    failureModes: [
      {
        cause: "Смена материала без контрольной партии",
        prevention: "Пилот на 5–10% объёма с отдельным KPI брака",
      },
    ],
  },
];

async function ensureCommunityUser() {
  return prisma.user.upsert({
    where: { email: COMMUNITY_USER_EMAIL },
    update: {},
    create: {
      email: COMMUNITY_USER_EMAIL,
      name: "Community Demo",
      emailVerified: new Date(),
    },
  });
}

export async function countDemoDecisions(userId: string): Promise<number> {
  return prisma.decision.count({
    where: { userId, title: { startsWith: DEMO_PREFIX } },
  });
}

/** Удаляет только решения текущего user с префиксом [Демо] (+ каскад). */
export async function deleteDemoDecisions(userId: string): Promise<number> {
  const existing = await prisma.decision.findMany({
    where: { userId, title: { startsWith: DEMO_PREFIX } },
    select: { id: true },
  });
  if (existing.length === 0) return 0;

  const ids = existing.map((d) => d.id);
  await prisma.$transaction([
    prisma.decisionLike.deleteMany({ where: { decisionId: { in: ids } } }),
    prisma.failureMode.deleteMany({ where: { decisionId: { in: ids } } }),
    prisma.scenario.deleteMany({ where: { decisionId: { in: ids } } }),
    prisma.decision.deleteMany({ where: { id: { in: ids } } }),
  ]);
  return ids.length;
}

/** Replace демо-решений для userId. Возвращает число созданных. */
export async function seedDemoDecisions(userId: string): Promise<{
  created: number;
  publicCount: number;
}> {
  await deleteDemoDecisions(userId);
  const communityUser = await ensureCommunityUser();

  const createdIds: string[] = [];
  for (const demo of DEMO_CASES) {
    const decision = await prisma.decision.create({
      data: {
        userId,
        title: demo.title,
        context: demo.context,
        horizon: demo.horizon,
        type: demo.type,
        status: demo.status,
        isPublic: demo.isPublic,
        outcome: demo.outcome,
        lesson: demo.lesson,
        resolvedAt: demo.status === "RESOLVED" ? new Date() : undefined,
        scenarios: {
          create: demo.scenarios.map((s, orderIdx) => ({ ...s, orderIdx })),
        },
        failureModes: {
          create: demo.failureModes.map((f, orderIdx) => ({ ...f, orderIdx })),
        },
      },
    });
    createdIds.push(decision.id);
  }

  const publicIds = (
    await prisma.decision.findMany({
      where: { id: { in: createdIds }, isPublic: true },
      select: { id: true },
    })
  ).map((d) => d.id);

  for (const decisionId of publicIds.slice(0, 3)) {
    await prisma.decisionLike.create({
      data: { userId: communityUser.id, decisionId },
    });
  }

  if (publicIds[0]) {
    await prisma.decisionLike.create({
      data: { userId, decisionId: publicIds[0] },
    });
  }

  return { created: createdIds.length, publicCount: publicIds.length };
}
