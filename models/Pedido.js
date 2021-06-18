const mongoose = require('mongoose');

const ProductosSchema = mongoose.Schema({
  pedido: {
    required: true,
    type: Array,
  },
  total: {
    required: true,
    type: Number
  },
  clientePedido: {
    required: true,
    type: mongoose.Schema.Types.ObjectId, // Id del cliente
    ref: 'Cliente'
  },
  vendedorPedido: {
    required: true,
    type: mongoose.Schema.Types.ObjectId, // Id del vendedor
    ref: 'Usuario'
  },
  // Si es nuevo, completado o cancelado
  estatus: {
    default: 'PENDIENTE',
    trim: true,
    type: String,
  },
  fechaCreacion: {
    default: Date.now(),
    type: Date
  }
});

module.exports = mongoose.model('Pedido', ProductosSchema);