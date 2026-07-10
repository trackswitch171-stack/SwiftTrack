import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
    };
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const requireSuperAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map