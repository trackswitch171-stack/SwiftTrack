"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
exports.dashboardRouter = (0, express_1.Router)();
exports.dashboardRouter.use(auth_1.authenticate);
// GET /api/dashboard/stats
exports.dashboardRouter.get('/stats', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [totalShipments, delivered, inTransit, pendingUpdates, delayed, todayShipments, recentShipments,] = await Promise.all([
            prisma_1.prisma.shipment.count(),
            prisma_1.prisma.shipment.count({ where: { status: 'delivered' } }),
            prisma_1.prisma.shipment.count({ where: { status: { in: ['in_transit', 'out_for_delivery', 'arrived_at_hub'] } } }),
            prisma_1.prisma.pendingUpdate.count({ where: { reviewStatus: 'pending' } }),
            prisma_1.prisma.shipment.count({ where: { status: 'delayed' } }),
            prisma_1.prisma.shipment.count({ where: { createdAt: { gte: today } } }),
            prisma_1.prisma.shipment.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    trackingNumber: true,
                    status: true,
                    senderName: true,
                    receiverName: true,
                    destinationCity: true,
                    destinationCountry: true,
                    createdAt: true,
                },
            }),
        ]);
        res.json({
            totalShipments,
            delivered,
            inTransit,
            pendingUpdates,
            delayed,
            todayShipments,
            recentShipments,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/dashboard/analytics
exports.dashboardRouter.get('/analytics', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        // Monthly shipment trends (last 12 months)
        const monthlyData = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const year = date.getFullYear();
            const month = date.getMonth();
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 0, 23, 59, 59);
            const count = await prisma_1.prisma.shipment.count({
                where: { createdAt: { gte: start, lte: end } },
            });
            const delivered = await prisma_1.prisma.shipment.count({
                where: { status: 'delivered', createdAt: { gte: start, lte: end } },
            });
            monthlyData.push({
                month: start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                shipments: count,
                delivered,
            });
        }
        // Status distribution
        const statuses = ['created', 'picked_up', 'in_warehouse', 'customs_cleared', 'in_transit',
            'arrived_at_hub', 'customs_import', 'out_for_delivery', 'delivered', 'returned', 'delayed'];
        const statusData = await Promise.all(statuses.map(async (status) => ({
            status,
            count: await prisma_1.prisma.shipment.count({ where: { status } }),
        })));
        // Top destination countries
        const allShipments = await prisma_1.prisma.shipment.findMany({
            select: { destinationCountry: true },
        });
        const countryCount = {};
        allShipments.forEach((s) => {
            countryCount[s.destinationCountry] = (countryCount[s.destinationCountry] || 0) + 1;
        });
        const topCountries = Object.entries(countryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([country, count]) => ({ country, count }));
        res.json({
            monthlyTrends: monthlyData,
            statusDistribution: statusData.filter((s) => s.count > 0),
            topDestinations: topCountries,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=dashboard.js.map