import citaRepository from '../repositories/cita.repository';
import usuarioRepository from '../repositories/usuario.repository';
import servicioRepository from '../repositories/servicio.repository';
import { Cita } from '../models/cita.model';
import { CreateCitaDto, UpdateCitaDto, CitaEstado } from '../dtos/cita.dto';
import { AppError } from '../middlewares/errorMiddleware';

export class CitaService {
  async getAllCitas(): Promise<Cita[]> {
    return citaRepository.findAll();
  }

  async getCitaById(id: number): Promise<Cita> {
    const cita = await citaRepository.findById(id);
    if (!cita) {
      throw new AppError('Cita no encontrada', 404);
    }
    return cita;
  }

  async getCitasByUsuario(usuarioId: number): Promise<Cita[]> {
    const usuario = await usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return citaRepository.findByUsuario(usuarioId);
  }

  async getMisCitas(usuarioId: number): Promise<Cita[]> {
    const usuario = await usuarioRepository.findById(usuarioId);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return citaRepository.findByUsuario(usuarioId);
  }

  async getCitasByServicio(servicioId: number): Promise<Cita[]> {
    const servicio = await servicioRepository.findById(servicioId);
    if (!servicio) {
      throw new AppError('Servicio no encontrado', 404);
    }
    return citaRepository.findByServicio(servicioId);
  }

  async getCitasByFecha(fecha: Date): Promise<Cita[]> {
    return citaRepository.findByFecha(fecha);
  }

  async createCita(data: CreateCitaDto): Promise<Cita> {
    const usuario = await usuarioRepository.findById(data.usuarioId);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const servicio = await servicioRepository.findById(data.servicioId);
    if (!servicio) {
      throw new AppError('Servicio no encontrado', 404);
    }

    if (!servicio.activo) {
      throw new AppError('El servicio no está activo', 400);
    }

    // Validar solapamiento de horarios (SRP: lógica en Service layer)
    await this.validateNoOverlap(data.servicioId, data.fecha, servicio.duracion);

    return citaRepository.create(data);
  }

  async updateCita(id: number, data: UpdateCitaDto): Promise<Cita> {
    const existingCita = await this.getCitaById(id);

    if (data.usuarioId) {
      const usuario = await usuarioRepository.findById(data.usuarioId);
      if (!usuario) {
        throw new AppError('Usuario no encontrado', 404);
      }
    }

    if (data.servicioId) {
      const servicio = await servicioRepository.findById(data.servicioId);
      if (!servicio) {
        throw new AppError('Servicio no encontrado', 404);
      }
    }

    // Si se cambia fecha o servicio, validar solapamiento
    if (data.fecha || data.servicioId) {
      const servicioId = data.servicioId || existingCita.servicioId;
      const fecha = data.fecha || existingCita.fecha;
      const servicio = await servicioRepository.findById(servicioId);
      
      if (servicio) {
        await this.validateNoOverlap(servicioId, fecha, servicio.duracion, id);
      }
    }

    return citaRepository.update(id, data);
  }

  async cancelarCita(id: number, usuarioId: number, userRol: string): Promise<Cita> {
    const cita = await this.getCitaById(id);

    // Solo el usuario dueño de la cita o un admin pueden cancelar
    if (cita.usuarioId !== usuarioId && userRol !== 'ADMINISTRADOR') {
      throw new AppError('No tiene permisos para cancelar esta cita', 403);
    }

    // Validar que la cita no esté ya cancelada
    if (cita.estado === CitaEstado.CANCELADA) {
      throw new AppError('La cita ya está cancelada', 400);
    }

    // Validar que la cita no esté completada
    if (cita.estado === CitaEstado.COMPLETADA) {
      throw new AppError('No se puede cancelar una cita completada', 400);
    }

    return citaRepository.update(id, { estado: CitaEstado.CANCELADA });
  }

  async deleteCita(id: number): Promise<Cita> {
    await this.getCitaById(id);
    return citaRepository.delete(id);
  }

  /**
   * Valida que no haya solapamiento de horarios para un servicio
   * SRP: Esta lógica está exclusivamente en el Service layer
   */
  private async validateNoOverlap(
    servicioId: number,
    fecha: Date,
    duracion: number,
    excludeCitaId?: number
  ): Promise<void> {
    const inicio = new Date(fecha);
    const fin = new Date(fecha);
    fin.setMinutes(fin.getMinutes() + duracion);

    // Validar que la fecha sea futura
    if (inicio < new Date()) {
      throw new AppError('No se pueden agendar citas en el pasado', 400);
    }

    // Obtener citas existentes del mismo servicio en el día
    const citasDelDia = await citaRepository.findByFecha(inicio);
    
    // Filtrar citas del mismo servicio y que no estén canceladas
    const citasDelServicio = citasDelDia.filter(
      cita => 
        cita.servicioId === servicioId &&
        cita.estado !== CitaEstado.CANCELADA &&
        (excludeCitaId === undefined || cita.id !== excludeCitaId)
    );

    // Validar solapamiento
    for (const citaExistente of citasDelServicio) {
      const citaInicio = new Date(citaExistente.fecha);
      const servicioExistente = await servicioRepository.findById(citaExistente.servicioId);
      
      if (servicioExistente) {
        const citaFin = new Date(citaInicio);
        citaFin.setMinutes(citaFin.getMinutes() + servicioExistente.duracion);

        // Hay solapamiento si:
        // - La nueva cita empieza antes de que termine la existente
        // - Y la nueva cita termina después de que empiece la existente
        if (inicio < citaFin && fin > citaInicio) {
          throw new AppError(
            'Ya existe una cita agendada para este servicio en el horario seleccionado',
            409
          );
        }
      }
    }
  }
}

export default new CitaService();
