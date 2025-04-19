'use server';

import { prisma } from '@/app/lib/prisma';

export interface AutomationRule {
  id?: number;
  trigger: 'link' | 'description';
  pattern: string;
  type: string;
  tags: string[];
}

/**
 * Gets all automation rules from the database
 */
export async function getAutomationRules(): Promise<AutomationRule[]> {
  try {
    const rules = await prisma.automationRule.findMany({
      include: {
        type: true,
        tags: {
          include: {
            tag: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return rules.map((rule: {
      id: number;
      trigger: string;
      pattern: string;
      type: { name: string };
      tags: Array<{ tag: { name: string } }>;
    }): AutomationRule => ({
      id: rule.id,
      trigger: rule.trigger as 'link' | 'description',
      pattern: rule.pattern,
      type: rule.type.name,
      tags: rule.tags.map((t: { tag: { name: string } }) => t.tag.name)
    }));
  } catch (error) {
    console.error('Error fetching automation rules:', error);
    return [];
  }
}

/**
 * Creates a new automation rule
 */
export async function createAutomationRule(rule: AutomationRule): Promise<{
  success: boolean;
  message: string;
  rule?: AutomationRule;
}> {
  try {
    // Find the type ID from the type name
    const taskType = await prisma.taskType.findUnique({
      where: { name: rule.type }
    });

    if (!taskType) {
      return {
        success: false,
        message: `Task type "${rule.type}" not found`
      };
    }

    // Create the rule
    const createdRule = await prisma.automationRule.create({
      data: {
        trigger: rule.trigger,
        pattern: rule.pattern,
        typeId: taskType.id
      },
      include: {
        type: true
      }
    });

    // Create the tag associations if there are any tags
    if (rule.tags.length > 0) {
      // Find all the tag IDs
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            in: rule.tags
          }
        }
      });

      // Create the tag associations
      const tagPromises = tags.map((tag: { id: string }) => 
        prisma.automationRuleTag.create({
          data: {
            ruleId: createdRule.id,
            tagId: tag.id
          }
        })
      );

      await Promise.all(tagPromises);
    }

    return {
      success: true,
      message: 'Automation rule created successfully',
      rule: {
        id: createdRule.id,
        trigger: createdRule.trigger as 'link' | 'description',
        pattern: createdRule.pattern,
        type: createdRule.type.name,
        tags: rule.tags
      }
    };
  } catch (error) {
    console.error('Error creating automation rule:', error);
    return {
      success: false,
      message: 'Failed to create automation rule'
    };
  }
}

/**
 * Updates an existing automation rule
 */
export async function updateAutomationRule(rule: AutomationRule): Promise<{
  success: boolean;
  message: string;
  rule?: AutomationRule;
}> {
  if (!rule.id) {
    return {
      success: false,
      message: 'Rule ID is required for updates'
    };
  }

  try {
    // Find the type ID from the type name
    const taskType = await prisma.taskType.findUnique({
      where: { name: rule.type }
    });

    if (!taskType) {
      return {
        success: false,
        message: `Task type "${rule.type}" not found`
      };
    }

    // Update the rule
    const updatedRule = await prisma.automationRule.update({
      where: { id: rule.id },
      data: {
        trigger: rule.trigger,
        pattern: rule.pattern,
        typeId: taskType.id
      },
      include: {
        type: true
      }
    });

    // Delete existing tag associations
    await prisma.automationRuleTag.deleteMany({
      where: {
        ruleId: rule.id
      }
    });

    // Create new tag associations if there are any tags
    if (rule.tags.length > 0) {
      // Find all the tag IDs
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            in: rule.tags
          }
        }
      });

      // Create the tag associations
      const tagPromises = tags.map((tag: { id: string }) => 
        prisma.automationRuleTag.create({
          data: {
            ruleId: updatedRule.id,
            tagId: tag.id
          }
        })
      );

      await Promise.all(tagPromises);
    }

    return {
      success: true,
      message: 'Automation rule updated successfully',
      rule: {
        id: updatedRule.id,
        trigger: updatedRule.trigger as 'link' | 'description',
        pattern: updatedRule.pattern,
        type: updatedRule.type.name,
        tags: rule.tags
      }
    };
  } catch (error) {
    console.error('Error updating automation rule:', error);
    return {
      success: false,
      message: 'Failed to update automation rule'
    };
  }
}

/**
 * Deletes an automation rule
 */
export async function deleteAutomationRule(id: number): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Delete the tag associations first
    await prisma.automationRuleTag.deleteMany({
      where: {
        ruleId: id
      }
    });

    // Delete the rule
    await prisma.automationRule.delete({
      where: { id }
    });

    return {
      success: true,
      message: 'Automation rule deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting automation rule:', error);
    return {
      success: false,
      message: 'Failed to delete automation rule'
    };
  }
}