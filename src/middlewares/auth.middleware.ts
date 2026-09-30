import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { AppError } from './errorMiddleware';
import { Rol } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    rol: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No se proporcionó token de autenticación', 401);
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles: Rol[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError('Usuario no autenticado', 401);
      }

      if (!roles.includes(req.user.rol as Rol)) {
        throw new AppError('No tiene permisos para realizar esta acción', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const requireAdmin = authorize('ADMINISTRADOR');
export const requireClient = authorize('CLIENTE');
export const requireAnyRole = authorize('CLIENTE', 'ADMINISTRADOR');
