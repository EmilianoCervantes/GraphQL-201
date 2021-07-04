const { gql } = require('apollo-server');

/**
 * Schema
 * "typeDefs" es el estándar para definirlos
 * "gql" es para definir sintaxis de GraphQL
 */

/**
 * Recordatorios:
 * - Query es un GET/Select, es la R en CRUD
 * - Mutation es todo lo demás y por tanto suelen haber más Mutations que Queries.
 */

/**
 * Misma situación que con Queries.
 * El nombre del "Mutation" debe ser replicado en los resolvers
 */

/**
 * NOTAS:
 * type Usuario no tiene password porque no es algo que queremos REGRESAR.
 * - Sería inseguro.
 * fechaCreacion es de tipo String, ¿por qué no Date?
 * - Sólo hay 5 tipos de datos en GraphQL: Boolean, Float, ID, Int, String.
 * - ID: número único que generalmente viene de BDD.
 * Modelo no requiere un id, pero aquí si lo requerimos y lo podemos regresar.
 * Input es para lo que debemos recibir.
 * - Ponemos "!" para los inputs obligatorios.
 */
const typeDefs = gql`
  type Usuario {
    id: ID
    nombre: String
    apellido: String
    email: String
    fechaCreacion: String
  }

  type TopVendedor {
    totalVendido: Float
    vendedor: [Usuario]
  }

  type Token {
    token: String
  }

  type Producto {
    id: ID
    nombre: String
    existencia: Int
    precio: Float
    fechaCreacion: String
  }

  type Cliente {
    id: ID
    nombre: String
    apellido: String
    empresa: String
    email: String
    telefono: String
    fechaCreacion: String
    vendedorQueLoDioDeAlta: ID
  }

  # A diferencia de cliente, este también es cuánto nos han comprado
  type TopCliente {
    totalCompra: Float
    cliente: [Cliente]
  }

  type Pedido {
    id: ID
    pedido: [PedidoProducto]
    total: Float
    clientePedido: ID
    vendedorPedido: ID
    estatus: EstatusPedido
    fechaCreacion: String
  }

  type PedidoProducto {
    idProducto: ID
    cantidad: Int
  }

  input UsuarioInput {
    nombre: String!
    apellido: String!
    email: String!
    password: String!
  }
  
  input AutenticarInput {
    email: String!
    password: String!
  }

  input ProductoInput {
    nombre: String!
    existencia: Int!
    precio: Float!
  }

  input ClienteInput {
    nombre: String!
    apellido: String!
    empresa: String!
    email: String!
    telefono: String
    # vendedorQueLoDioDeAlta: String! # no se pasará por input, sino cia CTX
  }

  input PedidoInput {
    pedido: [PedidoProductoInput]!
    total: Float!
    clientePedido: ID!
    # vendedorPedido # se pasará via CTX
    estatus: EstatusPedido
  }

  input PedidoProductoInput {
    idProducto: ID!
    cantidad: Int!
  }

  enum EstatusPedido {
    PENDIENTE
    COMPLETADO
    CANCELADO
  }

  type Query {
    # Usuarios
    obtenerUsuario: Usuario

    # Productos
    ## Select que toma todos los productos, no es necesario un input '()'
    obtenerProductos: [Producto]
    obtenerProducto(id: ID!): Producto

    # Clientes
    obtenerClientes: [Cliente]
    obtenerClientesVendedor: [Cliente]
    obtenerCliente(id: ID!): Cliente

    # Pedidos
    obtenerPedidos: [Pedido]
    obtenerPedidosVendedor: [Pedido]
    obtenerPedidoEspecifico(id: ID!): Pedido
    obtenerPedidosEstatus(estatus: EstatusPedido!): [Pedido]

    # Búsquedas avanzadas
    mejoresClientes: [TopCliente]
    mejoresVendedores: [TopVendedor]
    productosPorNombre(text: String!): [Producto]
  }

  type Mutation {
    # Usuarios
    crearUsuario(input: UsuarioInput): Usuario
    autenticarUsuario(input: AutenticarInput): Token

    # Productos
    nuevoProducto(input: ProductoInput): Producto
    # se pueden pasar múltiples parámetros
    actualizarProducto(id: ID!, input: ProductoInput): Producto
    eliminarProducto(id: ID!): String

    # Clientes
    nuevoCliente(input: ClienteInput): Cliente
    actualizarCliente(id: ID!, input: ClienteInput): Cliente
    eliminarCliente(id: ID!): String

    # Pedidos
    nuevoPedido(input: PedidoInput): Pedido
    actualizarPedido(id: ID!, input: PedidoInput): Pedido
    eliminarPedido(id: ID!): String
  }
`;

module.exports = typeDefs;