import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateTrackingNumber } from '../utils/trackingNumber';
import { logActivity } from '../utils/activityLogger';

export const shipmentsRouter = Router();

// GET /api/shipments/track/:trackingNumber - Public route
shipmentsRouter.get('/track/:trackingNumber', async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackingNumber } = req.params;

        const shipment = await prisma.shipment.findUnique({
            where: { trackingNumber },
            include: {
                trackingUpdates: {
                    orderBy: { timestamp: 'desc' },
                },
            },
        });

        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found. Please check your tracking number.' });
            return;
        }

        res.json(shipment);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// All routes below require authentication
shipmentsRouter.use(authenticate);

// GET /api/shipments - List all shipments (admin)
shipmentsRouter.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const {
            page = '1',
            limit = '20',
            search,
            status,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: Record<string, unknown> = {};

        if (search) {
            where.OR = [
                { trackingNumber: { contains: search as string } },
                { senderName: { contains: search as string } },
                { receiverName: { contains: search as string } },
                { originCity: { contains: search as string } },
                { destinationCity: { contains: search as string } },
            ];
        }

        if (status) {
            where.status = status;
        }

        const [shipments, total] = await Promise.all([
            prisma.shipment.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { [sortBy as string]: sortOrder },
                include: {
                    trackingUpdates: {
                        orderBy: { timestamp: 'desc' },
                        take: 1,
                    },
                    _count: { select: { trackingUpdates: true } },
                },
            }),
            prisma.shipment.count({ where }),
        ]);

        res.json({
            data: shipments,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/shipments/:id - Get single shipment
shipmentsRouter.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const shipment = await prisma.shipment.findUnique({
            where: { id: req.params.id },
            include: {
                trackingUpdates: { orderBy: { timestamp: 'desc' } },
                pendingUpdates: { orderBy: { createdAt: 'desc' } },
            },
        });

        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        res.json(shipment);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/shipments - Create shipment
shipmentsRouter.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = req.body;

        // Generate tracking number
        const trackingNumber = await generateTrackingNumber(data.originCountry || 'GL');

        const shipment = await prisma.shipment.create({
            data: {
                trackingNumber,
                status: 'created',
                senderName: data.senderName,
                senderEmail: data.senderEmail,
                senderPhone: data.senderPhone,
                senderAddress: data.senderAddress,
                senderCity: data.senderCity,
                senderCountry: data.senderCountry,
                receiverName: data.receiverName,
                receiverEmail: data.receiverEmail,
                receiverPhone: data.receiverPhone,
                receiverAddress: data.receiverAddress,
                receiverCity: data.receiverCity,
                receiverCountry: data.receiverCountry,
                shipmentType: data.shipmentType || 'package',
                weight: parseFloat(data.weight),
                weightUnit: data.weightUnit || 'kg',
                dimensions: data.dimensions,
                description: data.description,
                originCity: data.originCity,
                originCountry: data.originCountry,
                originLat: data.originLat ? parseFloat(data.originLat) : null,
                originLng: data.originLng ? parseFloat(data.originLng) : null,
                destinationCity: data.destinationCity,
                destinationCountry: data.destinationCountry,
                destinationLat: data.destinationLat ? parseFloat(data.destinationLat) : null,
                destinationLng: data.destinationLng ? parseFloat(data.destinationLng) : null,
                currentCity: data.originCity,
                currentCountry: data.originCountry,
                currentLat: data.originLat ? parseFloat(data.originLat) : null,
                currentLng: data.originLng ? parseFloat(data.originLng) : null,
                estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : null,
                shippedAt: data.shippedAt ? new Date(data.shippedAt) : null,
                declaredValue: data.declaredValue ? parseFloat(data.declaredValue) : null,
                currency: data.currency || 'USD',
                serviceType: data.serviceType || 'standard',
                priority: data.priority || 'normal',
                transportMode: data.transportMode || 'land',
                containsPets: data.containsPets === true || data.containsPets === 'true',
            },
        });

        // Create initial tracking update
        await prisma.trackingUpdate.create({
            data: {
                shipmentId: shipment.id,
                location: `${data.originCity}, ${data.originCountry}`,
                city: data.originCity,
                country: data.originCountry,
                lat: data.originLat ? parseFloat(data.originLat) : null,
                lng: data.originLng ? parseFloat(data.originLng) : null,
                status: 'created',
                description: 'Shipment created and registered in the system',
                approvedBy: req.admin!.id,
                approvedAt: new Date(),
            },
        });

        await logActivity({
            adminId: req.admin!.id,
            action: 'CREATE_SHIPMENT',
            entity: 'shipment',
            entityId: shipment.id,
            details: `Created shipment ${trackingNumber}`,
            ipAddress: req.ip,
        });

        res.status(201).json(shipment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// PUT /api/shipments/:id - Update shipment
shipmentsRouter.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const data = req.body;

        const shipment = await prisma.shipment.update({
            where: { id: req.params.id },
            data: {
                senderName: data.senderName,
                senderEmail: data.senderEmail,
                senderPhone: data.senderPhone,
                senderAddress: data.senderAddress,
                senderCity: data.senderCity,
                senderCountry: data.senderCountry,
                receiverName: data.receiverName,
                receiverEmail: data.receiverEmail,
                receiverPhone: data.receiverPhone,
                receiverAddress: data.receiverAddress,
                receiverCity: data.receiverCity,
                receiverCountry: data.receiverCountry,
                shipmentType: data.shipmentType,
                transportMode: data.transportMode,
                containsPets: data.containsPets === true || data.containsPets === 'true',
                weight: data.weight ? parseFloat(data.weight) : undefined,
                weightUnit: data.weightUnit,
                dimensions: data.dimensions,
                description: data.description,
                originCity: data.originCity,
                originCountry: data.originCountry,
                originLat: data.originLat ? parseFloat(data.originLat) : undefined,
                originLng: data.originLng ? parseFloat(data.originLng) : undefined,
                destinationCity: data.destinationCity,
                destinationCountry: data.destinationCountry,
                destinationLat: data.destinationLat ? parseFloat(data.destinationLat) : undefined,
                destinationLng: data.destinationLng ? parseFloat(data.destinationLng) : undefined,
                estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : undefined,
                declaredValue: data.declaredValue ? parseFloat(data.declaredValue) : undefined,
                currency: data.currency,
                serviceType: data.serviceType,
                priority: data.priority,
                status: data.status,
            },
        });

        await logActivity({
            adminId: req.admin!.id,
            action: 'UPDATE_SHIPMENT',
            entity: 'shipment',
            entityId: shipment.id,
            details: `Updated shipment ${shipment.trackingNumber}`,
            ipAddress: req.ip,
        });

        res.json(shipment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE /api/shipments/:id - Delete shipment
shipmentsRouter.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const shipment = await prisma.shipment.delete({ where: { id: req.params.id } });

        await logActivity({
            adminId: req.admin!.id,
            action: 'DELETE_SHIPMENT',
            entity: 'shipment',
            entityId: req.params.id,
            details: `Deleted shipment ${shipment.trackingNumber}`,
            ipAddress: req.ip,
        });

        res.json({ message: 'Shipment deleted successfully' });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});
