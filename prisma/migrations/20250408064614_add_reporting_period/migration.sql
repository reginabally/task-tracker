-- CreateTable
CREATE TABLE "ReportingPeriod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "periodStart" DATETIME NOT NULL,
    "nextStartDate" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
