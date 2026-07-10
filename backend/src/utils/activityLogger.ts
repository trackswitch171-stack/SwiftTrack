import { prisma } from '../lib/prisma';

interface LogActivityParams {
    adminId?: string;
    action: string;
    entity?: string;
    entityId?: string;
    details?: string;
    ipAddress?: string;
}

export async function logActivity(params: LogActivityParams): Promise<void> {
    try {
        await prisma.activityLog.create({
            data: {
                adminId: params.adminId,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                details: params.details,
                ipAddress: params.ipAddress,
            },
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
