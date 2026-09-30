export enum CitaEstado {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  COMPLETADA = 'completada',
}

export interface CreateCitaDto {
  fecha: Date;
  estado?: CitaEstado;
  notas?: string;
  usuarioId: number;
  servicioId: number;
}

export interface UpdateCitaDto {
  fecha?: Date;
  estado?: CitaEstado;
  notas?: string;
  usuarioId?: number;
  servicioId?: number;
}

export interface CitaResponseDto {
  id: number;
  fecha: Date;
  estado: CitaEstado;
  notas: string | null;
  usuarioId: number;
  servicioId: number;
  creadoEn: Date;
  actualizadoEn: Date;
}
