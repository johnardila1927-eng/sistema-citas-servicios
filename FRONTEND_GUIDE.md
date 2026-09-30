# Guía del Frontend Modular

## Resumen del Frontend

Frontend modular implementado en `/src/public` usando HTML5, Tailwind CSS (vía CDN) y JavaScript modular para consumir la API REST del sistema.

## Estructura de Archivos

```
/src/public/
├── index.html       - Estructura HTML principal con todas las vistas
├── auth.js          - Módulo de autenticación (login/registro)
├── servicios.js     - Módulo de catálogo de servicios
├── citas.js         - Módulo de gestión de citas
└── app.js           - Módulo principal de navegación
```

## Arquitectura Modular

### 1. auth.js - Módulo de Autenticación

**Funciones:**
- `initAuth()` - Inicializa desde localStorage
- `login()` - Inicia sesión
- `register()` - Registra nuevo usuario
- `logout()` - Cierra sesión
- `updateUI()` - Actualiza UI según estado de autenticación
- `showTab()` - Cambia entre login/registro
- `getAuthHeaders()` - Retorna headers con token JWT
- `isAuthenticated()` - Verifica si está autenticado
- `isAdmin()` - Verifica si es administrador

**Estado Global:**
- `currentUser` - Usuario autenticado actual
- `authToken` - Token JWT actual

**Persistencia:**
- Token en `localStorage.getItem('authToken')`
- Usuario en `localStorage.getItem('currentUser')`

### 2. servicios.js - Módulo de Servicios

**Funciones:**
- `loadServicios()` - Carga y muestra catálogo de servicios
- `loadServiciosSelect()` - Carga servicios en select para agendar

**Consumo de API:**
- `GET /api/servicios` - Listar servicios activos

### 3. citas.js - Módulo de Citas

**Funciones:**
- `agendarCita()` - Crea nueva cita con validación
- `loadMisCitas()` - Carga citas del usuario actual
- `cancelarCita()` - Cancela cita del usuario
- `loadAdminCitas()` - Carga todas las citas (admin)
- `cancelarCitaAdmin()` - Cancela cualquier cita (admin)
- `getEstadoClass()` - Retorna clase CSS según estado

**Consumo de API:**
- `POST /api/citas` - Crear cita
- `GET /api/citas/mis-citas` - Citas del usuario
- `PUT /api/citas/:id/cancelar` - Cancelar cita
- `GET /api/citas/todas` - Todas las citas (admin)

### 4. app.js - Módulo Principal

**Funciones:**
- `navigate(view)` - Navega entre vistas
- `showMessage()` - Muestra mensajes genéricos
- `initApp()` - Inicializa aplicación

## Vistas Implementadas

### 1. Vista de Login/Registro

**Ruta:** `#login`

**Características:**
- Formulario de login (email, contraseña)
- Formulario de registro (nombre, email, contraseña, teléfono, dirección)
- Tabs para cambiar entre login/registro
- Mensajes de error/éxito
- Redirección automática a servicios después de login exitoso

**Validaciones:**
- Campos requeridos en login
- Campos requeridos en registro (nombre, email, contraseña)
- Manejo de errores de API

### 2. Catálogo de Servicios

**Ruta:** `#servicios`

**Características:**
- Grid responsive de servicios
- Cards con información de servicio
- Nombre, descripción, duración, precio
- Badge de estado (disponible/no disponible)
- Hover effects

**API:**
- `GET /api/servicios` - Obtiene servicios activos

### 3. Formulario de Agendamiento de Citas

**Ruta:** `#agendar`

**Características:**
- Select de servicios (solo activos)
- Input datetime-local para fecha/hora
- Textarea para notas opcionales
- Validación de campos requeridos
- Mensajes de error/éxito
- Redirección a mis citas después de agendar

**API:**
- `GET /api/servicios` - Carga servicios en select
- `POST /api/citas` - Crea nueva cita

**Validaciones:**
- Servicio seleccionado
- Fecha/hora proporcionada
- Manejo de errores de solapamiento (409)

### 4. Panel de Citas del Usuario

**Ruta:** `#mis-citas`

**Características:**
- Lista de citas del usuario actual
- Cards con información de cita
- Fecha, servicio, notas
- Badge de estado con colores
- Botón de cancelar (solo si está pendiente/confirmada)
- Confirmación antes de cancelar

