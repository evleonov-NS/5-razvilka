-- CreateEnum
CREATE TYPE "LlmProviderKind" AS ENUM ('DEEPSEEK', 'QWEN', 'OPENAI');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "llmProvider" "LlmProviderKind" NOT NULL DEFAULT 'DEEPSEEK';
ALTER TABLE "User" ADD COLUMN "llmModel" TEXT NOT NULL DEFAULT 'deepseek-chat';
ALTER TABLE "User" ADD COLUMN "llmApiKeyEnc" TEXT;
ALTER TABLE "User" ADD COLUMN "platformCreditsUsed" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LlmUsage" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "provider" "LlmProviderKind" NOT NULL,
    "model" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "costUsdMicros" INTEGER NOT NULL DEFAULT 0,
    "billedTo" TEXT NOT NULL,
    "decisionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LlmUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LlmUsage_userId_createdAt_idx" ON "LlmUsage"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "LlmUsage" ADD CONSTRAINT "LlmUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
