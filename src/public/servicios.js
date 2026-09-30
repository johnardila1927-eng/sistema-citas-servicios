const API_URL = 'https://sistema-citas-servicios-production.up.railway.app/api';

// Cargar servicios
async function loadServicios() {
    if (!isAuthenticated()) {
        navigate('login');
        return;
    }

    const listDiv = document.getElementById('servicios-list');
    listDiv.innerHTML = '<p class="text-gray-500">Cargando servicios...</p>';

    try {
        const response = await fetch(`${API_URL}/servicios`, {
            headers: getAuthHeaders(),
        });

        const servicios = await response.json();

        if (response.ok) {
            if (servicios.length === 0) {
                listDiv.innerHTML = '<p class="text-gray-500">No hay servicios disponibles</p>';
                return;
            }

            listDiv.innerHTML = servicios.map(servicio => `
                <div class="border rounded-lg p-4 hover:shadow-md transition">
                    <h3 class="font-semibold text-lg text-gray-800">${servicio.nombre}</h3>
                    <p class="text-sm text-gray-600 mt-2">${servicio.descripcion || 'Sin descripción'}</p>
                    <div class="mt-3 space-y-1">
                        <p class="text-sm text-gray-600">
                            <span class="font-medium">Duración:</span> ${servicio.duracion} minutos
                        </p>
                        <p class="text-sm text-gray-600">
                            <span class="font-medium">Precio:</span> $${servicio.precio.toFixed(2)}
                        </p>
                    </div>
                    <span class="inline-block mt-3 px-2 py-1 text-xs rounded ${
                        servicio.activo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                    }">
                        ${servicio.activo ? 'Disponible' : 'No disponible'}
                    </span>
                </div>
            `).join('');
        } else {
            listDiv.innerHTML = `<p class="text-red-500">Error: ${servicios.message || 'No se pudieron cargar los servicios'}</p>`;
        }
    } catch (error) {
        console.error('Error al cargar servicios:', error);
        listDiv.innerHTML = '<p class="text-red-500">Error de conexión al cargar servicios</p>';
    }
}

// Cargar servicios en select (para agendar cita)
async function loadServiciosSelect() {
    const select = document.getElementById('cita-servicio');
    select.innerHTML = '<option value="">Seleccione un servicio</option>';

    try {
        const response = await fetch(`${API_URL}/servicios`, {
            headers: getAuthHeaders(),
        });

        const servicios = await response.json();

        if (response.ok && servicios.length > 0) {
            servicios.forEach(servicio => {
                if (servicio.activo) {
                    const option = document.createElement('option');
                    option.value = servicio.id;
                    option.textContent = `${servicio.nombre} - $${servicio.precio.toFixed(2)} (${servicio.duracion} min)`;
                    select.appendChild(option);
                }
            });
        }
    } catch (error) {
        console.error('Error al cargar servicios en select:', error);
    }
}
