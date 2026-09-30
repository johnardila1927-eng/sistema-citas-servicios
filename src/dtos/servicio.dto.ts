export interface CreateServicioDto {
  nombre: string;
  descripcion?: string;
  duracion: number;
  precio: number;
  activo?: boolean;
}

export interface UpdateServicioDto {
  nombre?: string;
  descripcion?: string;
  duracion?: number;
  precio?: number;
  activo?: boolean;
}

export interface ServicioResponseDto {
  id: number;
  nombre: string;
  descripcion: string | null;
  duracion: number;
  precio: number;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}
