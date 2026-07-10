import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Edit2, Trash2, Package, MapPin, User, Clock, Plus, ExternalLink
} from 'lucide-react';
import { shipmentsApi, updatesApi } from '../../services/api';
import { TrackingUpdate, PendingUpdate } from '../../types';
import ShipmentMap from '../../components/map/ShipmentMap';
import { StatusBadge, getStatusConfig, ALL_STATUSES } from '../../utils/statusHelpers';
import { format } from '../../utils/dateFormat';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface UpdateForm {
    location: string;
    city: string;
    country: string;
    lat: string;
    lng: string;
    status: string;
    description: string;
}

export default function AdminShipmentDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showAddUpdate, setShowAddUpdate] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['shipment', id],
        queryFn: () => shipmentsApi.get(id!),
        enabled: !!id,
    });

    const deleteMutation = useMutation({
        mutationFn: () => shipmentsApi.delete(id!),
        onSuccess: () => {
            toast.success('Shipment deleted');
            navigate('/admin/shipments');
        },
    });

    const addUpdateMutation = useMutation({
        mutationFn: (data: any) => updatesApi.addDirect(id!, data),
        onSuccess: () => {
            toast.success('Tracking update added!');
            queryClient.invalidateQueries({ queryKey: ['shipment', id] });
            setShowAddUpdate(false);
        },
        onError: () => toast.error('Failed to add update'),
    });

    const { register, handleSubmit, reset } = useForm<UpdateForm>();

    const onAddUpdate = async (data: UpdateForm) => {
        await addUpdateMutation.mutateAsync(data);
        reset();
    };

    const shipment = data?.data;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#0B3D91] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!shipment) return <div className="text-center py-20 text-gray-500">Shipment not found</div>;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/shipments" className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-xl font-extrabold text-gray-900 font-mono">{shipment.trackingNumber}</h1>
                            <StatusBadge status={shipment.status} size="md" />
                        </div>
                        <p className="text-gray-500 text-sm mt-0.5">Created {format(shipment.createdAt)}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <a
                        href={`/track/${shipment.trackingNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Public View
                    </a>
                    <Link
                        to={`/admin/shipments/${id}/edit`}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#0B3D91] text-white rounded-xl text-sm font-semibold hover:bg-[#0B3D91] transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit
                    </Link>
                    <button
                        onClick={() => { if (confirm('Delete this shipment?')) deleteMutation.mutate(); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors border border-red-100"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Route */}
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#0B3D91]" />
                            Shipment Route
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-[#1a4fc4] text-xs font-semibold uppercase mb-1">Origin</p>
                                <p className="font-bold text-[#0B3D91]">{shipment.originCity}</p>
                                <p className="text-[#1a4fc4]">{shipment.originCountry}</p>
                                {shipment.originLat && <p className="text-blue-400 text-xs mt-1">{shipment.originLat}, {shipment.originLng}</p>}
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <p className="text-[#0B3D91] text-xs font-semibold uppercase mb-1">Current Location</p>
                                <p className="font-bold text-[#0B3D91]">{shipment.currentCity || shipment.originCity}</p>
                                <p className="text-[#0B3D91]">{shipment.currentCountry || shipment.originCountry}</p>
                                {shipment.currentLat && <p className="text-blue-400 text-xs mt-1">{shipment.currentLat}, {shipment.currentLng}</p>}
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                                <p className="text-green-600 text-xs font-semibold uppercase mb-1">Destination</p>
                                <p className="font-bold text-green-700">{shipment.destinationCity}</p>
                                <p className="text-green-600">{shipment.destinationCountry}</p>
                                {shipment.destinationLat && <p className="text-green-400 text-xs mt-1">{shipment.destinationLat}, {shipment.destinationLng}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Map */}
                    <ShipmentMap shipment={shipment} />

                    {/* Timeline */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#0B3D91]" />
                                Tracking History ({shipment.trackingUpdates?.length || 0})
                            </h3>
                            <button
                                onClick={() => setShowAddUpdate(!showAddUpdate)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-[#0B3D91] text-white rounded-xl text-xs font-semibold hover:bg-[#0B3D91] transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                Add Update
                            </button>
                        </div>

                        {/* Add update form */}
                        {showAddUpdate && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mb-5 p-4 bg-blue-50 rounded-2xl border border-blue-100"
                            >
                                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Add Direct Tracking Update</h4>
                                <form onSubmit={handleSubmit(onAddUpdate)} className="space-y-3">
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="label text-xs">Location *</label>
                                            <input {...register('location', { required: true })} className="input-field py-2 text-sm" placeholder="Dubai International Airport" />
                                        </div>
                                        <div>
                                            <label className="label text-xs">Status *</label>
                                            <select {...register('status', { required: true })} className="input-field py-2 text-sm">
                                                {ALL_STATUSES.map(s => <option key={s} value={s}>{getStatusConfig(s).label}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label text-xs">City</label>
                                            <input {...register('city')} className="input-field py-2 text-sm" placeholder="Dubai" />
                                        </div>
                                        <div>
                                            <label className="label text-xs">Country</label>
                                            <input {...register('country')} className="input-field py-2 text-sm" placeholder="United Arab Emirates" />
                                        </div>
                                        <div>
                                            <label className="label text-xs">Latitude</label>
                                            <input {...register('lat')} type="number" step="any" className="input-field py-2 text-sm" placeholder="25.2532" />
                                        </div>
                                        <div>
                                            <label className="label text-xs">Longitude</label>
                                            <input {...register('lng')} type="number" step="any" className="input-field py-2 text-sm" placeholder="55.3657" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="label text-xs">Description *</label>
                                            <input {...register('description', { required: true })} className="input-field py-2 text-sm" placeholder="Package arrived at hub for inspection" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" disabled={addUpdateMutation.isPending} className="px-4 py-2 bg-[#0B3D91] text-white rounded-xl text-sm font-semibold hover:bg-[#0B3D91] transition-colors disabled:opacity-70">
                                            {addUpdateMutation.isPending ? 'Adding...' : 'Add Update'}
                                        </button>
                                        <button type="button" onClick={() => setShowAddUpdate(false)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        <div className="space-y-0">
                            {shipment.trackingUpdates && shipment.trackingUpdates.length > 0 ? (
                                [...shipment.trackingUpdates]
                                    .sort((a: TrackingUpdate, b: TrackingUpdate) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                    .map((update: TrackingUpdate, i: number, arr: TrackingUpdate[]) => {
                                        const isLatest = i === 0;
                                        const isLast = i === arr.length - 1;
                                        return (
                                            <div key={update.id} className="flex gap-3 relative">
                                                {!isLast && (
                                                    <div className="absolute left-4.5 top-10 bottom-0 w-0.5 bg-gray-100" />
                                                )}
                                                <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${isLatest ? 'bg-[#0B3D91]' : 'bg-gray-100'}`}>
                                                    <MapPin className={`w-4 h-4 ${isLatest ? 'text-white' : 'text-gray-400'}`} />
                                                </div>
                                                <div className="flex-1 pb-5">
                                                    <div className="flex flex-wrap justify-between gap-2 mb-1">
                                                        <StatusBadge status={update.status} size="sm" />
                                                        <span className="text-xs text-gray-400">{format(update.timestamp)}</span>
                                                    </div>
                                                    <p className="font-semibold text-gray-900 text-sm">{update.location}</p>
                                                    <p className="text-gray-500 text-sm">{update.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <p className="text-gray-500 text-sm">No tracking updates yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-5">
                    {/* Shipment details */}
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                            <Package className="w-4 h-4 text-[#0B3D91]" />
                            Details
                        </h3>
                        <dl className="space-y-2.5 text-sm">
                            {[
                                { l: 'Type', v: shipment.shipmentType },
                                { l: 'Weight', v: `${shipment.weight} ${shipment.weightUnit}` },
                                { l: 'Service', v: shipment.serviceType },
                                { l: 'Priority', v: shipment.priority },
                                shipment.dimensions && { l: 'Dimensions', v: shipment.dimensions },
                                shipment.description && { l: 'Contents', v: shipment.description },
                                shipment.declaredValue && { l: 'Value', v: `${shipment.declaredValue} ${shipment.currency}` },
                                { l: 'Est. Delivery', v: shipment.estimatedDelivery ? format(shipment.estimatedDelivery) : 'N/A' },
                            ].filter(Boolean).map((item: any) => (
                                <div key={item.l} className="flex justify-between gap-2">
                                    <dt className="text-gray-500 flex-shrink-0">{item.l}</dt>
                                    <dd className="font-medium text-gray-900 text-right capitalize">{item.v}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>

                    {/* Sender */}
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-[#0B3D91]" />
                            Sender
                        </h3>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold text-gray-900">{shipment.senderName}</p>
                            <p className="text-gray-500">{shipment.senderAddress}</p>
                            <p className="text-gray-500">{shipment.senderCity}, {shipment.senderCountry}</p>
                            {shipment.senderPhone && <p className="text-gray-500">{shipment.senderPhone}</p>}
                            {shipment.senderEmail && <p className="text-gray-500 truncate">{shipment.senderEmail}</p>}
                        </div>
                    </div>

                    {/* Receiver */}
                    <div className="card">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            Receiver
                        </h3>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold text-gray-900">{shipment.receiverName}</p>
                            <p className="text-gray-500">{shipment.receiverAddress}</p>
                            <p className="text-gray-500">{shipment.receiverCity}, {shipment.receiverCountry}</p>
                            {shipment.receiverPhone && <p className="text-gray-500">{shipment.receiverPhone}</p>}
                            {shipment.receiverEmail && <p className="text-gray-500 truncate">{shipment.receiverEmail}</p>}
                        </div>
                    </div>

                    {/* Pending updates */}
                    {shipment.pendingUpdates && shipment.pendingUpdates.length > 0 && (
                        <div className="card border-orange-100 bg-orange-50">
                            <h3 className="font-bold text-orange-700 mb-3 text-sm flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Pending Updates ({shipment.pendingUpdates.filter((p: PendingUpdate) => p.reviewStatus === 'pending').length})
                            </h3>
                            <p className="text-orange-600 text-xs">
                                There are pending updates awaiting approval.{' '}
                                <Link to="/admin/pending-updates" className="underline font-semibold">Review now</Link>
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
