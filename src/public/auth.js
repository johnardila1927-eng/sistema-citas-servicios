const API_URL = 'http://localhost:3000/api';

let currentUser = null;
let authToken = null;

// Inicializar desde localStorage
function initAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        updateUI();
    }
}

// Login
async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageDiv = document.getElementById('auth-message');

    if (!email || !password) {
        showMessage(messageDiv, 'Por favor complete todos los campos', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMessage(messageDiv, 'Login exitoso', 'success');
            updateUI();
            
            // Redirigir a servicios después de 1 segundo
            setTimeout(() => navigate('servicios'), 1000);
        } else {
            showMessage(messageDiv, data.message || 'Error en el login', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showMessage(messageDiv, 'Error de conexión', 'error');
    }
}

// Registro
async function register() {
    const nombre = document.getElementById('register-nombre').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const telefono = document.getElementById('register-telefono').value;
    const direccion = document.getElementById('register-direccion').value;
    const messageDiv = document.getElementById('auth-message');

    if (!nombre || !email || !password) {
        showMessage(messageDiv, 'Por favor complete nombre, email y contraseña', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                nombre, 
                email, 
                password,
                telefono: telefono || undefined,
                direccion: direccion || undefined
            }),
        });

        const data = await response.json();

        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            showMessage(messageDiv, 'Registro exitoso', 'success');
            updateUI();
            
            // Redirigir a servicios después de 1 segundo
            setTimeout(() => navigate('servicios'), 1000);
        } else {
            showMessage(messageDiv, data.message || 'Error en el registro', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showMessage(messageDiv, 'Error de conexión', 'error');
    }
}

// Logout
function logout() {
    authToken = null;
    currentUser = null;
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    updateUI();
    navigate('login');
}

// Actualizar UI según estado de autenticación
function updateUI() {
    const nav = document.getElementById('nav');
    const user_info = document.getElementById('user-info');
    const btnAdminCitas = document.getElementById('btn-admin-citas');

    if (currentUser) {
        nav.classList.remove('hidden');
        user_info.textContent = `Bienvenido, ${currentUser.nombre} (${currentUser.rol})`;
        
        // Mostrar botón de admin si es administrador
        if (currentUser.rol === 'ADMINISTRADOR') {
            btnAdminCitas.classList.remove('hidden');
        } else {
            btnAdminCitas.classList.add('hidden');
        }
    } else {
        nav.classList.add('hidden');
        user_info.textContent = '';
        btnAdminCitas.classList.add('hidden');
    }
}

// Mostrar mensaje
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `mt-4 text-sm ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
}

// Mostrar tab (login/register)
function showTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const messageDiv = document.getElementById('auth-message');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    }
    
    messageDiv.textContent = '';
}

// Obtener token para requests
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
    };
}

// Verificar si está autenticado
function isAuthenticated() {
    return authToken !== null && currentUser !== null;
}

// Verificar si es admin
function isAdmin() {
    return currentUser && currentUser.rol === 'ADMINISTRADOR';
}

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', initAuth);
