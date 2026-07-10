"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activityRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
exports.activityRouter = (0, express_1.Router)();
exports.activityRouter.use(auth_1.authenticate);
// GET /api/activity - Get activity logs
exports.activityRouter.get('/', async (req, res) => {
    try {
        const { page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const [logs, total] = await Promise.all([
            prisma_1.prisma.activityLog.findMany({
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    admin: { select: { name: true, email: true } },
                },
            }),
            prisma_1.prisma.activityLog.count(),
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
    }
    catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=activity.js.map