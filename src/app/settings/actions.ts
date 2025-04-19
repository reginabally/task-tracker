'use server';

import { prisma } from '@/app/lib/prisma';

/**
 * Updates the reporting period start date in the ReportingPeriod table
 * @param startDate - The new reporting period start date
 */
export async function updateReportingPeriod(startDate: Date): Promise<{ success: boolean; message: string }> {
  try {
    // Calculate the next start date (14 days after the periodStart)
    const nextStartDate = new Date(startDate);
    nextStartDate.setDate(startDate.getDate() + 14);
    
    // Update the ReportingPeriod record
    await prisma.reportingPeriod.upsert({
      where: { id: 1 },
      update: {
        periodStart: startDate,
        nextStartDate: nextStartDate
      },
      create: {
        id: 1,
        periodStart: startDate,
        nextStartDate: nextStartDate
      }
    });
    
    return { 
      success: true, 
      message: 'Reporting period updated successfully' 
    };
  } catch (error) {
    console.error('Error updating reporting period:', error);
    return { 
      success: false, 
      message: 'Failed to update reporting period' 
    };
  }
}

/**
 * Gets the current reporting period settings
 */
export async function getReportingPeriodSettings(): Promise<{ periodStart: Date; nextStartDate: Date }> {
  try {
    // Get the current reporting period from the database
    const reportingPeriod = await prisma.reportingPeriod.findUnique({
      where: { id: 1 }
    });
    
    if (!reportingPeriod) {
      // If no reporting period exists, return current date and calculated next date
      const today = new Date();
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + 14);
      
      return { 
        periodStart: today,
        nextStartDate: nextDate
      };
    }
    
    return { 
      periodStart: reportingPeriod.periodStart,
      nextStartDate: reportingPeriod.nextStartDate
    };
  } catch (error) {
    console.error('Error fetching reporting period settings:', error);
    // Return current date and calculated next date as fallback
    const today = new Date();
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + 14);
    
    return { 
      periodStart: today,
      nextStartDate: nextDate
    };
  }
}

/**
 * Gets all task types (categories) from the database
 */
export async function getTaskTypes(): Promise<{ id: string; name: string; label: string; sortOrder?: number }[]> {
  try {
    // Use $queryRaw to get task types ordered by sortOrder field
    const taskTypes = await prisma.$queryRaw`
      SELECT id, name, label, "sortOrder" 
      FROM "TaskType" 
      ORDER BY "sortOrder" ASC, label ASC
    `;
    
    return taskTypes as { id: string; name: string; label: string; sortOrder: number }[];
  } catch (error) {
    console.error('Error fetching task types:', error);
    return [];
  }
}

/**
 * Creates a new task type (category)
 * @param label - The display name for the category
 */
export async function createTaskType(label: string): Promise<{ 
  success: boolean; 
  message: string; 
  taskType?: { id: string; name: string; label: string; } 
}> {
  try {
    // Convert label to a system name (uppercase with underscores)
    const name = label.trim().toUpperCase().replace(/\s+/g, '_');
    
    // Check if a task type with this name already exists
    const existingTaskType = await prisma.taskType.findFirst({
      where: {
        OR: [
          { name },
          { label }
        ]
      }
    });
    
    if (existingTaskType) {
      return {
        success: false,
        message: 'A category with this name already exists'
      };
    }
    
    // Find the highest current sortOrder value
    const result = await prisma.$queryRaw`
      SELECT MAX("sortOrder") as max_order FROM "TaskType"
    ` as { max_order: number | null }[];
    
    // Get the max order value (or default to -1 if no task types exist)
    const maxOrder = result[0]?.max_order ?? -1;
    const newOrder = maxOrder + 1;
    
    // Create the task type using the ORM but include the sortOrder field
    // Using $executeRaw to set the sortOrder since the schema might not have
    // the sortOrder field in the TypeScript types yet
    const taskType = await prisma.taskType.create({
      data: {
        name,
        label: label.trim()
      }
    });
    
    // Update the sortOrder separately
    await prisma.$executeRaw`
      UPDATE "TaskType" 
      SET "sortOrder" = ${newOrder} 
      WHERE id = ${taskType.id}
    `;
    
    return {
      success: true,
      message: 'Category added successfully',
      taskType
    };
  } catch (error) {
    console.error('Error creating task type:', error);
    return {
      success: false,
      message: 'Failed to create category'
    };
  }
}

/**
 * Updates an existing task type (category)
 * @param id - The ID of the task type to update
 * @param label - The new display name for the category
 */
