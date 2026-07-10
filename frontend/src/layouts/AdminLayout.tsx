import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminTopbar from '../components/admin/AdminTopbar';

export default function AdminLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6 lg:p-8 max-w-screen-2xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
