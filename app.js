// Requires - importacion de librerias de terceros o personalizadas
var express = require('express');
var mongoose = require('mongoose');

// Inicializa variables
var app = express();

// Conexion a la BD
mongoose.connection
    .openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
        if (err) throw err;
        console.log('Base de Datos:\x1b[32m%s\x1b[0m','online');
})
// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000:\x1b[32m%s\x1b[0m','online');
});