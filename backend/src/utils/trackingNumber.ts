import { prisma } from '../lib/prisma';

export async function generateTrackingNumber(country: string = 'GL'): Promise<string> {
    const year = new Date().getFullYear();
    const countryCode = country.substring(0, 2).toUpperCase();

    // Count existing shipments for this year to generate sequence
    const count = await prisma.shipment.count({
        where: {
            createdAt: {
                gte: new Date(`${year}-01-01`),
                lt: new Date(`${year + 1}-01-01`),
            },
        },
    });

    const sequence = String(count + 1).padStart(6, '0');
    return `TRK-${countryCode}-${year}-${sequence}`;
}
