-- CreateTable
CREATE TABLE "integration_agents" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "serviceDescription" TEXT NOT NULL,
    "requiredFields" JSONB NOT NULL,
    "niceToHaveFields" JSONB NOT NULL,
    "toneInstructions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_agents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integration_agents_key_key" ON "integration_agents"("key");
