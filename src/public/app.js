// Navegación entre vistas
function navigate(view) {
    // Ocultar todas las vistas
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });

    // Mostrar vista seleccionada
    switch (view) {
        case 'login':
            document.getElementById('login-view').classList.remove('hidden');
            break;
        case 'servicios':
            document.getElementById('servicios-view').classList.remove('hidden');
            loadServicios();
            break;
        case 'agendar':
            document.getElementById('agendar-view').classList.remove('hidden');
            loadServiciosSelect();
            break;
        case 'mis-citas':
            document.getElementById('mis-citas-view').classList.remove('hidden');
            loadMisCitas();
            break;
        case 'admin-citas':
            document.getElementById('admin-citas-view').classList.remove('hidden');
            loadAdminCitas();
            break;
        default:
            document.getElementById('login-view').classList.remove('hidden');
    }
}

// Mostrar mensaje genérico
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `mt-4 text-sm ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
}

// Inicializar aplicación
function initApp() {
    // Verificar estado de autenticación
    if (isAuthenticated()) {
        navigate('servicios');
    } else {
        navigate('login');
    }
}

// Inicializar al cargar el DOM
document.addEventListener('DOMContentLoaded', initApp);
