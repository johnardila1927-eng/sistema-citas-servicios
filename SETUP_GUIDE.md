# Guía de Ejecución del Proyecto

## Requisitos Previos

### 1. Node.js y npm
Asegúrate de tener Node.js instalado (v16 o superior):
```bash
node --version
npm --version
```

### 2. PostgreSQL
Necesitas PostgreSQL instalado y corriendo en tu máquina.

**Opción A: PostgreSQL Local**
- Descargar e instalar desde: https://www.postgresql.org/download/
- Durante la instalación, configura:
  - Puerto: 5432
  - Usuario: postgres (o el que prefieras)
  - Contraseña: (configura una)
  - Puerto: 5432

**Opción B: Docker (Recomendado)**
```bash
docker run --name postgres-sistema-citas \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=sistema_citas \
  -p 5432:5432 \
  -d postgres
```

## Pasos de Configuración

### Paso 1: Instalar Dependencias
```bash
cd sistema-citas-servicios
npm install
```

### Paso 2: Configurar Base de Datos

#### Si usas PostgreSQL Local:
1. Abre pgAdmin o psql
2. Crea la base de datos:
```sql
CREATE DATABASE sistema_citas;
```

#### Si usas Docker:
La base de datos se crea automáticamente con el comando de arriba.

### Paso 3: Actualizar .env con tus credenciales

Edita el archivo `.env`:
```env
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/sistema_citas?schema=public"
PORT=3000
JWT_SECRET=cambia-esto-por-una-clave-secreta-mas-segura-minimo-32-caracteres
JWT_EXPIRES_IN=24h
```

**Importante:** Cambia `TU_USUARIO` y `TU_PASSWORD` por tus credenciales reales de PostgreSQL.

### Paso 4: Ejecutar Migraciones

El proyecto tiene migraciones SQL ya creadas. Puedes ejecutarlas de dos formas:

#### Opción A: Ejecutar SQL directamente
```bash
psql -U TU_USUARIO -d sistema_citas -f prisma/migrations/20240930000000_init/migration.sql
psql -U TU_USUARIO -d sistema_citas -f prisma/migrations/20240930000001_add_auth/migration.sql
```

#### Opción B: Usar Prisma Migrate
```bash
npm run prisma:migrate
```

**Nota:** Si usas Prisma migrate, puede pedirte crear un nuevo migration. En ese caso, cancela y usa la opción A.

### Paso 5: Generar Cliente Prisma
```bash
npm run prisma:generate
```

### Paso 6: Compilar TypeScript
```bash
npm run build
```

### Paso 7: Iniciar el Servidor

#### Opción A: Modo Desarrollo (con recarga automática)
```bash
npm run dev
```

#### Opción B: Modo Producción
```bash
npm start
```

## Verificar que Funciona

### 1. Verificar Salud del Servidor
Abre tu navegador y visita:
```
http://localhost:3000/health
```

Deberías ver:
```json
{
  "status": "ok",
  "message": "Sistema de Citas y Servicios - API funcionando"
}
```

### 2. Acceder al Frontend
Abre tu navegador y visita:
```
http://localhost:3000/index.html
```

Deberías ver la interfaz web con:
- Formulario de Login/Registro
- Navegación entre vistas
- Estilos con Tailwind CSS

### 3. Probar la API con cURL

#### Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Usuario Test",
    "email": "test@example.com",
    "password": "test123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

Deberías recibir un token JWT en la respuesta.

## Problemas Comunes y Soluciones

### Error: "Connection refused" al conectar a PostgreSQL
**Solución:**
- Verifica que PostgreSQL esté corriendo
- Verifica que el puerto 5432 esté disponible
- Verifica tus credenciales en .env

### Error: "Database does not exist"
**Solución:**
- Crea la base de datos en PostgreSQL:
```sql
CREATE DATABASE sistema_citas;
```

### Error: "relation does not exist"
**Solución:**
- Ejecuta las migraciones SQL:
```bash
psql -U TU_USUARIO -d sistema_citas -f prisma/migrations/20240930000000_init/migration.sql
psql -U TU_USUARIO -d sistema_citas -f prisma/migrations/20240930000001_add_auth/migration.sql
```

### Error: "Prisma Client not generated"
**Solución:**
```bash
npm run prisma:generate
```

### Error: "Module not found"
**Solución:**
```bash
npm install
```

### Error: "Cannot find module"
**Solución:**
```bash
npm run build
```

## Ver Datos con Prisma Studio

Para visualizar y editar los datos de la base de datos:
```bash
npm run prisma:studio
```

Esto abrirá una interfaz web en `http://localhost:5555` donde podrás:
- Ver tablas y datos
- Crear usuarios
- Crear servicios
- Crear citas
- Editar registros

## Ejecutar Tests

Para ejecutar las pruebas unitarias:
```bash
npm test
```