**API:**
- `GET /api/citas/mis-citas` - Obtiene citas del usuario
- `PUT /api/citas/:id/cancelar` - Cancela cita

**Estados y Colores:**
- PENDIENTE: Amarillo
- CONFIRMADA: Azul
- CANCELADA: Rojo
- COMPLETADA: Verde

### 5. Panel de Administración - Citas

**Ruta:** `#admin-citas`

**Características:**
- Lista de todas las citas del sistema
- Cards con información completa
- Usuario (nombre, email)
- Servicio, fecha, notas
- Badge de estado
- Botón de cancelar (admin puede cancelar cualquier cita)
- Solo visible para usuarios con rol ADMINISTRADOR

**API:**
- `GET /api/citas/todas` - Obtiene todas las citas
- `PUT /api/citas/:id/cancelar` - Cancela cita

## Navegación

### Botones de Navegación

```html
<button onclick="navigate('login')">Login/Registro</button>
<button onclick="navigate('servicios')">Servicios</button>
<button onclick="navigate('agendar')">Agendar Cita</button>
<button onclick="navigate('mis-citas')">Mis Citas</button>
<button onclick="navigate('admin-citas')">Panel Admin</button>
<button onclick="logout()">Cerrar Sesión</button>
```

### Protección de Rutas

- **Login/Registro:** Público
- **Servicios:** Requiere autenticación
- **Agendar Cita:** Requiere autenticación
- **Mis Citas:** Requiere autenticación
- **Panel Admin:** Requiere autenticación + rol ADMINISTRADOR

## Gestión de Estado

### LocalStorage

```javascript
// Guardar token
localStorage.setItem('authToken', token);

// Guardar usuario
localStorage.setItem('currentUser', JSON.stringify(user));

// Recuperar token
const token = localStorage.getItem('authToken');

// Recuperar usuario
const user = JSON.parse(localStorage.getItem('currentUser'));

// Limpiar
localStorage.removeItem('authToken');
localStorage.removeItem('currentUser');
```

### Variables Globales

```javascript
let currentUser = null;  // Usuario autenticado
let authToken = null;    // Token JWT
```

## Consumo de API

### Función de Headers

```javascript
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
    };
}
```

### Ejemplo de Request

```javascript
const response = await fetch(`${API_URL}/citas`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
        servicioId: 1,
        usuarioId: currentUser.id,
        fecha: new Date(fecha).toISOString(),
        estado: 'pendiente',
    }),
});

const data = await response.json();
```

## Manejo de Errores

### Errores de Validación

```javascript
if (!email || !password) {
    showMessage(messageDiv, 'Por favor complete todos los campos', 'error');
    return;
}
```

### Errores de API

```javascript
if (response.ok) {
    // Éxito
} else {
    const data = await response.json();
    showMessage(messageDiv, data.message || 'Error', 'error');
}
```

### Errores de Conexión

```javascript
try {
    const response = await fetch(...);
} catch (error) {
    console.error('Error:', error);
    showMessage(messageDiv, 'Error de conexión', 'error');
}
```

## Estilos con Tailwind CSS

### Clases Principales

