'use server';

// actions.ts
import { prisma } from '@/app/lib/prisma';

export async function getAllTaskTypes() {
  // Get all task types - let the frontend sort by order
  return await prisma.taskType.findMany();
}

/**
 * Gets all task types ordered by their sortOrder field and then by label
 */
export async function getOrderedTaskTypes() {
  try {
    // Use $queryRaw to get task types ordered by sortOrder field
    const taskTypes = await prisma.$queryRaw`
      SELECT id, name, label, "sortOrder" 
      FROM "TaskType" 
      ORDER BY "sortOrder" ASC, label ASC
    `;
    
    return taskTypes as { id: string; name: string; label: string; sortOrder: number }[];
  } catch (error) {
    console.error('Error fetching ordered task types:', error);
    return [];
  }
}

export async function getAllTags() {
  return await prisma.tag.findMany({
    select: { name: true, label: true }
  });
}

export async function addTask({ description, type, tags, date, link }: {
  description?: string;
  type?: string;
  tags?: string[];
  date: string;
  link?: string;
}) {
  let taskType = null;
  if (type) {
    taskType = await prisma.taskType.findUnique({
      where: { name: type }
    });

    if (!taskType) throw new Error('Invalid task type');
  }

  let allTagIds: string[] = [];
  if (tags && tags.length > 0) {
    const existingTags = await prisma.tag.findMany({
      where: { name: { in: tags } }
    });

    const newTags = tags.filter(
      tag => !existingTags.find((et: { name: string }) => et.name === tag)
    ).map(tag => ({
      name: tag,
      label: tag.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    }));

    const createdTags = await prisma.$transaction(
      newTags.map(tag => prisma.tag.create({ data: tag }))
    );

    allTagIds = [
      ...existingTags.map((t: { id: string }) => t.id),
      ...createdTags.map((t: { id: string }) => t.id)
    ];
  }

  return await prisma.task.create({
    data: {
      description,
      typeId: taskType?.id,
      date: new Date(date),
      link,
      tags: allTagIds.length > 0 ? {
        create: allTagIds.map(tagId => ({
          tag: { connect: { id: tagId } }
        }))
      } : undefined
    }
  });
}

