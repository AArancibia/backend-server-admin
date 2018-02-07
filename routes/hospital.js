var express = require('express')
var mdAutenticacion = require('../middlewares/autenticacion')
var app = express();

var handleError = require('../utils/index')


var Hospital = require('../models/hospital')

app.get('/', (req, res) => {
    var desde = req.query.desde || 0
    desde = Number(desde)
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hopitales) => {
                if (err) {
                    return handleError.handleError500list(err, res, 'cargar hospitales')
                }
                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hopitales,
                        total: conteo,
                        mensaje: 'Cargado todos los hospitales'
                    })
                })
            })
    })

// =================================
// Actualizar Hospital
// =================================
app.put('/:id', mdAutenticacion.verficaToken,  (req, res) => {
    var id = req.params.id
    var body = req.body
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return handleError.handleError500(err, res, 'buscar')
        }
        if (!hospital){
            return handleError.handleError400(err, res, 'No existe el hospital')
        }

        hospital.nombre = body.nombre
        hospital.usuario = req.usuario._id

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                })
            }
            res.status(200).json({
                ok: true,
                hospital: hospital,
                mensaje: 'Actualizacion realizada'
            })
        })
    })
})

// =================================
// Crear Hospital
// =================================
app.post('/', mdAutenticacion.verficaToken, (req, res) => {
    var body = req.body
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    })
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    })
})

// =================================
// Borrar Hospital
// =================================
app.delete('/:id', mdAutenticacion.verficaToken, (req, res) => {
    var id =  req.params.id
    Hospital.findByIdAndRemove(id, (err, hospitalDelete) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors: err
            });
        }
        if (!hospitalDelete) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al eliminar hospital',
                errors: { message: 'No existe el hospital con ese id'}
            });
        }
        res.status(200).json({
            ok:true,
            hospital: hospitalDelete,
            mensaje: 'Hospital Borrado'
        })
    })
})

module.exports = app;