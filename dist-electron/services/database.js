import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import { fileURLToPath } from 'url';
// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
/**
 * Dynamically determines and sets the DATABASE_URL for Prisma based on environment
 */
const resolveDatabasePath = () => {
    if (app.isPackaged) {
        console.log('Running in production mode');
        const appPath = app.getAppPath();
        const bundledDbPath = path.join(appPath, 'prisma', 'production.db');
        const fallbackDbPath = path.join(path.dirname(appPath), 'prisma', 'production.db');
        const userDbPath = path.join(app.getPath('userData'), 'production.db');
        // Try to copy DB from bundled location to userData path if it doesn't exist
        if (!fs.existsSync(userDbPath)) {
            const candidates = [bundledDbPath, fallbackDbPath];
            let copied = false;
            for (const source of candidates) {
                if (fs.existsSync(source)) {
                    try {
                        fs.mkdirSync(path.dirname(userDbPath), { recursive: true });
                        fs.copyFileSync(source, userDbPath);
                        console.log(`✅ Copied production.db from ${source} to ${userDbPath}`);
                        copied = true;
                        break;
                    }
                    catch (err) {
                        console.error(`❌ Failed to copy production.db from ${source}:`, err);
                    }
                }
            }
            if (!copied) {
                console.warn('⚠️ No bundled database found. A new database may be created.');
            }
        }
        const dbUrl = `file:${userDbPath}`;
        process.env.DATABASE_URL = dbUrl;
        console.log('DATABASE_URL set to', dbUrl);
        return dbUrl;
    }
    else {
        console.log('Running in development mode');
        const devDbPath = path.resolve(__dirname, '../../prisma/production.db');
        const dbUrl = `file:${devDbPath}`;
        process.env.DATABASE_URL = dbUrl;
        console.log('DATABASE_URL set to', dbUrl);
        return dbUrl;
    }
};
resolveDatabasePath();
const prisma = new PrismaClient({
    log: app.isPackaged ? [] : ['query', 'error', 'warn'],
});
const initDatabase = async () => {
    console.log('📍 DATABASE_URL:', process.env.DATABASE_URL);
    try {
        console.log('🔌 Connecting to database...');
        await prisma.$connect();
        console.log('✅ Connected to database');
        try {
            const taskTypeCount = await prisma.taskType.count();
            console.log(`📊 Found ${taskTypeCount} task types`);
        }
        catch (tableErr) {
            console.warn('⚠️ Could not verify task types:', tableErr);
        }
    }
    catch (err) {
        console.error('❌ Failed to connect to database:', err);
        throw err;
    }
};
const backupDatabase = () => {
    return new Promise((resolve, reject) => {
        const dbPath = process.env.DATABASE_URL?.replace('file:', '') || '';
        if (!dbPath || !fs.existsSync(dbPath)) {
            return reject(new Error(`Database file not found at: ${dbPath}`));
        }
        const backupDir = path.join(app.getPath('userData'), 'backups');
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const backupPath = path.join(backupDir, `backup-${timestamp}.db`);
        try {
            fs.mkdirSync(backupDir, { recursive: true });
            fs.copyFileSync(dbPath, backupPath);
            console.log(`✅ Backup created at ${backupPath}`);
            resolve(backupPath);
        }
        catch (err) {
            console.error('❌ Failed to create backup:', err);
            reject(err);
        }
    });
};
export { prisma, initDatabase, backupDatabase };
//# sourceMappingURL=database.js.map