**Layout:**
- `container mx-auto px-4 py-8` - Contenedor centrado
- `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Grid responsive
- `flex justify-between items-start` - Flexbox

**Cards:**
- `bg-white rounded-lg shadow p-6` - Card básico
- `hover:shadow-md transition` - Hover effect

**Botones:**
- `px-4 py-2 bg-blue-500 text-white rounded` - Botón azul
- `hover:bg-blue-600 transition` - Hover effect
- `w-full` - Botón completo

**Inputs:**
- `w-full px-3 py-2 border rounded-lg` - Input básico
- `focus:outline-none focus:ring-2 focus:ring-blue-500` - Focus

**Badges:**
- `inline-block px-2 py-1 text-xs rounded` - Badge básico
- `bg-green-100 text-green-800` - Badge verde

**Mensajes:**
- `text-green-600` - Éxito
- `text-red-500` - Error
- `text-gray-500` - Neutral

## Flujo de Usuario

### 1. Registro/Login

1. Usuario accede a la aplicación
2. Ve vista de login/registro
3. Selecciona tab (login o registro)
4. Completa formulario
5. Envía request a API
6. Si exitoso, guarda token y usuario en localStorage
7. Redirige a vista de servicios

### 2. Ver Servicios

1. Usuario navega a "Servicios"
2. Frontend llama `loadServicios()`
3. Request a `GET /api/servicios`
4. Renderiza grid de servicios
5. Usuario puede ver información de cada servicio

### 3. Agendar Cita

1. Usuario navega a "Agendar Cita"
2. Frontend carga servicios en select
3. Usuario selecciona servicio
4. Usuario selecciona fecha/hora
5. Usuario agrega notas opcionales
6. Envía request a `POST /api/citas`
7. Si exitoso, redirige a "Mis Citas"
8. Si hay solapamiento, muestra error

### 4. Ver Mis Citas

1. Usuario navega a "Mis Citas"
2. Frontend llama `loadMisCitas()`
3. Request a `GET /api/citas/mis-citas`
4. Renderiza lista de citas
5. Usuario puede cancelar citas pendientes/confirmadas

### 5. Panel Admin

1. Admin navega a "Panel Admin"
2. Frontend llama `loadAdminCitas()`
3. Request a `GET /api/citas/todas`
4. Renderiza todas las citas del sistema
5. Admin puede cancelar cualquier cita

## Responsive Design

### Breakpoints

- **Mobile:** `grid-cols-1` (1 columna)
- **Tablet:** `md:grid-cols-2` (2 columnas)
- **Desktop:** `lg:grid-cols-3` (3 columnas)

### Navegación Móvil

- `flex-wrap gap-2` - Botones se ajustan en móvil
- `w-full` - Botones ocupan ancho completo en móvil

## Seguridad

### Token JWT

- Token almacenado en localStorage
- Incluido en header `Authorization: Bearer <token>`
- Verificado en cada request

### Protección de Rutas

- Verificación de autenticación antes de cargar vistas
- Verificación de rol para vista de admin
- Redirección a login si no está autenticado

## Testing Manual

### 1. Registrar Usuario

1. Navega a la aplicación
2. Selecciona tab "Registro"
3. Completa formulario:
   - Nombre: Test User
   - Email: test@example.com
   - Contraseña: test123
   - Teléfono: +57 300 123 4567
   - Dirección: Calle 123
4. Click en "Registrarse"
5. Verifica redirección a servicios

### 2. Ver Servicios

1. Click en "Servicios"
2. Verifica que se muestren los servicios
3. Verifica información de cada servicio
4. Verifica badges de estado

### 3. Agendar Cita

1. Click en "Agendar Cita"
2. Selecciona servicio del select
3. Selecciona fecha/hora futura
4. Agrega notas opcionales
5. Click en "Agendar Cita"
6. Verifica redirección a "Mis Citas"

### 4. Ver Mis Citas

1. Click en "Mis Citas"
2. Verifica que se muestre la cita creada
3. Verifica badge de estado
4. Click en "Cancelar"
5. Confirma cancelación
6. Verifica que el estado cambie a "CANCELADA"

### 5. Panel Admin

1. Logout
2. Login como admin (crear usuario admin primero)
3. Click en "Panel Admin"
4. Verifica que se muestren todas las citas
5. Verifica información de usuario y servicio
6. Cancela una cita de otro usuario
7. Verifica que se pueda cancelar

## Notas de Diseño

1. **Modularidad:** Cada funcionalidad en su propio archivo JS
2. **Single Page Application:** Navegación sin recargar página
3. **State Management:** Variables globales + localStorage
4. **API Integration:** Fetch API con async/await
5. **Error Handling:** Try/catch + mensajes visuales
6. **Responsive:** Tailwind CSS breakpoints
7. **User Experience:** Confirmaciones, redirecciones, mensajes
8. **Security:** JWT en headers, verificación de roles

## Mejoras Futuras

- [ ] Agregar loader/spinner durante requests
- [ ] Implementar refresh de token
- [ ] Agregar paginación en listas
- [ ] Implementar filtros de búsqueda
- [ ] Agregar notificaciones toast
- [ ] Implementar modo offline
- [ ] Agregar testing E2E con Cypress
- [ ] Optimizar para móvil (PWA)
- [ ] Agregar tema oscuro
- [ ] Implementar internacionalización (i18n)
