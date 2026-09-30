# Documentación de Proyecto - Sistema de Gestión de Citas y Servicios

## Información del Proyecto

**Asignatura:** Calidad de Software (CUN)
**Autores:** Santiago Sabogal y John Ardila
**Estado:** Avance 70%

## Stack Tecnológico Implementado

- **Backend:** Node.js, Express, TypeScript
- **Base de Datos:** PostgreSQL con Prisma ORM v5
- **Frontend:** HTML5, CSS3 (Tailwind CSS via CDN), JavaScript modular (Fetch API)
- **Testing:** Jest y Supertest

## Estructura de Carpetas

```
sistema-citas-servicios/
├── src/
│   ├── config/           # Configuración de base de datos (Prisma)
│   ├── controllers/      # Controladores de Express
│   ├── services/         # Lógica de negocio
│   ├── repositories/     # Acceso a datos (Prisma)
│   ├── middlewares/      # Middlewares (manejo de errores global)
│   ├── models/           # Modelos de datos (types de Prisma)
│   ├── dtos/             # Data Transfer Objects
│   └── public/           # Archivos estáticos (HTML, CSS, JS)
├── prisma/
│   ├── schema.prisma     # Esquema de Prisma
│   └── migrations/       # Migraciones SQL
├── dist/                 # Código compilado (TypeScript → JavaScript)
├── node_modules/         # Dependencias
├── .env                  # Variables de entorno
├── tsconfig.json         # Configuración de TypeScript
├── jest.config.js        # Configuración de Jest
├── package.json          # Dependencias y scripts
└── README.md             # Documentación general
```

## Pasos de Configuración

### 1. Instalación de Dependencias

```bash
npm install
```

### 2. Configuración de Base de Datos

Editar el archivo `.env` con las credenciales de PostgreSQL:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/sistema_citas?schema=public"
PORT=3000
```

### 3. Creación de Base de Datos

Antes de ejecutar las migraciones, crear la base de datos en PostgreSQL:

```sql
CREATE DATABASE sistema_citas;
```

### 4. Ejecutar Migraciones

El archivo de migración SQL ya está creado en `prisma/migrations/20240930000000_init/migration.sql`

Para ejecutar las migraciones usando Prisma:

```bash
npm run prisma:migrate
```

O ejecutar el SQL directamente en PostgreSQL:

```bash
psql -U usuario -d sistema_citas -f prisma/migrations/20240930000000_init/migration.sql
```

### 5. Generar Cliente Prisma

```bash
npm run prisma:generate
```

## Scripts Disponibles

```bash
# Desarrollo (con recarga automática)
npm run dev

# Compilar TypeScript
npm run build

# Iniciar servidor en producción
npm start

# Ejecutar tests
npm test

