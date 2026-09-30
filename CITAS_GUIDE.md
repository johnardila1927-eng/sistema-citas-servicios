# Guía del Módulo de Citas y Lógica de Negocio

## Resumen del Módulo

El módulo de Citas implementa la lógica de agendamiento con validación estricta de solapamiento de horarios, siguiendo el principio SRP (Single Responsibility Principle). La lógica de validación de cruce de agendas reside exclusivamente en el Service layer.

## Modelo de Datos

### Tabla: citas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int (PK, Autoincrement) | Identificador único |
| fecha | DateTime (NOT NULL) | Fecha y hora de la cita |
| estado | String (default: 'pendiente') | Estado de la cita |
| notas | String (nullable) | Notas adicionales |
| usuarioId | Int (FK) | ID del usuario |
| servicioId | Int (FK) | ID del servicio |
| creadoEn | DateTime (default: NOW()) | Fecha de creación |
| actualizadoEn | DateTime (auto-update) | Fecha de última actualización |

### Estados de Cita (Enum)

- `pendiente` - Cita agendada pero no confirmada
- `confirmada` - Cita confirmada
- `cancelada` - Cita cancelada
- `completada` - Cita completada

## Endpoints

### 1. Crear Cita (Cliente/Admin)

**Endpoint:** `POST /api/citas`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "fecha": "2024-10-15T10:00:00Z",
  "estado": "pendiente",
  "notas": "Preferencia por la mañana",
  "usuarioId": 1,
  "servicioId": 1
}
```

**Validaciones:**
- Usuario debe existir
- Servicio debe existir y estar activo
- Fecha debe ser futura
- No debe haber solapamiento de horarios para el mismo servicio

**Response (201):**
```json
{
  "id": 1,
  "fecha": "2024-10-15T10:00:00.000Z",
  "estado": "pendiente",
  "notas": "Preferencia por la mañana",
  "usuarioId": 1,
  "servicioId": 1,
  "creadoEn": "2024-09-30T15:00:00.000Z",
  "actualizadoEn": "2024-09-30T15:00:00.000Z",
  "usuario": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "CLIENTE"
  },
  "servicio": {
    "id": 1,
    "nombre": "Corte de Cabello",
    "duracion": 30,
    "precio": 25.00
  }
}
```

**Error de Solapamiento (409):**
```json
{
  "status": "error",
  "message": "Ya existe una cita agendada para este servicio en el horario seleccionado"
}
```

### 2. Mis Citas (Cliente)

**Endpoint:** `GET /api/citas/mis-citas`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "fecha": "2024-10-15T10:00:00.000Z",
    "estado": "pendiente",
    "notas": "Preferencia por la mañana",
    "usuarioId": 1,
    "servicioId": 1,
    "creadoEn": "2024-09-30T15:00:00.000Z",
    "actualizadoEn": "2024-09-30T15:00:00.000Z",
    "usuario": { ... },
    "servicio": { ... }
  }
]
```

### 3. Cancelar Cita (Cliente/Admin)

**Endpoint:** `PUT /api/citas/:id/cancelar`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Permisos:**
- El usuario dueño de la cita puede cancelarla
- Un administrador puede cancelar cualquier cita

**Validaciones:**
- La cita no debe estar ya cancelada
- La cita no debe estar completada

**Response (200):**
```json
{
  "id": 1,
  "fecha": "2024-10-15T10:00:00.000Z",
  "estado": "cancelada",
  "notas": "Preferencia por la mañana",
  "usuarioId": 1,
  "servicioId": 1,
  "creadoEn": "2024-09-30T15:00:00.000Z",
  "actualizadoEn": "2024-09-30T15:30:00.000Z"
}
```

**Error de Permisos (403):**
```json
{
  "status": "error",
  "message": "No tiene permisos para cancelar esta cita"
}
```

### 4. Todas las Citas (Admin)

**Endpoint:** `GET /api/citas/todas`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "fecha": "2024-10-15T10:00:00.000Z",
    "estado": "pendiente",
    "usuarioId": 1,
    "servicioId": 1,
    "usuario": { ... },
    "servicio": { ... }
  }
]
```

### 5. Listar Citas (Autenticado)

**Endpoint:** `GET /api/citas`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "fecha": "2024-10-15T10:00:00.000Z",
    "estado": "pendiente",
    "usuarioId": 1,
    "servicioId": 1,
    "usuario": { ... },
    "servicio": { ... }
  }
]
```

