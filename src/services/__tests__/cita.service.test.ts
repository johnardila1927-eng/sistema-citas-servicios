import citaService from '../cita.service';
import citaRepository from '../../repositories/cita.repository';
import usuarioRepository from '../../repositories/usuario.repository';
import servicioRepository from '../../repositories/servicio.repository';
import { AppError } from '../../middlewares/errorMiddleware';
import { CitaEstado } from '../../dtos/cita.dto';

// Mock de los repositories
jest.mock('../../repositories/cita.repository');
jest.mock('../../repositories/usuario.repository');
jest.mock('../../repositories/servicio.repository');

describe('CitaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('createCita', () => {
    it('debería agendar una cita exitosamente cuando no hay solapamiento', async () => {
      // Arrange
      const mockUsuario = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'hashed',
        rol: 'CLIENTE',
        telefono: '+57 300 123 4567',
        direccion: 'Calle 123',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const mockServicio = {
        id: 1,
        nombre: 'Corte de Cabello',
        descripcion: 'Corte clásico',
        duracion: 30,
        precio: 25.00,
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const mockCitaCreada = {
        id: 1,
        fecha: new Date('2025-01-15T10:00:00Z'),
        estado: CitaEstado.PENDIENTE,
        notas: null,
        usuarioId: 1,
        servicioId: 1,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        usuario: mockUsuario,
        servicio: mockServicio,
      };

      const createCitaDto = {
        fecha: new Date('2025-01-15T10:00:00Z'),
        usuarioId: 1,
        servicioId: 1,
        estado: CitaEstado.PENDIENTE,
      };

      // Mock de usuarioRepository.findById
      (usuarioRepository.findById as jest.Mock).mockResolvedValue(mockUsuario);

      // Mock de servicioRepository.findById
      (servicioRepository.findById as jest.Mock).mockResolvedValue(mockServicio);

      // Mock de citaRepository.findByFecha (no hay citas existentes)
      (citaRepository.findByFecha as jest.Mock).mockResolvedValue([]);

      // Mock de citaRepository.create
      (citaRepository.create as jest.Mock).mockResolvedValue(mockCitaCreada);

      // Act
      const result = await citaService.createCita(createCitaDto);

      // Assert
      expect(usuarioRepository.findById).toHaveBeenCalledWith(1);
      expect(servicioRepository.findById).toHaveBeenCalledWith(1);
      expect(citaRepository.findByFecha).toHaveBeenCalled();
      expect(citaRepository.create).toHaveBeenCalledWith(createCitaDto);
      expect(result).toEqual(mockCitaCreada);
    });

    it('debería lanzar error 404 cuando el usuario no existe', async () => {
      // Arrange
      const createCitaDto = {
        fecha: new Date('2025-01-15T10:00:00Z'),
        usuarioId: 999,
        servicioId: 1,
        estado: CitaEstado.PENDIENTE,
      };

      (usuarioRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(citaService.createCita(createCitaDto)).rejects.toThrow(AppError);
      await expect(citaService.createCita(createCitaDto)).rejects.toThrow('Usuario no encontrado');
    });

    it('debería lanzar error 404 cuando el servicio no existe', async () => {
      // Arrange
      const mockUsuario = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'hashed',
        rol: 'CLIENTE',
        telefono: '+57 300 123 4567',
        direccion: 'Calle 123',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const createCitaDto = {
        fecha: new Date('2025-01-15T10:00:00Z'),
        usuarioId: 1,
        servicioId: 999,
        estado: CitaEstado.PENDIENTE,
      };

      (usuarioRepository.findById as jest.Mock).mockResolvedValue(mockUsuario);
      (servicioRepository.findById as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(citaService.createCita(createCitaDto)).rejects.toThrow(AppError);
      await expect(citaService.createCita(createCitaDto)).rejects.toThrow('Servicio no encontrado');
    });

    it('debería lanzar error 400 cuando el servicio no está activo', async () => {
      // Arrange
      const mockUsuario = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'hashed',
        rol: 'CLIENTE',
        telefono: '+57 300 123 4567',
        direccion: 'Calle 123',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const mockServicioInactivo = {
        id: 1,
        nombre: 'Corte de Cabello',
        descripcion: 'Corte clásico',
        duracion: 30,
        precio: 25.00,
        activo: false,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const createCitaDto = {
        fecha: new Date('2025-01-15T10:00:00Z'),
        usuarioId: 1,
        servicioId: 1,
        estado: CitaEstado.PENDIENTE,
      };

      (usuarioRepository.findById as jest.Mock).mockResolvedValue(mockUsuario);
      (servicioRepository.findById as jest.Mock).mockResolvedValue(mockServicioInactivo);

      // Act & Assert
      await expect(citaService.createCita(createCitaDto)).rejects.toThrow(AppError);
      await expect(citaService.createCita(createCitaDto)).rejects.toThrow('El servicio no está activo');
    });

    it('debería lanzar error 400 cuando la fecha es en el pasado', async () => {
      // Arrange
      const mockUsuario = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'hashed',
        rol: 'CLIENTE',
        telefono: '+57 300 123 4567',
        direccion: 'Calle 123',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const mockServicio = {
        id: 1,
        nombre: 'Corte de Cabello',
        descripcion: 'Corte clásico',
        duracion: 30,
        precio: 25.00,
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const createCitaDto = {
        fecha: new Date('2020-01-01T10:00:00Z'), // Fecha en el pasado
        usuarioId: 1,
        servicioId: 1,
        estado: CitaEstado.PENDIENTE,
      };

      (usuarioRepository.findById as jest.Mock).mockResolvedValue(mockUsuario);
      (servicioRepository.findById as jest.Mock).mockResolvedValue(mockServicio);

      // Act & Assert
      await expect(citaService.createCita(createCitaDto)).rejects.toThrow(AppError);
      await expect(citaService.createCita(createCitaDto)).rejects.toThrow('No se pueden agendar citas en el pasado');
    });

    it('debería lanzar error 409 cuando hay solapamiento de horarios', async () => {
      // Arrange
      const mockUsuario = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'hashed',
        rol: 'CLIENTE',
        telefono: '+57 300 123 4567',
        direccion: 'Calle 123',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const mockServicio = {
        id: 1,
        nombre: 'Corte de Cabello',
        descripcion: 'Corte clásico',
        duracion: 30,
        precio: 25.00,
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const mockCitaExistente = {
        id: 1,
        fecha: new Date('2025-01-15T10:00:00Z'),
        estado: CitaEstado.PENDIENTE,
        notas: null,
        usuarioId: 2,
        servicioId: 1,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        usuario: { ...mockUsuario, id: 2 },
        servicio: mockServicio,
      };

      // Intentar agendar cita que se solapa con la existente
      // Cita existente: 10:00 - 10:30
      // Nueva cita: 10:15 - 10:45 (solapamiento)
      const createCitaDto = {
        fecha: new Date('2025-01-15T10:15:00Z'),
        usuarioId: 1,
        servicioId: 1,
        estado: CitaEstado.PENDIENTE,
      };

      (usuarioRepository.findById as jest.Mock).mockResolvedValue(mockUsuario);
      (servicioRepository.findById as jest.Mock).mockResolvedValue(mockServicio);
      
      // Mock de citaRepository.findByFecha (retorna cita existente)
      (citaRepository.findByFecha as jest.Mock).mockResolvedValue([mockCitaExistente]);

      // Act & Assert
      await expect(citaService.createCita(createCitaDto)).rejects.toThrow(AppError);
      await expect(citaService.createCita(createCitaDto)).rejects.toThrow('Ya existe una cita agendada para este servicio en el horario seleccionado');
    });

    it('debería permitir agendar cita cuando no hay solapamiento (cita termina antes de que empiece la nueva)', async () => {
      // Arrange
      const mockUsuario = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'hashed',
        rol: 'CLIENTE',
        telefono: '+57 300 123 4567',
        direccion: 'Calle 123',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const mockServicio = {
        id: 1,
        nombre: 'Corte de Cabello',
        descripcion: 'Corte clásico',
        duracion: 30,
        precio: 25.00,
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const mockCitaExistente = {
        id: 1,
        fecha: new Date('2025-01-15T10:00:00Z'),
        estado: CitaEstado.PENDIENTE,
        notas: null,
        usuarioId: 2,
        servicioId: 1,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        usuario: { ...mockUsuario, id: 2 },
        servicio: mockServicio,
      };

      const mockCitaCreada = {
        id: 2,
        fecha: new Date('2025-01-15T10:30:00Z'),
        estado: CitaEstado.PENDIENTE,
        notas: null,
        usuarioId: 1,
        servicioId: 1,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        usuario: mockUsuario,
        servicio: mockServicio,
      };

      // Cita existente: 10:00 - 10:30
      // Nueva cita: 10:30 - 11:00 (NO hay solapamiento)
      const createCitaDto = {
        fecha: new Date('2025-01-15T10:30:00Z'),
        usuarioId: 1,
        servicioId: 1,
        estado: CitaEstado.PENDIENTE,
      };

      (usuarioRepository.findById as jest.Mock).mockResolvedValue(mockUsuario);
      (servicioRepository.findById as jest.Mock).mockResolvedValue(mockServicio);
      (citaRepository.findByFecha as jest.Mock).mockResolvedValue([mockCitaExistente]);
      (citaRepository.create as jest.Mock).mockResolvedValue(mockCitaCreada);

      // Act
      const result = await citaService.createCita(createCitaDto);

      // Assert
      expect(result).toEqual(mockCitaCreada);
      expect(citaRepository.create).toHaveBeenCalledWith(createCitaDto);
    });

    it('debería ignorar citas canceladas al validar solapamiento', async () => {
      // Arrange
      const mockUsuario = {
        id: 1,
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'hashed',
        rol: 'CLIENTE',
        telefono: '+57 300 123 4567',
        direccion: 'Calle 123',
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const mockServicio = {
        id: 1,
        nombre: 'Corte de Cabello',
        descripcion: 'Corte clásico',
        duracion: 30,
        precio: 25.00,
        activo: true,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
      };

      const mockCitaCancelada = {
        id: 1,
        fecha: new Date('2025-01-15T10:00:00Z'),
        estado: CitaEstado.CANCELADA,
        notas: null,
        usuarioId: 2,
        servicioId: 1,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        usuario: { ...mockUsuario, id: 2 },
        servicio: mockServicio,
      };

      const mockCitaCreada = {
        id: 2,
        fecha: new Date('2025-01-15T10:15:00Z'),
        estado: CitaEstado.PENDIENTE,
        notas: null,
        usuarioId: 1,
        servicioId: 1,
        creadoEn: new Date(),
        actualizadoEn: new Date(),
        usuario: mockUsuario,
        servicio: mockServicio,
      };

      // Cita cancelada: 10:00 - 10:30
      // Nueva cita: 10:15 - 10:45 (solaparía si no estuviera cancelada)
      const createCitaDto = {
        fecha: new Date('2025-01-15T10:15:00Z'),
        usuarioId: 1,
        servicioId: 1,
        estado: CitaEstado.PENDIENTE,
      };

      (usuarioRepository.findById as jest.Mock).mockResolvedValue(mockUsuario);
      (servicioRepository.findById as jest.Mock).mockResolvedValue(mockServicio);
      (citaRepository.findByFecha as jest.Mock).mockResolvedValue([mockCitaCancelada]);
      (citaRepository.create as jest.Mock).mockResolvedValue(mockCitaCreada);

      // Act
      const result = await citaService.createCita(createCitaDto);

      // Assert
      expect(result).toEqual(mockCitaCreada);
      expect(citaRepository.create).toHaveBeenCalledWith(createCitaDto);
    });
  });
});
