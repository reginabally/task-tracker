'use server'

import { prisma } from '@/lib/prisma'

/**
 * Fetches all unique tags from the database
 * @returns Promise<string[]> Array of tag names
 */
export async function getAllTags(): Promise<string[]> {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    return tags.map((tag: { name: string }) => tag.name)
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw new Error('Failed to fetch tags')
  }
} 