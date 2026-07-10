import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Package, MapPin, Calendar, Weight, Clock,
    User, Phone, Mail, ArrowRight, AlertCircle, CheckCircle,
    Loader2, Globe, Box
} from 'lucide-react';
import { shipmentsApi } from '../../services/api';
import { Shipment, TrackingUpdate } from '../../types';
import { StatusBadge, getStatusConfig } from '../../utils/statusHelpers';
import ShipmentMap from '../../components/map/ShipmentMap';
import { format } from '../../utils/dateFormat';

export default function TrackPage() {
    const { trackingNumber: paramTracking } = useParams();
    const navigate = useNavigate();
    const [inputValue, setInputValue] = useState(paramTracking || '');
    const [searchValue, setSearchValue] = useState(paramTracking || '');

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['track', searchValue],
        queryFn: () => shipmentsApi.track(searchValue),
        enabled: !!searchValue,
        retry: false,
    });

    const shipment: Shipment | undefined = data?.data;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setSearchValue(inputValue.trim());
            navigate(`/track/${inputValue.trim()}`);
        }
    };

    useEffect(() => {
        if (paramTracking) {
            setInputValue(paramTracking);
            setSearchValue(paramTracking);
        }
    }, [paramTracking]);

    const statusConfig = shipment ? getStatusConfig(shipment.status) : null;
    const progress = statusConfig?.progress || 0;

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            {/* Search header */}
            <div className="bg-gradient-hero py-12">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Track Your Shipment</h1>
                        <p className="text-white/70">Enter your tracking number to get real-time updates</p>
                    </motion.div>

                    <form onSubmit={handleSubmit}>
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="e.g. TRK-AU-2026-000001"
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500 shadow-lg font-medium"
                                />
                            </div>
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                disabled={isLoading}
                                className="px-8 py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-70"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                Track
                            </motion.button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Loading */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-16 h-16 border-4 border-[#0B3D91] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Searching for your shipment...</p>
                    </div>
                )}

                {/* Error */}
                {isError && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-lg mx-auto mt-8"
                    >
                        <div className="card border-red-100 text-center py-10">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Shipment Not Found</h3>
                            <p className="text-gray-500 mb-6">
                                We couldn't find a shipment with tracking number <strong>{searchValue}</strong>.<br />
                                Please check your tracking number and try again.
                            </p>
                            <div className="bg-blue-50 rounded-xl p-4 text-left text-sm text-blue-700">
                                <p className="font-semibold mb-1">Try these sample tracking numbers:</p>
                                {['TRK-AU-2026-000001', 'TRK-UK-2026-000002', 'TRK-US-2026-000003'].map((tn) => (
                                    <button
                                        key={tn}
                                        onClick={() => { setInputValue(tn); setSearchValue(tn); navigate(`/track/${tn}`); }}
                                        className="block text-[#0B3D91] hover:underline font-mono mt-1"
                                    >
                                        {tn}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Results */}
                <AnimatePresence>
                    {shipment && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Status overview card */}
                            <div className="card border-0 shadow-card bg-white overflow-hidden">
                                <div className="bg-gradient-to-r from-[#0B3D91] to-[#0B3D91] px-6 py-5">
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="text-white/70 text-sm mb-1">Tracking Number</p>
                                            <h2 className="text-white font-bold text-2xl font-mono">{shipment.trackingNumber}</h2>
                                        </div>
                                        <StatusBadge status={shipment.status} size="lg" />
                                    </div>
                                </div>

                                <div className="px-6 py-5">
                                    {/* Progress bar */}
                                    <div className="mb-6">
                                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                                            <span className="font-medium">Shipment Progress</span>
                                            <span className="font-semibold text-[#0B3D91]">{progress}%</span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className="h-full rounded-full bg-gradient-to-r from-[#0B3D91] to-orange-500"
                                            />
                                        </div>
                                        <div className="flex justify-between mt-3 text-xs text-gray-400">
                                            <span>📦 Created</span>
                                            <span>🚛 In Transit</span>
                                            <span>✅ Delivered</span>
                                        </div>
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                        <div className="text-center min-w-0">
                                            <p className="text-xs text-gray-500 mb-1">From</p>
                                            <p className="font-bold text-gray-900 text-sm">{shipment.originCity}</p>
                                            <p className="text-gray-500 text-xs">{shipment.originCountry}</p>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <div className="h-0.5 flex-1 bg-blue-200" />
                                            <ArrowRight className="w-5 h-5 text-[#0B3D91] flex-shrink-0" />
                                            <div className="h-0.5 flex-1 bg-blue-200" />
                                        </div>
                                        {shipment.currentCity && shipment.currentCity !== shipment.originCity && (
                                            <>
                                                <div className="text-center min-w-0">
                                                    <p className="text-xs text-gray-500 mb-1">Currently At</p>
                                                    <p className="font-bold text-[#0B3D91] text-sm">{shipment.currentCity}</p>
                                                    <p className="text-gray-500 text-xs">{shipment.currentCountry}</p>
                                                </div>
                                                <div className="flex-1 flex items-center gap-2">
                                                    <div className="h-0.5 flex-1 bg-gray-200" />
                                                    <ArrowRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
                                                    <div className="h-0.5 flex-1 bg-gray-200" />
                                                </div>
                                            </>
                                        )}
                                        <div className="text-center min-w-0">
                                            <p className="text-xs text-gray-500 mb-1">To</p>
                                            <p className="font-bold text-gray-900 text-sm">{shipment.destinationCity}</p>
                                            <p className="text-gray-500 text-xs">{shipment.destinationCountry}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main content grid */}
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Left column */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Map */}
                                    <ShipmentMap shipment={shipment} />

                                    {/* Timeline */}
                                    <div className="card">
                                        <h3 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-[#0B3D91]" />
                                            Shipment Timeline
                                        </h3>
                                        <div className="space-y-0">
                                            {shipment.trackingUpdates && shipment.trackingUpdates.length > 0 ? (
                                                [...shipment.trackingUpdates].sort((a, b) =>
                                                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                                                ).map((update: TrackingUpdate, i: number, arr: TrackingUpdate[]) => {
                                                    const config = getStatusConfig(update.status);
                                                    const isLatest = i === 0;
                                                    const isLast = i === arr.length - 1;
                                                    return (
                                                        <motion.div
                                                            key={update.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="flex gap-4 relative"
                                                        >
                                                            {/* Line */}
                                                            {!isLast && (
                                                                <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-100" />
                                                            )}

                                                            {/* Dot */}
                                                            <div className="relative flex-shrink-0 mt-1">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isLatest ? 'bg-[#0B3D91]' : 'bg-gray-100'
                                                                    }`}>
                                                                    {isLatest ? (
                                                                        <MapPin className="w-4 h-4 text-white" />
                                                                    ) : (
                                                                        <CheckCircle className="w-4 h-4 text-gray-400" />
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Content */}
                                                            <div className={`flex-1 pb-6 ${isLatest ? 'bg-blue-50 rounded-xl p-4 -ml-2 mb-2' : ''}`}>
                                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                                                                    <div>
                                                                        <StatusBadge status={update.status} size="sm" />
                                                                        <p className="font-semibold text-gray-900 mt-1.5">{update.location}</p>
                                                                    </div>
                                                                    <p className="text-xs text-gray-400 whitespace-nowrap">
                                                                        {format(update.timestamp)}
                                                                    </p>
                                                                </div>
                                                                <p className="text-gray-600 text-sm">{update.description}</p>
                                                                {isLatest && (
                                                                    <div className="flex items-center gap-1.5 mt-2">
                                                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                                                        <span className="text-green-600 text-xs font-medium">Most Recent Update</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })
                                            ) : (
                                                <p className="text-gray-500 text-sm">No tracking updates available yet.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right column — details */}
                                <div className="space-y-5">
                                    {/* Shipment info */}
                                    <div className="card">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Box className="w-4 h-4 text-[#0B3D91]" />
                                            Shipment Details
                                        </h3>
                                        <dl className="space-y-3 text-sm">
                                            {[
                                                { label: 'Type', value: shipment.shipmentType },
                                                { label: 'Weight', value: `${shipment.weight} ${shipment.weightUnit}` },
                                                { label: 'Service', value: shipment.serviceType || 'Standard' },
                                                { label: 'Priority', value: shipment.priority || 'Normal' },
                                                shipment.dimensions && { label: 'Dimensions', value: shipment.dimensions },
                                                shipment.description && { label: 'Description', value: shipment.description },
                                                shipment.estimatedDelivery && { label: 'Est. Delivery', value: format(shipment.estimatedDelivery) },
                                                shipment.actualDelivery && { label: 'Delivered On', value: format(shipment.actualDelivery) },
                                            ].filter(Boolean).map((item: any) => (
                                                <div key={item.label} className="flex justify-between">
                                                    <dt className="text-gray-500">{item.label}</dt>
                                                    <dd className="font-medium text-gray-900 text-right capitalize">{item.value}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>

                                    {/* Sender */}
                                    <div className="card">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <User className="w-4 h-4 text-[#0B3D91]" />
                                            Sender
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <p className="font-semibold text-gray-900">{shipment.senderName}</p>
                                            <p className="text-gray-500">{shipment.senderAddress}</p>
                                            <p className="text-gray-500">{shipment.senderCity}, {shipment.senderCountry}</p>
                                            {shipment.senderPhone && (
                                                <p className="flex items-center gap-1.5 text-gray-500">
                                                    <Phone className="w-3.5 h-3.5" /> {shipment.senderPhone}
                                                </p>
                                            )}
                                            {shipment.senderEmail && (
                                                <p className="flex items-center gap-1.5 text-gray-500">
                                                    <Mail className="w-3.5 h-3.5" /> {shipment.senderEmail}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Receiver */}
                                    <div className="card">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-orange-500" />
                                            Recipient
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <p className="font-semibold text-gray-900">{shipment.receiverName}</p>
                                            <p className="text-gray-500">{shipment.receiverAddress}</p>
                                            <p className="text-gray-500">{shipment.receiverCity}, {shipment.receiverCountry}</p>
                                            {shipment.receiverPhone && (
                                                <p className="flex items-center gap-1.5 text-gray-500">
                                                    <Phone className="w-3.5 h-3.5" /> {shipment.receiverPhone}
                                                </p>
                                            )}
                                            {shipment.receiverEmail && (
                                                <p className="flex items-center gap-1.5 text-gray-500">
                                                    <Mail className="w-3.5 h-3.5" /> {shipment.receiverEmail}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="card">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-[#0B3D91]" />
                                            Important Dates
                                        </h3>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Created</span>
                                                <span className="font-medium">{format(shipment.createdAt)}</span>
                                            </div>
                                            {shipment.shippedAt && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Shipped</span>
                                                    <span className="font-medium">{format(shipment.shippedAt)}</span>
                                                </div>
                                            )}
                                            {shipment.estimatedDelivery && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Est. Delivery</span>
                                                    <span className="font-medium text-[#0B3D91]">{format(shipment.estimatedDelivery)}</span>
                                                </div>
                                            )}
                                            {shipment.actualDelivery && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Actual Delivery</span>
                                                    <span className="font-medium text-green-600">{format(shipment.actualDelivery)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Empty state */}
                {!searchValue && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="w-20 h-20 bg-[#0B3D91]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Globe className="w-10 h-10 text-[#0B3D91]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Track Any Shipment Worldwide</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Enter a tracking number above to see real-time location and status of your shipment.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