## Lógica de Validación de Solapamiento (SRP)

### Principio SRP Aplicado

La lógica de validación de cruce de agendas reside **exclusivamente** en el `CitaService`, siguiendo el Single Responsibility Principle:

```typescript
private async validateNoOverlap(
  servicioId: number,
  fecha: Date,
  duracion: number,
  excludeCitaId?: number
): Promise<void>
```

### Algoritmo de Validación

1. **Calcular rango de tiempo:**
   - Inicio: fecha de la cita
   - Fin: fecha + duración del servicio

2. **Validar fecha futura:**
   - No se permiten citas en el pasado

3. **Obtener citas existentes:**
   - Citas del mismo servicio en el mismo día
   - Excluir citas canceladas
   - Excluir la cita actual (en actualizaciones)

4. **Detectar solapamiento:**
   - Hay solapamiento si:
     - La nueva cita empieza antes de que termine la existente
     - Y la nueva cita termina después de que empiece la existente

### Ejemplo de Solapamiento

```
Cita Existente: 10:00 - 10:30 (30 minutos)
Nueva Cita:      10:15 - 10:45 (30 minutos)

Result: ❌ SOLAPAMIENTO
- Nueva cita empieza (10:15) < Cita existente termina (10:30)
- Nueva cita termina (10:45) > Cita existente empieza (10:10)
```

```
Cita Existente: 10:00 - 10:30 (30 minutos)
Nueva Cita:      10:30 - 11:00 (30 minutos)

Result: ✅ NO SOLAPAMIENTO
- Nueva cita empieza (10:30) >= Cita existente termina (10:30)
```

## Ejemplos de Uso con cURL

### Crear cita (con validación de solapamiento)
```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-10-15T10:00:00Z",
    "usuarioId": 1,
    "servicioId": 1
  }'
```

### Intentar crear cita con solapamiento (error 409)
```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-10-15T10:15:00Z",
    "usuarioId": 2,
    "servicioId": 1
  }'
```

### Ver mis citas
```bash
curl http://localhost:3000/api/citas/mis-citas \
  -H "Authorization: Bearer <token>"
```

### Cancelar mi cita
```bash
curl -X PUT http://localhost:3000/api/citas/1/cancelar \
  -H "Authorization: Bearer <token>"
```

### Ver todas las citas (admin)
```bash
curl http://localhost:3000/api/citas/todas \
  -H "Authorization: Bearer <admin-token>"
```

## Errores

### 400 Bad Request
- Fecha en el pasado
- Cita ya cancelada
- Cita ya completada

### 403 Forbidden
- Usuario no tiene permisos para cancelar la cita
- Solo el dueño o admin pueden cancelar

### 404 Not Found
- Cita no encontrada
- Usuario no encontrado
- Servicio no encontrado

### 409 Conflict
- Solapamiento de horarios detectado

## Arquitectura en Capas

### DTOs (Data Transfer Objects)
- `CreateCitaDto` - Para crear citas
- `UpdateCitaDto` - Para actualizar citas
- `CitaResponseDto` - Respuesta estándar
- `CitaEstado` - Enum de estados

### Repository
- `findAll()` - Buscar todas
- `findById(id)` - Buscar por ID
- `findByUsuario(usuarioId)` - Buscar por usuario
- `findByServicio(servicioId)` - Buscar por servicio
- `findByFecha(fecha)` - Buscar por fecha
- `create(data)` - Crear cita
- `update(id, data)` - Actualizar cita
- `delete(id)` - Eliminar cita

### Service (Lógica de Negocio - SRP)
- `getAllCitas()` - Listar todas
- `getCitaById(id)` - Validación de existencia
- `getMisCitas(usuarioId)` - Citas del usuario autenticado
- `createCita(data)` - **Validación de solapamiento** (SRP)
- `updateCita(id, data)` - Validación y re-validación de solapamiento
- `cancelarCita(id, usuarioId, userRol)` - Validación de permisos
- `deleteCita(id)` - Validación de eliminación
- `validateNoOverlap()` - **Método privado exclusivo para validación de cruce**

