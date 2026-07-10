import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create super admin
    const hashedPassword = await bcrypt.hash('swifttrack123', 12);

    const admin = await prisma.admin.upsert({
        where: { email: 'admin@swifttrack.com' },
        update: {
            password: hashedPassword,
        },
        create: {
            email: 'admin@swifttrack.com',
            password: hashedPassword,
            name: 'System Administrator',
            role: 'superadmin',
        },
    });
    console.log('✅ Admin created:', admin.email);

    // Create sample shipments
    const shipments = [
        {
            trackingNumber: 'TRK-AU-2026-000001',
            status: 'in_transit',
            senderName: 'James Mitchell',
            senderEmail: 'james@example.com',
            senderPhone: '+61 2 9000 0001',
            senderAddress: '123 George Street',
            senderCity: 'Sydney',
            senderCountry: 'Australia',
            receiverName: 'Mohammed Al-Rashid',
            receiverEmail: 'mohammed@example.ae',
            receiverPhone: '+971 50 123 4567',
            receiverAddress: 'Business Bay, Tower A',
            receiverCity: 'Dubai',
            receiverCountry: 'United Arab Emirates',
            shipmentType: 'package',
            weight: 2.5,
            weightUnit: 'kg',
            description: 'Electronics - Laptop Computer',
            originCity: 'Sydney',
            originCountry: 'Australia',
            originLat: -33.8688,
            originLng: 151.2093,
            destinationCity: 'Dubai',
            destinationCountry: 'United Arab Emirates',
            destinationLat: 25.2048,
            destinationLng: 55.2708,
            currentCity: 'Singapore',
            currentCountry: 'Singapore',
            currentLat: 1.3521,
            currentLng: 103.8198,
            estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            serviceType: 'express',
            priority: 'high',
            declaredValue: 1500,
            currency: 'USD',
        },
        {
            trackingNumber: 'TRK-UK-2026-000002',
            status: 'out_for_delivery',
            senderName: 'Sarah Thompson',
            senderEmail: 'sarah@example.co.uk',
            senderPhone: '+44 20 7000 0001',
            senderAddress: '45 Oxford Street',
            senderCity: 'London',
            senderCountry: 'United Kingdom',
            receiverName: 'Ahmed Hassan',
            receiverEmail: 'ahmed@example.com',
            receiverPhone: '+20 100 000 0001',
            receiverAddress: 'Corniche Road',
            receiverCity: 'Cairo',
            receiverCountry: 'Egypt',
            shipmentType: 'document',
            weight: 0.3,
            weightUnit: 'kg',
            description: 'Legal Documents',
            originCity: 'London',
            originCountry: 'United Kingdom',
            originLat: 51.5074,
            originLng: -0.1278,
            destinationCity: 'Cairo',
            destinationCountry: 'Egypt',
            destinationLat: 30.0444,
            destinationLng: 31.2357,
            currentCity: 'Cairo',
            currentCountry: 'Egypt',
            currentLat: 30.0444,
            currentLng: 31.2357,
            estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            serviceType: 'express',
            priority: 'urgent',
            declaredValue: 100,
            currency: 'USD',
        },
        {
            trackingNumber: 'TRK-US-2026-000003',
            status: 'delivered',
            senderName: 'Robert Johnson',
            senderEmail: 'robert@example.com',
            senderPhone: '+1 212 000 0001',
            senderAddress: '350 5th Avenue',
            senderCity: 'New York',
            senderCountry: 'United States',
            receiverName: 'Yuki Tanaka',
            receiverEmail: 'yuki@example.jp',
            receiverPhone: '+81 3 0000 0001',
            receiverAddress: 'Shibuya District',
            receiverCity: 'Tokyo',
            receiverCountry: 'Japan',
            shipmentType: 'package',
            weight: 5.0,
            weightUnit: 'kg',
            description: 'Fashion Items',
            originCity: 'New York',
            originCountry: 'United States',
            originLat: 40.7128,
            originLng: -74.0060,
            destinationCity: 'Tokyo',
            destinationCountry: 'Japan',
            destinationLat: 35.6762,
            destinationLng: 139.6503,
            currentCity: 'Tokyo',
            currentCountry: 'Japan',
            currentLat: 35.6762,
            currentLng: 139.6503,
            estimatedDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            actualDelivery: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            serviceType: 'standard',
            priority: 'normal',
            declaredValue: 800,
            currency: 'USD',
        },
    ];

    for (const shipmentData of shipments) {
        const existing = await prisma.shipment.findUnique({
            where: { trackingNumber: shipmentData.trackingNumber },
        });

        if (!existing) {
            const shipment = await prisma.shipment.create({ data: shipmentData as any });

            // Add tracking history
            if (shipmentData.trackingNumber === 'TRK-AU-2026-000001') {
                await prisma.trackingUpdate.createMany({
                    data: [
                        {
                            shipmentId: shipment.id,
                            location: 'Sydney, Australia',
                            city: 'Sydney',
                            country: 'Australia',
                            lat: -33.8688,
                            lng: 151.2093,
                            status: 'created',
                            description: 'Shipment created and registered in the system',
                            approvedBy: admin.id,
                            approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                            timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                        },
                        {
                            shipmentId: shipment.id,
                            location: 'Sydney Airport, Australia',
                            city: 'Sydney',
                            country: 'Australia',
                            lat: -33.9399,
                            lng: 151.1753,
                            status: 'picked_up',
                            description: 'Package picked up by courier',
                            approvedBy: admin.id,
                            approvedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                        },
                        {
                            shipmentId: shipment.id,
                            location: 'Sydney International Airport',
                            city: 'Sydney',
                            country: 'Australia',
                            lat: -33.9399,
                            lng: 151.1753,
                            status: 'customs_cleared',
                            description: 'Export customs cleared, ready for international shipment',
                            approvedBy: admin.id,
                            approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                            timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                        },
                        {
                            shipmentId: shipment.id,
                            location: 'Changi Airport, Singapore',
                            city: 'Singapore',
                            country: 'Singapore',
                            lat: 1.3644,
                            lng: 103.9915,
                            status: 'arrived_at_hub',
                            description: 'Arrived at transit hub in Singapore',
                            approvedBy: admin.id,
                            approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                        },
                        {
                            shipmentId: shipment.id,
                            location: 'Singapore',
                            city: 'Singapore',
                            country: 'Singapore',
                            lat: 1.3521,
                            lng: 103.8198,
                            status: 'in_transit',
                            description: 'In transit to destination',
                            approvedBy: admin.id,
                            approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                        },
                    ],
                });
            }

            console.log(`✅ Created shipment: ${shipmentData.trackingNumber}`);
        }
    }

    // Create a pending update
    const firstShipment = await prisma.shipment.findUnique({
        where: { trackingNumber: 'TRK-AU-2026-000001' },
    });

    if (firstShipment) {
        const existingPending = await prisma.pendingUpdate.findFirst({
            where: { shipmentId: firstShipment.id, reviewStatus: 'pending' },
        });

        if (!existingPending) {
            await prisma.pendingUpdate.create({
                data: {
                    shipmentId: firstShipment.id,
                    location: 'Dubai International Airport, UAE',
                    city: 'Dubai',
                    country: 'United Arab Emirates',
                    lat: 25.2532,
                    lng: 55.3657,
                    status: 'arrived_at_hub',
                    description: 'Package arrived at Dubai hub for customs inspection',
                    submittedBy: 'trackswitch171@gmail.com',
                    timestamp: new Date(),
                },
            });
            console.log('✅ Created pending update');
        }
    }

    console.log('🎉 Database seeded successfully!');
    console.log('📧 Admin login: admin@swifttrack.com');
    console.log('🔑 Password: swifttrack123');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
