// Define la colección actual seleccionada por defecto
let currentCollection = 'Estudiantes';

// Arreglo para guardar todos los datos cargados
let currentData = [];

// Arreglo para guardar los datos filtrados por búsqueda
let filteredData = [];

// Término de búsqueda actual (texto que el usuario escribió)
let searchTerm = '';

// Objeto para guardar filtros avanzados activos
let activeFilters = {};

// Configuración de los campos de formulario por cada colección
const collectionFields = {
    'Estudiantes': [
        { name: 'nombre', label: 'Nombre Completo', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'cedula', label: 'Cédula', type: 'text', required: true },
        { name: 'telefono', label: 'Teléfono', type: 'text', required: false },
        { name: 'fechaNacimiento', label: 'Fecha de Nacimiento', type: 'date', required: false },
        { name: 'carrera', label: 'Carrera', type: 'text', required: true },
        { name: 'semestre', label: 'Semestre', type: 'number', required: true },
        { name: 'direccion', label: 'Dirección', type: 'text', required: false }
    ],
    'Docentes': [
        { name: 'nombre', label: 'Nombre Completo', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'cedula', label: 'Cédula', type: 'text', required: true },
        { name: 'telefono', label: 'Teléfono', type: 'text', required: false },
        { name: 'especialidad', label: 'Especialidad', type: 'text', required: true },
        { name: 'departamento', label: 'Departamento', type: 'text', required: true },
        { name: 'titulo', label: 'Título Académico', type: 'text', required: true },
        { name: 'experiencia', label: 'Años de Experiencia', type: 'number', required: false }
    ],
    'Carreras': [
        { name: 'nombre', label: 'Nombre de la Carrera', type: 'text', required: true },
        { name: 'codigo', label: 'Código', type: 'text', required: true },
        { name: 'duracion', label: 'Duración (semestres)', type: 'number', required: true },
        { name: 'facultad', label: 'Facultad', type: 'text', required: true },
        { name: 'modalidad', label: 'Modalidad', type: 'text', required: true },
        { name: 'creditos', label: 'Créditos Totales', type: 'number', required: true },
        { name: 'descripcion', label: 'Descripción', type: 'text', required: false }
    ]
};

// Muestra un mensaje en pantalla, puede ser de éxito o error
function showMessage(message, type = 'success') {
    const messagesDiv = document.getElementById('messages'); // Contenedor de mensajes
    const messageDiv = document.createElement('div'); // Nuevo div para el mensaje
    messageDiv.className = type; // Clase (success o error)
    messageDiv.innerHTML = `
        <span>${type === 'success' ? '✅' : '❌'}</span>
        <span>${message}</span>
    `;
    messagesDiv.appendChild(messageDiv); // Agrega el mensaje al contenedor

    // Elimina el mensaje luego de 5 segundos
    setTimeout(() => {
        if (messagesDiv.contains(messageDiv)) {
            messagesDiv.removeChild(messageDiv);
        }
    }, 5000);
}

// Cambia la colección actual y actualiza la UI
function selectCollection(collection) {
    currentCollection = collection; // Asigna la colección seleccionada

    // Quita la clase "active" de todos los botones de pestaña
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Agrega la clase "active" al botón seleccionado
    event.target.classList.add('active');

    // Cambia los títulos de la UI según la colección
    document.getElementById('formTitle').textContent = `➕ Agregar Nuevo ${collection.slice(0, -1)}`;
    document.getElementById('dataTitle').textContent = `📊 Lista de ${collection}`;
    document.getElementById('searchCollectionName').textContent = collection;

    // Genera el formulario dinámico
    generateForm(collection);

    // Genera las opciones del campo de búsqueda
    generateSearchOptions(collection);

    // Limpia búsqueda anterior
    clearSearch();

    // Carga los datos de la colección
    loadData();
}

