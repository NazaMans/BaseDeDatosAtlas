// Importa el módulo express para crear el servidor
const express = require('express');

// Importa MongoClient desde el paquete mongodb para conectarse a la base de datos
const { MongoClient } = require('mongodb');

// Importa el middleware cors para permitir peticiones de distintos orígenes
const cors = require('cors');

// Importa el módulo path para trabajar con rutas de archivos
const path = require('path');

// Carga variables de entorno desde un archivo .env
require('dotenv').config();

// Crea una aplicación de Express
const app = express();

// Define el puerto desde una variable de entorno o usa el 3000 por defecto
const PORT = process.env.PORT || 3000;

// Define la URI de conexión a MongoDB desde una variable de entorno o una cadena por defecto
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nazareno:1234@prueba.qwrsvwy.mongodb.net/Universidad';

// Aplica el middleware cors para permitir peticiones cross-origin
app.use(cors());

// Aplica el middleware para parsear JSON en las peticiones
app.use(express.json());

// Sirve archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

let db; // Variable para almacenar la conexión a la base de datos

// Conecta a MongoDB Atlas
MongoClient.connect(MONGODB_URI)
    .then(client => {
        // Muestra un mensaje en consola si la conexión fue exitosa
        console.log('Conectado a MongoDB Atlas');

        // Guarda la referencia a la base de datos "Universidad"
        db = client.db('Universidad');
    })
    .catch(error => console.error('Error conectando a MongoDB:', error)); // Muestra error si falla la conexión

// Ruta GET para obtener todos los documentos de una colección
app.get('/api/:collection', async (req, res) => {
    try {
        // Obtiene el nombre de la colección desde los parámetros de la URL
        const collection = req.params.collection;

        // Busca todos los documentos de la colección
        const documents = await db.collection(collection).find({}).toArray();

        // Devuelve los documentos en formato JSON
        res.json(documents);
    } catch (error) {
        // Devuelve un error 500 en caso de falla
        res.status(500).json({ error: error.message });
    }
});

// Ruta GET para obtener un documento por su ID
app.get('/api/:collection/:id', async (req, res) => {
    try {
        // Obtiene el nombre de la colección desde los parámetros de la URL
        const collection = req.params.collection;

        // Obtiene el ID del documento desde los parámetros de la URL
        const id = req.params.id;

        // Busca un documento en la colección con ese ID
        const document = await db.collection(collection).findOne({ _id: new require('mongodb').ObjectId(id) });

        // Si no se encuentra, devuelve un error 404
        if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        // Devuelve el documento encontrado
        res.json(document);
    } catch (error) {
        // Devuelve un error 500 en caso de falla
        res.status(500).json({ error: error.message });
    }
});

// Ruta POST para crear un nuevo documento en una colección
app.post('/api/:collection', async (req, res) => {
    try {
        // Obtiene el nombre de la colección desde los parámetros de la URL
        const collection = req.params.collection;

        // Obtiene el contenido del nuevo documento desde el cuerpo de la petición
        const newDocument = req.body;

        // Inserta el nuevo documento en la colección
        const result = await db.collection(collection).insertOne(newDocument);

        // Devuelve el documento creado con su nuevo ID
        res.status(201).json({ _id: result.insertedId, ...newDocument });
    } catch (error) {
        // Devuelve un error 500 en caso de falla
        res.status(500).json({ error: error.message });
    }
});

// Ruta PUT para actualizar un documento existente por ID
app.put('/api/:collection/:id', async (req, res) => {
    try {
        // Obtiene el nombre de la colección desde los parámetros de la URL
        const collection = req.params.collection;

        // Obtiene el ID del documento a actualizar
        const id = req.params.id;

        // Obtiene los nuevos datos para actualizar desde el cuerpo de la petición
        const updateData = req.body;

        // Actualiza el documento que coincida con el ID
        const result = await db.collection(collection).updateOne(
            { _id: new require('mongodb').ObjectId(id) },
            { $set: updateData }
        );

        // Si no se encontró ningún documento para actualizar, devuelve error 404
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        // Devuelve mensaje de éxito
        res.json({ message: 'Documento actualizado correctamente' });
    } catch (error) {
        // Devuelve un error 500 en caso de falla
        res.status(500).json({ error: error.message });
    }
});

// Ruta DELETE para eliminar un documento por ID
app.delete('/api/:collection/:id', async (req, res) => {
    try {
        // Obtiene el nombre de la colección desde los parámetros de la URL
        const collection = req.params.collection;

        // Obtiene el ID del documento a eliminar
        const id = req.params.id;

        // Elimina el documento que coincida con el ID
        const result = await db.collection(collection).deleteOne({ _id: new require('mongodb').ObjectId(id) });

        // Si no se eliminó ningún documento, devuelve error 404
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        // Devuelve mensaje de éxito
        res.json({ message: 'Documento eliminado correctamente' });
    } catch (error) {
        // Devuelve un error 500 en caso de falla
        res.status(500).json({ error: error.message });
    }
});

// Ruta raíz - sirve el archivo index.html desde la carpeta "public"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia el servidor en el puerto definido y muestra mensaje en consola
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});