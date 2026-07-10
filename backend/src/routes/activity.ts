import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const activityRouter = Router();
activityRouter.use(authenticate);

// GET /api/activity - Get activity logs
activityRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);

        const [logs, total] = await Promise.all([
            prisma.activityLog.findMany({
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    admin: { select: { name: true, email: true } },
                },
            }),
            prisma.activityLog.count(),
        ]);

        res.json({
            data: logs,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});
