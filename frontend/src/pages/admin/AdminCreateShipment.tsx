import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { shipmentsApi } from '../../services/api';
import ShipmentForm from '../../components/admin/ShipmentForm';
import toast from 'react-hot-toast';

export default function AdminCreateShipment() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data: any) => shipmentsApi.create(data),
        onSuccess: (response) => {
            toast.success(`Shipment ${response.data.trackingNumber} created successfully!`);
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            navigate('/admin/shipments');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || 'Failed to create shipment');
        },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-4">
                <Link
                    to="/admin/shipments"
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Create New Shipment</h1>
                    <p className="text-gray-500 text-sm">A tracking number will be generated automatically.</p>
                </div>
            </div>

            <ShipmentForm
                onSubmit={mutation.mutateAsync}
                isLoading={mutation.isPending}
                submitLabel="Create Shipment"
            />
        </div>
    );
}
