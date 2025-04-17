import { app, ipcMain, dialog } from 'electron';
import * as fs from 'fs';
import { prisma, backupDatabase } from './services/database.js';
// Register all IPC handlers
export const registerIpcHandlers = () => {
    // Task operations
    ipcMain.handle('task:create', async (_, data) => {
        try {
            return await prisma.task.create({
                data: {
                    description: data.description,
                    typeId: data.typeId,
                    date: new Date(data.date),
                    link: data.link,
                    tags: {
                        create: data.tagIds?.map((tagId) => ({
                            tag: { connect: { id: tagId } }
                        })) || []
                    }
                },
                include: {
                    type: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error('Error in task:create:', error);
            throw error;
        }
    });
    ipcMain.handle('task:getAll', async () => {
        try {
            return await prisma.task.findMany({
                include: {
                    type: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                },
                orderBy: {
                    date: 'desc'
                }
            });
        }
        catch (error) {
            console.error('Error in task:getAll:', error);
            throw error;
        }
    });
    ipcMain.handle('task:getByFilters', async (_, filters) => {
        try {
            const { typeId, tagId, startDate, endDate } = filters;
            const where = {};
            if (typeId) {
                where.typeId = typeId;
            }
            if (tagId) {
                where.tags = {
                    some: {
                        tagId
                    }
                };
            }
            if (startDate || endDate) {
                where.date = {};
                if (startDate) {
                    where.date.gte = new Date(startDate);
                }
                if (endDate) {
                    where.date.lte = new Date(endDate);
                }
            }
            return await prisma.task.findMany({
                where,
                include: {
                    type: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                },
                orderBy: {
                    date: 'desc'
                }
            });
        }
        catch (error) {
            console.error('Error in task:getByFilters:', error);
            throw error;
        }
    });
    ipcMain.handle('task:update', async (_, id, data) => {
        try {
            // First, delete existing tag connections
            await prisma.taskTag.deleteMany({
                where: { taskId: id }
            });
            // Then update the task with new tags
            return await prisma.task.update({
                where: { id },
                data: {
                    description: data.description,
                    typeId: data.typeId,
                    date: new Date(data.date),
                    link: data.link,
                    tags: {
                        create: data.tagIds?.map((tagId) => ({
                            tag: { connect: { id: tagId } }
                        })) || []
                    }
                },
                include: {
                    type: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error('Error in task:update:', error);
            throw error;
        }
    });
    ipcMain.handle('task:delete', async (_, id) => {
        try {
            // First, delete tag connections
            await prisma.taskTag.deleteMany({
                where: { taskId: id }
            });
            // Then delete the task
            return await prisma.task.delete({
                where: { id }
            });
        }
        catch (error) {
            console.error('Error in task:delete:', error);
            throw error;
        }
    });
    // TaskType operations
    ipcMain.handle('taskType:getAll', async () => {
        try {
            return await prisma.taskType.findMany({
                orderBy: {
                    sortOrder: 'asc'
                }
            });
        }
        catch (error) {
            console.error('Error in taskType:getAll:', error);
            throw error;
        }
    });
    // Tag operations
    ipcMain.handle('tag:getAll', async () => {
        try {
            return await prisma.tag.findMany();
        }
        catch (error) {
            console.error('Error in tag:getAll:', error);
            throw error;
        }
    });
    // Automation Rule operations
    ipcMain.handle('automationRule:getAll', async () => {
        try {
            return await prisma.automationRule.findMany({
                orderBy: {
                    id: 'asc'
                },
                include: {
                    type: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error('Error in automationRule:getAll:', error);
            throw error;
        }
    });
    ipcMain.handle('automationRule:create', async (_, data) => {
        try {
            return await prisma.automationRule.create({
                data: {
                    trigger: data.field || data.trigger, // support both field and trigger names
                    pattern: data.pattern,
                    type: {
                        connect: { id: data.typeId }
                    },
                    tags: {
                        create: data.tagIds?.map((tagId) => ({
                            tag: { connect: { id: tagId } }
                        })) || []
                    }
                },
                include: {
                    type: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error('Error in automationRule:create:', error);
            throw error;
        }
    });
    ipcMain.handle('automationRule:update', async (_, id, data) => {
        try {
            // First, delete any existing tag connections
            await prisma.automationRuleTag.deleteMany({
                where: { ruleId: id }
            });
            return await prisma.automationRule.update({
                where: { id },
                data: {
                    trigger: data.field || data.trigger, // support both field and trigger names
                    pattern: data.pattern,
                    type: {
                        connect: { id: data.typeId }
                    },
                    tags: {
                        create: data.tagIds?.map((tagId) => ({
                            tag: { connect: { id: tagId } }
                        })) || []
                    }
                },
                include: {
                    type: true,
                    tags: {
                        include: {
                            tag: true
                        }
                    }
                }
            });
        }
        catch (error) {
            console.error('Error in automationRule:update:', error);
            throw error;
        }
    });
    ipcMain.handle('automationRule:delete', async (_, id) => {
        try {
            return await prisma.automationRule.delete({
                where: { id }
            });
        }
        catch (error) {
            console.error('Error in automationRule:delete:', error);
            throw error;
        }
    });
    // Settings operations
    ipcMain.handle('settings:get', async () => {
        const settings = await prisma.settings.findFirst({
            where: { id: 1 }
        });
        if (!settings) {
            return await prisma.settings.create({
                data: {
                    id: 1,
                    reportingPeriodStart: new Date(),
                    reportingPeriodDay: 5, // Friday
                    defaultDateBehavior: 'today'
                }
            });
        }
        return settings;
    });
    // File operations
    ipcMain.handle('files:readFile', async (_, filePath) => {
        try {
            return fs.readFileSync(filePath, 'utf-8');
        }
        catch (error) {
            console.error('File read error:', error);
            throw error;
        }
    });
    ipcMain.handle('files:saveFile', async (_, content, defaultPath) => {
        try {
            const { canceled, filePath } = await dialog.showSaveDialog({
                defaultPath,
                filters: [
                    { name: 'Markdown', extensions: ['md'] },
                    { name: 'Text', extensions: ['txt'] }
                ]
            });
            if (!canceled && filePath) {
                fs.writeFileSync(filePath, content);
                return { success: true, filePath };
            }
            else {
                return { success: false };
            }
        }
        catch (error) {
            console.error('File save error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
    // App operations
    ipcMain.handle('app:getVersion', () => {
        return app.getVersion();
    });
    ipcMain.handle('app:backupDatabase', async () => {
        try {
            const backupPath = await backupDatabase();
            return { success: true, backupPath };
        }
        catch (error) {
            console.error('Database backup error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : String(error)
            };
        }
    });
};
//# sourceMappingURL=ipc-handlers.js.map