// Import the Task type
import { Task } from '@/app/types';

export function getCurrentReportingPeriod(): { periodStart: Date; periodEnd: Date } {
  const today = new Date();
  
  // Find the most recent Friday (including today if it's Friday)
  const daysUntilFriday = (5 - today.getDay() + 7) % 7;
  const periodStart = new Date(today);
  periodStart.setDate(today.getDate() - daysUntilFriday);
  periodStart.setHours(0, 0, 0, 0);
  
  // Set period end to Thursday 13 days after period start
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodStart.getDate() + 13);
  periodEnd.setHours(23, 59, 59, 999);
  
  return { periodStart, periodEnd };
}

/**
 * Adds a specified number of days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
} 

/**
 * Groups tasks by their type
 * @param tasks Array of Task objects
 * @returns Dictionary where keys are task types and values are arrays of tasks with that type
 */
export function groupTasksByType(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((acc, task) => {
    const typeName = task.type.name;
    if (!acc[typeName]) {
      acc[typeName] = [];
    }
    acc[typeName].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
} 