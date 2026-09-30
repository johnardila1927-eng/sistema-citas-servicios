import { Request, Response, NextFunction } from 'express';
import usuarioService from '../services/usuario.service';
import { CreateUsuarioDto, UpdateUsuarioDto } from '../dtos/usuario.dto';

export class UsuarioController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usuarios = await usuarioService.getAllUsuarios();
      res.json(usuarios);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      const usuario = await usuarioService.getUsuarioById(id);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateUsuarioDto = req.body;
      const usuario = await usuarioService.createUsuario(data);
      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      const data: UpdateUsuarioDto = req.body;
      const usuario = await usuarioService.updateUsuario(id, data);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idParam = req.params.id;
      const id = parseInt(Array.isArray(idParam) ? idParam[0] : idParam);
      await usuarioService.deleteUsuario(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default new UsuarioController();
