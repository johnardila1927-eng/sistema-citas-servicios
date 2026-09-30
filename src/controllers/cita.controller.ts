import { Request, Response, NextFunction } from 'express';
import citaService from '../services/cita.service';
import { CreateCitaDto, UpdateCitaDto } from '../dtos/cita.dto';
import { AuthRequest } from '../middlewares/auth.middleware';

export class CitaController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const citas = await citaService.getAllCitas();
      res.json(citas);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      const cita = await citaService.getCitaById(id);
      res.json(cita);
    } catch (error) {
      next(error);
    }
  }

  async getByUsuario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarioIdParam = req.params.usuarioId;
      const usuarioId = parseInt(Array.isArray(usuarioIdParam) ? usuarioIdParam[0] : usuarioIdParam);
      const citas = await citaService.getCitasByUsuario(usuarioId);
      res.json(citas);
    } catch (error) {
      next(error);
    }
  }

  async getMisCitas(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new Error('Usuario no autenticado');
      }
      const citas = await citaService.getMisCitas(userId);
      res.json(citas);
    } catch (error) {
      next(error);
    }
  }

  async getByServicio(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const servicioIdParam = req.params.servicioId;
      const servicioId = parseInt(Array.isArray(servicioIdParam) ? servicioIdParam[0] : servicioIdParam);
      const citas = await citaService.getCitasByServicio(servicioId);
      res.json(citas);
    } catch (error) {
      next(error);
    }
  }

  async getByFecha(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const fechaParam = req.params.fecha;
      const fecha = new Date(Array.isArray(fechaParam) ? fechaParam[0] : fechaParam);
      const citas = await citaService.getCitasByFecha(fecha);
      res.json(citas);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateCitaDto = req.body;
      const cita = await citaService.createCita(data);
      res.status(201).json(cita);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      const data: UpdateCitaDto = req.body;
      const cita = await citaService.updateCita(id, data);
      res.json(cita);
    } catch (error) {
      next(error);
    }
  }

  async cancelar(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      const userId = req.user?.userId;
      const userRol = req.user?.rol;
      
      if (!userId || !userRol) {
        throw new Error('Usuario no autenticado');
      }
      
      const cita = await citaService.cancelarCita(id, userId, userRol);
      res.json(cita);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      await citaService.deleteCita(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new CitaController();
