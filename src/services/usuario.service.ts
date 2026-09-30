import usuarioRepository from '../repositories/usuario.repository';
import { Usuario } from '../models/usuario.model';
import { CreateUsuarioDto, UpdateUsuarioDto } from '../dtos/usuario.dto';
import { AppError } from '../middlewares/errorMiddleware';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

const BCRYPT_COST = 10;

export class UsuarioService {
  async getAllUsuarios(): Promise<Omit<Usuario, 'password'>[]> {
    const usuarios = await usuarioRepository.findAll();
    return usuarios.map(({ password, ...user }) => user);
  }

  async getUsuarioById(id: number): Promise<Omit<Usuario, 'password'>> {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }
    const { password, ...userWithoutPassword } = usuario;
    return userWithoutPassword;
  }

  async createUsuario(data: CreateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const existingUsuario = await usuarioRepository.findByEmail(data.email);
    if (existingUsuario) {
      throw new AppError('El email ya está registrado', 400);
    }

    const createData: Prisma.UsuarioCreateInput = {
      nombre: data.nombre,
      email: data.email,
      password: await bcrypt.hash(data.password, BCRYPT_COST),
      telefono: data.telefono || null,
      direccion: data.direccion || null,
    };

    if (data.rol) {
      createData.rol = data.rol;
    }

    const usuario = await usuarioRepository.create(createData);
    const { password, ...userWithoutPassword } = usuario;
    return userWithoutPassword;
  }

  async updateUsuario(id: number, data: UpdateUsuarioDto): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.getUsuarioById(id);
    
    if (data.email && data.email !== usuario.email) {
      const existingUsuario = await usuarioRepository.findByEmail(data.email);
      if (existingUsuario) {
        throw new AppError('El email ya está registrado', 400);
      }
    }

    const updateData: Prisma.UsuarioUpdateInput = {};
    
    if (data.nombre !== undefined) {
      updateData.nombre = data.nombre;
    }
    if (data.email !== undefined) {
      updateData.email = data.email;
    }
    if (data.password !== undefined) {
      updateData.password = await bcrypt.hash(data.password, BCRYPT_COST);
    }
    if (data.rol !== undefined) {
      updateData.rol = data.rol;
    }
    if (data.telefono !== undefined) {
      updateData.telefono = data.telefono;
    }
    if (data.direccion !== undefined) {
      updateData.direccion = data.direccion;
    }
    
    const updatedUsuario = await usuarioRepository.update(id, updateData);
    const { password, ...userWithoutPassword } = updatedUsuario;
    return userWithoutPassword;
  }

  async deleteUsuario(id: number): Promise<Omit<Usuario, 'password'>> {
    await this.getUsuarioById(id);
    const deletedUsuario = await usuarioRepository.delete(id);
    const { password, ...userWithoutPassword } = deletedUsuario;
    return userWithoutPassword;
  }
}

export default new UsuarioService();
