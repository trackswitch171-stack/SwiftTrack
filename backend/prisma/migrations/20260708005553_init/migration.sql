-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "shipments" (
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
    "priority" TEXT DEFAULT 'normal'
);

-- CreateTable
CREATE TABLE "tracking_updates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "lat" REAL,
    "lng" REAL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tracking_updates_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tracking_updates_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pending_updates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "lat" REAL,
    "lng" REAL,
    "status" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "photo" TEXT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submittedBy" TEXT,
    "notes" TEXT,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "reviewNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pending_updates_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "shipments" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "shipments_trackingNumber_key" ON "shipments"("trackingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