// Genera los inputs del formulario según la colección
function generateForm(collection) {
    const formFields = document.getElementById('formFields'); // Contenedor de inputs
    const fields = collectionFields[collection]; // Obtiene los campos configurados

    let html = '';
    fields.forEach(field => {
        html += `
            <div class="form-group">
                <label for="${field.name}">${field.label}${field.required ? ' *' : ''}</label>
                <input 
                    type="${field.type}" 
                    id="${field.name}" 
                    name="${field.name}"
                    ${field.required ? 'required' : ''}
                    placeholder="Ingrese ${field.label.toLowerCase()}..."
                >
            </div>
        `;
    });

    formFields.innerHTML = html; // Inserta el HTML generado al formulario
}

// Genera las opciones del select para el campo de búsqueda
function generateSearchOptions(collection) {
    const searchField = document.getElementById('searchField'); // Select del campo
    const fields = collectionFields[collection]; // Campos de la colección

    let html = '<option value="">-- Seleccionar campo --</option>';
    fields.forEach(field => {
        html += `<option value="${field.name}">${field.label}</option>`;
    });

    searchField.innerHTML = html; // Inserta las opciones
    generateAdvancedFilters(collection); // Crea filtros avanzados
}

// Genera filtros avanzados debajo del buscador
function generateAdvancedFilters(collection) {
    const advancedFilters = document.getElementById('advancedFilters'); // Contenedor de filtros
    const fields = collectionFields[collection]; // Campos de la colección

    let html = '';
    fields.forEach(field => {
        html += `
            <div class="form-group">
                <label for="filter_${field.name}">${field.label}:</label>
                <input 
                    type="${field.type}" 
                    id="filter_${field.name}" 
                    name="filter_${field.name}"
                    placeholder="Filtrar por ${field.label.toLowerCase()}..."
                >
            </div>
        `;
    });

    advancedFilters.innerHTML = html; // Inserta filtros en el DOM
}

// Filtra los datos según el campo y valor de búsqueda
function searchData() {
    const searchField = document.getElementById('searchField').value; // Campo seleccionado
    const searchValue = document.getElementById('searchValue').value.trim(); // Valor ingresado

    // Validación: campo y valor requeridos
    if (!searchField || !searchValue) {
        showMessage('Por favor selecciona un campo y ingresa un valor para buscar', 'error');
        return;
    }

    searchTerm = searchValue.toLowerCase(); // Guarda el término en minúsculas

    // Filtra los datos por coincidencia
    filteredData = currentData.filter(item => {
        if (item[searchField]) {
            return item[searchField].toString().toLowerCase().includes(searchTerm);
        }
        return false;
    });

    // Muestra los datos filtrados
    displayData(filteredData, true);
    updateResultCount(); // Actualiza contador de resultados

    // Muestra mensaje de éxito o error según resultados
    if (filteredData.length === 0) {
        showMessage(`No se encontraron resultados para "${searchValue}" en ${searchField}`, 'error');
    } else {
        showMessage(`Se encontraron ${filteredData.length} resultado(s)`, 'success');
    }
}

// Limpia la búsqueda y restaura todos los datos
function clearSearch() {
    document.getElementById('searchValue').value = ''; // Limpia input de valor
    document.getElementById('searchField').value = ''; // Limpia el campo seleccionado

    // Limpia inputs de filtros avanzados
    const advancedInputs = document.querySelectorAll('#advancedFilters input');
    advancedInputs.forEach(input => input.value = '');

    searchTerm = '';
    activeFilters = {};
    filteredData = [...currentData]; // Restaura datos originales
    displayData(currentData); // Muestra todos los datos
    updateResultCount(); // Actualiza contador
}

// Muestra u oculta la sección de búsqueda avanzada
function toggleAdvancedSearch() {
    const advancedSearch = document.getElementById('advancedSearch'); // Contenedor
    if (advancedSearch.style.display === 'none' || !advancedSearch.style.display) {
        advancedSearch.style.display = 'block'; // Muestra
    } else {
        advancedSearch.style.display = 'none'; // Oculta
    }
}

