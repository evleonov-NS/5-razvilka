import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.note.deleteMany();

  await prisma.note.createMany({
    data: [
      { title: "Smoke-тест: первая заметка" },
      { title: "Smoke-тест: вторая заметка" },
      { title: "Развилка — данные из Neon" },
    ],
  });

  console.log("Seed: создано 3 заметки");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
