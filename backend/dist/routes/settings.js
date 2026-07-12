"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const DEFAULT_TIMEZONE = process.env.APP_TIMEZONE || 'America/New_York';
exports.settingsRouter = (0, express_1.Router)();
exports.settingsRouter.get('/timezone', async (_req, res) => {
    try {
        const setting = await prisma_1.prisma.systemSetting.findUnique({ where: { key: 'app.timezone' } });
        res.json({ timezone: setting?.value || DEFAULT_TIMEZONE });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load timezone setting' });
    }
});
exports.settingsRouter.put('/timezone', auth_1.authenticate, async (req, res) => {
    try {
        const { timezone } = req.body;
        const nextTimezone = timezone || DEFAULT_TIMEZONE;
        try {
            new Intl.DateTimeFormat('en-US', { timeZone: nextTimezone }).format(new Date());
        }
        catch {
            res.status(400).json({ error: 'Invalid timezone' });
            return;
        }
        const existing = await prisma_1.prisma.systemSetting.findUnique({ where: { key: 'app.timezone' } });
        if (existing) {
            await prisma_1.prisma.systemSetting.update({
                where: { key: 'app.timezone' },
                data: { value: nextTimezone },
            });
        }
        else {
            await prisma_1.prisma.systemSetting.create({
                data: { key: 'app.timezone', value: nextTimezone },
            });
        }
        res.json({ timezone: nextTimezone });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update timezone setting' });
    }
});
//# sourceMappingURL=settings.js.map