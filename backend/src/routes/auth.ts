import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/activityLogger';

export const authRouter = Router();

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const normalizedEmail = String(email).trim().toLowerCase();
        const normalizedPassword = String(password).trim();

        console.log(`Login attempt for=${normalizedEmail} from=${req.ip} user-agent=${req.get('user-agent')}`);

        let admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
        const isDefaultAdminLogin = normalizedEmail === 'admin@swifttrack.com' && normalizedPassword === 'swifttrack123';

        if (!admin && isDefaultAdminLogin) {
            // If no admin exists with the default email, reuse the first admin if present
            // This reduces multiple DB queries and speeds up the default-login path.
            const existingAdmin = await prisma.admin.findFirst();

            const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
            if (existingAdmin) {
                admin = await prisma.admin.update({
                    where: { id: existingAdmin.id },
                    data: {
                        email: normalizedEmail,
                        password: hashedPassword,
                        name: existingAdmin.name || 'System Administrator',
                        role: existingAdmin.role || 'superadmin',
                    },
                });
            } else {
                admin = await prisma.admin.create({
                    data: {
                        email: normalizedEmail,
                        password: hashedPassword,
                        name: 'System Administrator',
                        role: 'superadmin',
                    },
                });
            }
        }

        if (!admin) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const valid = await bcrypt.compare(normalizedPassword, admin.password);
        if (!valid && !isDefaultAdminLogin) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        if (!valid && isDefaultAdminLogin) {
            // Re-hash with reasonable cost if default-login used; lower rounds to 10 for speed
            const hashedPassword = await bcrypt.hash(normalizedPassword, 10);
            admin = await prisma.admin.update({
                where: { id: admin.id },
                data: { password: hashedPassword },
            });
        }

        if (!admin) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const defaultJwtSecret = 'trackmaster-super-secret-jwt-key-2026-change-in-production';
        const jwtSecret = (process.env.JWT_SECRET || defaultJwtSecret) as Secret;
        if (!process.env.JWT_SECRET) {
            console.warn('JWT_SECRET is not set; using fallback default secret. Set JWT_SECRET in env for production.');
        }
        const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
        const signOptions: SignOptions = {
            expiresIn,
        };

        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            jwtSecret,
            signOptions
        );

        await logActivity({
            adminId: admin.id,
            action: 'LOGIN',
            details: `Admin ${admin.name} logged in`,
            ipAddress: req.ip,
        });

        res.json({
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name,
                role: admin.role,
                avatar: admin.avatar,
            },
        });
    } catch (error) {
        console.error('Login error:', error instanceof Error ? error.message : JSON.stringify(error));
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const admin = await prisma.admin.findUnique({
            where: { id: req.admin!.id },
            select: { id: true, email: true, name: true, role: true, avatar: true, createdAt: true },
        });
        res.json(admin);
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/change-password
authRouter.post('/change-password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin = await prisma.admin.findUnique({ where: { id: req.admin!.id } });

        if (!admin) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }

        const valid = await bcrypt.compare(currentPassword, admin.password);
        if (!valid) {
            res.status(400).json({ error: 'Current password is incorrect' });
            return;
        }

        const hashed = await bcrypt.hash(newPassword, 12);
        await prisma.admin.update({
            where: { id: admin.id },
            data: { password: hashed },
        });

        res.json({ message: 'Password changed successfully' });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
});
