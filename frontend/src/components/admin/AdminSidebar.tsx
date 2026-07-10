import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package, LayoutDashboard, Truck, Clock, Activity,
    LogOut, X, Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { updatesApi } from '../../services/api';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/shipments', icon: Truck, label: 'Shipments' },
    { to: '/admin/pending-updates', icon: Clock, label: 'Pending Updates', badge: true },
    { to: '/admin/activity', icon: Activity, label: 'Activity Logs' },
];

export default function AdminSidebar({ isOpen, onClose }: Props) {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();

    const { data: pendingData } = useQuery({
        queryKey: ['pending-updates'],
        queryFn: () => updatesApi.getPending(),
        refetchInterval: 30000,
    });

    const pendingCount = pendingData?.data?.length || 0;

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="text-white font-bold text-base block">
                                Swift<span className="text-orange-400">Track</span>
                            </span>
                            <span className="text-white/50 text-xs">Admin Portal</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${isActive
                                ? 'bg-white/20 text-white shadow-sm'
                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                            }`
                        }
                    >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.label}</span>
                        {item.badge && pendingCount > 0 && (
                            <span className="ml-auto bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-5 text-center">
                                {pendingCount > 99 ? '99+' : pendingCount}
                            </span>
                        )}
                    </NavLink>
                ))}

                <div className="pt-4 border-t border-white/10 mt-4">
                    <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    >
                        <Globe className="w-5 h-5" />
                        <span>View Public Site</span>
                    </a>
                </div>
            </nav>

            {/* Admin info */}
            <div className="px-4 py-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{admin?.name}</p>
                        <p className="text-white/50 text-xs truncate">{admin?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-white/70 hover:bg-red-500/20 hover:text-red-300 transition-all font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 flex-shrink-0 bg-gradient-to-b from-[#0B3D91] to-[#0a2e6e] h-full">
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="lg:hidden fixed inset-0 bg-black/60 z-40"
                        />
                        <motion.aside
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-[#0B3D91] to-[#0a2e6e] z-50 flex flex-col"
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
