import type { ShipmentStatus } from '../types';

export const STATUS_CONFIG: Record<ShipmentStatus, {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    dotColor: string;
    progress: number;
}> = {
    created: {
        label: 'Shipment Created',
        color: '#6366f1',
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-700',
        dotColor: 'bg-indigo-500',
        progress: 5,
    },
    picked_up: {
        label: 'Package Picked Up',
        color: '#8b5cf6',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        dotColor: 'bg-purple-500',
        progress: 15,
    },
    in_warehouse: {
        label: 'Received at Warehouse',
        color: '#f59e0b',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        dotColor: 'bg-amber-500',
        progress: 25,
    },
    customs_cleared: {
        label: 'Export Customs Cleared',
        color: '#10b981',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        dotColor: 'bg-emerald-500',
        progress: 35,
    },
    departed_origin: {
        label: 'Departed Origin Country',
        color: '#3b82f6',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        dotColor: 'bg-blue-500',
        progress: 45,
    },
    in_transit: {
        label: 'In Transit',
        color: '#2563eb',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        dotColor: 'bg-[#0B3D91]',
        progress: 55,
    },
    arrived_at_hub: {
        label: 'Arrived at Transit Hub',
        color: '#0891b2',
        bgColor: 'bg-cyan-50',
        textColor: 'text-cyan-700',
        dotColor: 'bg-cyan-500',
        progress: 65,
    },
    customs_import: {
        label: 'Import Customs',
        color: '#d97706',
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        dotColor: 'bg-yellow-500',
        progress: 75,
    },
    out_for_delivery: {
        label: 'Out for Delivery',
        color: '#f97316',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        dotColor: 'bg-orange-500',
        progress: 90,
    },
    delivered: {
        label: 'Delivered',
        color: '#16a34a',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        dotColor: 'bg-green-500',
        progress: 100,
    },
    returned: {
        label: 'Returned',
        color: '#dc2626',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        dotColor: 'bg-red-500',
        progress: 0,
    },
    delayed: {
        label: 'Delayed',
        color: '#dc2626',
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        dotColor: 'bg-red-500',
        progress: 0,
    },
    cancelled: {
        label: 'Cancelled',
        color: '#6b7280',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-700',
        dotColor: 'bg-gray-500',
        progress: 0,
    },
    on_hold: {
        label: 'On Hold',
        color: '#b45309',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        dotColor: 'bg-amber-600',
        progress: 40,
    },
};

export function getStatusConfig(status: string) {
    return STATUS_CONFIG[status as ShipmentStatus] || STATUS_CONFIG.created;
}

export function StatusBadge({ status, size = 'md' }: { status: string; size?: 'sm' | 'md' | 'lg' }) {
    const config = getStatusConfig(status);
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-xs',
        lg: 'px-4 py-1.5 text-sm',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.bgColor} ${config.textColor} ${sizeClasses[size]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
            {config.label}
        </span>
    );
}

export const ALL_STATUSES: ShipmentStatus[] = [
    'created', 'picked_up', 'in_warehouse', 'customs_cleared',
    'departed_origin', 'in_transit', 'arrived_at_hub', 'customs_import',
    'out_for_delivery', 'delivered', 'returned', 'delayed', 'cancelled', 'on_hold',
];