# Tests en modo watch
npm run test:watch

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Abrir Prisma Studio (interfaz visual)
npm run prisma:studio
```

## Modelo de Datos

### Tabla: usuarios
- `id` (SERIAL, PK)
- `nombre` (TEXT, NOT NULL)
- `email` (TEXT, UNIQUE, NOT NULL)
- `telefono` (TEXT, nullable)
- `direccion` (TEXT, nullable)
- `creadoEn` (TIMESTAMP, DEFAULT NOW())
- `actualizadoEn` (TIMESTAMP, auto-update)

### Tabla: servicios
- `id` (SERIAL, PK)
- `nombre` (TEXT, NOT NULL)
- `descripcion` (TEXT, nullable)
- `duracion` (INTEGER, NOT NULL) - minutos
- `precio` (DECIMAL(10,2), NOT NULL)
- `activo` (BOOLEAN, DEFAULT true)
- `creadoEn` (TIMESTAMP, DEFAULT NOW())
- `actualizadoEn` (TIMESTAMP, auto-update)

### Tabla: citas
- `id` (SERIAL, PK)
- `fecha` (TIMESTAMP, NOT NULL)
- `estado` (TEXT, DEFAULT 'pendiente')
- `notas` (TEXT, nullable)
- `usuarioId` (INTEGER, FK → usuarios.id, ON DELETE CASCADE)
- `servicioId` (INTEGER, FK → servicios.id, ON DELETE CASCADE)
- `creadoEn` (TIMESTAMP, DEFAULT NOW())
- `actualizadoEn` (TIMESTAMP, auto-update)

### Índices
- `usuarios_email_key` (UNIQUE)
- `citas_usuarioId_idx`
- `citas_servicioId_idx`
- `citas_fecha_idx`

## API Endpoints

### Usuarios
- `GET /api/usuarios` - Listar todos
- `GET /api/usuarios/:id` - Obtener por ID
- `POST /api/usuarios` - Crear
- `PUT /api/usuarios/:id` - Actualizar
- `DELETE /api/usuarios/:id` - Eliminar

### Servicios
- `GET /api/servicios` - Listar activos
- `GET /api/servicios/:id` - Obtener por ID
- `POST /api/servicios` - Crear
- `PUT /api/servicios/:id` - Actualizar
- `DELETE /api/servicios/:id` - Eliminar

### Citas
- `GET /api/citas` - Listar todas
- `GET /api/citas/:id` - Obtener por ID
- `GET /api/citas/usuario/:usuarioId` - Por usuario
- `GET /api/citas/servicio/:servicioId` - Por servicio
- `GET /api/citas/fecha/:fecha` - Por fecha
- `POST /api/citas` - Crear
- `PUT /api/citas/:id` - Actualizar
- `DELETE /api/citas/:id` - Eliminar

## Middleware de Errores

El proyecto incluye un middleware global de errores (`ErrorMiddleware`) que:

- Captura errores de tipo `AppError` con código de estado personalizado
- Maneja errores no esperados con código 500
- Incluye stack trace en modo desarrollo
- Respuestas JSON consistentes

## Arquitectura

El proyecto sigue una arquitectura en capas:

1. **Controllers:** Manejan las peticiones HTTP y respuestas
2. **Services:** Contienen la lógica de negocio y validaciones
3. **Repositories:** Acceso a datos usando Prisma ORM
4. **DTOs:** Definen la estructura de datos de entrada/salida
5. **Models:** Tipos de TypeScript basados en Prisma

## Frontend

La interfaz web está en `src/public/`:

- `index.html` - Estructura HTML
- `app.js` - Lógica JavaScript con Fetch API
- Tailwind CSS via CDN para estilos

## Testing

Configuración de Jest en `jest.config.js`:

- Preset: ts-jest
- Entorno: node
- Cobertura de código activada
- Tests en archivos `*.test.ts` o `*.spec.ts`

## Notas Importantes

- El proyecto usa TypeScript con configuración estricta
- Se usa Prisma v5 (no v8 que tiene cambios en la CLI)
- Las migraciones están en SQL manual para mayor control
- Se incluye middleware de errores global
- Se usan DTOs para tipado fuerte
- Se siguen principios de Clean Architecture

## Próximos Pasos (Avance 70% → 100%)

- [x] Implementar autenticación y autorización (RBAC)
- [x] Módulo de Catálogo de Servicios (CRUD completo con validaciones)
- [x] Módulo de Citas y Lógica de Negocio (validación de solapamiento, SRP)
- [x] Frontend Modular (HTML/JS con Tailwind CSS)
- [x] Pruebas Unitarias (Jest) - CitaService con validación de solapamiento
- [ ] Implementar tests de integración con Supertest
- [ ] Agregar validación de datos con zod o similar
- [ ] Agregar documentación de API con Swagger
- [ ] Implementar paginación en endpoints
- [ ] Agregar filtros y búsqueda avanzada
- [ ] Implementar logging estructurado
- [ ] Agregar configuración de CORS
- [ ] Implementar rate limiting
- [ ] Deploy y configuración de producción

## Pruebas Unitarias (Jest) - CitaService (Implementado - Prompt 2.5)

### Características Implementadas

- **Suite de pruebas unitarias** para `CitaService`
- **Mocking de repositories** para aislar el service layer
- **Control de tiempo** con `jest.useFakeTimers()`
- **8 tests implementados** cubriendo casos de éxito y error
- **Tests requeridos:**
  - ✅ Agendamiento exitoso de una cita
  - ✅ Error 409 por solapamiento de horario (intento de agendar dos citas al mismo tiempo)

### Tests Implementados

#### 1. Agendamiento Exitoso
- Verifica agendamiento cuando no hay solapamiento
- Mock de usuario, servicio y citaRepository
- Valida llamadas a todos los repositories

#### 2. Error 404 - Usuario No Existe
- Verifica error cuando el usuario no existe
- Mock de usuarioRepository.findById (null)

#### 3. Error 404 - Servicio No Existe
- Verifica error cuando el servicio no existe
- Mock de servicioRepository.findById (null)

#### 4. Error 400 - Servicio Inactivo
- Verifica error cuando el servicio no está activo
- Mock de servicio con activo: false

#### 5. Error 400 - Fecha en el Pasado
- Verifica error cuando la fecha es en el pasado
- Control de tiempo con `jest.setSystemTime()`

#### 6. Error 409 - Solapamiento de Horarios ⭐ (REQUERIDO)
- Verifica error cuando hay solapamiento de horarios
- Cita existente: 10:00 - 10:30
- Nueva cita: 10:15 - 10:45 (solapamiento)
- Valida código 409 y mensaje específico

#### 7. Sin Solapamiento - Caso Límite
- Verifica agendamiento cuando cita termina antes de que empiece la nueva
- Cita existente: 10:00 - 10:30
- Nueva cita: 10:30 - 11:00 (NO hay solapamiento)

#### 8. Ignorar Citas Canceladas
- Verifica que citas canceladas no afecten validación
- Cita cancelada: 10:00 - 10:30
- Nueva cita: 10:15 - 10:45 (se solapa pero cita está cancelada)

### Archivo de Pruebas

- `src/services/__tests__/cita.service.test.ts` - Suite de tests de CitaService

### Resultados de Tests

```
PASS src/services/__tests__/cita.service.test.ts
  CitaService
    createCita
      ✓ debería agendar una cita exitosamente cuando no hay solapamiento
      ✓ debería lanzar error 404 cuando el usuario no existe
      ✓ debería lanzar error 404 cuando el servicio no existe
      ✓ debería lanzar error 400 cuando el servicio no está activo
      ✓ debería lanzar error 400 cuando la fecha es en el pasado
      ✓ debería lanzar error 409 cuando hay solapamiento de horarios
      ✓ debería permitir agendar cita cuando no hay solapamiento
      ✓ debería ignorar citas canceladas al validar solapamiento

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

