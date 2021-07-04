const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');

require('dotenv').config({ path: '.env' })

/**
 * Función para crear y regresar un JWT
 * @param {any} info - qué info se almacenará en el JWT
 * @param {string} secret - palabra secreta
 * @param {string} expiration - tiempo de expiración del token
 * @returns JWT
 */
const crearToken = (info, secret, expiresIn) => {
  const { id, email, nombre, apellido } = info;

  // Firmar un nuevo jwt
  // Toma un payload
  return jwt.sign({ id, email, nombre, apellido }, secret, { expiresIn });
};

/**
 * Resolvers
 * Siempre son un objeto.
 * Si arriba en el Schema se puso "Query", pues en resolvers se escribe "Query".
 * 
 * No es necesario usar un map, filter u otra cosa. GraphQL se encarga de todo con base en lo que definas.
 */
const resolvers = {
  Query: {
    // INICIO USUARIOS
    obtenerUsuario: async (_, {}, ctx) => {
      if (!ctx?.usuario) throw new Error('No se ha ingresado')

      const user = await Usuario.findById(ctx.usuario?.id.toString());

      return user;
    },
    // FIN USUARIOS

    // INICIO PRODUCTOS
    obtenerProductos: async () => {
      try {
        // Find trae todos a partir de un filtrado
        // Vacío para que traiga todos.
        const productos = await Producto.find({});
        return productos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerProducto: async (_, { id }) => {
      // Revisar si existe o no
      const prod = await Producto.findById(id);
      if (!prod) throw new Error('Producto no encontrado');
      return prod;
    },
    // FIN PRODUCTOS

    // INICIO CLIENTES
    obtenerClientes: async () => {
      try {
        const clientes = await Cliente.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_, { }, ctx) => {
      try {
        const clientes = await Cliente.find({ vendedorQueLoDioDeAlta: ctx?.usuario?.id.toString() });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_, { id }, ctx) => {
      // Revisar si el cliente existe o no
      const cliente = await Cliente.findById(id);
      if (!cliente) throw new Error('Cliente no encontrado');

      // Sólo quien lo creó puede verlo
      if (cliente.vendedorQueLoDioDeAlta.toString() !== ctx?.usuario?.id) throw new Error('No cuentas con los permisos');

      // Paaó todas las validaciones
      return cliente;
    },
    // FIN CLIENTES

    // INICIO PEDIDOS
    obtenerPedidos: async () => {
      try {
        return await Pedido.find({});
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosVendedor: async (_, { }, ctx) => {
      try {
        return await Pedido.find({ vendedorPedido: ctx?.usuario?.id });
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidoEspecifico: async (_, { id }, ctx) => {
      const pedido = await Pedido.findById(id);

      if (pedido?.vendedorPedido.toString() !== ctx?.usuario?.id) throw new Error('No tienes permisos para este pedido');

      return pedido;
    },
    obtenerPedidosEstatus: async (_, { estatus }, ctx) => {
      try {
        return await Pedido.find({ vendedorPedido: ctx?.usuario?.id, estatus });
      } catch (error) {
        console.log(error);
      }
    },
    // FIN PEDIDOS

    // INICIO BUSQUEDAS AVANZADAS
    mejoresClientes: async (_, { }, _ctx) => {
      const clientes = await Pedido.aggregate([
        // Los signos de peso '$' significa que es código de MongoDB, no de mongoose.
        // $match --> de mongodb (como un WHERE)
        { $match: { estatus: 'COMPLETADO' } },
        {
          $group: {
            _id: "$clientePedido", // Nombre del modelo
            totalCompra: { $sum: '$total' }
          }
        },
        // Una especia de join
        {
          $lookup: {
            from: 'clientes',
            localField: '_id',
            foreignField: '_id',
            as: 'cliente'
          }
        },
        {
          $sort: { totalCompra: -1 } // Mayor primero
        }
      ]);

      return clientes;
    },
    mejoresVendedores: async () => {
      const vendedores = await Pedido.aggregate([
        { $match: { estatus: 'COMPLETADO' } },
        {
          $group: {
            _id: "$vendedorPedido",
            totalVendido: { $sum: '$total' }
          }
        },
        {
          $lookup: {
            from: 'usuarios',
            localField: '_id',
            foreignField: '_id',
            as: 'vendedor' // Como está en el schema TopVendedor
          }
        },
        { $limit: 5 },
        { $sort: { totalVendido: -1 } }
      ]);

      return vendedores;
    },
    productosPorNombre: async (_, { text }) => {
      const productos = await Producto.find({ $text: { $search: text } }).limit(10);
      return productos;
    },
    // FIN BUSQUEDAS AVANZADAS
  },
  Mutation: {
    // USUARIOS
    /**
     * Se reciben siempre 4 argumentos, aquí usaremos 1.
     * @param {any} _ - Objeto que contiene los resultados que regresa el resolver padre.
     * @param {object} input - Ese nombre de "input" es porque en el schema se definió así. Debe ser igual.
     */
    crearUsuario: async (_, { input }) => {
      // Revisar que el usuario no esté registrado previamente:
      const { email, password } = input;
      const existeUsuario = await Usuario.findOne({ email });
      if (existeUsuario) throw new Error('El usuario ya existe');

      // Hashear el password
      const salt = bcryptjs.genSaltSync(10); // 10 es arbitrario porque es buen número, 12 ya es tardado
      input.password = bcryptjs.hashSync(password, salt);

      // Guardar en base de datos
      try {
        const usuario = new Usuario(input);
        usuario.save();
        return usuario;
      } catch (error) {
        console.log('Error creando usuario', error);
      }
    },
    autenticarUsuario: async (_, { input }) => {
      const { email, password } = input;

      // Revisar si el usuario existe
      const userExistente = await Usuario.findOne({ email });
      if (!userExistente) throw new Error('El usuario no existe');

      // Revisar si el pass es correcto
      // const salt = bcryptjs.genSaltSync(10);
      // const pass = bcryptjs.hashSync(password, salt);
      const passCorrecto = await bcryptjs.compare(password, userExistente.password);

      if (!passCorrecto) throw new Error('El passowrd es incorrecto');

      // Crear el token

      try {
        return {
          // La palabra secreta vendrá de las ENV
          token: crearToken(userExistente, process.env.SECRET, '24h')
        }
      } catch (error) {
        console.log('Error en login', error);
      }
    },
    // FIN USUARIOS

    // INICIO PRODUCTOS
    nuevoProducto: async (_, { input }) => {
      const { nombre } = input;
      input.nombre = nombre.toUpperCase();
      // Verificar si el prod ya existe
      const existeProd = await Producto.findOne({ nombre: input.nombre });
      if (existeProd) throw new Error('Un producto con este nombre ya existe.');

      try {
        const producto = new Producto(input);
        const res = await producto.save();
        return res;
      } catch (error) {
        console.log('Error creación producto', error);
      }
    },
    actualizarProducto: async (_, { id, input }) => {
      // Primero revisar que existe
      let prod = await Producto.findById(id);
      if (!prod) throw new Error('Producto no encontrado');

      // Luego hay que validar que los valores
      const { nombre, existencia, precio } = input;
      input.nombre = nombre ? nombre : prod.nombre;
      input.nombre = input.nombre.toUpperCase();
      input.existencia = existencia < 0 ? prod.existencia : existencia;
      input.precio = precio < 0 ? prod.precio : precio;

      // Por último actualizar y regresar
      // el tercer parámetro es para que nos regrese el nuevo y no el viejo por cualquier cosa
      prod = await Producto.findByIdAndUpdate(id, input, { new: true });
      return prod;
    },
    eliminarProducto: async (_, { id }) => {
      // Primero revisar que existe
      const prod = await Producto.findById(id);
      if (!prod) throw new Error('Producto no encontrado');

      // Eliminar
      try {
        await Producto.findByIdAndDelete({ _id: id });
        return 'Producto eliminado';
      } catch (error) {
        console.log(error);
      }
    },
    // FIN PRODUCTOS

    // INICIO CLIENTES
    nuevoCliente: async (_, { input }, ctx) => {
      // Verificar si ya existe el cliente
      const { email } = input;
      const cliente = await Cliente.findOne({ email });
      if (cliente) throw new Error('Este cliente ya fue registrado')

      const nuevoCliente = new Cliente(input);
      // Asignar un vendedor
      const { usuario } = ctx;
      nuevoCliente.vendedorQueLoDioDeAlta = usuario?.id;

      // Guardarlo en la base de datos
      const res = await nuevoCliente.save();
      return res;
    },
    actualizarCliente: async (_, { id, input }, ctx) => {
      // Revisar que exista:
      let cliente = await Cliente.findById(id);
      if (!cliente) throw new Error('Cliente no encontrado');

      // Revisar que el cliente sea del vendedor
      if (cliente.vendedorQueLoDioDeAlta.toString() !== ctx?.usuario?.id) throw new Error('No cuentas con los permisos');

      // Validar los valores
      const { nombre, apellido, empresa, email, telefono } = input;
      input.nombre = nombre ? nombre : cliente.nombre;
      input.apellido = apellido ? apellido : cliente.apellido;
      input.empresa = empresa ? empresa : cliente.empresa;
      input.email = email ? email : cliente.email;
      input.telefono = telefono ? telefono : cliente.telefono;

      cliente = await Cliente.findByIdAndUpdate(id, input, { new: true });
      return cliente;
    },
    eliminarCliente: async (_, { id }, ctx) => {
      const cliente = await Cliente.findById(id);
      if (!cliente) throw new Error('Cliente no encontrado');

      if (cliente.vendedorQueLoDioDeAlta.toString() !== ctx?.usuario?.id) throw new Error('No cuentas con los permisos');

      try {
        await Cliente.findByIdAndDelete({ _id: id });
        return "Cliente eliminado exitosamente"
      } catch (error) {
        console.log(error);
      }
    },
    // FIN CLIENTES

    // INICIO PEDIDOS
    nuevoPedido: async (_, { input }, ctx) => {
      const { clientePedido, pedido } = input;
      // Verificar si cliente existe
      const cliente = await Cliente.findById(clientePedido);
      if (!cliente) throw new Error('Cliente no encontrado');

      // Veriticar si el cliente es del vendedor
      if (cliente.vendedorQueLoDioDeAlta.toString() !== ctx?.usuario?.id) throw new Error('No cuentas con los permisos');

      // Revisar que stock esté disponible
      for await (const prod of pedido) {
        const { idProducto, cantidad } = prod;
        const producto = await Producto.findById(idProducto);
        const { existencia, nombre } = producto;

        if (cantidad > existencia) throw new Error(`Sólo quedan ${existencia} del producto: ${nombre}`);
        // Restar a la existencia disponible
        producto.existencia = existencia - cantidad;
        await producto.save();
      }

      // Crear un nuevo pedido
      const nuevoPedido = new Pedido(input);
      // Asignar un vendedor
      nuevoPedido.vendedorPedido = ctx?.usuario?.id;

      // Guardar en base de datos
      const res = await nuevoPedido.save();
      return res;
    },
    actualizarPedido: async (_, { id, input }, ctx) => {
      const { pedido, total, clientePedido, estatus } = input;

      const pedidoExiste = await Pedido.findById(id);
      if (!pedidoExiste) throw new Error('El pedido no existe');

      // Que el cliente exista
      input.pedido = pedido?.length ? pedido : pedidoExiste.pedido;
      input.clientePedido = clientePedido ? clientePedido : pedidoExiste.clientePedido;
      input.total = total ? total : pedidoExiste.total;
      input.estatus = estatus ? estatus : pedidoExiste.estatus;

      const cliente = await Cliente.findById(input.clientePedido);

      if (!cliente) throw new Error('Cliente no existe');

      // Cliente y pedido del vendedor
      if (pedidoExiste.vendedorPedido.toString() !== ctx?.usuario?.id) throw new Error('No tienes permisos para este pedido');

      if (cliente.vendedorQueLoDioDeAlta.toString() !== ctx?.usuario?.id) throw new Error('No tienes permisos para este cliente');

      // Revisar que stock esté disponible
      if (pedido?.length) {
        for await (const prod of pedido) {
          const { idProducto, cantidad } = prod;
          const producto = await Producto.findById(idProducto);
          const { existencia, nombre } = producto;

          if (cantidad > existencia) throw new Error(`Sólo quedan ${existencia} del producto: ${nombre}`);
          // Restar a la existencia disponible
          const cantidadPrevia = pedidoExiste.pedido.find(prod => prod.idProducto === idProducto)?.cantidad;

          // Que no se sume lo original, sino sólo lo nuevo
          console.log('cantidadPrevia');
          console.log(cantidadPrevia);
          producto.existencia = existencia - cantidad + (cantidadPrevia || 0);
          await producto.save();
        }
      }

      return await Pedido.findByIdAndUpdate(id, input, { new: true });
    },
    eliminarPedido: async (_, { id }, ctx) => {
      const pedido = await Pedido.findById(id);
      if (!pedido) throw new Error('El pedido no existe');
      if (pedido.vendedorPedido.toString() !== ctx?.usuario?.id) throw new Error('No se tienen permisos para este pedido');

      for await (const prod of pedido.pedido) {
        const { idProducto, cantidad } = prod;
        const producto = await Producto.findById(idProducto);
        const { existencia } = producto;

        // Regresar las cosas a stock
        producto.existencia = existencia + cantidad;
        await producto.save();
      }

      await Pedido.findByIdAndDelete({ _id: id });

      return 'Pedido eliminado correctamente';
    }
    // FIN PEDIDOS
  }
};

module.exports = resolvers;