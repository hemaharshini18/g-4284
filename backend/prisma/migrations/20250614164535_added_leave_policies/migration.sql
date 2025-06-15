/*
  Warnings:

  - You are about to drop the column `type` on the `Leave` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "LeavePolicy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "defaultAllowance" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeId" INTEGER NOT NULL,
    "policyId" INTEGER NOT NULL,
    "accrued" REAL NOT NULL,
    "used" REAL NOT NULL DEFAULT 0,
    "year" INTEGER NOT NULL,
    CONSTRAINT "LeaveBalance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LeaveBalance_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "LeavePolicy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Leave" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "days" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "policyId" INTEGER,
    CONSTRAINT "Leave_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Leave_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "LeavePolicy" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Leave" ("createdAt", "employeeId", "endDate", "id", "reason", "startDate", "status", "updatedAt") SELECT "createdAt", "employeeId", "endDate", "id", "reason", "startDate", "status", "updatedAt" FROM "Leave";
DROP TABLE "Leave";
ALTER TABLE "new_Leave" RENAME TO "Leave";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "LeavePolicy_name_key" ON "LeavePolicy"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employeeId_policyId_year_key" ON "LeaveBalance"("employeeId", "policyId", "year");
