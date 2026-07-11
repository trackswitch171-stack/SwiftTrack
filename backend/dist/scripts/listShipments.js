"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const count = await prisma.shipment.count();
    console.log(`Shipments count: ${count}`);
    const rows = await prisma.shipment.findMany({ take: 10 });
    console.log('Sample shipments:', rows.map(r => ({ id: r.id, trackingNumber: r.trackingNumber, transportMode: r.transportMode, containsPets: r.containsPets })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=listShipments.js.map