export async function updateTaskType(id: string, label: string): Promise<{ 
  success: boolean; 
  message: string; 
  taskType?: { id: string; name: string; label: string; } 
}> {
  try {
    // Convert label to a system name (uppercase with underscores)
    const name = label.trim().toUpperCase().replace(/\s+/g, '_');
    
    // Check if another task type with this name already exists (excluding the current one)
    const existingTaskType = await prisma.taskType.findFirst({
      where: {
        OR: [
          { name },
          { label: label.trim() }
        ],
        NOT: {
          id
        }
      }
    });
    
    if (existingTaskType) {
      return {
        success: false,
        message: 'Another category with this name already exists'
      };
    }
    
    // Update the task type
    const taskType = await prisma.taskType.update({
      where: { id },
      data: {
        name,
        label: label.trim()
      }
    });
    
    return {
      success: true,
      message: 'Category updated successfully',
      taskType
    };
  } catch (error) {
    console.error('Error updating task type:', error);
    return {
      success: false,
      message: 'Failed to update category'
    };
  }
}

/**
 * Deletes a task type (category)
 * @param id - The ID of the task type to delete
 */
export async function deleteTaskType(id: string): Promise<{ 
  success: boolean; 
  message: string; 
}> {
  try {
    // Check if there are any tasks using this category
    const tasksUsingCategory = await prisma.task.count({
      where: { typeId: id }
    });
    
    if (tasksUsingCategory > 0) {
      return {
        success: false,
        message: `Cannot delete: ${tasksUsingCategory} task(s) are using this category`
      };
    }
    
    // Delete the task type
    await prisma.taskType.delete({
      where: { id }
    });
    
    return {
      success: true,
      message: 'Category deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting task type:', error);
    return {
      success: false,
      message: 'Failed to delete category'
    };
  }
}

/**
 * Gets all tags from the database
 */
export async function getTags(): Promise<{ id: string; name: string; label: string; }[]> {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        label: 'asc'
      }
    });
    
    // Sort tags in case-insensitive manner
    return tags.sort((a: { label: string }, b: { label: string }) =>
      a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

/**
 * Creates a new tag
 * @param label - The display name for the tag
 */
export async function createTag(label: string): Promise<{ 
  success: boolean; 
  message: string; 
  tag?: { id: string; name: string; label: string; } 
}> {
  try {
    // Convert label to a system name (lowercase with hyphens)
    const name = label.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Check if a tag with this name already exists
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name },
          { label }
        ]
      }
    });
    
    if (existingTag) {
      return {
        success: false,
        message: 'A tag with this name already exists'
      };
    }
    
    // Create the new tag
    const tag = await prisma.tag.create({
      data: {
        name,
        label: label.trim()
      }
    });
    
    return {
      success: true,
      message: 'Tag added successfully',
      tag
    };
  } catch (error) {
    console.error('Error creating tag:', error);
    return {
      success: false,
      message: 'Failed to create tag'
    };
  }
}

/**
 * Updates an existing tag
 * @param id - The ID of the tag to update
 * @param label - The new display name for the tag
 */
export async function updateTag(id: string, label: string): Promise<{ 
  success: boolean; 
  message: string; 
  tag?: { id: string; name: string; label: string; } 
}> {
  try {
    // Convert label to a system name (lowercase with hyphens)
    const name = label.trim().toLowerCase().replace(/\s+/g, '-');
    
    // Check if another tag with this name already exists (excluding the current one)
    const existingTag = await prisma.tag.findFirst({
      where: {
        OR: [
          { name },
          { label: label.trim() }
        ],
        NOT: {
          id
        }
      }
    });
    
    if (existingTag) {
      return {
        success: false,
        message: 'Another tag with this name already exists'
      };
    }
    
    // Update the tag
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name,
        label: label.trim()
      }
    });
    
    return {
      success: true,
      message: 'Tag updated successfully',
      tag
    };
  } catch (error) {
    console.error('Error updating tag:', error);
    return {
      success: false,
      message: 'Failed to update tag'
    };
  }
}

/**
 * Deletes a tag
 * @param id - The ID of the tag to delete
 */
export async function deleteTag(id: string): Promise<{ 
  success: boolean; 
  message: string; 
}> {
  try {
    // Check if there are any tasks using this tag
    const tasksUsingTag = await prisma.taskTag.count({
      where: { tagId: id }
    });
    
    if (tasksUsingTag > 0) {
      return {
        success: false,
        message: `Cannot delete: ${tasksUsingTag} task(s) are using this tag`
      };
    }
    
    // Delete the tag
    await prisma.tag.delete({
      where: { id }
    });
    
    return {
      success: true,
      message: 'Tag deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting tag:', error);
    return {
      success: false,
      message: 'Failed to delete tag'
    };
  }
}

/**
 * Updates the order of a task type (category)
 * @param id - The ID of the task type to update
 * @param newOrder - The new order value
 */
export async function updateTaskTypeOrder(id: string, newOrder: number): Promise<{ 
  success: boolean; 
  message: string; 
}> {
  try {
    // Update the task type's order using a raw query
    await prisma.$executeRaw`
      UPDATE "TaskType" 
      SET "sortOrder" = ${newOrder} 
      WHERE id = ${id}
    `;
    
    return {
      success: true,
      message: 'Category order updated successfully'
    };
  } catch (error) {
    console.error('Error updating category order:', error);
    return {
      success: false,
      message: 'Failed to update category order'
    };
  }
}