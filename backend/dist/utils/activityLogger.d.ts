interface LogActivityParams {
    adminId?: string;
    action: string;
    entity?: string;
    entityId?: string;
    details?: string;
    ipAddress?: string;
}
export declare function logActivity(params: LogActivityParams): Promise<void>;
export {};
//# sourceMappingURL=activityLogger.d.ts.map