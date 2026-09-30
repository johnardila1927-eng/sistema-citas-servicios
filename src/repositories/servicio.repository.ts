import prisma from '../config/database';
import { Servicio } from '../models/servicio.model';
import { CreateServicioDto, UpdateServicioDto } from '../dtos/servicio.dto';

export class ServicioRepository {
  async findAll(includeInactive: boolean = false): Promise<Servicio[]> {
    if (includeInactive) {
      return prisma.servicio.findMany();
    }
    return prisma.servicio.findMany({
      where: { activo: true },
    });
  }

  async findById(id: number): Promise<Servicio | null> {
    return prisma.servicio.findUnique({
      where: { id },
      include: { citas: true },
    });
  }

  async create(data: CreateServicioDto): Promise<Servicio> {
    return prisma.servicio.create({
      data,
    });
  }

  async update(id: number, data: UpdateServicioDto): Promise<Servicio> {
    return prisma.servicio.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Servicio> {
    return prisma.servicio.delete({
      where: { id },
    });
  }
}

export default new ServicioRepository();
