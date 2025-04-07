import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const tags = [
  "tickets",
  "slack-pings",
  "gut-checks",
  "p2-post",
  "p2-discussions",
  "project",
  "webinar",
  "e-learning",
  "reading",
  "team-call",
  "1-1",
  "coaching",
  "meetups",
  "events",
  "tool-workflow-improvements",
  "fu-update",
  "admin",
  "investigation",
  "fraud-pattern",
  "signal-discovery",
  "tool-feedback",
  "shared-insight",
  "data-analysis",
  "ai"
];

async function main() {
  for (const tagName of tags) {
    await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: { name: tagName }
    });
  }
  console.log("✅ Tags seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
