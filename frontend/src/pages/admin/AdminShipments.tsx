import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Plus, Search, Eye, Edit2, Trash2, Package,
    ChevronLeft, ChevronRight
} from 'lucide-react';
import { shipmentsApi } from '../../services/api';
import { Shipment } from '../../types';
import { StatusBadge, ALL_STATUSES, getStatusConfig } from '../../utils/statusHelpers';
import { format } from '../../utils/dateFormat';
import toast from 'react-hot-toast';

export default function AdminShipments() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['shipments', page, search, statusFilter],
        queryFn: () => shipmentsApi.list({ page, limit: 15, search, status: statusFilter }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => shipmentsApi.delete(id),
        onSuccess: () => {
            toast.success('Shipment deleted');
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            setDeleteId(null);
        },
        onError: () => toast.error('Failed to delete shipment'),
    });

    const shipments: Shipment[] = data?.data?.data || [];
    const pagination = data?.data?.pagination;

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearch(searchInput);
        setPage(1);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Shipments</h1>
                    <p className="text-gray-500 text-sm mt-0.5">
                        {pagination ? `${pagination.total.toLocaleString()} total shipments` : 'Manage all shipments'}
                    </p>
                </div>
                <Link
                    to="/admin/shipments/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0B3D91] text-white rounded-xl font-semibold text-sm hover:bg-[#0B3D91] transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Shipment
                </Link>
            </div>

            {/* Filters */}
            <div className="card py-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tracking number, name, city..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="input-field pl-10 py-2.5"
                            />
                        </div>
                        <button type="submit" className="px-4 py-2.5 bg-[#0B3D91] text-white rounded-xl text-sm font-semibold hover:bg-[#0B3D91] transition-colors">
                            Search
                        </button>
                    </form>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="input-field py-2.5 w-full sm:w-48"
                    >
                        <option value="">All Statuses</option>
                        {ALL_STATUSES.map((s) => (
                            <option key={s} value={s}>{getStatusConfig(s).label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Tracking No.</th>
                                <th className="text-left px-4 py-3.5 font-semibold text-gray-600 hidden md:table-cell">Sender</th>
                                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Receiver</th>
                                <th className="text-left px-4 py-3.5 font-semibold text-gray-600 hidden lg:table-cell">Route</th>
                                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Status</th>
                                <th className="text-left px-4 py-3.5 font-semibold text-gray-600 hidden xl:table-cell">Created</th>
                                <th className="text-right px-4 py-3.5 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                [...Array(8)].map((_, i) => (
                                    <tr key={i}>
                                        {[...Array(7)].map((_, j) => (
                                            <td key={j} className="px-4 py-3.5">
                                                <div className="h-5 skeleton rounded-md" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : shipments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-16 text-center">
                                        <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">No shipments found</p>
                                        <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            ) : (
                                shipments.map((s: Shipment) => (
                                    <motion.tr
                                        key={s.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-4 py-3.5">
                                            <span className="font-mono font-semibold text-[#0B3D91] text-xs">{s.trackingNumber}</span>
                                        </td>
                                        <td className="px-4 py-3.5 hidden md:table-cell">
                                            <p className="font-medium text-gray-900">{s.senderName}</p>
                                            <p className="text-gray-500 text-xs">{s.senderCity}, {s.senderCountry}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <p className="font-medium text-gray-900">{s.receiverName}</p>
                                            <p className="text-gray-500 text-xs">{s.receiverCity}, {s.receiverCountry}</p>
                                        </td>
                                        <td className="px-4 py-3.5 hidden lg:table-cell">
                                            <p className="text-gray-600 text-xs">{s.originCountry} → {s.destinationCountry}</p>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <StatusBadge status={s.status} size="sm" />
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-500 text-xs hidden xl:table-cell">
                                            {format(s.createdAt)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    to={`/admin/shipments/${s.id}`}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#0B3D91] hover:bg-blue-50 transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    to={`/admin/shipments/${s.id}/edit`}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(s.id)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3.5 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                            Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 text-sm font-semibold text-gray-700">
                                {page} / {pagination.pages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                disabled={page === pagination.pages}
                                className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                    >
                        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Shipment</h3>
                        <p className="text-gray-500 text-sm text-center mb-6">
                            Are you sure you want to delete this shipment? This action cannot be undone and all tracking history will be lost.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteMutation.mutate(deleteId)}
                                disabled={deleteMutation.isPending}
                                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-70"
                            >
                                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
