import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/activityLogger';

export const updatesRouter = Router();

// POST /api/updates/submit - Submit a pending update (can be used by ops or admin)
updatesRouter.post('/submit', async (req: Request, res: Response): Promise<void> => {
    try {
        const { trackingNumber, location, city, country, lat, lng, status, description, photo, submittedBy, notes } = req.body;

        const shipment = await prisma.shipment.findUnique({ where: { trackingNumber } });
        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        const pendingUpdate = await prisma.pendingUpdate.create({
            data: {
                shipmentId: shipment.id,
                location,
                city,
                country,
                lat: lat ? parseFloat(lat) : null,
                lng: lng ? parseFloat(lng) : null,
                status,
                description,
                photo,
                submittedBy,
                notes,
                reviewStatus: 'pending',
            },
        });

        res.status(201).json(pendingUpdate);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// All routes below require authentication
updatesRouter.use(authenticate);

// GET /api/updates/pending - Get all pending updates
updatesRouter.get('/pending', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const pendingUpdates = await prisma.pendingUpdate.findMany({
            where: { reviewStatus: 'pending' },
            include: {
                shipment: {
                    select: {
                        trackingNumber: true,
                        status: true,
                        senderName: true,
                        receiverName: true,
                        originCity: true,
                        originCountry: true,
                        destinationCity: true,
                        destinationCountry: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(pendingUpdates);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/updates/approve/:id - Approve a pending update
updatesRouter.post('/approve/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const pending = await prisma.pendingUpdate.findUnique({
            where: { id: req.params.id },
            include: { shipment: true },
        });

        if (!pending) {
            res.status(404).json({ error: 'Pending update not found' });
            return;
        }

        if (pending.reviewStatus !== 'pending') {
            res.status(400).json({ error: 'Update has already been reviewed' });
            return;
        }

        // Create approved tracking update
        await prisma.trackingUpdate.create({
            data: {
                shipmentId: pending.shipmentId,
                location: pending.location,
                city: pending.city,
                country: pending.country,
                lat: pending.lat,
                lng: pending.lng,
                status: pending.status,
                description: pending.description,
                photo: pending.photo,
                timestamp: pending.timestamp,
                approvedBy: req.admin!.id,
                approvedAt: new Date(),
            },
        });

        // Update the shipment status and current location
        await prisma.shipment.update({
            where: { id: pending.shipmentId },
            data: {
                status: pending.status,
                currentCity: pending.city,
                currentCountry: pending.country,
                currentLat: pending.lat,
                currentLng: pending.lng,
                ...(pending.status === 'delivered' ? { actualDelivery: new Date() } : {}),
            },
        });

        // Mark pending update as approved
        await prisma.pendingUpdate.update({
            where: { id: req.params.id },
            data: {
                reviewStatus: 'approved',
                reviewedBy: req.admin!.id,
                reviewedAt: new Date(),
            },
        });

        await logActivity({
            adminId: req.admin!.id,
            action: 'APPROVE_UPDATE',
            entity: 'pending_update',
            entityId: req.params.id,
            details: `Approved update for shipment ${pending.shipment.trackingNumber}: ${pending.status}`,
            ipAddress: req.ip,
        });

        res.json({ message: 'Update approved successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/updates/reject/:id - Reject a pending update
updatesRouter.post('/reject/:id', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { reason } = req.body;
        const pending = await prisma.pendingUpdate.findUnique({
            where: { id: req.params.id },
            include: { shipment: true },
        });

        if (!pending) {
            res.status(404).json({ error: 'Pending update not found' });
            return;
        }

        await prisma.pendingUpdate.update({
            where: { id: req.params.id },
            data: {
                reviewStatus: 'rejected',
                reviewedBy: req.admin!.id,
                reviewedAt: new Date(),
                reviewNotes: reason,
            },
        });

        await logActivity({
            adminId: req.admin!.id,
            action: 'REJECT_UPDATE',
            entity: 'pending_update',
            entityId: req.params.id,
            details: `Rejected update for shipment ${pending.shipment.trackingNumber}`,
            ipAddress: req.ip,
        });

        res.json({ message: 'Update rejected' });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/updates/direct/:shipmentId - Add direct tracking update (admin only)
updatesRouter.post('/direct/:shipmentId', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { location, city, country, lat, lng, status, description, photo } = req.body;

        const shipment = await prisma.shipment.findUnique({ where: { id: req.params.shipmentId } });
        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }

        const update = await prisma.trackingUpdate.create({
            data: {
                shipmentId: req.params.shipmentId,
                location,
                city,
                country,
                lat: lat ? parseFloat(lat) : null,
                lng: lng ? parseFloat(lng) : null,
                status,
                description,
                photo,
                approvedBy: req.admin!.id,
                approvedAt: new Date(),
            },
        });

        await prisma.shipment.update({
            where: { id: req.params.shipmentId },
            data: {
                status,
                currentCity: city,
                currentCountry: country,
                currentLat: lat ? parseFloat(lat) : null,
                currentLng: lng ? parseFloat(lng) : null,
                ...(status === 'delivered' ? { actualDelivery: new Date() } : {}),
            },
        });

        await logActivity({
            adminId: req.admin!.id,
            action: 'ADD_TRACKING_UPDATE',
            entity: 'shipment',
            entityId: req.params.shipmentId,
            details: `Added tracking update for ${shipment.trackingNumber}: ${status}`,
            ipAddress: req.ip,
        });

        res.status(201).json(update);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
