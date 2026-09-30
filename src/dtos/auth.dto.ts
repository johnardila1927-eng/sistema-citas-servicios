import { Rol } from '@prisma/client';

export interface RegisterDto {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  direccion?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: {
    id: number;
    nombre: string;
    email: string;
    rol: Rol;
    telefono: string | null;
    direccion: string | null;
  };
  token: string;
}
