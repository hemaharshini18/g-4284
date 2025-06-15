-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Leave" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'PERSONAL',
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
INSERT INTO "new_Leave" ("createdAt", "days", "employeeId", "endDate", "id", "policyId", "reason", "startDate", "status", "updatedAt") SELECT "createdAt", "days", "employeeId", "endDate", "id", "policyId", "reason", "startDate", "status", "updatedAt" FROM "Leave";
DROP TABLE "Leave";
ALTER TABLE "new_Leave" RENAME TO "Leave";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
