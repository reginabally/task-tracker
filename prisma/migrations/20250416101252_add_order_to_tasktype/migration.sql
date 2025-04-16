-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TaskType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_TaskType" ("id", "label", "name") SELECT "id", "label", "name" FROM "TaskType";
DROP TABLE "TaskType";
ALTER TABLE "new_TaskType" RENAME TO "TaskType";
CREATE UNIQUE INDEX "TaskType_name_key" ON "TaskType"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
