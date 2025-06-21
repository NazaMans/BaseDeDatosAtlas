 let currentCollection = 'Estudiantes';
        let currentData = [];
        let filteredData = [];
        let searchTerm = '';
        let activeFilters = {};

        // Configuración de campos para cada colección
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

        // Función para mostrar mensajes
        function showMessage(message, type = 'success') {
            const messagesDiv = document.getElementById('messages');
            const messageDiv = document.createElement('div');
            messageDiv.className = type;
            messageDiv.innerHTML = `
                <span>${type === 'success' ? '✅' : '❌'}</span>
                <span>${message}</span>
            `;
            messagesDiv.appendChild(messageDiv);
            
            setTimeout(() => {
                if (messagesDiv.contains(messageDiv)) {
                    messagesDiv.removeChild(messageDiv);
                }
            }, 5000);
        }

        // Función para seleccionar colección
        function selectCollection(collection) {
            currentCollection = collection;
            
            // Actualizar tabs activos
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Actualizar títulos
            document.getElementById('formTitle').textContent = `➕ Agregar Nuevo ${collection.slice(0, -1)}`;
            document.getElementById('dataTitle').textContent = `📊 Lista de ${collection}`;
            document.getElementById('searchCollectionName').textContent = collection;
            
            // Generar formulario
            generateForm(collection);
            
            // Generar opciones de búsqueda
            generateSearchOptions(collection);
            
            // Limpiar búsqueda anterior
            clearSearch();
            
            // Cargar datos
            loadData();
        }

        // Función para generar formulario dinámico
        function generateForm(collection) {
            const formFields = document.getElementById('formFields');
            const fields = collectionFields[collection];
            
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
            
            formFields.innerHTML = html;
        }

        // Función para generar opciones de búsqueda
        function generateSearchOptions(collection) {
            const searchField = document.getElementById('searchField');
            const fields = collectionFields[collection];
            
            let html = '<option value="">-- Seleccionar campo --</option>';
            fields.forEach(field => {
                html += `<option value="${field.name}">${field.label}</option>`;
            });
            
            searchField.innerHTML = html;
            generateAdvancedFilters(collection);
        }

        // Función para generar filtros avanzados
        function generateAdvancedFilters(collection) {
            const advancedFilters = document.getElementById('advancedFilters');
            const fields = collectionFields[collection];
            
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
            
            advancedFilters.innerHTML = html;
        }

        // Función para buscar datos
        function searchData() {
            const searchField = document.getElementById('searchField').value;
            const searchValue = document.getElementById('searchValue').value.trim();
            
            if (!searchField || !searchValue) {
                showMessage('Por favor selecciona un campo y ingresa un valor para buscar', 'error');
                return;
            }
            
            searchTerm = searchValue.toLowerCase();
            
            filteredData = currentData.filter(item => {
                if (item[searchField]) {
                    return item[searchField].toString().toLowerCase().includes(searchTerm);
                }
                return false;
            });
            
            displayData(filteredData, true);
            updateResultCount();
            
            if (filteredData.length === 0) {
                showMessage(`No se encontraron resultados para "${searchValue}" en ${searchField}`, 'error');
            } else {
                showMessage(`Se encontraron ${filteredData.length} resultado(s)`, 'success');
            }
        }

        // Función para limpiar búsqueda
        function clearSearch() {
            document.getElementById('searchValue').value = '';
            document.getElementById('searchField').value = '';
            
            // Limpiar filtros avanzados
            const advancedInputs = document.querySelectorAll('#advancedFilters input');
            advancedInputs.forEach(input => input.value = '');
            
            searchTerm = '';
            activeFilters = {};
            filteredData = [...currentData];
            displayData(currentData);
            updateResultCount();
        }

        // Función para toggle búsqueda avanzada
        function toggleAdvancedSearch() {
            const advancedSearch = document.getElementById('advancedSearch');
            if (advancedSearch.style.display === 'none' || !advancedSearch.style.display) {
                advancedSearch.style.display = 'block';
            } else {
                advancedSearch.style.display = 'none';
            }
        }

        // Función para aplicar búsqueda avanzada
        function applyAdvancedSearch() {
            const fields = collectionFields[currentCollection];
            activeFilters = {};
            
            // Recopilar filtros activos
            fields.forEach(field => {
                const input = document.getElementById(`filter_${field.name}`);
                if (input && input.value.trim()) {
                    activeFilters[field.name] = input.value.trim().toLowerCase();
                }
            });
            
            if (Object.keys(activeFilters).length === 0) {
                showMessage('Ingresa al menos un filtro para la búsqueda avanzada', 'error');
                return;
            }
            
            // Aplicar filtros
            filteredData = currentData.filter(item => {
                return Object.keys(activeFilters).every(fieldName => {
                    if (item[fieldName]) {
                        return item[fieldName].toString().toLowerCase().includes(activeFilters[fieldName]);
                    }
                    return false;
                });
            });
            
            displayData(filteredData, true);
            updateResultCount();
            
            if (filteredData.length === 0) {
                showMessage('No se encontraron resultados con los filtros aplicados', 'error');
            } else {
                showMessage(`Filtros aplicados: ${filteredData.length} resultado(s)`, 'success');
            }
        }

        // Función para actualizar contador de resultados
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

        // Función para exportar datos
        function exportData() {
            const dataToExport = filteredData.length > 0 ? filteredData : currentData;
            const csvContent = convertToCSV(dataToExport);
            downloadCSV(csvContent, `${currentCollection}_${new Date().toISOString().split('T')[0]}.csv`);
            showMessage('Datos exportados correctamente', 'success');
        }

        // Función para convertir a CSV
        function convertToCSV(data) {
            if (data.length === 0) return '';
            
            const fields = collectionFields[currentCollection];
            const headers = fields.map(field => field.label).join(',');
            
            const rows = data.map(item => {
                return fields.map(field => {
                    const value = item[field.name] || '';
                    return `"${value.toString().replace(/"/g, '""')}"`;
                }).join(',');
            });
            
            return headers + '\n' + rows.join('\n');
        }

        // Función para descargar CSV
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
        function clearForm() {
            document.getElementById('universityForm').reset();
        }

        // Función para cargar datos
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

        // Función para mostrar los datos
        function displayData(data, highlight = false) {
            const dataDisplay = document.getElementById('dataDisplay');
            
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
                
                // Mostrar campos específicos según la colección
                const fields = collectionFields[currentCollection];
                fields.forEach(field => {
                    if (item[field.name]) {
                        let value = item[field.name].toString();
                        
                        // Resaltar términos de búsqueda
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
                
                // Mostrar filtros activos si los hay
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

        // Función para actualizar estadísticas
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

        // Función para eliminar un elemento
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

        // Función para editar un elemento (simple - llena el formulario)
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

            // Scroll al formulario
            document.getElementById('universityForm').scrollIntoView({ behavior: 'smooth' });
            showMessage(`Datos cargados en el formulario. Modifica y guarda para actualizar.`, 'success');
        }

        // Manejar envío del formulario
        document.getElementById('universityForm').addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(this);
            const data = {};
            
            // Convertir FormData a objeto
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

        // Inicializar la aplicación
        document.addEventListener('DOMContentLoaded', function() {
            generateForm('Estudiantes');
            generateSearchOptions('Estudiantes');
            loadData();
            
            // Agregar evento de búsqueda en tiempo real
            document.getElementById('searchValue').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchData();
                }
            });
        });