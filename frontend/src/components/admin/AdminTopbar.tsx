import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { updatesApi, settingsApi } from '../../services/api';
import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { setAppTimezone } from '../../utils/dateFormat';

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
    const [timezone, setTimezoneState] = useState('America/New_York');

    const { data: pendingData } = useQuery({
        queryKey: ['pending-updates'],
        queryFn: () => updatesApi.getPending(),
        refetchInterval: 30000,
    });

    const pendingCount = pendingData?.data?.length || 0;
    const pageTitle = breadcrumbs[location.pathname] || 'SwiftTrack Admin';

    useEffect(() => {
        const loadTimezone = async () => {
            try {
                const saved = window.localStorage.getItem('app.timezone');
                if (saved) {
                    setTimezoneState(saved);
                    setAppTimezone(saved);
                }

                const response = await settingsApi.getTimezone();
                const nextTimezone = response.data?.timezone || saved || 'America/New_York';
                setTimezoneState(nextTimezone);
                setAppTimezone(nextTimezone);
                window.localStorage.setItem('app.timezone', nextTimezone);
            } catch {
                setTimezoneState('America/New_York');
            }
        };

        loadTimezone();
    }, []);

    const handleTimezoneChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const nextTimezone = event.target.value;
        setTimezoneState(nextTimezone);
        setAppTimezone(nextTimezone);
        window.localStorage.setItem('app.timezone', nextTimezone);

        try {
            await settingsApi.setTimezone(nextTimezone);
        } catch {
            // keep the local preference even if the server update fails
        }
    };

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

                <label className="hidden md:flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    <span className="text-xs font-semibold uppercase tracking-wide">TZ</span>
                    <select value={timezone} onChange={handleTimezoneChange} className="bg-transparent text-sm font-medium outline-none">
                        <option value="America/New_York">New York</option>
                        <option value="America/Chicago">Chicago</option>
                        <option value="America/Denver">Denver</option>
                        <option value="America/Los_Angeles">Los Angeles</option>
                        <option value="UTC">UTC</option>
                    </select>
                </label>

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
