# Guía de Pruebas Unitarias (Jest)

## Resumen de Pruebas

Suite de pruebas unitarias implementada con Jest para el `CitaService`, probando el agendamiento exitoso y el error por solapamiento de horarios.

## Configuración de Jest

**Archivo:** `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
};
```

## Archivo de Pruebas

**Archivo:** `src/services/__tests__/cita.service.test.ts`

### Tests Implementados

#### 1. Agendamiento Exitoso
**Test:** `debería agendar una cita exitosamente cuando no hay solapamiento`

**Propósito:** Verifica que se pueda agendar una cita cuando no hay conflictos de horario.

**Arrange:**
- Mock de usuario existente
- Mock de servicio activo
- Mock de citaRepository.findByFecha (no hay citas existentes)
- Mock de citaRepository.create (cita creada exitosamente)

**Act:**
- Llama a `citaService.createCita()` con datos válidos

**Assert:**
- Verifica que se llame a usuarioRepository.findById
- Verifica que se llame a servicioRepository.findById
- Verifica que se llame a citaRepository.findByFecha
- Verifica que se llame a citaRepository.create
- Verifica que se retorne la cita creada

#### 2. Error 404 - Usuario No Existe
**Test:** `debería lanzar error 404 cuando el usuario no existe`

**Propósito:** Verifica que se lance error cuando el usuario no existe.

**Arrange:**
- Mock de usuarioRepository.findById (retorna null)

**Act:**
- Llama a `citaService.createCita()` con usuarioId inexistente

**Assert:**
- Verifica que se lance AppError
- Verifica que el mensaje sea 'Usuario no encontrado'

#### 3. Error 404 - Servicio No Existe
**Test:** `debería lanzar error 404 cuando el servicio no existe`

**Propósito:** Verifica que se lance error cuando el servicio no existe.

**Arrange:**
- Mock de usuario existente
- Mock de servicioRepository.findById (retorna null)

**Act:**
- Llama a `citaService.createCita()` con servicioId inexistente

**Assert:**
- Verifica que se lance AppError
- Verifica que el mensaje sea 'Servicio no encontrado'

#### 4. Error 400 - Servicio Inactivo
**Test:** `debería lanzar error 400 cuando el servicio no está activo`

**Propósito:** Verifica que se lance error cuando el servicio no está activo.

**Arrange:**
- Mock de usuario existente
- Mock de servicio inactivo (activo: false)

**Act:**
- Llama a `citaService.createCita()` con servicio inactivo

**Assert:**
- Verifica que se lance AppError
- Verifica que el mensaje sea 'El servicio no está activo'

#### 5. Error 400 - Fecha en el Pasado
**Test:** `debería lanzar error 400 cuando la fecha es en el pasado`

**Propósito:** Verifica que se lance error cuando la fecha es en el pasado.

**Arrange:**
- Mock de usuario existente
- Mock de servicio activo
- Fecha: 2020-01-01 (pasado)

**Act:**
- Llama a `citaService.createCita()` con fecha en el pasado

**Assert:**
- Verifica que se lance AppError
- Verifica que el mensaje sea 'No se pueden agendar citas en el pasado'

#### 6. Error 409 - Solapamiento de Horarios ⭐
**Test:** `debería lanzar error 409 cuando hay solapamiento de horarios`

**Propósito:** Verifica que se lance error cuando hay solapamiento de horarios (caso principal requerido).

**Arrange:**
- Mock de usuario existente
- Mock de servicio activo (duración: 30 minutos)
- Mock de cita existente: 10:00 - 10:30
- Nueva cita: 10:15 - 10:45 (solapamiento)

**Act:**
- Llama a `citaService.createCita()` con fecha que se solapa

**Assert:**
- Verifica que se lance AppError
- Verifica que el código sea 409 (Conflict)
- Verifica que el mensaje sea 'Ya existe una cita agendada para este servicio en el horario seleccionado'

**Visualización del Solapamiento:**
```
Cita Existente: 10:00 ────────── 10:30
                           ║
Nueva Cita:       10:15 ────────── 10:45
                           ║
                    SOLAPAMIENTO
```

#### 7. Sin Solapamiento - Caso Límite
**Test:** `debería permitir agendar cita cuando no hay solapamiento (cita termina antes de que empiece la nueva)`

**Propósito:** Verifica que se permita agendar cuando una cita termina justo antes de que empiece la nueva.

**Arrange:**
- Mock de cita existente: 10:00 - 10:30
- Nueva cita: 10:30 - 11:00 (NO hay solapamiento)

**Act:**
- Llama a `citaService.createCita()` con fecha que no se solapa

**Assert:**
- Verifica que se agende exitosamente
- Verifica que se llame a citaRepository.create

**Visualización del Caso Límite:**
```
Cita Existente: 10:00 ────────── 10:30
                                      ║
Nueva Cita:                        10:30 ────────── 11:00
                                      ║
                                    NO SOLAPAMIENTO
```

#### 8. Ignorar Citas Canceladas
**Test:** `debería ignorar citas canceladas al validar solapamiento`

