import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import { RegisterDto, LoginDto } from '../dtos/auth.dto';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: RegisterDto = req.body;
      const result = await authService.register(data);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: LoginDto = req.body;
      const result = await authService.login(data);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }
      const user = await authService.getMe(userId);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
