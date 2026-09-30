# Guía del Módulo de Catálogo de Servicios

## Resumen del Módulo

El módulo de Catálogo de Servicios permite la gestión completa de los servicios ofrecidos en el sistema, con CRUD completo y control de estado activo/inactivo.

## Modelo de Datos

### Tabla: servicios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int (PK, Autoincrement) | Identificador único |
| nombre | String (NOT NULL) | Nombre del servicio |
| descripcion | String (nullable) | Descripción detallada |
| duracion | Int (NOT NULL) | Duración en minutos |
| precio | Decimal(10,2) (NOT NULL) | Precio del servicio |
| activo | Boolean (default: true) | Estado del servicio |
| creadoEn | DateTime (default: NOW()) | Fecha de creación |
| actualizadoEn | DateTime (auto-update) | Fecha de última actualización |

## Endpoints

### 1. Listar Servicios (Público)

**Endpoint:** `GET /api/servicios`

**Query Params (opcional):**
- `inactive=true` - Incluir servicios inactivos (solo admin)

**Response (200):**
```json
[
  {
    "id": 1,
    "nombre": "Corte de Cabello",
    "descripcion": "Corte clásico para caballeros",
    "duracion": 30,
    "precio": 25.00,
    "activo": true,
    "creadoEn": "2024-09-30T15:00:00.000Z",
    "actualizadoEn": "2024-09-30T15:00:00.000Z"
  }
]
```

### 2. Listar Todos los Servicios (Solo Admin)

**Endpoint:** `GET /api/servicios/all`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "nombre": "Corte de Cabello",
    "descripcion": "Corte clásico para caballeros",
    "duracion": 30,
    "precio": 25.00,
    "activo": true,
    "creadoEn": "2024-09-30T15:00:00.000Z",
    "actualizadoEn": "2024-09-30T15:00:00.000Z"
  },
  {
    "id": 2,
    "nombre": "Servicio Descontinuado",
    "descripcion": "Ya no se ofrece",
    "duracion": 45,
    "precio": 50.00,
    "activo": false,
    "creadoEn": "2024-09-30T15:00:00.000Z",
    "actualizadoEn": "2024-09-30T15:00:00.000Z"
  }
]
```

### 3. Obtener Servicio por ID (Público)

**Endpoint:** `GET /api/servicios/:id`

**Response (200):**
```json
{
  "id": 1,
  "nombre": "Corte de Cabello",
  "descripcion": "Corte clásico para caballeros",
  "duracion": 30,
  "precio": 25.00,
  "activo": true,
  "creadoEn": "2024-09-30T15:00:00.000Z",
  "actualizadoEn": "2024-09-30T15:00:00.000Z"
}
```

### 4. Crear Servicio (Solo Admin)

**Endpoint:** `POST /api/servicios`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Corte de Cabello",
  "descripcion": "Corte clásico para caballeros",
  "duracion": 30,
  "precio": 25.00,
  "activo": true
}
```

**Validaciones:**
- `nombre`: Requerido, no puede estar vacío
- `duracion`: Requerido, debe ser mayor a 0
- `precio`: Requerido, debe ser mayor a 0
- `descripcion`: Opcional
- `activo`: Opcional (default: true)

**Response (201):**
```json
{
  "id": 1,
  "nombre": "Corte de Cabello",
  "descripcion": "Corte clásico para caballeros",
  "duracion": 30,
  "precio": 25.00,
  "activo": true,
  "creadoEn": "2024-09-30T15:00:00.000Z",
  "actualizadoEn": "2024-09-30T15:00:00.000Z"
}
```

### 5. Actualizar Servicio (Solo Admin)

**Endpoint:** `PUT /api/servicios/:id`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "nombre": "Corte de Cabello Premium",
  "descripcion": "Corte premium con lavado incluido",
  "duracion": 45,
  "precio": 35.00,
  "activo": true
}
```

**Validaciones:**
- `duracion`: Si se envía, debe ser mayor a 0
- `precio`: Si se envía, debe ser mayor a 0

**Response (200):**
```json
{
  "id": 1,
  "nombre": "Corte de Cabello Premium",
  "descripcion": "Corte premium con lavado incluido",
  "duracion": 45,
  "precio": 35.00,
  "activo": true,
  "creadoEn": "2024-09-30T15:00:00.000Z",
  "actualizadoEn": "2024-09-30T15:30:00.000Z"
}
```

### 6. Eliminar Servicio (Solo Admin)

**Endpoint:** `DELETE /api/servicios/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):**
Sin contenido (servicio eliminado)

## Estrategia de Eliminación

### Soft Delete vs Hard Delete

