import {handleError500} from "../utils/index";

var express = require('express')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
var app = express();
var SEED = require('../config/config').SEED
var Usuario = require('../models/usuario')

//Variable para Autenticacion de Google
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;

const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET

// =================================
// Autenticacion de Google
// =================================
app.post('/google', (req, res) => {

    var token = req.body.token || 'XXX'
    var client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');
    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function(e, login) {

            if(e) {
                return res.status(400).json({
                    ok: true,
                    mensaje: `Token No valido`,
                    errors: e
                })
            }

            var payload = login.getPayload();
            var userid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];

            Usuario.findOne({ email: payload.email}, (err, usuarioDB) => {
                if(err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: `Error al buscar usuario - login`,
                        errors: err
                    })
                }
                if(usuarioDB) {
                    if (usuarioDB.google === false) {//si no fue creado por google
                        //si ya se habia autenticado previamente por google
                        return res.status(400).json({
                            ok: false,
                            mensaje: `Debe de usuar su autenticacion normal`
                        })
                    }else {
                        usuarioDB.password = ':)'
                        var token = jwt.sign({ usuario: usuarioDB }, SEED , {expiresIn: 14400 })

                        res.status(200).json({
                            ok: true,
                            usuario: usuarioDB,
                            token: token,
                            id: usuarioDB._id
                        })
                    }
                }else {
                    // si el susuario no existe por correo
                    var usuario = new Usuario()
                    usuario.nombre = payload.name
                    usuario.email = payload.email
                    usuario.password = ':)'
                    usuario.img = payload.picture
                    usuario.google = true

                    usuario.save((err, usuarioGuardado) => {
                        if (err) {
                            return handleError500(err, res, 'guardar')
                        }

                        var token = jwt.sign({ usuario: usuarioGuardado }, SEED , {expiresIn: 14400 })

                        res.status(200).json({
                            ok: true,
                            usuario: usuarioGuardado,
                            token: token,
                            id: usuarioGuardado._id
                        })
                    })
                }
            })


        });
})

// =================================
// Autenticacion Normal
// =================================
app.post('/', (req, res) => {
    var body = req.body
    Usuario.findOne({ email: body.email}, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: `Error al buscar usuario`,
                errors: err
            })
        }

        if(!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas - email`,
                errors: err
            });
        }

        if(!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: `Credenciales incorrectas - password`,
                errors: err
            });
        }

        //Crear un token!!!
        usuarioDB.password = ':)'
        var token = jwt.sign({ usuario: usuarioDB }, SEED , {expiresIn: 14400 })

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id,
            mensaje: 'Login post correcto'
        })
    })

})

module.exports = app