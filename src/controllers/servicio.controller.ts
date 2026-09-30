import { Request, Response, NextFunction } from 'express';
import servicioService from '../services/servicio.service';
import { CreateServicioDto, UpdateServicioDto } from '../dtos/servicio.dto';

export class ServicioController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const includeInactive = req.query.inactive === 'true';
      const servicios = await servicioService.getAllServicios(includeInactive);
      res.json(servicios);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      const servicio = await servicioService.getServicioById(id);
      res.json(servicio);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateServicioDto = req.body;
      const servicio = await servicioService.createServicio(data);
      res.status(201).json(servicio);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      const data: UpdateServicioDto = req.body;
      const servicio = await servicioService.updateServicio(id, data);
      res.json(servicio);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      await servicioService.deleteServicio(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new ServicioController();
