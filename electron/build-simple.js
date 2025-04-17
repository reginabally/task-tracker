import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyFiles() {
  try {
    // Output directory
    const outDir = resolve(__dirname, '../out');
    
    // Ensure output directory exists
    await fs.ensureDir(outDir);
    
    // Copy HTML and CSS files from simple-app
    await fs.copy(
      resolve(__dirname, 'renderer/simple-app'),
      outDir
    );
    
    // Copy database files if they exist
    const prismaDir = resolve(__dirname, '../prisma');
    const outPrismaDir = resolve(outDir, 'prisma');
    
    if (fs.existsSync(prismaDir)) {
      await fs.ensureDir(outPrismaDir);
      
      // Check for production.db
      const prodDbSrc = resolve(prismaDir, 'production.db');
      
      if (fs.existsSync(prodDbSrc)) {
        // Copy to output prisma directory
        await fs.copy(prodDbSrc, resolve(outPrismaDir, 'production.db'));
        console.log('Copied production.db to out/prisma/ directory');
        
        // Also copy to root of out directory as fallback
        await fs.copy(prodDbSrc, resolve(outDir, 'production.db'));
        console.log('Copied production.db to out/ directory as fallback');
      } else {
        console.warn('Warning: production.db not found in prisma directory');
        
        // Try to find dev.db as alternative
        const devDbSrc = resolve(prismaDir, 'dev.db');
        if (fs.existsSync(devDbSrc)) {
          await fs.copy(devDbSrc, resolve(outPrismaDir, 'production.db'));
          console.log('Used dev.db as production.db in out/prisma/ directory');
          
          await fs.copy(devDbSrc, resolve(outDir, 'production.db'));
          console.log('Used dev.db as production.db in out/ directory');
        } else {
          console.warn('No database file found to copy. App may need to create a new database.');
        }
      }
      
      // Copy Prisma schema
      const schemaPath = resolve(prismaDir, 'schema.prisma');
      if (fs.existsSync(schemaPath)) {
        await fs.copy(schemaPath, resolve(outPrismaDir, 'schema.prisma'));
        console.log('Copied schema.prisma to output directory');
      }
      
      // Copy seed script for potential reseeding
      const seedPath = resolve(prismaDir, 'seed.cjs');
      if (fs.existsSync(seedPath)) {
        await fs.copy(seedPath, resolve(outPrismaDir, 'seed.cjs'));
        console.log('Copied seed.cjs to output directory');
      }
      
      // Also copy migrations for future use
      const migrationsDir = resolve(prismaDir, 'migrations');
      if (fs.existsSync(migrationsDir)) {
        await fs.copy(migrationsDir, resolve(outPrismaDir, 'migrations'));
        console.log('Copied migrations directory to output');
      }
    } else {
      console.warn('Warning: prisma directory not found');
    }
    
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Error building application:', error);
    process.exit(1);
  }
}

copyFiles(); 