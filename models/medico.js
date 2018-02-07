var mongoose = require('mongoose')
var Schema = mongoose.Schema

var {ObjectId} = Schema.Types

var medicoSchema = new Schema({
    nombre: {type: String, required:[true, 'El nombre es necesario']},
    img: {type: String, required:false},
    usuario: {type: ObjectId, ref:'Usuario' ,required:true},
    hospital: {type: ObjectId, ref:'Hospital' ,required:[true, 'EL id del hospital es un campo obligatorio']}
})

module.exports = mongoose.model('Medico', medicoSchema)