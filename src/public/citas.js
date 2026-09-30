const API_URL = 'http://localhost:3000/api';

// Agendar cita
async function agendarCita() {
    if (!isAuthenticated()) {
        navigate('login');
        return;
    }

    const servicioId = document.getElementById('cita-servicio').value;
    const fecha = document.getElementById('cita-fecha').value;
    const notas = document.getElementById('cita-notas').value;
    const messageDiv = document.getElementById('agendar-message');

    if (!servicioId || !fecha) {
        showMessage(messageDiv, 'Por favor seleccione un servicio y una fecha', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/citas`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                servicioId: parseInt(servicioId),
                usuarioId: currentUser.id,
                fecha: new Date(fecha).toISOString(),
                estado: 'pendiente',
                notas: notas || undefined,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage(messageDiv, 'Cita agendada exitosamente', 'success');
            
            // Limpiar formulario
            document.getElementById('cita-servicio').value = '';
            document.getElementById('cita-fecha').value = '';
            document.getElementById('cita-notas').value = '';
            
            // Redirigir a mis citas después de 1 segundo
            setTimeout(() => navigate('mis-citas'), 1000);
        } else {
            showMessage(messageDiv, data.message || 'Error al agendar cita', 'error');
        }
    } catch (error) {
        console.error('Error al agendar cita:', error);
        showMessage(messageDiv, 'Error de conexión', 'error');
    }
}

// Cargar mis citas
async function loadMisCitas() {
    if (!isAuthenticated()) {
        navigate('login');
        return;
    }

    const listDiv = document.getElementById('mis-citas-list');
    listDiv.innerHTML = '<p class="text-gray-500">Cargando tus citas...</p>';

    try {
        const response = await fetch(`${API_URL}/citas/mis-citas`, {
            headers: getAuthHeaders(),
        });

        const citas = await response.json();

        if (response.ok) {
            if (citas.length === 0) {
                listDiv.innerHTML = '<p class="text-gray-500">No tienes citas agendadas</p>';
                return;
            }

            listDiv.innerHTML = citas.map(cita => `
                <div class="border rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold text-lg text-gray-800">Cita #${cita.id}</h3>
                            <p class="text-sm text-gray-600 mt-1">
                                <span class="font-medium">Fecha:</span> ${new Date(cita.fecha).toLocaleString()}
                            </p>
                            <p class="text-sm text-gray-600">
                                <span class="font-medium">Servicio:</span> ${cita.servicio?.nombre || 'N/A'}
                            </p>
                            ${cita.notas ? `<p class="text-sm text-gray-600 mt-2"><span class="font-medium">Notas:</span> ${cita.notas}</p>` : ''}
                        </div>
                        <div class="text-right">
                            <span class="inline-block px-2 py-1 text-xs rounded ${getEstadoClass(cita.estado)}">
                                ${cita.estado.toUpperCase()}
                            </span>
                            ${cita.estado === 'pendiente' || cita.estado === 'confirmada' ? `
                                <button onclick="cancelarCita(${cita.id})" class="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition">
                                    Cancelar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            listDiv.innerHTML = `<p class="text-red-500">Error: ${citas.message || 'No se pudieron cargar tus citas'}</p>`;
        }
    } catch (error) {
        console.error('Error al cargar mis citas:', error);
        listDiv.innerHTML = '<p class="text-red-500">Error de conexión al cargar tus citas</p>';
    }
}

// Cancelar cita
async function cancelarCita(citaId) {
    if (!confirm('¿Está seguro de cancelar esta cita?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/citas/${citaId}/cancelar`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Cita cancelada exitosamente');
            loadMisCitas();
        } else {
            alert(data.message || 'Error al cancelar cita');
        }
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        alert('Error de conexión al cancelar cita');
    }
}

// Cargar todas las citas (admin)
async function loadAdminCitas() {
    if (!isAuthenticated() || !isAdmin()) {
        navigate('login');
        return;
    }

    const listDiv = document.getElementById('admin-citas-list');
    listDiv.innerHTML = '<p class="text-gray-500">Cargando todas las citas...</p>';

    try {
        const response = await fetch(`${API_URL}/citas/todas`, {
            headers: getAuthHeaders(),
        });

        const citas = await response.json();

        if (response.ok) {
            if (citas.length === 0) {
                listDiv.innerHTML = '<p class="text-gray-500">No hay citas en el sistema</p>';
                return;
            }

            listDiv.innerHTML = citas.map(cita => `
                <div class="border rounded-lg p-4 hover:shadow-md transition">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="font-semibold text-lg text-gray-800">Cita #${cita.id}</h3>
                            <p class="text-sm text-gray-600 mt-1">
                                <span class="font-medium">Fecha:</span> ${new Date(cita.fecha).toLocaleString()}
                            </p>
                            <p class="text-sm text-gray-600">
                                <span class="font-medium">Usuario:</span> ${cita.usuario?.nombre || 'N/A'} (${cita.usuario?.email || 'N/A'})
                            </p>
                            <p class="text-sm text-gray-600">
                                <span class="font-medium">Servicio:</span> ${cita.servicio?.nombre || 'N/A'}
                            </p>
                            ${cita.notas ? `<p class="text-sm text-gray-600 mt-2"><span class="font-medium">Notas:</span> ${cita.notas}</p>` : ''}
                        </div>
                        <div class="text-right">
                            <span class="inline-block px-2 py-1 text-xs rounded ${getEstadoClass(cita.estado)}">
                                ${cita.estado.toUpperCase()}
                            </span>
                            ${cita.estado === 'pendiente' || cita.estado === 'confirmada' ? `
                                <button onclick="cancelarCitaAdmin(${cita.id})" class="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition">
                                    Cancelar
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            listDiv.innerHTML = `<p class="text-red-500">Error: ${citas.message || 'No se pudieron cargar las citas'}</p>`;
        }
    } catch (error) {
        console.error('Error al cargar admin citas:', error);
        listDiv.innerHTML = '<p class="text-red-500">Error de conexión al cargar las citas</p>';
    }
}

// Cancelar cita (admin)
async function cancelarCitaAdmin(citaId) {
    if (!confirm('¿Está seguro de cancelar esta cita?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/citas/${citaId}/cancelar`, {
            method: 'PUT',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Cita cancelada exitosamente');
            loadAdminCitas();
        } else {
            alert(data.message || 'Error al cancelar cita');
        }
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        alert('Error de conexión al cancelar cita');
    }
}

// Obtener clase CSS según estado
function getEstadoClass(estado) {
    switch (estado) {
        case 'pendiente':
            return 'bg-yellow-100 text-yellow-800';
        case 'confirmada':
            return 'bg-blue-100 text-blue-800';
        case 'cancelada':
            return 'bg-red-100 text-red-800';
        case 'completada':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}
