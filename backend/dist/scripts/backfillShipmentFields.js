"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Starting backfill: set transportMode and containsPets defaults');
    const result = await prisma.shipment.updateMany({
        // Update all existing shipments to ensure fields exist and have sensible defaults
        data: {
            transportMode: 'land',
            containsPets: false,
        },
    });
    console.log(`Updated ${result.count} shipment(s)`);
}
main()
    .catch((e) => {
    console.error('Backfill failed', e);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=backfillShipmentFields.js.map