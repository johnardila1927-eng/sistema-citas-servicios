import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRepository from '../repositories/auth.repository';
import { RegisterDto, LoginDto, AuthResponseDto } from '../dtos/auth.dto';
import { AppError } from '../middlewares/errorMiddleware';
import { Rol } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const BCRYPT_COST = 10;

export class AuthService {
  async register(data: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await authRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('El email ya está registrado', 400);
    }

    const hashedPassword = await bcrypt.hash(data.password, BCRYPT_COST);

    const user = await authRepository.create({
      nombre: data.nombre,
      email: data.email,
      password: hashedPassword,
      rol: 'CLIENTE',
      telefono: data.telefono,
      direccion: data.direccion,
    });

    const token = this.generateToken(user.id, user.email, user.rol);

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        telefono: user.telefono,
        direccion: user.direccion,
      },
      token,
    };
  }

  async login(data: LoginDto): Promise<AuthResponseDto> {
    const user = await authRepository.findByEmail(data.email);
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const token = this.generateToken(user.id, user.email, user.rol);

    return {
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        telefono: user.telefono,
        direccion: user.direccion,
      },
      token,
    };
  }

  async getMe(userId: number): Promise<AuthResponseDto['user']> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      telefono: user.telefono,
      direccion: user.direccion,
    };
  }

  private generateToken(userId: number, email: string, rol: Rol): string {
    const payload = {
      userId,
      email,
      rol,
    };
    
    const options: any = {
      expiresIn: JWT_EXPIRES_IN,
    };

    return jwt.sign(payload, JWT_SECRET, options);
  }

  verifyToken(token: string): { userId: number; email: string; rol: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        email: string;
        rol: string;
      };
      return decoded;
    } catch (error) {
      throw new AppError('Token inválido o expirado', 401);
    }
  }
}

export default new AuthService();