// Función para aplicar búsqueda avanzada
function applyAdvancedSearch() {
    const fields = collectionFields[currentCollection]; // Obtiene los campos de la colección actual
    activeFilters = {}; // Reinicia los filtros activos

    // Recorre todos los campos y toma los valores ingresados en los filtros
    fields.forEach(field => {
        const input = document.getElementById(`filter_${field.name}`);
        if (input && input.value.trim()) {
            activeFilters[field.name] = input.value.trim().toLowerCase(); // Guarda valor en minúsculas
        }
    });

    // Si no hay filtros, muestra mensaje de error
    if (Object.keys(activeFilters).length === 0) {
        showMessage('Ingresa al menos un filtro para la búsqueda avanzada', 'error');
        return;
    }

    // Aplica los filtros a los datos actuales
    filteredData = currentData.filter(item => {
        return Object.keys(activeFilters).every(fieldName => {
            if (item[fieldName]) {
                return item[fieldName].toString().toLowerCase().includes(activeFilters[fieldName]);
            }
            return false;
        });
    });

    displayData(filteredData, true); // Muestra los resultados filtrados
    updateResultCount(); // Actualiza el contador

    // Muestra mensaje según si hubo resultados o no
    if (filteredData.length === 0) {
        showMessage('No se encontraron resultados con los filtros aplicados', 'error');
    } else {
        showMessage(`Filtros aplicados: ${filteredData.length} resultado(s)`, 'success');
    }
}

// Actualiza el contador de resultados mostrados
function updateResultCount() {
    const count = filteredData.length > 0 ? filteredData.length : currentData.length;
    const total = currentData.length;
    const resultCount = document.getElementById('resultCount');

    if (filteredData.length > 0 && filteredData.length < total) {
        resultCount.textContent = `${count} de ${total} registros`;
        resultCount.style.background = '#fff3cd';
        resultCount.style.color = '#856404';
    } else {
        resultCount.textContent = `${count} registros`;
        resultCount.style.background = '#e9ecef';
        resultCount.style.color = '#495057';
    }
}

// Exporta los datos visibles (filtrados o todos) en formato CSV
function exportData() {
    const dataToExport = filteredData.length > 0 ? filteredData : currentData;
    const csvContent = convertToCSV(dataToExport);
    downloadCSV(csvContent, `${currentCollection}_${new Date().toISOString().split('T')[0]}.csv`);
    showMessage('Datos exportados correctamente', 'success');
}

// Convierte un array de objetos a formato CSV
function convertToCSV(data) {
    if (data.length === 0) return '';

    const fields = collectionFields[currentCollection];
    const headers = fields.map(field => field.label).join(',');

    const rows = data.map(item => {
        return fields.map(field => {
            const value = item[field.name] || '';
            return `"${value.toString().replace(/"/g, '""')}"`; // Escapa comillas
        }).join(',');
    });

    return headers + '\n' + rows.join('\n');
}

// Descarga el contenido CSV generado como archivo
function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Limpia todos los campos del formulario
function clearForm() {
    document.getElementById('universityForm').reset();
}

// Carga datos desde el servidor para la colección actual
async function loadData() {
    const dataDisplay = document.getElementById('dataDisplay');
    dataDisplay.innerHTML = '<div class="loading">⏳ Cargando datos...</div>';

    try {
        const response = await fetch(`/api/${currentCollection}`);
        const data = await response.json();

        if (response.ok) {
            currentData = data;
            filteredData = [...data];
            displayData(data);
            updateStats();
            updateResultCount();
        } else {
            throw new Error(data.error || 'Error al cargar datos');
        }
    } catch (error) {
        dataDisplay.innerHTML = `<div class="error">❌ Error: ${error.message}</div>`;
    }
}

