import prisma from '../config/database';
import { Cita } from '../models/cita.model';
import { CreateCitaDto, UpdateCitaDto } from '../dtos/cita.dto';

export class CitaRepository {
  async findAll(): Promise<Cita[]> {
    return prisma.cita.findMany({
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            telefono: true,
            direccion: true,
            creadoEn: true,
            actualizadoEn: true,
          },
        },
        servicio: true,
      },
    });
  }

  async findById(id: number): Promise<Cita | null> {
    return prisma.cita.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            telefono: true,
            direccion: true,
            creadoEn: true,
            actualizadoEn: true,
          },
        },
        servicio: true,
      },
    });
  }

  async findByUsuario(usuarioId: number): Promise<Cita[]> {
    return prisma.cita.findMany({
      where: { usuarioId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            telefono: true,
            direccion: true,
            creadoEn: true,
            actualizadoEn: true,
          },
        },
        servicio: true,
      },
    });
  }

  async findByServicio(servicioId: number): Promise<Cita[]> {
    return prisma.cita.findMany({
      where: { servicioId },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            telefono: true,
            direccion: true,
            creadoEn: true,
            actualizadoEn: true,
          },
        },
        servicio: true,
      },
    });
  }

  async findByFecha(fecha: Date): Promise<Cita[]> {
    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fecha);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.cita.findMany({
      where: {
        fecha: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            telefono: true,
            direccion: true,
            creadoEn: true,
            actualizadoEn: true,
          },
        },
        servicio: true,
      },
    });
  }

  async create(data: CreateCitaDto): Promise<Cita> {
    return prisma.cita.create({
      data,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            telefono: true,
            direccion: true,
            creadoEn: true,
            actualizadoEn: true,
          },
        },
        servicio: true,
      },
    });
  }

  async update(id: number, data: UpdateCitaDto): Promise<Cita> {
    return prisma.cita.update({
      where: { id },
      data,
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            telefono: true,
            direccion: true,
            creadoEn: true,
            actualizadoEn: true,
          },
        },
        servicio: true,
      },
    });
  }

  async delete(id: number): Promise<Cita> {
    return prisma.cita.delete({
      where: { id },
    });
  }
}

export default new CitaRepository();
