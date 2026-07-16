-- AlterTable
ALTER TABLE "Decision" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "DecisionLike" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "decisionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DecisionLike_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DecisionLike_decisionId_idx" ON "DecisionLike"("decisionId");

-- CreateIndex
CREATE INDEX "DecisionLike_userId_idx" ON "DecisionLike"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionLike_userId_decisionId_key" ON "DecisionLike"("userId", "decisionId");

-- CreateIndex
CREATE INDEX "Decision_isPublic_createdAt_idx" ON "Decision"("isPublic", "createdAt");

-- AddForeignKey
ALTER TABLE "DecisionLike" ADD CONSTRAINT "DecisionLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionLike" ADD CONSTRAINT "DecisionLike_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE CASCADE ON UPDATE CASCADE;
