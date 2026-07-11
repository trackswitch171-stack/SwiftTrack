-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_shipments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT,
    "senderPhone" TEXT,
    "senderAddress" TEXT NOT NULL,
    "senderCity" TEXT NOT NULL,
    "senderCountry" TEXT NOT NULL,
    "receiverName" TEXT NOT NULL,
    "receiverEmail" TEXT,
    "receiverPhone" TEXT,
    "receiverAddress" TEXT NOT NULL,
    "receiverCity" TEXT NOT NULL,
    "receiverCountry" TEXT NOT NULL,
    "shipmentType" TEXT NOT NULL DEFAULT 'package',
    "weight" REAL NOT NULL,
    "weightUnit" TEXT NOT NULL DEFAULT 'kg',
    "dimensions" TEXT,
    "description" TEXT,
    "originCity" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "originLat" REAL,
    "originLng" REAL,
    "destinationCity" TEXT NOT NULL,
    "destinationCountry" TEXT NOT NULL,
    "destinationLat" REAL,
    "destinationLng" REAL,
    "currentCity" TEXT,
    "currentCountry" TEXT,
    "currentLat" REAL,
    "currentLng" REAL,
    "estimatedDelivery" DATETIME,
    "actualDelivery" DATETIME,
    "shippedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "declaredValue" REAL,
    "currency" TEXT DEFAULT 'USD',
    "serviceType" TEXT DEFAULT 'standard',
    "priority" TEXT DEFAULT 'normal',
    "transportMode" TEXT DEFAULT 'land',
    "containsPets" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_shipments" ("actualDelivery", "createdAt", "currency", "currentCity", "currentCountry", "currentLat", "currentLng", "declaredValue", "description", "destinationCity", "destinationCountry", "destinationLat", "destinationLng", "dimensions", "estimatedDelivery", "id", "originCity", "originCountry", "originLat", "originLng", "priority", "receiverAddress", "receiverCity", "receiverCountry", "receiverEmail", "receiverName", "receiverPhone", "senderAddress", "senderCity", "senderCountry", "senderEmail", "senderName", "senderPhone", "serviceType", "shipmentType", "shippedAt", "status", "trackingNumber", "updatedAt", "weight", "weightUnit") SELECT "actualDelivery", "createdAt", "currency", "currentCity", "currentCountry", "currentLat", "currentLng", "declaredValue", "description", "destinationCity", "destinationCountry", "destinationLat", "destinationLng", "dimensions", "estimatedDelivery", "id", "originCity", "originCountry", "originLat", "originLng", "priority", "receiverAddress", "receiverCity", "receiverCountry", "receiverEmail", "receiverName", "receiverPhone", "senderAddress", "senderCity", "senderCountry", "senderEmail", "senderName", "senderPhone", "serviceType", "shipmentType", "shippedAt", "status", "trackingNumber", "updatedAt", "weight", "weightUnit" FROM "shipments";
DROP TABLE "shipments";
ALTER TABLE "new_shipments" RENAME TO "shipments";
CREATE UNIQUE INDEX "shipments_trackingNumber_key" ON "shipments"("trackingNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
