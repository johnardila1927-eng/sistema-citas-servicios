import { Rol } from '@prisma/client';

export interface CreateUsuarioDto {
  nombre: string;
  email: string;
  password: string;
  rol?: Rol;
  telefono?: string;
  direccion?: string;
}

export interface UpdateUsuarioDto {
  nombre?: string;
  email?: string;
  password?: string;
  rol?: Rol;
  telefono?: string;
  direccion?: string;
}

export interface UsuarioResponseDto {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  telefono: string | null;
  direccion: string | null;
  creadoEn: Date;
  actualizadoEn: Date;
}
