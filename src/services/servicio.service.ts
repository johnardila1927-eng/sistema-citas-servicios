import servicioRepository from '../repositories/servicio.repository';
import { Servicio } from '../models/servicio.model';
import { CreateServicioDto, UpdateServicioDto } from '../dtos/servicio.dto';
import { AppError } from '../middlewares/errorMiddleware';

export class ServicioService {
  async getAllServicios(includeInactive: boolean = false): Promise<Servicio[]> {
    return servicioRepository.findAll(includeInactive);
  }

  async getServicioById(id: number): Promise<Servicio> {
    const servicio = await servicioRepository.findById(id);
    if (!servicio) {
      throw new AppError('Servicio no encontrado', 404);
    }
    return servicio;
  }

  async createServicio(data: CreateServicioDto): Promise<Servicio> {
    if (!data.nombre || data.nombre.trim() === '') {
      throw new AppError('El nombre del servicio es requerido', 400);
    }
    if (!data.duracion || data.duracion <= 0) {
      throw new AppError('La duración debe ser mayor a 0', 400);
    }
    if (!data.precio || data.precio <= 0) {
      throw new AppError('El precio debe ser mayor a 0', 400);
    }
    return servicioRepository.create(data);
  }

  async updateServicio(id: number, data: UpdateServicioDto): Promise<Servicio> {
    await this.getServicioById(id);
    
    if (data.duracion !== undefined && data.duracion <= 0) {
      throw new AppError('La duración debe ser mayor a 0', 400);
    }
    if (data.precio !== undefined && data.precio <= 0) {
      throw new AppError('El precio debe ser mayor a 0', 400);
    }
    
    return servicioRepository.update(id, data);
  }

  async deleteServicio(id: number): Promise<Servicio> {
    await this.getServicioById(id);
    return servicioRepository.delete(id);
  }
}

export default new ServicioService();
