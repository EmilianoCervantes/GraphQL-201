const mongoose = require('mongoose');

/**
 * Forma que van a tener los datos en la base de datos
 * Va a tener mucha interacción con la base de datos.
 * DEBE TENER la misma forma que lo definido en el schema (db/schema.js)
 * Resolver es quien interactuará mucho con este modelo.
 */
const UsuariosSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true // Que elimine los espacios al inicio y al final automáticamente por Mongo
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true // Que no se puedan dar de alta dos veces con el mismo usuario
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now() // Nosotros no tenemos que hacer nada
  },
});

module.exports = mongoose.model('Usuario', UsuariosSchema);