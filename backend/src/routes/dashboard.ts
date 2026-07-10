import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

// GET /api/dashboard/stats
dashboardRouter.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalShipments,
            delivered,
            inTransit,
            pendingUpdates,
            delayed,
            todayShipments,
            recentShipments,
        ] = await Promise.all([
            prisma.shipment.count(),
            prisma.shipment.count({ where: { status: 'delivered' } }),
            prisma.shipment.count({ where: { status: { in: ['in_transit', 'out_for_delivery', 'arrived_at_hub'] } } }),
            prisma.pendingUpdate.count({ where: { reviewStatus: 'pending' } }),
            prisma.shipment.count({ where: { status: 'delayed' } }),
            prisma.shipment.count({ where: { createdAt: { gte: today } } }),
            prisma.shipment.findMany({
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/dashboard/analytics
dashboardRouter.get('/analytics', async (req: AuthRequest, res: Response): Promise<void> => {
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

            const count = await prisma.shipment.count({
                where: { createdAt: { gte: start, lte: end } },
            });
            const delivered = await prisma.shipment.count({
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
        const statusData = await Promise.all(
            statuses.map(async (status) => ({
                status,
                count: await prisma.shipment.count({ where: { status } }),
            }))
        );

        // Top destination countries
        const allShipments = await prisma.shipment.findMany({
            select: { destinationCountry: true },
        });
        const countryCount: Record<string, number> = {};
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
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
