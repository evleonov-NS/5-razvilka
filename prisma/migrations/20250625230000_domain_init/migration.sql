-- DropTable
DROP TABLE "Note";

-- CreateEnum
CREATE TYPE "Horizon" AS ENUM ('THREE_MONTHS', 'ONE_YEAR', 'FIVE_YEARS');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('DECISION', 'HABIT');

-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('OPEN', 'RESOLVED');

-- CreateEnum
CREATE TYPE "ScenarioKind" AS ENUM ('OPTIMISTIC', 'BASE', 'PESSIMISTIC');

-- CreateEnum
CREATE TYPE "Likelihood" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "horizon" "Horizon" NOT NULL DEFAULT 'ONE_YEAR',
    "type" "DecisionType" NOT NULL DEFAULT 'DECISION',
    "status" "DecisionStatus" NOT NULL DEFAULT 'OPEN',
    "tree" JSONB,
    "outcome" TEXT,
    "lesson" TEXT,
    "reviewClosestScenario" "ScenarioKind",
    "reviewMissed" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scenario" (
    "id" UUID NOT NULL,
    "decisionId" UUID NOT NULL,
    "kind" "ScenarioKind" NOT NULL,
    "likelihood" "Likelihood" NOT NULL,
    "narrative" TEXT NOT NULL,
    "orderIdx" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FailureMode" (
    "id" UUID NOT NULL,
    "decisionId" UUID NOT NULL,
    "cause" TEXT NOT NULL,
    "prevention" TEXT NOT NULL,
    "orderIdx" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FailureMode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Decision_userId_idx" ON "Decision"("userId");

-- CreateIndex
CREATE INDEX "Scenario_decisionId_idx" ON "Scenario"("decisionId");

-- CreateIndex
CREATE INDEX "FailureMode_decisionId_idx" ON "FailureMode"("decisionId");

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FailureMode" ADD CONSTRAINT "FailureMode_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;
