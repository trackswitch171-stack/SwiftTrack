"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const prisma_1 = require("../lib/prisma");
async function logActivity(params) {
    try {
        await prisma_1.prisma.activityLog.create({
            data: {
                adminId: params.adminId,
                action: params.action,
                entity: params.entity,
                entityId: params.entityId,
                details: params.details,
                ipAddress: params.ipAddress,
            },
        });
    }
    catch (error) {
        console.error('Failed to log activity:', error);
    }
}
//# sourceMappingURL=activityLogger.js.map