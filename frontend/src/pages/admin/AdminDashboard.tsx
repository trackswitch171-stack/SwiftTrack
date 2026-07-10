import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Package, Truck, CheckCircle, Clock, AlertTriangle,
    TrendingUp, Plus, ArrowRight, Calendar
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { dashboardApi } from '../../services/api';
import { DashboardStats } from '../../types';
import { StatusBadge } from '../../utils/statusHelpers';
import { timeAgo } from '../../utils/dateFormat';

const PIE_COLORS = ['#0B3D91', '#2563EB', '#F97316', '#16A34A', '#dc2626', '#8b5cf6', '#0891b2', '#f59e0b'];

export default function AdminDashboard() {
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => dashboardApi.stats(),
        refetchInterval: 60000,
    });

    const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
        queryKey: ['dashboard-analytics'],
        queryFn: () => dashboardApi.analytics(),
        refetchInterval: 300000,
    });

    const stats: DashboardStats | undefined = statsData?.data;
    const analytics = analyticsData?.data;

    const statCards = [
        {
            title: 'Total Shipments',
            value: stats?.totalShipments || 0,
            icon: Package,
            color: 'text-[#0B3D91]',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            change: '+12%',
            changeType: 'up',
        },
        {
            title: 'Delivered',
            value: stats?.delivered || 0,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50',
            border: 'border-green-100',
            change: '+8%',
            changeType: 'up',
        },
        {
            title: 'In Transit',
            value: stats?.inTransit || 0,
            icon: Truck,
            color: 'text-[#0B3D91]',
            bg: 'bg-blue-50',
            border: 'border-blue-100',
            change: '+5%',
            changeType: 'up',
        },
        {
            title: 'Pending Updates',
            value: stats?.pendingUpdates || 0,
            icon: Clock,
            color: 'text-orange-500',
            bg: 'bg-orange-50',
            border: 'border-orange-100',
            link: '/admin/pending-updates',
            urgent: (stats?.pendingUpdates || 0) > 0,
        },
        {
            title: 'Delayed',
            value: stats?.delayed || 0,
            icon: AlertTriangle,
            color: 'text-red-500',
            bg: 'bg-red-50',
            border: 'border-red-100',
        },
        {
            title: "Today's Shipments",
            value: stats?.todayShipments || 0,
            icon: Calendar,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            border: 'border-purple-100',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Welcome back! Here's what's happening today.</p>
                </div>
                <Link to="/admin/shipments/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0B3D91] text-white rounded-xl font-semibold text-sm hover:bg-[#0B3D91] transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    New Shipment
                </Link>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {statCards.map((card, i) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                    >
                        {card.link ? (
                            <Link to={card.link} className={`card border ${card.border} block hover:shadow-card-hover transition-all ${card.urgent ? 'ring-2 ring-orange-400 ring-offset-1' : ''}`}>
                                <StatCardContent card={card} loading={statsLoading} />
                            </Link>
                        ) : (
                            <div className={`card border ${card.border}`}>
                                <StatCardContent card={card} loading={statsLoading} />
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Trend chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 card"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900">Shipment Trends</h3>
                            <p className="text-gray-500 text-sm">Last 12 months</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-[#0B3D91]" />
                    </div>
                    {analyticsLoading ? (
                        <div className="h-64 skeleton rounded-xl" />
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={analytics?.monthlyTrends || []}>
                                <defs>
                                    <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="delGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#16A34A" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#16A34A" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Legend />
                                <Area type="monotone" dataKey="shipments" stroke="#2563EB" fill="url(#shipGrad)" strokeWidth={2} name="Shipments" />
                                <Area type="monotone" dataKey="delivered" stroke="#16A34A" fill="url(#delGrad)" strokeWidth={2} name="Delivered" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Status pie */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="card"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900">Status Distribution</h3>
                            <p className="text-gray-500 text-sm">Current shipments</p>
                        </div>
                    </div>
                    {analyticsLoading ? (
                        <div className="h-64 skeleton rounded-xl" />
                    ) : (
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={analytics?.statusDistribution || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {(analytics?.statusDistribution || []).map((_: any, index: number) => (
                                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>
            </div>

            {/* Bottom row */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent shipments */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 card"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">Recent Shipments</h3>
                        <Link to="/admin/shipments" className="text-[#0B3D91] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {statsLoading ? (
                            [...Array(5)].map((_, i) => <div key={i} className="h-12 skeleton rounded-xl" />)
                        ) : stats?.recentShipments?.length ? (
                            stats.recentShipments.map((s: any) => (
                                <Link
                                    key={s.id}
                                    to={`/admin/shipments/${s.id}`}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="w-9 h-9 bg-[#0B3D91]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Package className="w-4 h-4 text-[#0B3D91]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 text-sm font-mono">{s.trackingNumber}</p>
                                        <p className="text-gray-500 text-xs truncate">{s.receiverName} → {s.destinationCity}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <StatusBadge status={s.status} size="sm" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm text-center py-8">No shipments yet</p>
                        )}
                    </div>
                </motion.div>

                {/* Top destinations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card"
                >
                    <h3 className="font-bold text-gray-900 mb-4">Top Destinations</h3>
                    {analyticsLoading ? (
                        <div className="space-y-3">
                            {[...Array(6)].map((_, i) => <div key={i} className="h-8 skeleton rounded-lg" />)}
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={(analytics?.topDestinations || []).slice(0, 6)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis type="category" dataKey="country" tick={{ fontSize: 10, fill: '#64748b' }} width={80} />
                                <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="count" fill="#2563EB" radius={[0, 6, 6, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function StatCardContent({ card, loading }: { card: any; loading: boolean }) {
    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                </div>
                {card.urgent && (
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-pulse" />
                )}
            </div>
            {loading ? (
                <div className="h-7 w-16 skeleton rounded-lg" />
            ) : (
                <div className={`text-2xl font-extrabold ${card.color}`}>{card.value.toLocaleString()}</div>
            )}
            <p className="text-gray-500 text-xs font-medium leading-tight">{card.title}</p>
        </div>
    );
}
