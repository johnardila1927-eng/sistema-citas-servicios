# Sistema Web de Gestión de Citas y Servicios

Sistema para la gestión de citas y servicios desarrollado para la asignatura de Calidad de Software (CUN).

**Autores:** Santiago Sabogal y John Ardila

## Stack Tecnológico

- **Backend:** Node.js, Express, TypeScript
- **Base de Datos:** PostgreSQL con Prisma ORM
- **Frontend:** HTML5, CSS3 (Tailwind CSS), JavaScript modular (Fetch API)
- **Testing:** Jest y Supertest
- **Autenticación:** JWT (json-web-token) + bcrypt (hash de contraseñas)
- **Autorización:** RBAC (Role-Based Access Control)

## Estructura del Proyecto

```
/src
  /config        - Configuración de la base de datos
  /controllers   - Controladores de la API
  /services      - Lógica de negocio
  /repositories  - Acceso a datos
  /middlewares   - Middlewares (manejo de errores)
  /models        - Modelos de datos
  /dtos          - Data Transfer Objects
  /public        - Archivos estáticos (HTML, CSS, JS)
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar la base de datos en el archivo `.env`:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/sistema_citas?schema=public"
PORT=3000
JWT_SECRET=super-secret-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=24h
```

4. Ejecutar las migraciones de Prisma:
```bash
npm run prisma:migrate
```

5. Generar el cliente de Prisma:
```bash
npm run prisma:generate
```

## Scripts Disponibles

- `npm run dev` - Iniciar el servidor en modo desarrollo (con nodemon)
- `npm run build` - Compilar TypeScript
- `npm start` - Iniciar el servidor en producción
- `npm test` - Ejecutar tests
- `npm run test:watch` - Ejecutar tests en modo watch
- `npm run prisma:generate` - Generar cliente Prisma
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:studio` - Abrir Prisma Studio

## Modelo de Datos

### Usuarios
- id (autoincrement)
- nombre
- email (único)
- password (hash bcrypt)
- rol (CLIENTE | ADMINISTRADOR)
- telefono (opcional)
- direccion (opcional)
- creadoEn
- actualizadoEn

### Servicios
- id (autoincrement)
- nombre
- descripcion (opcional)
- duracion (minutos)
- precio
- activo (boolean)
- creadoEn
- actualizadoEn

### Citas
- id (autoincrement)
- fecha
- estado (pendiente, confirmada, cancelada, completada)
- notas (opcional)
- usuarioId (FK → usuarios)
- servicioId (FK → servicios)
- creadoEn
- actualizadoEn

## API Endpoints

### Autenticación (Públicos)
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual (requiere token)

### Usuarios (Protegidos)
- `GET /api/usuarios` - Listar todos los usuarios [ADMIN]
- `GET /api/usuarios/:id` - Obtener usuario por ID [Auth]
- `POST /api/usuarios` - Crear nuevo usuario [ADMIN]
- `PUT /api/usuarios/:id` - Actualizar usuario [ADMIN]
- `DELETE /api/usuarios/:id` - Eliminar usuario [ADMIN]

### Servicios
- `GET /api/servicios` - Listar servicios activos [Público]
- `GET /api/servicios/all` - Listar todos los servicios (incluyendo inactivos) [ADMIN]
- `GET /api/servicios/:id` - Obtener servicio por ID [Público]
- `POST /api/servicios` - Crear nuevo servicio [ADMIN]
- `PUT /api/servicios/:id` - Actualizar servicio [ADMIN]
- `DELETE /api/servicios/:id` - Eliminar servicio [ADMIN]

### Citas (Protegidos)
- `GET /api/citas/todas` - Listar todas las citas [ADMIN]
- `GET /api/citas` - Listar citas [Auth]
- `GET /api/citas/mis-citas` - Listar citas del usuario actual [Auth]
- `GET /api/citas/:id` - Obtener cita por ID [Auth]
- `GET /api/citas/usuario/:usuarioId` - Obtener citas por usuario [Auth]
- `GET /api/citas/servicio/:servicioId` - Obtener citas por servicio [Auth]
- `GET /api/citas/fecha/:fecha` - Obtener citas por fecha [Auth]
- `POST /api/citas` - Crear nueva cita (con validación de solapamiento) [Auth]
- `PUT /api/citas/:id` - Actualizar cita [Auth]
- `PUT /api/citas/:id/cancelar` - Cancelar cita [Auth]
- `DELETE /api/citas/:id` - Eliminar cita [ADMIN]

**Leyenda:**
- [Público] - No requiere autenticación
- [Auth] - Requiere autenticación (CLIENTE o ADMINISTRADOR)
- [ADMIN] - Solo usuarios con rol ADMINISTRADOR

## Desarrollo

El servidor de desarrollo se inicia en `http://localhost:3000`

La interfaz web está disponible en `http://localhost:3000/index.html`

### Frontend Modular

El frontend está implementado en `/src/public` con arquitectura modular:

- **index.html** - Estructura HTML con todas las vistas
- **auth.js** - Módulo de autenticación (login/registro)
- **servicios.js** - Módulo de catálogo de servicios
- **citas.js** - Módulo de gestión de citas
- **app.js** - Módulo principal de navegación

**Vistas disponibles:**
- Login/Registro
- Catálogo de Servicios
- Formulario de Agendamiento de Citas
- Panel de Citas del Usuario
- Panel de Administración (solo admin)

Ver `FRONTEND_GUIDE.md` para documentación completa del frontend.

## Testing

Para ejecutar los tests:
```bash
npm test
```

Para ejecutar en modo watch:
```bash
npm run test:watch
```

## Prisma Studio

Para visualizar y editar los datos de la base de datos:
```bash
npm run prisma:studio
```

## Notas

- El proyecto sigue una arquitectura en capas (Controllers → Services → Repositories)
- Se manejan errores globalmente con un middleware personalizado
- Se usan DTOs para la transferencia de datos
- Se incluyen validaciones básicas en la capa de servicios
