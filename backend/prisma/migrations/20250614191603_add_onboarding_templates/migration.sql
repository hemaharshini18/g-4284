-- CreateTable
CREATE TABLE "OnboardingTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OnboardingTemplateTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "taskName" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    CONSTRAINT "OnboardingTemplateTask_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OnboardingTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingTemplate_name_key" ON "OnboardingTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingTemplateTask_templateId_order_key" ON "OnboardingTemplateTask"("templateId", "order");
