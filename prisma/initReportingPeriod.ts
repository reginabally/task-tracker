// /prisma/initReportingPeriod.ts

import { prisma } from "../src/lib/prisma";
import { addDays } from "date-fns";

// Helper: Get last Friday from any date
function getLastFriday(date: Date): Date {
  const day = date.getDay();
  const diff = (day >= 5) ? day - 5 : day + 2;
  const lastFriday = new Date(date);
  lastFriday.setDate(date.getDate() - diff);
  lastFriday.setHours(0, 0, 0, 0);
  return lastFriday;
}

async function main() {
  const today = new Date();
  const periodStart = getLastFriday(today);
  const nextStartDate = addDays(periodStart, 14);

  await prisma.reportingPeriod.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      periodStart,
      nextStartDate,
    },
  });

  console.log("✅ Reporting period initialized:", {
    periodStart: periodStart.toISOString().split("T")[0],
    nextStartDate: nextStartDate.toISOString().split("T")[0],
  });
}

main()
  .catch((e) => {
    console.error("❌ Error seeding reporting period:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