// Muestra los datos en pantalla
function displayData(data, highlight = false) {
    const dataDisplay = document.getElementById('dataDisplay');

    // Si no hay datos
    if (data.length === 0) {
        if (filteredData.length === 0 && currentData.length > 0) {
            dataDisplay.innerHTML = `
                <div class="no-results">
                    🔍 No se encontraron resultados con los criterios de búsqueda
                    <br><br>
                    <button class="btn" onclick="clearSearch()">🔄 Mostrar Todos</button>
                </div>
            `;
        } else {
            dataDisplay.innerHTML = '<div class="empty-state">📄 No hay registros en esta colección</div>';
        }
        return;
    }

    let html = '<div class="data-grid">';
    data.forEach(item => {
        html += `
            <div class="data-item">
                <div class="item-header">
                    <div class="item-id">ID: ${item._id}</div>
                    <div class="item-actions">
                        <button class="btn btn-warning" onclick="editItem('${item._id}')" title="Editar">✏️</button>
                        <button class="btn btn-danger" onclick="deleteItem('${item._id}')" title="Eliminar">🗑️</button>
                    </div>
                </div>
                <div class="item-content">
        `;

        const fields = collectionFields[currentCollection];
        fields.forEach(field => {
            if (item[field.name]) {
                let value = item[field.name].toString();

                if (highlight && searchTerm) {
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    value = value.replace(regex, '<span class="search-highlight">$1</span>');
                }

                html += `
                    <div class="field">
                        <span class="field-label">${field.label}:</span>
                        <span class="field-value">${value}</span>
                    </div>
                `;
            }
        });

        if (Object.keys(activeFilters).length > 0) {
            html += '<div style="margin-top: 10px;">';
            Object.keys(activeFilters).forEach(filterKey => {
                const field = collectionFields[currentCollection].find(f => f.name === filterKey);
                if (field) {
                    html += `<span class="filter-tag">${field.label}: ${activeFilters[filterKey]}</span>`;
                }
            });
            html += '</div>';
        }

        html += '</div></div>';
    });
    html += '</div>';

    dataDisplay.innerHTML = html;
}

// Carga estadísticas de cantidad de registros por colección
async function updateStats() {
    try {
        const collections = ['Estudiantes', 'Docentes', 'Carreras'];
        for (const collection of collections) {
            const response = await fetch(`/api/${collection}`);
            const data = await response.json();
            if (response.ok) {
                document.getElementById(`${collection.toLowerCase()}Count`).textContent = data.length;
            }
        }
    } catch (error) {
        console.error('Error actualizando estadísticas:', error);
    }
}

// Elimina un elemento de la colección actual por ID
async function deleteItem(id) {
    if (!confirm(`¿Estás seguro de que quieres eliminar este ${currentCollection.slice(0, -1).toLowerCase()}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/${currentCollection}/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`${currentCollection.slice(0, -1)} eliminado correctamente`);
            loadData();
        } else {
            throw new Error(result.error || 'Error al eliminar');
        }
    } catch (error) {
        showMessage(`Error al eliminar: ${error.message}`, 'error');
    }
}

// Carga los datos de un ítem en el formulario para edición
function editItem(id) {
    let item;
    if (filteredData.length > 0) {
        item = filteredData.find(data => data._id === id);
    } else {
        item = currentData.find(data => data._id === id);
    }

    if (!item) return;

    const fields = collectionFields[currentCollection];
    fields.forEach(field => {
        const input = document.getElementById(field.name);
        if (input && item[field.name]) {
            input.value = item[field.name];
        }
    });

    document.getElementById('universityForm').scrollIntoView({ behavior: 'smooth' });
    showMessage(`Datos cargados en el formulario. Modifica y guarda para actualizar.`, 'success');
}

// Maneja el envío del formulario (crear nuevo documento)
document.getElementById('universityForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = {};

    for (let [key, value] of formData.entries()) {
        if (value.trim()) {
            data[key] = value.trim();
        }
    }

    try {
        const response = await fetch(`/api/${currentCollection}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showMessage(`${currentCollection.slice(0, -1)} guardado correctamente`);
            clearForm();
            loadData();
        } else {
            throw new Error(result.error || 'Error al guardar');
        }
    } catch (error) {
        showMessage(`Error al guardar: ${error.message}`, 'error');
    }
});

// Inicializa la app cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    generateForm('Estudiantes'); // Genera formulario inicial
    generateSearchOptions('Estudiantes'); // Genera opciones de búsqueda
    loadData(); // Carga datos iniciales

    // Permite buscar presionando Enter en el input
    document.getElementById('searchValue').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchData();
        }
    });
});