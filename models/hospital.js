var mongoose = require('mongoose')
var Schema = mongoose.Schema

var {ObjectId} = Schema.Types

var hospitalSchema = new Schema({
    nombre: {type: String, required:[true, 'El nombre es necesario']},
    img: {type: String, required:false},
    usuario: {type: ObjectId ,ref: 'Usuario'}
}, {collection: 'hospitales'})

module.exports = mongoose.model('Hospital', hospitalSchema)