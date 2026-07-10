import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { shipmentsApi } from '../../services/api';
import ShipmentForm from '../../components/admin/ShipmentForm';
import toast from 'react-hot-toast';

export default function AdminEditShipment() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['shipment', id],
        queryFn: () => shipmentsApi.get(id!),
        enabled: !!id,
    });

    const shipment = data?.data;

    const mutation = useMutation({
        mutationFn: (formData: any) => shipmentsApi.update(id!, formData),
        onSuccess: () => {
            toast.success('Shipment updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['shipment', id] });
            navigate(`/admin/shipments/${id}`);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.error || 'Failed to update shipment');
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#0B3D91] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!shipment) {
        return <div className="text-center py-20 text-gray-500">Shipment not found</div>;
    }

    const defaultValues = {
        ...shipment,
        weight: String(shipment.weight),
        declaredValue: shipment.declaredValue ? String(shipment.declaredValue) : '',
        originLat: shipment.originLat ? String(shipment.originLat) : '',
        originLng: shipment.originLng ? String(shipment.originLng) : '',
        destinationLat: shipment.destinationLat ? String(shipment.destinationLat) : '',
        destinationLng: shipment.destinationLng ? String(shipment.destinationLng) : '',
        estimatedDelivery: shipment.estimatedDelivery
            ? new Date(shipment.estimatedDelivery).toISOString().slice(0, 16)
            : '',
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-4">
                <Link
                    to={`/admin/shipments/${id}`}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Edit Shipment</h1>
                    <p className="text-gray-500 text-sm font-mono">{shipment.trackingNumber}</p>
                </div>
            </div>

            <ShipmentForm
                defaultValues={defaultValues}
                onSubmit={async (data) => { await mutation.mutateAsync(data); }}
                isLoading={mutation.isPending}
                submitLabel="Save Changes"
                isEdit
            />
        </div>
    );
}
