import { PrismaClient, ScenarioKind, Likelihood } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.failureMode.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      email: "demo@razvilka.local",
      passwordHash: bcrypt.hashSync("demo1234", 10),
    },
  });

  const decision = await prisma.decision.create({
    data: {
      userId: user.id,
      title: "Сменить работу в течение года",
      context:
        "Работаю на текущем месте, но чувствую потолок по развитию и доходу. " +
        "Есть страх потерять стабильность. Семья и финансовые обязательства. " +
        "Рассматриваю поиск новой работы в ближайший год.",
      horizon: "ONE_YEAR",
      type: "DECISION",
      scenarios: {
        create: [
          {
            kind: ScenarioKind.OPTIMISTIC,
            likelihood: Likelihood.LOW,
            narrative:
              "Новая работа с ростом дохода на 30%, комфортная команда, баланс с семьёй.",
            orderIdx: 0,
          },
          {
            kind: ScenarioKind.BASE,
            likelihood: Likelihood.HIGH,
            narrative:
              "Переход занял 4–6 месяцев, доход +10–15%, адаптация без резких потерь.",
            orderIdx: 1,
          },
          {
            kind: ScenarioKind.PESSIMISTIC,
            likelihood: Likelihood.MEDIUM,
            narrative:
              "Долгий поиск, промежуточное падение дохода, стресс в семье из-за неопределённости.",
            orderIdx: 2,
          },
        ],
      },
      failureModes: {
        create: [
          {
            cause: "Уход без финансовой подушки",
            prevention: "Накопить 3–6 месяцев расходов до старта поиска",
            orderIdx: 0,
          },
          {
            cause: "Согласие на первое предложение из страха",
            prevention: "Зафиксировать минимальные критерии до собеседований",
            orderIdx: 1,
          },
          {
            cause: "Выгорание от параллельной работы и поиска",
            prevention: "Выделить фиксированные часы на поиск, не жертвовать сном",
            orderIdx: 2,
          },
        ],
      },
    },
    include: { scenarios: true, failureModes: true },
  });

  console.log("Seed OK:");
  console.log(`  User: ${user.email} (${user.id})`);
  console.log(`  Decision: ${decision.title} (${decision.id})`);
  console.log(`  Scenarios: ${decision.scenarios.length}`);
  console.log(`  FailureModes: ${decision.failureModes.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