export async function fetchTasks(filters: {
  type?: string;
  tag?: string;
  startDate?: Date;
  endDate?: Date;
} = {}) {
  const { type, tag, startDate, endDate } = filters;
  
  // Create a new end date that includes the entire day
  const adjustedEndDate = endDate ? new Date(endDate) : undefined;
  if (adjustedEndDate) {
    // Set to end of day (23:59:59.999)
    adjustedEndDate.setHours(23, 59, 59, 999);
  }
  
  return await prisma.task.findMany({
    where: {
      ...(type && { type: { name: type } }),
      ...(tag && { tags: { some: { tag: { name: tag } } } }),
      ...(startDate && adjustedEndDate && {
        date: {
          gte: startDate,
          lte: adjustedEndDate,
        },
      }),
      ...(startDate && !adjustedEndDate && {
        date: {
          gte: startDate,
        },
      }),
      ...(!startDate && adjustedEndDate && {
        date: {
          lte: adjustedEndDate,
        },
      }),
    },
    include: {
      type: {
        select: {
          name: true,
          label: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: {
              name: true,
              label: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });
}

export async function updateTask({ 
  id, 
  description, 
  type, 
  tags, 
  date, 
  link 
}: {
  id: string;
  description: string;
  type: string;
  tags: string[];
  date: string;
  link?: string;
}) {
  const taskType = await prisma.taskType.findUnique({
    where: { name: type }
  });

  if (!taskType) throw new Error('Invalid task type');

  // Get existing tags
  const existingTags = await prisma.tag.findMany({
    where: { name: { in: tags } }
  });

  // Create any new tags that don't exist
  const newTags = tags.filter(
    tag => !existingTags.find((et: { name: string }) => et.name === tag)
  ).map(tag => ({
    name: tag,
    label: tag.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }));

  const createdTags = await prisma.$transaction(
    newTags.map(tag => prisma.tag.create({ data: tag }))
  );

  const allTagIds = [
    ...existingTags.map((t: { id: string }) => t.id),
    ...createdTags.map((t: { id: string }) => t.id)
  ];

  // Delete existing task-tag relationships
  await prisma.taskTag.deleteMany({
    where: { taskId: id }
  });

  // Update the task
  return await prisma.task.update({
    where: { id },
    data: {
      description,
      typeId: taskType.id,
      date: new Date(date),
      link,
      tags: {
        create: allTagIds.map(tagId => ({
          tag: { connect: { id: tagId } }
        }))
      }
    }
  });
}

export async function deleteTask(id: string) {
  // Delete task-tag relationships first (due to foreign key constraints)
  await prisma.taskTag.deleteMany({
    where: { taskId: id }
  });

  // Then delete the task
  return await prisma.task.delete({
    where: { id }
  });
}

/**
 * Gets the current reporting period from the database
 * This is a server action that can be called from client components
 */
export async function getLockedReportingPeriodAction(): Promise<{ periodStart: Date; periodEnd: Date }> {
  'use server';
  
  const prisma = await import('../lib/prisma').then(m => m.prisma);
  
  // Get the current reporting period settings from the database
  const startSetting = await prisma.$queryRaw`
    SELECT value FROM "Setting" WHERE key = 'reportingPeriod_start'
  ` as { value: string }[];
  
  const nextStartSetting = await prisma.$queryRaw`
    SELECT value FROM "Setting" WHERE key = 'reportingPeriod_nextStartDate'
  ` as { value: string }[];
  
  let periodStart: Date;
  let nextStartDate: Date;
  
  // If no reporting period settings exist, create defaults starting from the most recent Friday
  if (startSetting.length === 0 || nextStartSetting.length === 0) {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    periodStart = new Date(today);
    periodStart.setDate(today.getDate() - daysUntilFriday);
    periodStart.setHours(0, 0, 0, 0);
    
    nextStartDate = new Date(periodStart);
    nextStartDate.setDate(periodStart.getDate() + 14);
    
    // Format dates as YYYY-MM-DD for storage
    const periodStartStr = formatDateOnly(periodStart);
    const nextStartDateStr = formatDateOnly(nextStartDate);
    
    // Insert default settings
    await prisma.$executeRaw`
      INSERT OR REPLACE INTO "Setting" (key, value, "updatedAt") 
      VALUES ('reportingPeriod_start', ${periodStartStr}, CURRENT_TIMESTAMP)
    `;
    
    await prisma.$executeRaw`
      INSERT OR REPLACE INTO "Setting" (key, value, "updatedAt") 
      VALUES ('reportingPeriod_nextStartDate', ${nextStartDateStr}, CURRENT_TIMESTAMP)
    `;
  } else {
    // Use existing settings - parse the YYYY-MM-DD format
    periodStart = parseDateOnly(startSetting[0].value);
    nextStartDate = parseDateOnly(nextStartSetting[0].value);
  }
  
  // Check if we need to roll over to the next period
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for proper comparison
  
  if (today >= nextStartDate) {
    // Update the reporting period
    const newPeriodStart = nextStartDate;
    const newNextStartDate = new Date(newPeriodStart);
    newNextStartDate.setDate(newPeriodStart.getDate() + 14);
    
    // Format dates as YYYY-MM-DD for storage
    const newPeriodStartStr = formatDateOnly(newPeriodStart);
    const newNextStartDateStr = formatDateOnly(newNextStartDate);
    
    // Update settings
    await prisma.$executeRaw`
      UPDATE "Setting" 
      SET value = ${newPeriodStartStr}, "updatedAt" = CURRENT_TIMESTAMP 
      WHERE key = 'reportingPeriod_start'
    `;
    
    await prisma.$executeRaw`
      UPDATE "Setting" 
      SET value = ${newNextStartDateStr}, "updatedAt" = CURRENT_TIMESTAMP 
      WHERE key = 'reportingPeriod_nextStartDate'
    `;
    
    periodStart = newPeriodStart;
  }
  
  // Calculate the period end (13 days after period start)
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodStart.getDate() + 13);
  periodEnd.setHours(23, 59, 59, 999);
  
  return { 
    periodStart, 
    periodEnd 
  };
}

/**
 * Formats a date object to YYYY-MM-DD string format
 * @param date - The date to format
 */
function formatDateOnly(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parses a YYYY-MM-DD string to a Date object
 * @param dateStr - The date string to parse
 */
function parseDateOnly(dateStr: string): Date {
  const date = new Date(dateStr);
  date.setHours(0, 0, 0, 0);
  return date;
}
