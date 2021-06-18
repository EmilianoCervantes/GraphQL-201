const mongoose = require('mongoose');

const ClientesSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  apellido: {
    type: String,
    required: true,
    trim: true
  },
  empresa: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  telefono: {
    type: String,
    trim: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now()
  },
  vendedorQueLoDioDeAlta: {
    type: mongoose.Schema.Types.ObjectId, // Id de un usuario (vendedor)
    required: true,
    ref: 'Usuario' // Dónde está la referencia del ObjectId
  }
});

module.exports = mongoose.model('Cliente', ClientesSchema);