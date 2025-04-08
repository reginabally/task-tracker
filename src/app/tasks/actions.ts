'use server';

// actions.ts
import { prisma } from '@/lib/prisma';

export async function getAllTaskTypes() {
  return await prisma.taskType.findMany({
    select: { name: true, label: true }
  });
}

export async function getAllTags() {
  return await prisma.tag.findMany({
    select: { name: true, label: true }
  });
}

export async function addTask({ description, type, tags, date, link }: {
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

  const allTagIds = [
    ...existingTags.map((t: { id: string }) => t.id),
    ...createdTags.map((t: { id: string }) => t.id)
  ];

  return await prisma.task.create({
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
