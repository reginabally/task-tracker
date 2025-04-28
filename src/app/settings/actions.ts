'use server';

import { prisma } from '@/app/lib/prisma';

/**
 * Updates the reporting period start date in the Settings table
 * @param startDate - The new reporting period start date
 */
export async function updateReportingPeriod(startDate: Date): Promise<{ success: boolean; message: string }> {
  try {
    // Calculate the next start date (14 days after the periodStart)
    const nextStartDate = new Date(startDate);
    nextStartDate.setDate(startDate.getDate() + 14);
    
    // Format dates as YYYY-MM-DD for storage
    const startDateStr = formatDateOnly(startDate);
    const nextStartDateStr = formatDateOnly(nextStartDate);
    
    // Update the Settings records
    const updateStart = await updateSetting('reportingPeriod_start', startDateStr);
    const updateNextStart = await updateSetting('reportingPeriod_nextStartDate', nextStartDateStr);
    
    if (!updateStart.success || !updateNextStart.success) {
      return { 
        success: false, 
        message: 'Failed to update one or more reporting period settings' 
      };
    }
    
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
 * Gets the current reporting period settings from the Settings table
 */
export async function getReportingPeriodSettings(): Promise<{ periodStart: Date; nextStartDate: Date }> {
  try {
    // Get the current reporting period settings from the database
    const startResult = await getSetting('reportingPeriod_start');
    const nextStartResult = await getSetting('reportingPeriod_nextStartDate');
    
    // If settings don't exist, return current date and calculated next date
    if (!startResult.value || !nextStartResult.value) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + 14);
      
      return { 
        periodStart: today,
        nextStartDate: nextDate
      };
    }
    
    return { 
      periodStart: parseDateOnly(startResult.value),
      nextStartDate: parseDateOnly(nextStartResult.value)
    };
  } catch (error) {
    console.error('Error fetching reporting period settings:', error);
    // Return current date and calculated next date as fallback
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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

/**
 * Gets a setting value by key from the Setting table
 * @param key - The setting key
 */
export async function getSetting(key: string): Promise<{ value: string | null }> {
  try {
    // Use raw query to get the setting
    const result = await prisma.$queryRaw`
      SELECT value FROM "Setting" WHERE key = ${key}
    ` as { value: string }[];
    
    return { 
      value: result.length > 0 ? result[0].value : null
    };
  } catch (error) {
    console.error(`Error fetching setting ${key}:`, error);
    return { value: null };
  }
}

/**
 * Updates a setting value in the Setting table
 * @param key - The setting key
 * @param value - The setting value
 */
export async function updateSetting(key: string, value: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if the setting exists
    const existingResult = await prisma.$queryRaw`
      SELECT key FROM "Setting" WHERE key = ${key}
    ` as { key: string }[];
    
    if (existingResult.length > 0) {
      // Update existing setting
      await prisma.$executeRaw`
        UPDATE "Setting" SET value = ${value}, "updatedAt" = CURRENT_TIMESTAMP WHERE key = ${key}
      `;
    } else {
      // Insert new setting
      await prisma.$executeRaw`
        INSERT INTO "Setting" (key, value, "updatedAt") VALUES (${key}, ${value}, CURRENT_TIMESTAMP)
      `;
    }
    
    return { 
      success: true, 
      message: 'Setting updated successfully' 
    };
  } catch (error) {
    console.error(`Error updating setting ${key}:`, error);
    return { 
      success: false, 
      message: 'Failed to update setting' 
    };
  }
}

/**
 * Gets the OpenAI API key from the Settings table
 */
export async function getOpenAIApiKey(): Promise<{ value: string | null }> {
  try {
    return await getSetting('openaikey');
  } catch (error) {
    console.error('Error fetching OpenAI API key:', error);
    return { value: null };
  }
}

/**
 * Updates the OpenAI API key in the Settings table
 * @param apiKey - The OpenAI API key
 */
export async function updateOpenAIApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    return await updateSetting('openaikey', apiKey);
  } catch (error) {
    console.error('Error updating OpenAI API key:', error);
    return { success: false, message: 'Failed to update API key' };
  }
}

/**
 * Gets the LM Studio endpoint from the Settings table
 */
export async function getLMStudioEndpoint(): Promise<{ value: string | null }> {
  try {
    return await getSetting('lmstudioendpoint');
  } catch (error) {
    console.error('Error fetching LM Studio endpoint:', error);
    return { value: null };
  }
}

/**
 * Updates the LM Studio endpoint in the Settings table
 * @param endpoint - The LM Studio API endpoint URL
 */
export async function updateLMStudioEndpoint(endpoint: string): Promise<{ success: boolean; message: string }> {
  try {
    return await updateSetting('lmstudioendpoint', endpoint);
  } catch (error) {
    console.error('Error updating LM Studio endpoint:', error);
    return { success: false, message: 'Failed to update LM Studio endpoint' };
  }
}

/**
 * Gets the OpenAI API endpoint from the Settings table
 */
export async function getOpenAIEndpoint(): Promise<{ value: string | null }> {
  try {
    return await getSetting('openapiendpoint');
  } catch (error) {
    console.error('Error fetching OpenAI API endpoint:', error);
    return { value: null };
  }
}

/**
 * Updates the OpenAI API endpoint in the Settings table
 * @param endpoint - The OpenAI API endpoint URL
 */
export async function updateOpenAIEndpoint(endpoint: string): Promise<{ success: boolean; message: string }> {
  try {
    return await updateSetting('openapiendpoint', endpoint);
  } catch (error) {
    console.error('Error updating OpenAI API endpoint:', error);
    return { success: false, message: 'Failed to update OpenAI API endpoint' };
  }
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