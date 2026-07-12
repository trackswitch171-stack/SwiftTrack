"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatesRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const activityLogger_1 = require("../utils/activityLogger");
const email_1 = require("../utils/email");
exports.updatesRouter = (0, express_1.Router)();
// POST /api/updates/submit - Submit a pending update (can be used by ops or admin)
exports.updatesRouter.post('/submit', async (req, res) => {
    try {
        const { trackingNumber, location, city, country, lat, lng, status, description, photo, submittedBy, notes } = req.body;
        const shipment = await prisma_1.prisma.shipment.findUnique({ where: { trackingNumber } });
        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }
        const pendingUpdate = await prisma_1.prisma.pendingUpdate.create({
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// All routes below require authentication
exports.updatesRouter.use(auth_1.authenticate);
// GET /api/updates/pending - Get all pending updates
exports.updatesRouter.get('/pending', async (req, res) => {
    try {
        const pendingUpdates = await prisma_1.prisma.pendingUpdate.findMany({
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
    }
    catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/updates/approve/:id - Approve a pending update
exports.updatesRouter.post('/approve/:id', async (req, res) => {
    try {
        const pending = await prisma_1.prisma.pendingUpdate.findUnique({
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
        await prisma_1.prisma.trackingUpdate.create({
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
                approvedBy: req.admin.id,
                approvedAt: new Date(),
            },
        });
        const updatedShipment = await prisma_1.prisma.shipment.update({
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
        const frontendBaseUrl = (process.env.FRONTEND_URL || 'https://track.swifttrackpro.com').replace(/\/$/, '');
        const trackingUrl = `${frontendBaseUrl}/track/${pending.shipment.trackingNumber}`;
        const recipients = [
            { email: pending.shipment.senderEmail, name: pending.shipment.senderName, role: 'Sender' },
            { email: pending.shipment.receiverEmail, name: pending.shipment.receiverName, role: 'Receiver' },
        ];
        for (const recipient of recipients) {
            if (!recipient.email)
                continue;
            const { subject, html, text } = (0, email_1.getShipmentStatusUpdateEmail)({
                recipientName: recipient.name || recipient.role,
                trackingNumber: pending.shipment.trackingNumber,
                status: updatedShipment.status,
                location: updatedShipment.currentCity ? `${updatedShipment.currentCity}, ${updatedShipment.currentCountry || ''}`.trim() : null,
                description: pending.description || 'The shipment status has been updated.',
                trackingUrl,
            });
            (0, email_1.sendMail)({
                to: recipient.email,
                subject,
                html,
                text,
            }).catch(error => {
                console.error(`Failed to send shipment update email to ${recipient.email}:`, error);
            });
        }
        // Mark pending update as approved
        await prisma_1.prisma.pendingUpdate.update({
            where: { id: req.params.id },
            data: {
                reviewStatus: 'approved',
                reviewedBy: req.admin.id,
                reviewedAt: new Date(),
            },
        });
        await (0, activityLogger_1.logActivity)({
            adminId: req.admin.id,
            action: 'APPROVE_UPDATE',
            entity: 'pending_update',
            entityId: req.params.id,
            details: `Approved update for shipment ${pending.shipment.trackingNumber}: ${pending.status}`,
            ipAddress: req.ip,
        });
        res.json({ message: 'Update approved successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/updates/reject/:id - Reject a pending update
exports.updatesRouter.post('/reject/:id', async (req, res) => {
    try {
        const { reason } = req.body;
        const pending = await prisma_1.prisma.pendingUpdate.findUnique({
            where: { id: req.params.id },
            include: { shipment: true },
        });
        if (!pending) {
            res.status(404).json({ error: 'Pending update not found' });
            return;
        }
        await prisma_1.prisma.pendingUpdate.update({
            where: { id: req.params.id },
            data: {
                reviewStatus: 'rejected',
                reviewedBy: req.admin.id,
                reviewedAt: new Date(),
                reviewNotes: reason,
            },
        });
        await (0, activityLogger_1.logActivity)({
            adminId: req.admin.id,
            action: 'REJECT_UPDATE',
            entity: 'pending_update',
            entityId: req.params.id,
            details: `Rejected update for shipment ${pending.shipment.trackingNumber}`,
            ipAddress: req.ip,
        });
        res.json({ message: 'Update rejected' });
    }
    catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /api/updates/direct/:shipmentId - Add direct tracking update (admin only)
exports.updatesRouter.post('/direct/:shipmentId', async (req, res) => {
    try {
        const { location, city, country, lat, lng, status, description, photo } = req.body;
        const shipment = await prisma_1.prisma.shipment.findUnique({ where: { id: req.params.shipmentId } });
        if (!shipment) {
            res.status(404).json({ error: 'Shipment not found' });
            return;
        }
        const update = await prisma_1.prisma.trackingUpdate.create({
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
                approvedBy: req.admin.id,
                approvedAt: new Date(),
            },
        });
        const updatedShipment = await prisma_1.prisma.shipment.update({
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
        const frontendBaseUrl = (process.env.FRONTEND_URL || 'https://track.swifttrackpro.com').replace(/\/$/, '');
        const trackingUrl = `${frontendBaseUrl}/track/${shipment.trackingNumber}`;
        const recipients = [
            { email: shipment.senderEmail, name: shipment.senderName, role: 'Sender' },
            { email: shipment.receiverEmail, name: shipment.receiverName, role: 'Receiver' },
        ];
        for (const recipient of recipients) {
            if (!recipient.email)
                continue;
            const { subject, html, text } = (0, email_1.getShipmentStatusUpdateEmail)({
                recipientName: recipient.name || recipient.role,
                trackingNumber: shipment.trackingNumber,
                status: updatedShipment.status,
                location: updatedShipment.currentCity ? `${updatedShipment.currentCity}, ${updatedShipment.currentCountry || ''}`.trim() : null,
                description: description || 'The shipment status has been updated.',
                trackingUrl,
            });
            (0, email_1.sendMail)({
                to: recipient.email,
                subject,
                html,
                text,
            }).catch(error => {
                console.error(`Failed to send shipment update email to ${recipient.email}:`, error);
            });
        }
        await (0, activityLogger_1.logActivity)({
            adminId: req.admin.id,
            action: 'ADD_TRACKING_UPDATE',
            entity: 'shipment',
            entityId: req.params.shipmentId,
            details: `Added tracking update for ${shipment.trackingNumber}: ${status}`,
            ipAddress: req.ip,
        });
        res.status(201).json(update);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//# sourceMappingURL=updates.js.map