Para ejecutar solo los tests de CitaService:
```bash
npm test -- src/services/__tests__/cita.service.test.ts
```

## Crear Datos de Prueba

### Crear Usuario Administrador Manualmente

1. Abre Prisma Studio:
```bash
npm run prisma:studio
```

2. Ve a la tabla `usuarios`
3. Crea un nuevo registro:
   - nombre: Admin
   - email: admin@example.com
   - password: [Genera hash con bcrypt]
   - rol: ADMINISTRADOR

**Generar hash de contraseña:**
```javascript
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('admin123', 10);
console.log(hash);
```

### Crear Servicios de Prueba

En Prisma Studio, ve a la tabla `servicios` y crea:
- Corte de Cabello (30 min, $25.00)
- Manicura (45 min, $30.00)
- Pediluvio (30 min, $20.00)

## Flujo Completo de Prueba

1. **Iniciar PostgreSQL**
   - Docker: `docker run ...` (si no está corriendo)
   - Local: Asegúrate que el servicio esté iniciado

2. **Iniciar el Servidor**
   ```bash
   npm run dev
   ```

3. **Abrir el Frontend**
   - Navega a `http://localhost:3000/index.html`

4. **Registrar Usuario**
   - Llena el formulario de registro
   - Click en "Registrarse"

5. **Ver Servicios**
   - Navega a la vista de Servicios
   - Verifica que se muestren los servicios

6. **Agendar Cita**
   - Navega a "Agendar Cita"
   - Selecciona un servicio
   - Selecciona una fecha futura
   - Click en "Agendar Cita"

7. **Ver Mis Citas**
   - Navega a "Mis Citas"
   - Verifica que la cita creada aparezca
   - Prueba cancelar la cita

8. **Probar Solapamiento**
   - Intenta agendar otra cita en el mismo horario
   - Deberías ver un error de solapamiento

## Estructura de Directorios Final

```
sistema-citas-servicios/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── cita.controller.ts
│   │   ├── servicio.controller.ts
│   │   └── usuario.controller.ts
│   ├── dtos/
│   │   ├── auth.dto.ts
│   │   ├── cita.dto.ts
│   │   ├── servicio.dto.ts
│   │   └── usuario.dto.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── errorMiddleware.ts
│   ├── models/
│   │   ├── cita.model.ts
│   │   ├── servicio.model.ts
│   │   └── usuario.model.ts
│   ├── public/
│   │   ├── index.html
│   │   ├── auth.js
│   │   ├── servicios.js
│   │   ├── citas.js
│   │   └── app.js
│   ├── repositories/
│   │   ├── auth.repository.ts
│   │   ├── cita.repository.ts
│   │   ├── servicio.repository.ts
│   │   └── usuario.repository.ts
│   ├── services/
│   │   ├── __tests__/
│   │   │   └── cita.service.test.ts
│   │   ├── auth.service.ts
│   │   ├── cita.service.ts
│   │   ├── servicio.service.ts
│   │   └── usuario.service.ts
│   └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       ├── 20240930000000_init/
│       │   └── migration.sql
│       └── 20240930000001_add_auth/
│           └── migration.sql
├── dist/ (generado por build)
├── node_modules/
├── .env
├── .gitignore
├── AGENTS.md
├── AUTH_GUIDE.md
├── CITAS_GUIDE.md
├── FRONTEND_GUIDE.md
├── jest.config.js
├── package.json
├── README.md
├── SERVICIOS_GUIDE.md
├── SETUP_GUIDE.md
├── TESTING_GUIDE.md
└── tsconfig.json
```

## Resumen de Comandos

```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npm run prisma:generate

# Ejecutar migraciones
psql -U TU_USUARIO -d sistema_citas -f prisma/migrations/20240930000000_init/migration.sql
psql -U TU_USUARIO -d sistema_citas -f prisma/migrations/20240930000001_add_auth/migration.sql

# Compilar TypeScript
npm run build

# Iniciar servidor (desarrollo)
npm run dev

# Iniciar servidor (producción)
npm start

# Ejecutar tests
npm test

# Prisma Studio
npm run prisma:studio
```

## Siguiente Paso

Una vez que el servidor esté corriendo, puedes:
1. Abrir `http://localhost:3000/index.html` en tu navegador
2. Registrar un usuario
3. Probar agendar citas
4. Verificar la validación de solapamiento
5. Probar el panel de administración (si creas un usuario admin)

## Notas Importantes

1. **PostgreSQL debe estar corriendo** antes de iniciar el servidor
2. **Las migraciones SQL deben ejecutarse** antes de usar la aplicación
3. **El cliente Prisma debe generarse** después de cambios en schema.prisma
4. **TypeScript debe compilarse** antes de iniciar en producción
5. **El archivo .env debe configurarse** con tus credenciales reales
