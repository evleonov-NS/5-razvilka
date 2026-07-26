-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM (
  'LOGIN',
  'LOGOUT',
  'CREATE_DECISION',
  'GENERATE_TREE',
  'RESOLVE',
  'OPEN_SETTINGS',
  'SUBMIT_FEEDBACK',
  'LOAD_DEMO',
  'DELETE_DEMO'
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "platformKeyEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeedbackMessage" (
    "id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "email" TEXT,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedbackMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "VisitSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "type" "AnalyticsEventType" NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX "FeedbackMessage_createdAt_idx" ON "FeedbackMessage"("createdAt");
CREATE INDEX "FeedbackMessage_userId_idx" ON "FeedbackMessage"("userId");
CREATE INDEX "VisitSession_userId_startedAt_idx" ON "VisitSession"("userId", "startedAt");
CREATE INDEX "VisitSession_startedAt_idx" ON "VisitSession"("startedAt");
CREATE INDEX "AnalyticsEvent_type_createdAt_idx" ON "AnalyticsEvent"("type", "createdAt");
CREATE INDEX "AnalyticsEvent_userId_createdAt_idx" ON "AnalyticsEvent"("userId", "createdAt");
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- Foreign keys
ALTER TABLE "FeedbackMessage" ADD CONSTRAINT "FeedbackMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VisitSession" ADD CONSTRAINT "VisitSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Singleton row
INSERT INTO "AppSettings" ("id", "platformKeyEnabled", "updatedAt")
VALUES ('default', true, CURRENT_TIMESTAMP);
