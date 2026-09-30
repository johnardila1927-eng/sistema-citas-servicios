# Guía del Módulo de Autenticación

## Resumen del Módulo

El módulo de autenticación implementa seguridad basada en tokens JWT y control de acceso basado en roles (RBAC).

## Características

- ✅ Hash de contraseñas con bcrypt (costo 10)
- ✅ Tokens JWT con expiración configurable (24h por defecto)
- ✅ Roles: CLIENTE y ADMINISTRADOR
- ✅ Middleware de autenticación
- ✅ Middleware de autorización por roles
- ✅ Protección de rutas por rol

## Endpoints

### 1. Registro de Usuario

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "telefono": "+57 300 123 4567",
  "direccion": "Calle 123, Bogotá"
}
```

**Response (201):**
```json
{
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "CLIENTE",
    "telefono": "+57 300 123 4567",
    "direccion": "Calle 123, Bogotá"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Inicio de Sesión

**Endpoint:** `POST /api/auth/login`

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "CLIENTE",
    "telefono": "+57 300 123 4567",
    "direccion": "Calle 123, Bogotá"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Obtener Usuario Actual

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "rol": "CLIENTE",
  "telefono": "+57 300 123 4567",
  "direccion": "Calle 123, Bogotá"
}
```

## Uso del Token

Para acceder a rutas protegidas, incluye el token en el header `Authorization`:

```bash
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/citas
```

## Middleware de Autenticación

### `authenticate`

Verifica que el token JWT sea válido y agrega la información del usuario al request.

```typescript
import { authenticate } from './middlewares/auth.middleware';

app.get('/api/protected', authenticate, (req, res) => {
  const user = (req as AuthRequest).user;
  res.json({ user });
});
```

### `authorize(...roles)`

Verifica que el usuario tenga uno de los roles especificados.

```typescript
import { authorize } from './middlewares/auth.middleware';

app.post('/api/admin-only', authenticate, authorize('ADMINISTRADOR'), (req, res) => {
  res.json({ message: 'Solo administradores' });
});
```

### Middlewares Predefinidos

- `requireAdmin` - Solo ADMINISTRADOR
- `requireClient` - Solo CLIENTE
- `requireAnyRole` - CLIENTE o ADMINISTRADOR

## Protección de Rutas Actuales

### Usuarios
- `GET /api/usuarios` - Requiere: ADMINISTRADOR
- `GET /api/usuarios/:id` - Requiere: Autenticado
- `POST /api/usuarios` - Requiere: ADMINISTRADOR
- `PUT /api/usuarios/:id` - Requiere: ADMINISTRADOR
- `DELETE /api/usuarios/:id` - Requiere: ADMINISTRADOR

### Servicios
- `GET /api/servicios` - Público
- `GET /api/servicios/:id` - Público
- `POST /api/servicios` - Requiere: ADMINISTRADOR
- `PUT /api/servicios/:id` - Requiere: ADMINISTRADOR
- `DELETE /api/servicios/:id` - Requiere: ADMINISTRADOR

### Citas
- `GET /api/citas` - Requiere: CLIENTE o ADMINISTRADOR
- `GET /api/citas/:id` - Requiere: CLIENTE o ADMINISTRADOR
- `GET /api/citas/usuario/:usuarioId` - Requiere: CLIENTE o ADMINISTRADOR
- `GET /api/citas/servicio/:servicioId` - Requiere: CLIENTE o ADMINISTRADOR
- `GET /api/citas/fecha/:fecha` - Requiere: CLIENTE o ADMINISTRADOR
- `POST /api/citas` - Requiere: CLIENTE o ADMINISTRADOR
- `PUT /api/citas/:id` - Requiere: CLIENTE o ADMINISTRADOR
- `DELETE /api/citas/:id` - Requiere: CLIENTE o ADMINISTRADOR

## Errores

### 401 Unauthorized
- Token no proporcionado
- Token inválido
- Token expirado

### 403 Forbidden
- Usuario no tiene el rol requerido

### 400 Bad Request
- Email ya registrado (registro)
- Credenciales inválidas (login)

## Ejemplos de Uso con cURL

### Registrar usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Admin User",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Iniciar sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

### Obtener usuario actual
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Crear cita (requiere autenticación)
```bash
curl -X POST http://localhost:3000/api/citas \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2024-10-15T10:00:00Z",
    "estado": "pendiente",
    "usuarioId": 1,
    "servicioId": 1
  }'
```

## Notas de Seguridad

1. **JWT_SECRET:** Cambiar la clave secreta en producción (mínimo 32 caracteres)
2. **Contraseñas:** bcrypt con costo 10 (configurable)
3. **HTTPS:** Usar HTTPS en producción para proteger el token
4. **Expiración:** Tokens expiran en 24h (configurable vía JWT_EXPIRES_IN)
5. **Almacenamiento:** No almacenar tokens en localStorage en producción (usar httpOnly cookies)

## Variables de Entorno

```env
JWT_SECRET=super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
```

## Testing

Para crear un usuario administrador manualmente (para pruebas):

```sql
-- Insertar usuario administrador
INSERT INTO usuarios (nombre, email, password, rol)
VALUES (
  'Administrador',
  'admin@example.com',
  '$2b$10$hashedpasswordhere',
  'ADMINISTRADOR'
);
```

El hash de contraseña se puede generar con:
```javascript
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
```
