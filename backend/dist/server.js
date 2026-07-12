"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const auth_1 = require("./routes/auth");
const shipments_1 = require("./routes/shipments");
const updates_1 = require("./routes/updates");
const dashboard_1 = require("./routes/dashboard");
const activity_1 = require("./routes/activity");
const settings_1 = require("./routes/settings");
const errorHandler_1 = require("./middleware/errorHandler");
const requestLogger_1 = require("./middleware/requestLogger");
const prisma_1 = require("./lib/prisma");
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT || '5000');
const HOST_ENV = process.env.HOST?.trim();
const HOST = HOST_ENV || '0.0.0.0';
const configuredOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim()).filter(Boolean);
const derivedOrigins = HOST === '0.0.0.0'
    ? []
    : [
        `http://${HOST}`,
        `https://${HOST}`,
        `http://${HOST}:80`,
        `https://${HOST}:443`,
        `http://${HOST}:5000`,
    ];
const allowedOrigins = Array.from(new Set([...configuredOrigins, ...derivedOrigins]));
// Deployment diagnostics (helpful when troubleshooting remote login failures)
console.log('▶ Allowed CORS origins:', allowedOrigins);
console.log('▶ NODE_ENV:', process.env.NODE_ENV);
console.log('▶ JWT_SECRET set:', !!process.env.JWT_SECRET);
console.log('▶ DATABASE_URL set:', !!process.env.DATABASE_URL);
console.log('▶ SMTP configured:', !!process.env.SMTP_HOST && !!process.env.SMTP_PORT && !!process.env.SMTP_USER && !!process.env.SMTP_PASS);
// Middleware
const corsOptions = {
    origin: (origin, callback) => {
        // Allow when no origin (server-to-server) or explicit whitelist
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        // Allow any subdomain of swifttrack.com or swifttrackpro.com.
        // Use URL parsing to extract hostname so origins with ports are handled.
        try {
            const parsed = new URL(origin);
            const hostname = parsed.hostname.toLowerCase();
            const allowedHostSuffixes = ['swifttrack.com', 'swifttrackpro.com'];
            if (allowedHostSuffixes.some(suf => hostname === suf || hostname.endsWith('.' + suf))) {
                console.log('CORS allow by domain-match (hostname):', hostname, 'origin:', origin);
                callback(null, true);
                return;
            }
        }
        catch (e) {
            // If URL parsing fails, fall back to simple string check
            try {
                const lower = origin.toLowerCase();
                const allowedSuffixes = ['.swifttrack.com', 'swifttrack.com', '.swifttrackpro.com', 'swifttrackpro.com'];
                if (allowedSuffixes.some(suf => lower.endsWith(suf))) {
                    console.log('CORS allow by fallback domain-match:', origin);
                    callback(null, true);
                    return;
                }
            }
            catch (e2) {
                // fall through to block
            }
        }
        console.warn('CORS blocked origin:', origin);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    optionsSuccessStatus: 204,
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger_1.requestLogger);
// Static files for uploads
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', auth_1.authRouter);
app.use('/api/shipments', shipments_1.shipmentsRouter);
app.use('/api/updates', updates_1.updatesRouter);
app.use('/api/dashboard', dashboard_1.dashboardRouter);
app.use('/api/activity', activity_1.activityRouter);
app.use('/api/settings', settings_1.settingsRouter);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Debug information for deployment diagnostics
app.get('/api/debug', (req, res) => {
    res.json({
        status: 'debug',
        allowedOrigins,
        nodeEnv: process.env.NODE_ENV || null,
        jwtSecretSet: !!process.env.JWT_SECRET,
        databaseUrlSet: !!process.env.DATABASE_URL,
        timestamp: new Date().toISOString(),
    });
});
// Serve frontend (if built)
const clientPath = path_1.default.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs_1.default.existsSync(clientPath)) {
    app.use(express_1.default.static(clientPath));
    // All other non-API routes should serve the frontend's index.html
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads'))
            return next();
        res.sendFile(path_1.default.join(clientPath, 'index.html'));
    });
}
else {
    console.warn(`Frontend build not found at ${clientPath}. Visit /api routes only.`);
}
// Error handler (must be last)
app.use(errorHandler_1.errorHandler);
const startServer = (host) => {
    app.listen(PORT, host, () => {
        console.log(`🚀 TrackMaster API running on http://${host}:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    });
};
try {
    startServer(HOST);
}
catch (err) {
    console.warn(`Failed to bind to ${HOST}. Falling back to 0.0.0.0`);
    startServer('0.0.0.0');
}
// Warm up Prisma client to avoid first-request latency
(async () => {
    try {
        const t1 = Date.now();
        await prisma_1.prisma.$connect();
        console.log(`Prisma warm-up connected in ${Date.now() - t1}ms`);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : JSON.stringify(err);
        console.warn('Prisma warm-up failed:', message);
    }
})();
exports.default = app;
//# sourceMappingURL=server.js.map