var express = require('express')
var mdAutenticacion = require('../middlewares/autenticacion')
var app = express();

var handleError = require('../utils/index')


var Medico = require('../models/medico')

app.get('/', (req, res) => {
    var desde = req.query.desde || 0
    desde = Number(desde)
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
            if(err) {
                return handleError.handleError500list(err, res, 'cargar medicos')
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medico: medicos,
                    total: conteo,
                    mensaje: 'Cargado todos los medicos'
                })
            })
        })
})

// =================================
// Actualizar Medico
// =================================
app.put('/:id', mdAutenticacion.verficaToken,  (req, res) => {
    var id = req.params.id
    var body = req.body
    Medico.findById(id, (err, medico) => {
        if (err) {
            return handleError.handleError500(err, res, 'buscar')
        }
        if (!medico){
            return handleError.handleError400(err, res, 'No existe el medico')
        }

        medico.nombre = body.nombre
        medico.usuario = req.usuario._id
        medico.hospital = body.hospital

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                })
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado,
                mensaje: 'Actualizacion realizada'
            })
        })
    })
})

// =================================
// Crear Medico
// =================================
app.post('/', mdAutenticacion.verficaToken, (req, res) => {
    var body = req.body
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    })
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    })
})

// =================================
// Borrar Medico
// =================================
app.delete('/:id', mdAutenticacion.verficaToken, (req, res) => {
    var id =  req.params.id
    Medico.findByIdAndRemove(id, (err, medicoDelete) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al eliminar Medico',
                errors: err
            });
        }
        if (!medicoDelete) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al eliminar Medico',
                errors: err
            });
        }
        res.status(200).json({
            ok:true,
            medico: medicoDelete,
            mensaje: 'Medico Borrado'
        })
    })
})

module.exports = app;