import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { shipmentsRouter } from './routes/shipments';
import { updatesRouter } from './routes/updates';
import { dashboardRouter } from './routes/dashboard';
import { activityRouter } from './routes/activity';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
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

// Error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 TrackMaster API running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
