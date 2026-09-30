import prisma from '../config/database';
import { Usuario } from '../models/usuario.model';
import { Prisma } from '@prisma/client';

export class UsuarioRepository {
  async findAll(): Promise<Usuario[]> {
    return prisma.usuario.findMany();
  }

  async findById(id: number): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { id },
      include: { citas: true },
    });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
    return prisma.usuario.create({
      data,
    });
  }

  async update(id: number, data: Prisma.UsuarioUpdateInput): Promise<Usuario> {
    return prisma.usuario.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Usuario> {
    return prisma.usuario.delete({
      where: { id },
    });
  }
}

export default new UsuarioRepository();
