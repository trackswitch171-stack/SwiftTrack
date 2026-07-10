import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request {
    admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            email: string;
        };

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true },
        });

        if (!admin) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }

        req.admin = admin;
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

export const requireSuperAdmin = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    if (req.admin?.role !== 'superadmin') {
        res.status(403).json({ error: 'Super admin access required' });
        return;
    }
    next();
};
