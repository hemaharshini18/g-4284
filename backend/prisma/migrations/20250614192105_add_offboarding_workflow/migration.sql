-- CreateTable
CREATE TABLE "OffboardingTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "taskName" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "OffboardingTask_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OffboardingTemplate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OffboardingTemplateTask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "templateId" INTEGER NOT NULL,
    "taskName" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    CONSTRAINT "OffboardingTemplateTask_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "OffboardingTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OffboardingTemplate_name_key" ON "OffboardingTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "OffboardingTemplateTask_templateId_order_key" ON "OffboardingTemplateTask"("templateId", "order");
