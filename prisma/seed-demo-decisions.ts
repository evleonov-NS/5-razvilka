import {
  PrismaClient,
  ScenarioKind,
  Likelihood,
  Horizon,
  DecisionType,
  DecisionStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

/** Префикс — чтобы повторный запуск пересоздавал только демо-записи. */
const DEMO_PREFIX = "[Демо] ";

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
        narrative: "Ставки снижаются, платёж остаётся комфортным, квартира дорожает медленнее инфляции дохода.",
      },
      {
        kind: ScenarioKind.BASE,
        likelihood: Likelihood.MEDIUM,
        narrative: "Платёж ощутимый, но терпимый; через 2–3 года доход догоняет нагрузку.",
      },
      {
        kind: ScenarioKind.PESSIMISTIC,
        likelihood: Likelihood.MEDIUM,
        narrative: "Рост расходов и ставки давят на бюджет, приходится резать другие цели.",
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
    outcome: "Пилотная партия дала 8% брака — выше порога. Остались на старом материале.",
    lesson: "Проверять не только цену, но и стабильность партий на малом объёме.",
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

async function resolveTargetUser() {
  const emailFromEnv = process.env.DEMO_USER_EMAIL?.trim();

  if (emailFromEnv) {
    const user = await prisma.user.findUnique({ where: { email: emailFromEnv } });
    if (!user) {
      throw new Error(
        `Пользователь ${emailFromEnv} не найден. Сначала войдите через Google с этим email.`,
      );
    }
    return user;
  }

  const user = await prisma.user.findFirst({
    where: {
      email: {
        notIn: ["demo@razvilka.local", COMMUNITY_USER_EMAIL],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!user) {
    throw new Error(
      "Не найден пользователь Google OAuth. Войдите в приложение через Google, " +
        "затем снова запустите npm run db:seed-demo. " +
        "Или укажите DEMO_USER_EMAIL=ваш@email.com в .env",
    );
  }

  return user;
}

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

async function main() {
  const targetUser = await resolveTargetUser();
  const communityUser = await ensureCommunityUser();

  const existingDemo = await prisma.decision.findMany({
    where: {
      userId: targetUser.id,
      title: { startsWith: DEMO_PREFIX },
    },
    select: { id: true },
  });

  if (existingDemo.length > 0) {
    const ids = existingDemo.map((d) => d.id);
    await prisma.decisionLike.deleteMany({ where: { decisionId: { in: ids } } });
    await prisma.failureMode.deleteMany({ where: { decisionId: { in: ids } } });
    await prisma.scenario.deleteMany({ where: { decisionId: { in: ids } } });
    await prisma.decision.deleteMany({ where: { id: { in: ids } } });
    console.log(`Удалено старых демо-решений: ${ids.length}`);
  }

  const createdIds: string[] = [];

  for (const demo of DEMO_CASES) {
    const decision = await prisma.decision.create({
      data: {
        userId: targetUser.id,
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
      select: { id: true, title: true },
    })
  ).map((d) => d.id);

  // Лайки от «сообщества» — для проверки sort=popular
  for (const decisionId of publicIds.slice(0, 3)) {
    await prisma.decisionLike.create({
      data: { userId: communityUser.id, decisionId },
    });
  }

  // Лайк от владельца на первое публичное — проверка self-like на dev
  if (publicIds[0]) {
    await prisma.decisionLike.create({
      data: { userId: targetUser.id, decisionId: publicIds[0] },
    });
  }

  console.log("Demo seed OK:");
  console.log(`  Пользователь: ${targetUser.email} (${targetUser.id})`);
  console.log(`  Решений: ${createdIds.length} (${publicIds.length} публичных)`);
  console.log(`  Лента: http://localhost:3015/explore`);
  console.log(`  Кабинет: http://localhost:3015/cabinet`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
