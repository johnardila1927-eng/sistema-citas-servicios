import express, { Application } from 'express';
import { errorMiddleware, notFoundHandler } from './middlewares/errorMiddleware';
import authController from './controllers/auth.controller';
import usuarioController from './controllers/usuario.controller';
import servicioController from './controllers/servicio.controller';
import citaController from './controllers/cita.controller';
import { authenticate, requireAdmin, requireAnyRole } from './middlewares/auth.middleware';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static('src/public'));

// Rutas - Autenticación (públicas)
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/me', authenticate, authController.getMe);

// Rutas - Usuarios (protegidas)
app.get('/api/usuarios', authenticate, requireAdmin, usuarioController.getAll);
app.get('/api/usuarios/:id', authenticate, usuarioController.getById);
app.post('/api/usuarios', authenticate, requireAdmin, usuarioController.create);
app.put('/api/usuarios/:id', authenticate, requireAdmin, usuarioController.update);
app.delete('/api/usuarios/:id', authenticate, requireAdmin, usuarioController.delete);

// Rutas - Servicios (lectura pública, escritura admin)
app.get('/api/servicios', servicioController.getAll);
app.get('/api/servicios/all', authenticate, requireAdmin, servicioController.getAll);
app.get('/api/servicios/:id', servicioController.getById);
app.post('/api/servicios', authenticate, requireAdmin, servicioController.create);
app.put('/api/servicios/:id', authenticate, requireAdmin, servicioController.update);
app.delete('/api/servicios/:id', authenticate, requireAdmin, servicioController.delete);

// Rutas - Citas (protegidas)
app.get('/api/citas/todas', authenticate, requireAdmin, citaController.getAll);
app.get('/api/citas', authenticate, requireAnyRole, citaController.getAll);
app.get('/api/citas/mis-citas', authenticate, requireAnyRole, citaController.getMisCitas);
app.get('/api/citas/:id', authenticate, requireAnyRole, citaController.getById);
app.get('/api/citas/usuario/:usuarioId', authenticate, requireAnyRole, citaController.getByUsuario);
app.get('/api/citas/servicio/:servicioId', authenticate, requireAnyRole, citaController.getByServicio);
app.get('/api/citas/fecha/:fecha', authenticate, requireAnyRole, citaController.getByFecha);
app.post('/api/citas', authenticate, requireAnyRole, citaController.create);
app.put('/api/citas/:id', authenticate, requireAnyRole, citaController.update);
app.put('/api/citas/:id/cancelar', authenticate, requireAnyRole, citaController.cancelar);
app.delete('/api/citas/:id', authenticate, requireAdmin, citaController.delete);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistema de Citas y Servicios - API funcionando' });
});

// Manejo de rutas no encontradas
app.use(notFoundHandler);

// Middleware de errores global
app.use(errorMiddleware);

// Iniciar servidor
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`📚 API disponible en http://localhost:${PORT}`);
  });
}

export default app;
