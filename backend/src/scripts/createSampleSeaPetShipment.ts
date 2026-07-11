import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tracking = 'TRK-SEA-2026-000010';

    const existing = await prisma.shipment.findUnique({ where: { trackingNumber: tracking } });
    if (existing) {
        console.log('Sample shipment already exists:', tracking);
        return;
    }

    const shipment = await prisma.shipment.create({
        data: {
            trackingNumber: tracking,
            status: 'created',
            senderName: 'Ocean Sender',
            senderEmail: 'ocean.sender@example.com',
            senderPhone: '+91 99999 00010',
            senderAddress: 'Harbor Way 1',
            senderCity: 'Mumbai',
            senderCountry: 'India',
            receiverName: 'Coast Receiver',
            receiverEmail: 'coast.receiver@example.com',
            receiverPhone: '+971 50 000 010',
            receiverAddress: 'Pier 4',
            receiverCity: 'Dubai',
            receiverCountry: 'United Arab Emirates',
            shipmentType: 'freight',
            weight: 500.0,
            weightUnit: 'kg',
            description: 'Large sea freight container carrying mixed goods',
            originCity: 'Mumbai',
            originCountry: 'India',
            originLat: 19.0760,
            originLng: 72.8777,
            destinationCity: 'Dubai',
            destinationCountry: 'United Arab Emirates',
            destinationLat: 25.2048,
            destinationLng: 55.2708,
            currentCity: 'At Sea',
            currentCountry: 'International Waters',
            estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            declaredValue: 20000,
            currency: 'USD',
            serviceType: 'freight',
            priority: 'normal',
            transportMode: 'sea',
            containsPets: true,
        },
    });

    await prisma.trackingUpdate.create({
        data: {
            shipmentId: shipment.id,
            location: 'Mumbai Port',
            city: 'Mumbai',
            country: 'India',
            lat: 19.0760,
            lng: 72.8777,
            status: 'created',
            description: 'Shipment created and registered',
            // leave approvedBy null so it appears as unapproved if your workflow requires approval
        },
    });

    console.log('Created sample shipment:', shipment.trackingNumber);
}

main()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
