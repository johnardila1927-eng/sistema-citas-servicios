import prisma from '../config/database';
import { Usuario } from '../models/usuario.model';
import { Rol } from '@prisma/client';

export class AuthRepository {
  async findByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { email },
    });
  }

  async findById(id: number): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { id },
    });
  }

  async create(data: {
    nombre: string;
    email: string;
    password: string;
    rol?: Rol;
    telefono?: string;
    direccion?: string;
  }): Promise<Usuario> {
    return prisma.usuario.create({
      data,
    });
  }
}

export default new AuthRepository();
