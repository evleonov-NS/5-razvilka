/**
 * Короткая проверка доменной схемы после миграции.
 * Создаёт: User → Decision → Scenario + FailureMode.
 */
import { PrismaClient, ScenarioKind, Likelihood } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = `verify-${Date.now()}@razvilka.local`;

  const user = await prisma.user.create({
    data: {
      email,
      name: "Verify User",
      emailVerified: new Date(),
    },
  });

  const decision = await prisma.decision.create({
    data: {
      userId: user.id,
      title: "Verify: тестовое решение",
      context: "Краткий контекст для проверки связей User → Decision.",
      horizon: "THREE_MONTHS",
      type: "DECISION",
    },
  });

  const scenario = await prisma.scenario.create({
    data: {
      decisionId: decision.id,
      kind: ScenarioKind.BASE,
      likelihood: Likelihood.MEDIUM,
      narrative: "Verify: базовый сценарий для smoke-теста схемы.",
      orderIdx: 0,
    },
  });

  const failureMode = await prisma.failureMode.create({
    data: {
      decisionId: decision.id,
      cause: "Verify: тестовая причина провала",
      prevention: "Verify: тестовое предупреждающее действие",
      orderIdx: 0,
    },
  });

  const loaded = await prisma.decision.findUnique({
    where: { id: decision.id },
    include: {
      user: true,
      scenarios: true,
      failureModes: true,
    },
  });

  if (!loaded || loaded.scenarios.length !== 1 || loaded.failureModes.length !== 1) {
    throw new Error("Verify failed: связи Decision ↔ Scenario ↔ FailureMode не сходятся");
  }

  console.log("Verify OK — доменная схема работает:");
  console.log(`  User:     ${user.email}`);
  console.log(`  Decision: ${decision.title}`);
  console.log(`  Scenario: ${scenario.kind} / ${scenario.likelihood}`);
  console.log(`  FailureMode: ${failureMode.cause.slice(0, 40)}…`);
}

main()
  .catch((error) => {
    console.error("Verify FAILED:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
