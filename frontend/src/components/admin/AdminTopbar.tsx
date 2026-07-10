import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { updatesApi } from '../../services/api';
import { Link, useLocation } from 'react-router-dom';

interface Props {
    onMenuClick: () => void;
}

const breadcrumbs: Record<string, string> = {
    '/admin/dashboard': 'Dashboard',
    '/admin/shipments': 'Shipments',
    '/admin/shipments/new': 'Create Shipment',
    '/admin/pending-updates': 'Pending Updates',
    '/admin/activity': 'Activity Logs',
};

export default function AdminTopbar({ onMenuClick }: Props) {
    const { admin } = useAuth();
    const location = useLocation();

    const { data: pendingData } = useQuery({
        queryKey: ['pending-updates'],
        queryFn: () => updatesApi.getPending(),
        refetchInterval: 30000,
    });

    const pendingCount = pendingData?.data?.length || 0;
    const pageTitle = breadcrumbs[location.pathname] || 'SwiftTrack Admin';

    return (
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 flex-shrink-0 shadow-sm">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div>
                    <h1 className="font-bold text-gray-900 text-base">{pageTitle}</h1>
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Notifications bell */}
                <Link
                    to="/admin/pending-updates"
                    className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    {pendingCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                            {pendingCount > 9 ? '9+' : pendingCount}
                        </span>
                    )}
                </Link>

                {/* Admin avatar */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B3D91] to-[#0B3D91] flex items-center justify-center text-white font-bold text-sm">
                        {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                    <div className="hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900 leading-none">{admin?.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{admin?.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
