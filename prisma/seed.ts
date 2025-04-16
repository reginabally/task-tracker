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
  try {
    // Reset database - handle foreign key constraints
    // Delete in proper order to respect relations
    await prisma.taskTag.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.taskType.deleteMany({});
    
    // Seed task types with alphabetical ordering
    const taskTypes = [
      { name: 'COMMUNICATION', label: 'Communication', sortOrder: 0 },
      { name: 'DOCUMENTATION', label: 'Documentation', sortOrder: 1 },
      { name: 'LEARNING', label: 'Learning', sortOrder: 2 },
      { name: 'MANUAL_REVIEW_WORK', label: 'Manual Review Work', sortOrder: 3 },
      { name: 'OTHERS', label: 'Others', sortOrder: 4 },
      { name: 'PROJECT', label: 'Project', sortOrder: 5 },
      { name: 'SQUAD', label: 'Compliance Squad Work', sortOrder: 6 }
    ];
    
    // Insert each task type individually
    for (const taskType of taskTypes) {
      await prisma.taskType.create({
        data: taskType
      });
    }
    
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
    // Calculate reporting period automatically
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
  } catch (e) {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
