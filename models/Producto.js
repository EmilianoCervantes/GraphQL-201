const mongoose = require('mongoose');

const ProductosSchema = mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  existencia: {
    type: Number,
    required: true,
    trim: true
  },
  precio: {
    type: Number,
    required: true,
    trim: true
  },
  fechaCreacion: {
    type: Date,
    default: Date.now() // Nosotros no tenemos que hacer nada
  },
});

// Consultar un índice para búsquedas en barra de búsqueda como e-commerce
ProductosSchema.index({ nombre: 'text' });

module.exports = mongoose.model('Producto', ProductosSchema);