**Propósito:** Verifica que las citas canceladas no afecten la validación de solapamiento.

**Arrange:**
- Mock de cita cancelada: 10:00 - 10:30 (estado: CANCELADA)
- Nueva cita: 10:15 - 10:45 (se solaparía si no estuviera cancelada)

**Act:**
- Llama a `citaService.createCita()` con fecha que se solapa con cita cancelada

**Assert:**
- Verifica que se agende exitosamente
- Verifica que se llame a citaRepository.create

**Visualización:**
```
Cita Cancelada: 10:00 ────────── 10:30 (ignorada)
                           ║
Nueva Cita:       10:15 ────────── 10:45
                           ║
                    PERMITIDO (cita cancelada no cuenta)
```

## Mocking de Repositories

```typescript
// Mock de los repositories
jest.mock('../../repositories/cita.repository');
jest.mock('../../repositories/usuario.repository');
jest.mock('../../repositories/servicio.repository');
```

### Ejemplo de Mock

```typescript
const mockUsuario = {
  id: 1,
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  password: 'hashed',
  rol: 'CLIENTE',
  telefono: '+57 300 123 4567',
  direccion: 'Calle 123',
  creadoEn: new Date(),
  actualizadoEn: new Date(),
};

(usuarioRepository.findById as jest.Mock).mockResolvedValue(mockUsuario);
```

## Control de Tiempo en Tests

```typescript
beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-01-01T12:00:00Z'));
});

afterEach(() => {
  jest.useRealTimers();
});
```

Esto permite controlar el tiempo para validar correctamente si una fecha es futura o pasada.

## Ejecutar Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar solo el archivo de CitaService
```bash
npm test -- src/services/__tests__/cita.service.test.ts
```

### Ejecutar en modo watch
```bash
npm run test:watch
```

### Ejecutar con cobertura
```bash
npm test -- --coverage
```

## Resultados Esperados

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

## Cobertura de Código

Para generar reporte de cobertura:

```bash
npm test -- --coverage
```

El reporte se genera en:
- `coverage/` - Directorio con reportes
- `coverage/lcov-report/index.html` - Reporte HTML interactivo

## Patrones de Testing

### 1. Arrange-Act-Assert (AAA)

```typescript
it('debería hacer algo', async () => {
  // Arrange: Preparar el entorno
  const mockData = { ... };
  (repository.find as jest.Mock).mockResolvedValue(mockData);

  // Act: Ejecutar la acción
  const result = await service.execute();

  // Assert: Verificar el resultado
  expect(result).toEqual(expected);
});
```

### 2. Mocking de Dependencies

```typescript
jest.mock('../../repositories/cita.repository');
const citaRepository = require('../../repositories/cita.repository');
```

### 3. Verificación de Errores

```typescript
await expect(service.execute()).rejects.toThrow(AppError);
await expect(service.execute()).rejects.toThrow('Mensaje de error');
```

### 4. Verificación de Llamadas

```typescript
expect(repository.find).toHaveBeenCalledWith(id);
expect(repository.create).toHaveBeenCalledWith(data);
```

## Casos de Prueba Cubiertos

### Casos Exitosos
- ✅ Agendamiento sin solapamiento
- ✅ Agendamiento cuando cita termina antes de que empiece la nueva
- ✅ Agendamiento ignorando citas canceladas

### Casos de Error
- ✅ Usuario no existe (404)
- ✅ Servicio no existe (404)
- ✅ Servicio inactivo (400)
- ✅ Fecha en el pasado (400)
- ✅ Solapamiento de horarios (409) ⭐

## Algoritmo de Validación Probado

El test de solapamiento valida el algoritmo implementado en `CitaService.validateNoOverlap()`:

1. Calcular rango de tiempo (inicio: fecha, fin: fecha + duración)
2. Validar que la fecha sea futura
3. Obtener citas existentes del mismo servicio en el día
4. Excluir citas canceladas
5. Detectar solapamiento:
   - Nueva cita empieza antes de que termine la existente
   - Y nueva cita termina después de que empiece la existente

## Notas Importantes

1. **Mock de Date:** Se usa `jest.useFakeTimers()` y `jest.setSystemTime()` para controlar el tiempo
2. **Mock de Repositories:** Se mockean todos los repositories para aislar el service
3. **Type Safety:** Los tests usan TypeScript para type safety
4. **Async/Await:** Todos los tests son asíncronos para manejar promesas
5. **Clean Up:** Se limpian los mocks en cada `beforeEach`

## Mejoras Futuras

- [ ] Agregar tests para `updateCita` con re-validación de solapamiento
- [ ] Agregar tests para `cancelarCita` con validación de permisos
- [ ] Agregar tests para `getCitasByUsuario` y `getCitasByServicio`
- [ ] Agregar tests de integración con Supertest
- [ ] Agregar tests para otros services (AuthService, ServicioService)
- [ ] Implementar snapshot testing para respuestas complejas
- [ ] Agregar mocking de Prisma Client para tests de repositories
- [ ] Implementar tests de performance
- [ ] Agregar tests de carga (stress testing)
