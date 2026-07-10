import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Clock, CheckCircle, XCircle, MapPin, Package,
    AlertTriangle, Eye
} from 'lucide-react';
import { updatesApi } from '../../services/api';
import { PendingUpdate } from '../../types';
import { StatusBadge, getStatusConfig } from '../../utils/statusHelpers';
import { format } from '../../utils/dateFormat';
import toast from 'react-hot-toast';

export default function AdminPendingUpdates() {
    const queryClient = useQueryClient();
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [viewUpdate, setViewUpdate] = useState<PendingUpdate | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['pending-updates'],
        queryFn: () => updatesApi.getPending(),
        refetchInterval: 30000,
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => updatesApi.approve(id),
        onSuccess: () => {
            toast.success('Update approved and published to tracking!');
            queryClient.invalidateQueries({ queryKey: ['pending-updates'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            setViewUpdate(null);
        },
        onError: () => toast.error('Failed to approve update'),
    });

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            updatesApi.reject(id, reason),
        onSuccess: () => {
            toast.success('Update rejected');
            queryClient.invalidateQueries({ queryKey: ['pending-updates'] });
            setRejectId(null);
            setRejectReason('');
            setViewUpdate(null);
        },
        onError: () => toast.error('Failed to reject update'),
    });

    const pendingUpdates: PendingUpdate[] = data?.data || [];

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Pending Updates</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Review and approve tracking updates before they appear to customers
                    </p>
                </div>
                {pendingUpdates.length > 0 && (
                    <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-xl border border-orange-100">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-bold text-sm">{pendingUpdates.length} pending</span>
                    </div>
                )}
            </div>

            {/* Info banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-sm">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-[#0B3D91]" />
                </div>
                <div>
                    <p className="font-semibold text-blue-800">Approval Required</p>
                    <p className="text-[#0B3D91] mt-0.5">
                        Updates submitted by operations team require admin approval before they become visible to customers on the public tracking page.
                    </p>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-32 skeleton rounded-2xl" />)}
                </div>
            )}

            {/* Empty */}
            {!isLoading && pendingUpdates.length === 0 && (
                <div className="card text-center py-16">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
                    <p className="text-gray-500">No pending updates require review at this time.</p>
                </div>
            )}

            {/* Updates list */}
            <AnimatePresence>
                {pendingUpdates.map((update: PendingUpdate) => (
                    <motion.div
                        key={update.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, height: 0 }}
                        className="card border-l-4 border-l-accent-500"
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Left info */}
                            <div className="flex-1 space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full border border-orange-100">
                                        ⏳ Awaiting Review
                                    </span>
                                    <StatusBadge status={update.status} size="sm" />
                                    <span className="text-gray-400 text-xs">{format(update.createdAt)}</span>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-9 h-9 bg-[#0B3D91]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Package className="w-4 h-4 text-[#0B3D91]" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-[#0B3D91] text-sm">
                                                {update.shipment?.trackingNumber}
                                            </span>
                                            <Link
                                                to={`/admin/shipments/${update.shipmentId}`}
                                                className="text-gray-400 hover:text-[#0B3D91]"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                        <p className="text-gray-500 text-xs">
                                            {update.shipment?.senderName} → {update.shipment?.receiverName}
                                        </p>
                                        <p className="text-gray-400 text-xs">
                                            {update.shipment?.originCity} → {update.shipment?.destinationCity}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-semibold text-gray-900">{update.location}</span>
                                            {update.lat && update.lng && (
                                                <span className="text-gray-400 text-xs ml-2">({update.lat}, {update.lng})</span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 pl-6">{update.description}</p>
                                    {update.notes && (
                                        <p className="text-gray-400 text-xs pl-6 italic">Note: {update.notes}</p>
                                    )}
                                    {update.submittedBy && (
                                        <p className="text-gray-400 text-xs pl-6">Submitted by: {update.submittedBy}</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex md:flex-col gap-2 justify-end md:justify-start md:min-w-[140px]">
                                <button
                                    onClick={() => approveMutation.mutate(update.id)}
                                    disabled={approveMutation.isPending}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-colors disabled:opacity-70 flex-1 md:flex-none"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => setRejectId(update.id)}
                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors flex-1 md:flex-none"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Reject modal */}
            {rejectId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Reject Update</h3>
                        <p className="text-gray-500 text-sm text-center mb-4">Provide a reason for rejection (optional)</p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="w-full input-field resize-none h-24 mb-4"
                            placeholder="e.g. Incorrect location data..."
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setRejectId(null); setRejectReason(''); }}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
                                disabled={rejectMutation.isPending}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-70"
                            >
                                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
