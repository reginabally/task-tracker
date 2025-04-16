import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const taskTypes = await prisma.$queryRaw`
    SELECT id, name, label, "sortOrder" 
    FROM "TaskType" 
    ORDER BY "sortOrder" ASC, label ASC
  `;
  
  console.log("Task Types (ordered by sortOrder field):");
  console.log(JSON.stringify(taskTypes, null, 2));
}

main()
  .catch(e => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 