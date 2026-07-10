import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/public/HomePage';
import TrackPage from './pages/public/TrackPage';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShipments from './pages/admin/AdminShipments';
import AdminCreateShipment from './pages/admin/AdminCreateShipment';
import AdminEditShipment from './pages/admin/AdminEditShipment';
import AdminPendingUpdates from './pages/admin/AdminPendingUpdates';
import AdminShipmentDetail from './pages/admin/AdminShipmentDetail';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000,
            retry: 1,
        },
    },
});

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        {/* Public routes */}
                        <Route element={<PublicLayout />}>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/track" element={<TrackPage />} />
                            <Route path="/track/:trackingNumber" element={<TrackPage />} />
                        </Route>

                        {/* Admin auth */}
                        <Route path="/admin/login" element={<AdminLogin />} />

                        {/* Admin protected routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route element={<AdminLayout />}>
                                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                <Route path="/admin/shipments" element={<AdminShipments />} />
                                <Route path="/admin/shipments/new" element={<AdminCreateShipment />} />
                                <Route path="/admin/shipments/:id" element={<AdminShipmentDetail />} />
                                <Route path="/admin/shipments/:id/edit" element={<AdminEditShipment />} />
                                <Route path="/admin/pending-updates" element={<AdminPendingUpdates />} />
                                <Route path="/admin/activity" element={<AdminActivityLogs />} />
                            </Route>
                        </Route>

                        {/* Catch all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#fff',
                                color: '#1a1a2e',
                                borderRadius: '12px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                padding: '12px 16px',
                                fontSize: '14px',
                                fontWeight: '500',
                            },
                            success: {
                                iconTheme: { primary: '#16A34A', secondary: '#fff' },
                            },
                            error: {
                                iconTheme: { primary: '#dc2626', secondary: '#fff' },
                            },
                        }}
                    />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
