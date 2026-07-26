/**
 * CLI: npm run db:seed-demo
 * Логика — lib/demo-data.ts (тот же путь, что POST /api/user/demo-data).
 */
import { PrismaClient } from "@prisma/client";
import { seedDemoDecisions } from "../lib/demo-data";

const prisma = new PrismaClient();

const COMMUNITY_USER_EMAIL = "community@razvilka.local";

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

async function main() {
  const targetUser = await resolveTargetUser();
  const result = await seedDemoDecisions(targetUser.id);

  console.log("Demo seed OK:");
  console.log(`  Пользователь: ${targetUser.email} (${targetUser.id})`);
  console.log(
    `  Решений: ${result.created} (${result.publicCount} публичных)`,
  );
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