El sistema usa **Hard Delete** (eliminación física) por defecto. Sin embargo, se recomienda usar el campo `activo` para "desactivar" servicios en lugar de eliminarlos:

**Para desactivar un servicio:**
```bash
curl -X PUT http://localhost:3000/api/servicios/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"activo": false}'
```

Esto permite:
- Mantener historial de servicios
- Reactivar servicios posteriormente
- Preservar citas asociadas al servicio

## Ejemplos de Uso con cURL

### Listar servicios activos (público)
```bash
curl http://localhost:3000/api/servicios
```

### Listar todos los servicios (incluyendo inactivos) - Admin
```bash
curl http://localhost:3000/api/servicios/all \
  -H "Authorization: Bearer <token>"
```

### Crear nuevo servicio - Admin
```bash
curl -X POST http://localhost:3000/api/servicios \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Manicura",
    "descripcion": "Manicura completa con esmalte",
    "duracion": 45,
    "precio": 30.00
  }'
```

### Actualizar servicio - Admin
```bash
curl -X PUT http://localhost:3000/api/servicios/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "precio": 28.00,
    "activo": true
  }'
```

### Desactivar servicio (soft delete) - Admin
```bash
curl -X PUT http://localhost:3000/api/servicios/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"activo": false}'
```

### Eliminar servicio (hard delete) - Admin
```bash
curl -X DELETE http://localhost:3000/api/servicios/1 \
  -H "Authorization: Bearer <token>"
```

## Errores

### 400 Bad Request
- Nombre requerido o vacío
- Duración debe ser mayor a 0
- Precio debe ser mayor a 0

### 404 Not Found
- Servicio no encontrado

### 401 Unauthorized
- Token no proporcionado o inválido

### 403 Forbidden
- Usuario no tiene rol de ADMINISTRADOR

## Arquitectura en Capas

### DTOs (Data Transfer Objects)
- `CreateServicioDto` - Para crear servicios
- `UpdateServicioDto` - Para actualizar servicios
- `ServicioResponseDto` - Respuesta estándar

### Repository
- `findAll(includeInactive)` - Buscar todos (opcional inactivos)
- `findById(id)` - Buscar por ID
- `create(data)` - Crear servicio
- `update(id, data)` - Actualizar servicio
- `delete(id)` - Eliminar servicio

### Service
- `getAllServicios(includeInactive)` - Lógica de negocio para listar
- `getServicioById(id)` - Validación de existencia
- `createServicio(data)` - Validaciones de creación
- `updateServicio(id, data)` - Validaciones de actualización
- `deleteServicio(id)` - Validación de eliminación

### Controller
- `getAll` - Maneja query params
- `getById` - Parsea ID de params
- `create` - Procesa body y responde 201
- `update` - Procesa body y params
- `delete` - Responde 204

## Protección de Rutas

| Endpoint | Autenticación | Rol Requerido |
|----------|---------------|---------------|
| GET /api/servicios | No | N/A (Público) |
| GET /api/servicios/all | Sí | ADMINISTRADOR |
| GET /api/servicios/:id | No | N/A (Público) |
| POST /api/servicios | Sí | ADMINISTRADOR |
| PUT /api/servicios/:id | Sí | ADMINISTRADOR |
| DELETE /api/servicios/:id | Sí | ADMINISTRADOR |

## Notas de Diseño

1. **Precio Decimal:** Usado `Decimal(10,2)` para precisión monetaria
2. **Duración en Minutos:** Facilita cálculos de horarios
3. **Estado Activo:** Permite desactivar sin eliminar (soft delete)
4. **Lectura Pública:** Clientes pueden ver servicios disponibles
5. **Escritura Admin:** Solo administradores pueden gestionar servicios
6. **Validaciones:** Service layer valida datos antes de persistir

## Integración con Citas

Los servicios activos son los únicos disponibles para crear citas. El sistema valida que:
- El servicio exista
- El servicio esté activo (`activo: true`)
- El servicio no haya sido eliminado

## Testing Manual

### Crear servicios de prueba
```sql
INSERT INTO servicios (nombre, descripcion, duracion, precio, activo)
VALUES 
  ('Corte de Cabello', 'Corte clásico', 30, 25.00, true),
  ('Manicura', 'Manicura completa', 45, 30.00, true),
  ('Pediluvio', 'Tratamiento de pies', 30, 20.00, true),
  ('Servicio Antiguo', 'Ya no disponible', 60, 50.00, false);
```

### Verificar listado público (solo activos)
```bash
curl http://localhost:3000/api/servicios
```

### Verificar listado admin (todos)
```bash
curl http://localhost:3000/api/servicios/all \
  -H "Authorization: Bearer <admin-token>"
```