### Controller
- `getAll` - Lista todas las citas
- `getMisCitas` - Lista citas del usuario autenticado
- `create` - Procesa body y responde 201
- `update` - Procesa body y params
- `cancelar` - Procesa cancelación con validación de permisos
- `delete` - Procesa eliminación

## Protección de Rutas

| Endpoint | Método | Autenticación | Rol | Descripción |
|----------|--------|---------------|-----|-------------|
| `/api/citas/todas` | GET | Sí | ADMIN | Lista todas las citas |
| `/api/citas` | GET | Sí | Cualquiera | Lista citas |
| `/api/citas/mis-citas` | GET | Sí | Cualquiera | Citas del usuario actual |
| `/api/citas/:id` | GET | Sí | Cualquiera | Obtiene cita por ID |
| `/api/citas/usuario/:usuarioId` | GET | Sí | Cualquiera | Citas por usuario |
| `/api/citas/servicio/:servicioId` | GET | Sí | Cualquiera | Citas por servicio |
| `/api/citas/fecha/:fecha` | GET | Sí | Cualquiera | Citas por fecha |
| `/api/citas` | POST | Sí | Cualquiera | Crear cita (con validación) |
| `/api/citas/:id` | PUT | Sí | Cualquiera | Actualizar cita |
| `/api/citas/:id/cancelar` | PUT | Sí | Cualquiera | Cancelar cita |
| `/api/citas/:id` | DELETE | Sí | ADMIN | Eliminar cita |

## Flujo de Agendamiento

### 1. Cliente solicita cita
```
POST /api/citas
{
  "fecha": "2024-10-15T10:00:00Z",
  "usuarioId": 1,
  "servicioId": 1
}
```

### 2. Controller recibe request
- Parsea body
- Llama a `citaService.createCita(data)`

### 3. Service valida
- Verifica que usuario exista
- Verifica que servicio exista y esté activo
- **Llama a `validateNoOverlap()`** (SRP)
  - Calcula rango de tiempo
  - Busca citas existentes del servicio
  - Detecta solapamientos
  - Lanza error si hay conflicto

### 4. Repository persiste
- Crea cita en base de datos
- Retorna cita creada

### 5. Controller responde
- Status 201 Created
- Retorna cita creada

## Notas de Diseño

1. **SRP:** La lógica de validación de solapamiento está exclusivamente en el Service layer
2. **Validación estricta:** No permite citas en el pasado ni solapamientos
3. **Soft delete:** Las citas canceladas no afectan la validación de solapamiento
4. **Permisos:** Solo el dueño o admin pueden cancelar citas
5. **Estados:** Usa enum para type safety
6. **Re-validación:** Al actualizar fecha/servicio, se re-valida el solapamiento

## Testing Manual

### Crear servicio de prueba
```sql
INSERT INTO servicios (nombre, descripcion, duracion, precio, activo)
VALUES ('Corte de Cabello', 'Corte clásico', 30, 25.00, true);
```

### Crear cita exitosa
```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-10-15T10:00:00Z",
    "usuarioId": 1,
    "servicioId": 1
  }'
```

### Intentar cita solapada (debe fallar 409)
```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-10-15T10:15:00Z",
    "usuarioId": 2,
    "servicioId": 1
  }'
```

### Crear cita no solapada (debe funcionar)
```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-10-15T10:30:00Z",
    "usuarioId": 2,
    "servicioId": 1
  }'
```

## Ventajas del Diseño SRP

1. **Separación de responsabilidades:**
   - Controller: Maneja HTTP
   - Service: Lógica de negocio
   - Repository: Acceso a datos

2. **Reutilización:**
   - `validateNoOverlap()` puede ser reutilizado en create y update

3. **Testabilidad:**
   - Lógica de validación aislada y testeable
   - Mocks de repository fáciles de implementar

4. **Mantenibilidad:**
   - Cambios en la lógica de validación no afectan controller
   - Cambios en HTTP no afectan lógica de negocio

5. **Escalabilidad:**
   - Fácil agregar nuevas validaciones
   - Fácil agregar nuevas reglas de negocio
