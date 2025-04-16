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
  
  // Get the current reporting period from the database
  let reportingPeriod = await prisma.reportingPeriod.findUnique({
    where: { id: 1 }
  });
  
  // If no reporting period exists, create one starting from the most recent Friday
  if (!reportingPeriod) {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    const periodStart = new Date(today);
    periodStart.setDate(today.getDate() - daysUntilFriday);
    periodStart.setHours(0, 0, 0, 0);
    
    const nextStartDate = new Date(periodStart);
    nextStartDate.setDate(periodStart.getDate() + 14);
    
    reportingPeriod = await prisma.reportingPeriod.create({
      data: {
        id: 1,
        periodStart,
        nextStartDate
      }
    });
  }
  
  // Check if we need to roll over to the next period
  const today = new Date();
  if (today >= reportingPeriod.nextStartDate) {
    // Update the reporting period
    const newPeriodStart = reportingPeriod.nextStartDate;
    const newNextStartDate = new Date(newPeriodStart);
    newNextStartDate.setDate(newPeriodStart.getDate() + 14);
    
    reportingPeriod = await prisma.reportingPeriod.update({
      where: { id: 1 },
      data: {
        periodStart: newPeriodStart,
        nextStartDate: newNextStartDate
      }
    });
  }
  
  // Calculate the period end (13 days after period start)
  const periodEnd = new Date(reportingPeriod.periodStart);
  periodEnd.setDate(reportingPeriod.periodStart.getDate() + 13);
  periodEnd.setHours(23, 59, 59, 999);
  
  return { 
    periodStart: reportingPeriod.periodStart, 
    periodEnd 
  };
}
