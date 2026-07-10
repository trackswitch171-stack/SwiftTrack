import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { activityApi } from '../../services/api';
import { ActivityLog } from '../../types';
import { format } from '../../utils/dateFormat';

const ACTION_COLORS: Record<string, string> = {
    LOGIN: 'bg-blue-50 text-[#0B3D91]',
    CREATE_SHIPMENT: 'bg-green-50 text-green-600',
    UPDATE_SHIPMENT: 'bg-yellow-50 text-yellow-600',
    DELETE_SHIPMENT: 'bg-red-50 text-red-600',
    APPROVE_UPDATE: 'bg-emerald-50 text-emerald-600',
    REJECT_UPDATE: 'bg-red-50 text-red-600',
    ADD_TRACKING_UPDATE: 'bg-purple-50 text-purple-600',
};

export default function AdminActivityLogs() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['activity-logs', page],
        queryFn: () => activityApi.list({ page, limit: 20 }),
    });

    const logs: ActivityLog[] = data?.data?.data || [];
    const pagination = data?.data?.pagination;

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Activity Logs</h1>
                <p className="text-gray-500 text-sm mt-0.5">Complete audit trail of all admin actions</p>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0B3D91]" />
                    <h3 className="font-semibold text-gray-900 text-sm">
                        {pagination ? `${pagination.total.toLocaleString()} total events` : 'All Events'}
                    </h3>
                </div>

                <div className="divide-y divide-gray-50">
                    {isLoading ? (
                        [...Array(10)].map((_, i) => (
                            <div key={i} className="px-5 py-4 flex gap-4">
                                <div className="w-8 h-8 skeleton rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 skeleton rounded w-48" />
                                    <div className="h-3 skeleton rounded w-64" />
                                </div>
                            </div>
                        ))
                    ) : logs.length === 0 ? (
                        <div className="py-16 text-center">
                            <Clock className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500">No activity logged yet</p>
                        </div>
                    ) : (
                        logs.map((log: ActivityLog, i: number) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.03 }}
                                className="px-5 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors"
                            >
                                <div className={`px-2.5 py-1 rounded-lg text-xs font-bold flex-shrink-0 mt-0.5 ${ACTION_COLORS[log.action] || 'bg-gray-50 text-gray-600'}`}>
                                    {log.action.replace(/_/g, ' ')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-gray-900 text-sm font-medium">{log.details || log.action}</p>
                                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                                        {log.admin && <span>By: {log.admin.name}</span>}
                                        {log.entity && <span>Entity: {log.entity}</span>}
                                        {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                                        <span>{format(log.createdAt)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Page {page} of {pagination.pages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