### Patrones de Testing

- **Arrange-Act-Assert (AAA)** - Estructura estándar de tests
- **Mocking de Dependencies** - Aislamiento del service layer
- **Verificación de Errores** - `rejects.toThrow(AppError)`
- **Verificación de Llamadas** - `expect(repository.find).toHaveBeenCalledWith()`
- **Control de Tiempo** - `jest.useFakeTimers()` y `jest.setSystemTime()`

### Configuración de Jest

- Preset: ts-jest
- Environment: node
- Match pattern: `**/__tests__/**/*.ts` y `**/?(*.)+(spec|test).ts`
- Coverage configurado
- Verbose mode activado

### Comandos de Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar solo CitaService
npm test -- src/services/__tests__/cita.service.test.ts

# Ejecutar en modo watch
npm run test:watch

# Ejecutar con cobertura
npm test -- --coverage
```

### Documentación

- `TESTING_GUIDE.md` - Guía completa de pruebas
- Explicación de cada test
- Patrones de testing
- Ejemplos de mocking
- Mejoras futuras

## Frontend Modular (Implementado - Prompt 2.4)

### Características Implementadas

- **Arquitectura modular** con archivos JavaScript separados
- **Tailwind CSS** vía CDN para estilos
- **Vistas implementadas:**
  - Login/Registro con tabs
  - Catálogo de Servicios (grid responsive)
  - Formulario de Agendamiento de Citas
  - Panel de Citas del Usuario
  - Panel de Administración (solo admin)
- **Navegación SPA** sin recargar página
- **Gestión de estado** con localStorage
- **Integración completa** con API REST
- **Responsive design** con breakpoints de Tailwind

### Archivos del Frontend

- `src/public/index.html` - Estructura HTML con todas las vistas
- `src/public/auth.js` - Módulo de autenticación (login/registro)
- `src/public/servicios.js` - Módulo de catálogo de servicios
- `src/public/citas.js` - Módulo de gestión de citas
- `src/public/app.js` - Módulo principal de navegación
- `FRONTEND_GUIDE.md` - Guía completa del frontend

### Vistas Implementadas

#### 1. Vista de Login/Registro
- Formulario de login (email, contraseña)
- Formulario de registro (nombre, email, contraseña, teléfono, dirección)
- Tabs para cambiar entre login/registro
- Mensajes de error/éxito
- Redirección automática a servicios después de login

#### 2. Catálogo de Servicios
- Grid responsive de servicios
- Cards con información (nombre, descripción, duración, precio)
- Badge de estado (disponible/no disponible)
- Hover effects

#### 3. Formulario de Agendamiento de Citas
- Select de servicios (solo activos)
- Input datetime-local para fecha/hora
- Textarea para notas opcionales
- Validación de campos requeridos
- Manejo de errores de solapamiento

#### 4. Panel de Citas del Usuario
- Lista de citas del usuario actual
- Cards con información completa
- Badge de estado con colores
- Botón de cancelar (solo si está pendiente/confirmada)
- Confirmación antes de cancelar

#### 5. Panel de Administración
- Lista de todas las citas del sistema
- Información de usuario y servicio
- Badge de estado
- Botón de cancelar (admin puede cancelar cualquier cita)
- Solo visible para usuarios con rol ADMINISTRADOR

### Funcionalidades del Frontend

**Auth Module:**
- `initAuth()` - Inicializa desde localStorage
- `login()` - Inicia sesión
- `register()` - Registra nuevo usuario
- `logout()` - Cierra sesión
- `updateUI()` - Actualiza UI según estado
- `getAuthHeaders()` - Headers con token JWT
- `isAuthenticated()` - Verifica autenticación
- `isAdmin()` - Verifica rol de admin

**Servicios Module:**
- `loadServicios()` - Carga catálogo
- `loadServiciosSelect()` - Carga en select

**Citas Module:**
- `agendarCita()` - Crea nueva cita
- `loadMisCitas()` - Cita del usuario
- `cancelarCita()` - Cancela cita
- `loadAdminCitas()` - Todas las citas (admin)
- `cancelarCitaAdmin()` - Cancela cualquier cita (admin)

**App Module:**
- `navigate(view)` - Navega entre vistas
- `showMessage()` - Muestra mensajes
- `initApp()` - Inicializa aplicación

### Consumo de API

**Endpoints utilizados:**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `GET /api/servicios` - Listar servicios
- `POST /api/citas` - Crear cita
- `GET /api/citas/mis-citas` - Citas del usuario
- `PUT /api/citas/:id/cancelar` - Cancelar cita
- `GET /api/citas/todas` - Todas las citas (admin)

### Gestión de Estado

- Token JWT en `localStorage`
- Usuario actual en `localStorage`
- Variables globales: `currentUser`, `authToken`
- Persistencia entre sesiones

### Estilos con Tailwind CSS

- Layout responsive con grid y flexbox
- Cards con hover effects
- Botones con estados hover
- Inputs con focus states
- Badges de estado con colores
- Mensajes de error/éxito

### Documentación

- `FRONTEND_GUIDE.md` - Guía completa del frontend
- Documentación de arquitectura modular
- Ejemplos de uso
- Testing manual
- Mejoras futuras

## Módulo de Citas y Lógica de Negocio (Implementado - Prompt 2.3)

### Características Implementadas

- **Validación estricta de solapamiento de horarios** (SRP)
- **Endpoint POST /api/citas** - Crear cita con validación (Cliente/Admin)
- **Endpoint GET /api/citas/mis-citas** - Citas del usuario actual (Cliente)
- **Endpoint PUT /api/citas/:id/cancelar** - Cancelar cita (Cliente/Admin)
- **Endpoint GET /api/citas/todas** - Todas las citas (Admin)
- **Enum CitaEstado** - Type safety para estados
- **Validación de permisos** - Solo dueño o admin pueden cancelar
- **Re-validación en actualizaciones** - Solapamiento al cambiar fecha/servicio

### Endpoints de Citas

- `POST /api/citas` - Crear cita con validación de solapamiento [Auth]
- `GET /api/citas/mis-citas` - Listar citas del usuario actual [Auth]
- `PUT /api/citas/:id/cancelar` - Cancelar cita [Auth]
- `GET /api/citas/todas` - Listar todas las citas [ADMIN]
- `GET /api/citas` - Listar citas [Auth]
- `GET /api/citas/:id` - Obtener cita por ID [Auth]
- `PUT /api/citas/:id` - Actualizar cita [Auth]
- `DELETE /api/citas/:id` - Eliminar cita [ADMIN]

### Lógica de Validación de Solapamiento (SRP)

**Principio SRP Aplicado:** La lógica de validación de cruce de agendas reside exclusivamente en el `CitaService`:

```typescript
private async validateNoOverlap(
  servicioId: number,
  fecha: Date,
  duracion: number,
  excludeCitaId?: number
): Promise<void>
```

**Algoritmo:**
1. Calcular rango de tiempo (inicio: fecha, fin: fecha + duración)
2. Validar que la fecha sea futura
3. Obtener citas existentes del mismo servicio en el día
4. Excluir citas canceladas
5. Detectar solapamiento:
   - Nueva cita empieza antes de que termine la existente
   - Y nueva cita termina después de que empiece la existente

### Estados de Cita (Enum)

- `PENDIENTE` - Cita agendada pero no confirmada
- `CONFIRMADA` - Cita confirmada
- `CANCELADA` - Cita cancelada
- `COMPLETADA` - Cita completada

### Validaciones Implementadas

- Usuario debe existir
- Servicio debe existir y estar activo
- Fecha debe ser futura
- No solapamiento de horarios para el mismo servicio
- Solo el dueño o admin pueden cancelar
- No cancelar citas ya canceladas
- No cancelar citas completadas

### Archivos del Módulo

- `src/dtos/cita.dto.ts` - DTOs con enum CitaEstado
- `src/repositories/cita.repository.ts` - Repository existente
- `src/services/cita.service.ts` - Service con lógica de negocio (SRP)
- `src/controllers/cita.controller.ts` - Controller con nuevos endpoints
- `CITAS_GUIDE.md` - Guía completa del módulo

### Mejoras Realizadas

1. Agregado método `validateNoOverlap()` en Service layer (SRP)
2. Agregado endpoint `/api/citas/mis-citas` para clientes
3. Agregado endpoint `/api/citas/:id/cancelar` con validación de permisos
4. Agregado endpoint `/api/citas/todas` para administradores
5. Implementado enum `CitaEstado` para type safety
6. Re-validación de solapamiento en actualizaciones
7. Documentación completa en CITAS_GUIDE.md

## Módulo de Catálogo de Servicios (Mejorado - Prompt 2.2)

### Características Implementadas

- **CRUD completo** de servicios
- **Validaciones** en la capa de servicios
- **Estado activo/inactivo** para soft delete
- **Query params** para incluir servicios inactivos (admin)
- **Protección por roles** (lectura pública, escritura admin)

### Endpoints de Servicios

- `GET /api/servicios` - Listar servicios activos (público)
- `GET /api/servicios/all` - Listar todos los servicios (incluyendo inactivos) [ADMIN]
- `GET /api/servicios/:id` - Obtener servicio por ID (público)
- `POST /api/servicios` - Crear nuevo servicio [ADMIN]
- `PUT /api/servicios/:id` - Actualizar servicio [ADMIN]
- `DELETE /api/servicios/:id` - Eliminar servicio [ADMIN]

### Modelo de Datos

- `id` (autoincrement)
- `nombre` (requerido)
- `descripcion` (opcional)
- `duracion` (minutos, requerido, > 0)
- `precio` (decimal, requerido, > 0)
- `activo` (boolean, default: true)
- `creadoEn` (timestamp)
- `actualizadoEn` (timestamp auto-update)

### Validaciones Implementadas

- Nombre no puede estar vacío
- Duración debe ser mayor a 0
- Precio debe ser mayor a 0
- Validaciones en create y update

### Archivos del Módulo

- `src/dtos/servicio.dto.ts` - DTOs de servicios
- `src/repositories/servicio.repository.ts` - Repository con filtro de activos
- `src/services/servicio.service.ts` - Service con validaciones
- `src/controllers/servicio.controller.ts` - Controller con query params
- `SERVICIOS_GUIDE.md` - Guía completa del módulo

### Mejoras Realizadas

1. Agregado parámetro `includeInactive` en repository
2. Validaciones de negocio en service layer
3. Query param `?inactive=true` para listar inactivos
4. Endpoint `/api/servicios/all` para administradores
5. Documentación completa en SERVICIOS_GUIDE.md

## Módulo de Autenticación (Implementado - Prompt 2.1)

### Características Implementadas

- **Hash de contraseñas:** bcrypt con costo 10
- **Tokens JWT:** Expirables (24h por defecto)
- **Roles:** CLIENTE y ADMINISTRADOR
- **Middlewares de autenticación y autorización**

### Endpoints de Autenticación

- `POST /api/auth/register` - Registro de nuevos usuarios (público)
- `POST /api/auth/login` - Inicio de sesión (público)
- `GET /api/auth/me` - Obtener usuario actual (requiere token)

### Middleware de Autenticación

- `authenticate` - Verifica token JWT y agrega usuario al request
- `authorize(...roles)` - Verifica que el usuario tenga el rol requerido
- `requireAdmin` - Solo permite acceso a ADMINISTRADOR
- `requireClient` - Solo permite acceso a CLIENTE
- `requireAnyRole` - Permite acceso a CLIENTE o ADMINISTRADOR

### Protección de Rutas

- **Usuarios:** Lectura/escritura solo para ADMINISTRADOR
- **Servicios:** Lectura pública, escritura solo para ADMINISTRADOR
- **Citas:** Todas las operaciones requieren autenticación (CLIENTE o ADMINISTRADOR)

### Cambios en el Modelo de Datos

- Agregado campo `password` a la tabla `usuarios`
- Agregado campo `rol` (enum: CLIENTE, ADMINISTRADOR) a la tabla `usuarios`
- Migración SQL creada en `prisma/migrations/20240930000001_add_auth/`

### Archivos Nuevos

- `src/dtos/auth.dto.ts` - DTOs para autenticación
- `src/repositories/auth.repository.ts` - Repository de autenticación
- `src/services/auth.service.ts` - Service de autenticación
- `src/controllers/auth.controller.ts` - Controller de autenticación
- `src/middlewares/auth.middleware.ts` - Middlewares de auth y RBAC

### Variables de Entorno

- `JWT_SECRET` - Clave secreta para firmar tokens (32+ caracteres recomendado)
- `JWT_EXPIRES_IN` - Tiempo de expiración del token (default: 24h)
