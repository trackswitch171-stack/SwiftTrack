import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || 'America/New_York';

export const settingsRouter = Router();

settingsRouter.get('/timezone', async (_req: Request, res: Response): Promise<void> => {
    try {
        const setting = await prisma.systemSetting.findUnique({ where: { key: 'app.timezone' } });
        res.json({ timezone: setting?.value || DEFAULT_TIMEZONE });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load timezone setting' });
    }
});

settingsRouter.put('/timezone', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { timezone } = req.body as { timezone?: string };
        const nextTimezone = timezone || DEFAULT_TIMEZONE;

        try {
            new Intl.DateTimeFormat('en-US', { timeZone: nextTimezone }).format(new Date());
        } catch {
            res.status(400).json({ error: 'Invalid timezone' });
            return;
        }

        const existing = await prisma.systemSetting.findUnique({ where: { key: 'app.timezone' } });

        if (existing) {
            await prisma.systemSetting.update({
                where: { key: 'app.timezone' },
                data: { value: nextTimezone },
            });
        } else {
            await prisma.systemSetting.create({
                data: { key: 'app.timezone', value: nextTimezone },
            });
        }

        res.json({ timezone: nextTimezone });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update timezone setting' });
    }
});
