import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { shipmentsRouter } from './routes/shipments';
import { updatesRouter } from './routes/updates';
import { dashboardRouter } from './routes/dashboard';
import { activityRouter } from './routes/activity';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { prisma } from './lib/prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Deployment diagnostics (helpful when troubleshooting remote login failures)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
console.log('▶ Allowed CORS origins:', allowedOrigins);
console.log('▶ NODE_ENV:', process.env.NODE_ENV);
console.log('▶ JWT_SECRET set:', !!process.env.JWT_SECRET);
console.log('▶ DATABASE_URL set:', !!process.env.DATABASE_URL);

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/shipments', shipmentsRouter);
app.use('/api/updates', updatesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/activity', activityRouter);

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
const clientPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(clientPath)) {
    app.use(express.static(clientPath));

    // All other non-API routes should serve the frontend's index.html
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
        res.sendFile(path.join(clientPath, 'index.html'));
    });
} else {
    console.warn(`Frontend build not found at ${clientPath}. Visit /api routes only.`);
}

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 TrackMaster API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

// Warm up Prisma client to avoid first-request latency
(async () => {
    try {
        const t1 = Date.now();
        await prisma.$connect();
        console.log(`Prisma warm-up connected in ${Date.now() - t1}ms`);
    } catch (err) {
        console.warn('Prisma warm-up failed:', err?.message || err);
    }
})();

export default app;
