import { PrismaClient } from '@prisma/client';
import { addDays } from "date-fns";

const prisma = new PrismaClient();

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
  // Seed task types
  await prisma.taskType.createMany({
    data: [
      { name: 'MANUAL_REVIEW_WORK', label: 'Manual Review Work' },
      { name: 'SQUAD', label: 'Compliance Squad Work' },
      { name: 'COMMUNICATION', label: 'Communication' },
      { name: 'PROJECT', label: 'Project' },
      { name: 'LEARNING', label: 'Learning' },
      { name: 'DOCUMENTATION', label: 'Documentation' },
      { name: 'OTHERS', label: 'Others' }
    ]
  });

  // Seed tags
  await prisma.tag.createMany({
    data: [
      { name: 'slack-ping', label: 'Slack Ping' },
      { name: 'ticket', label: 'Ticket' },
      { name: 'gut-check', label: 'Gut Check' },
      { name: 'p2-post', label: 'P2 Post' },
      { name: 'p2-discussion', label: 'P2 Discussion' },
      { name: 'slack-discussion', label: 'Slack Discussion' },
      { name: 'team-call', label: 'Team Call' },
      { name: '1-1', label: '1:1' },
      { name: 'internal-tools', label: 'Internal Tools' },
      { name: 'workflow-improvement', label: 'Workflow Improvement' },
      { name: 'buddying', label: 'Buddying' },
      { name: 'tool-exploration', label: 'Tool Exploration' },
      { name: 'deep-dive', label: 'Deep Dive' },
      { name: 'shared-insight', label: 'Shared Insight' },
      { name: 'fraud-pattern', label: 'Fraud Pattern' },
      { name: 'webinar', label: 'Webinar' },
      { name: 'e-learning', label: 'e-Learning' },
      { name: 'coaching', label: 'Coaching' },
      { name: 'reading', label: 'Reading' },
      { name: 'fu-update', label: 'Fraudsquad University Update' },
      { name: 'survey', label: 'Survey' },
      { name: 'admin', label: 'Admin Tasks' },
      { name: 'hr-feedback', label: 'HR Feedback' },
      { name: 'ai', label: 'AI' },
      { name: 'data-analysis', label: 'Data Analysis' },
      { name: 'meetup', label: 'Meetup' },
      { name: 'event', label: 'Event' },
      { name: 'other', label: 'Other' }
    ]
  });

  // Initialize reporting period
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
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
