"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSuperAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const admin = await prisma_1.prisma.admin.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, name: true, role: true },
        });
        if (!admin) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        req.admin = admin;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
const requireSuperAdmin = (req, res, next) => {
    if (req.admin?.role !== 'superadmin') {
        res.status(403).json({ error: 'Super admin access required' });
        return;
    }
    next();
};
exports.requireSuperAdmin = requireSuperAdmin;
//# sourceMappingURL=auth.js.map