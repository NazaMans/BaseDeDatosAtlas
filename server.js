const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nazareno:1234@prueba.qwrsvwy.mongodb.net/Universidad';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Servir archivos estáticos

let db;

// Conectar a MongoDB
MongoClient.connect(MONGODB_URI)
    .then(client => {
        console.log('Conectado a MongoDB Atlas');
        db = client.db('Universidad'); // Cambia 'Universidad' por el nombre de tu base de datos
    })
    .catch(error => console.error('Error conectando a MongoDB:', error));

// Rutas de API

// GET - Obtener todos los documentos de una colección
app.get('/api/:collection', async (req, res) => {
    try {
        const collection = req.params.collection;
        const documents = await db.collection(collection).find({}).toArray();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET - Obtener un documento por ID
app.get('/api/:collection/:id', async (req, res) => {
    try {
        const collection = req.params.collection;
        const id = req.params.id;
        const document = await db.collection(collection).findOne({ _id: new require('mongodb').ObjectId(id) });
        
        if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        
        res.json(document);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST - Crear un nuevo documento
app.post('/api/:collection', async (req, res) => {
    try {
        const collection = req.params.collection;
        const newDocument = req.body;
        const result = await db.collection(collection).insertOne(newDocument);
        res.status(201).json({ _id: result.insertedId, ...newDocument });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT - Actualizar un documento
app.put('/api/:collection/:id', async (req, res) => {
    try {
        const collection = req.params.collection;
        const id = req.params.id;
        const updateData = req.body;
        
        const result = await db.collection(collection).updateOne(
            { _id: new require('mongodb').ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        
        res.json({ message: 'Documento actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Eliminar un documento
app.delete('/api/:collection/:id', async (req, res) => {
    try {
        const collection = req.params.collection;
        const id = req.params.id;
        
        const result = await db.collection(collection).deleteOne({ _id: new require('mongodb').ObjectId(id) });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }
        
        res.json({ message: 'Documento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta principal - servir el HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});