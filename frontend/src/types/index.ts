export interface Shipment {
    id: string;
    trackingNumber: string;
    status: ShipmentStatus;
    senderName: string;
    senderEmail?: string;
    senderPhone?: string;
    senderAddress: string;
    senderCity: string;
    senderCountry: string;
    receiverName: string;
    receiverEmail?: string;
    receiverPhone?: string;
    receiverAddress: string;
    receiverCity: string;
    receiverCountry: string;
    shipmentType: string;
    weight: number;
    weightUnit: string;
    dimensions?: string;
    description?: string;
    originCity: string;
    originCountry: string;
    originLat?: number;
    originLng?: number;
    destinationCity: string;
    destinationCountry: string;
    destinationLat?: number;
    destinationLng?: number;
    currentCity?: string;
    currentCountry?: string;
    currentLat?: number;
    currentLng?: number;
    estimatedDelivery?: string;
    actualDelivery?: string;
    shippedAt?: string;
    declaredValue?: number;
    currency?: string;
    serviceType?: string;
    priority?: string;
    createdAt: string;
    updatedAt: string;
    trackingUpdates?: TrackingUpdate[];
    pendingUpdates?: PendingUpdate[];
    _count?: { trackingUpdates: number };
}

export type ShipmentStatus =
    | 'created'
    | 'picked_up'
    | 'in_warehouse'
    | 'customs_cleared'
    | 'departed_origin'
    | 'in_transit'
    | 'arrived_at_hub'
    | 'customs_import'
    | 'out_for_delivery'
    | 'delivered'
    | 'returned'
    | 'delayed'
    | 'cancelled';

export interface TrackingUpdate {
    id: string;
    shipmentId: string;
    location: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    status: ShipmentStatus;
    description: string;
    photo?: string;
    timestamp: string;
    approvedBy?: string;
    approvedAt?: string;
    createdAt: string;
}

export interface PendingUpdate {
    id: string;
    shipmentId: string;
    shipment?: {
        trackingNumber: string;
        status: string;
        senderName: string;
        receiverName: string;
        originCity: string;
        originCountry: string;
        destinationCity: string;
        destinationCountry: string;
    };
    location: string;
    city?: string;
    country?: string;
    lat?: number;
    lng?: number;
    status: ShipmentStatus;
    description: string;
    photo?: string;
    timestamp: string;
    submittedBy?: string;
    notes?: string;
    reviewStatus: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    createdAt: string;
}

export interface DashboardStats {
    totalShipments: number;
    delivered: number;
    inTransit: number;
    pendingUpdates: number;
    delayed: number;
    todayShipments: number;
    recentShipments: Partial<Shipment>[];
}

export interface ActivityLog {
    id: string;
    adminId?: string;
    admin?: { name: string; email: string };
    action: string;
    entity?: string;
    entityId?: string;
    details?: string;
    ipAddress?: string;
    createdAt: string;
}
