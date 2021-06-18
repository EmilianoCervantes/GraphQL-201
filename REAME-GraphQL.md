# Acerca de GraphQL

## Queries

### 4 términos clave en GraphQL:
1. Query
2. Mutation
3. Resolver
4. Schema

> Para tener un servidor de GraphQL se requiere un ```Query``` definido en un ```Schema``` y posea un ```Resolver```.

### Query
En un esquema tipo **CRUD** (Create, Read, Update, Delete), un query permite leer los registros.
Dentro del esquema de *CRUD*, un query es la **R**.
Es el equivalente al *```SELECT```* en SQL y al *```GET```* en una REST API.

#### Definición del Query:
1. Definir campos/datos que se pretenden consultar.
2. Establecer parámetros.
Nota: la sintaxis es universal sin importar en conjunto con qué otras tecnologías o frameworks se emplee GraphQL.

### Sintaxis Query
```
query {
  obtenerProductos {
    id
    nombre
    precio
    stock
  }
}
```

## Mutations
Se emplean para las otras 3 acciones del **C**R**U****D**: *crear, actualizar y eliminar*.
Son el equivalente de ```PUT/PATCH```, ```DELETE``` y ```POST``` en una REST API, así como un ```DELETE```, ```UPDATE``` e ```INSERT``` en SQL.

### Sintaxis Mutation
La palabra ```mutation``` seguidido del nombre y el input para localizar el registro en específico.
```
mutation eliminarProducto($id: ID) {
  eliminarProducto(id: $id)
}
```

## Schema
Describe tus tipos de objeto, queries y datos (la forma de los datos) de la aplicación.
*__QUERY__ es el único obligatorio dentro del SCHEMA.*

### Typing
El Schema en GraphQL utiliza un *Typing* en el que se define si un campo es tipo *string*, *int*, *boolean*, etc.

### Schema y Resolver
Están muy relacionados.
El Schema *define la forma*, mientras que el Resolver *se encarga de la comunicación con el lenguaje del servidor y la base de datos*.

### Sintaxis Schema
Esta sintaxis es 100% GraphQL.
```
type Cliente {
  id: ID
  nombre: String
  apellido: String
  empresa: String
  emails: [Email]
  edad: Int
}
type Email {
  email: String
}
```
```Email``` es por el tipo de dato que definimos.
Los corchetes ```[]``` que rodean a Email indican que se trata de un arreglo, en este caso, de un *arreglo de emails*.

#### Nota importante del Schema
Tal como está la sintaxis, es lo que se consultaría en la base de datos.
Es importante recalcar que **la estructura debe ser similar a la de tu _Base de Datos_**, de otra manera **arrojará el error de que el campo no lo pudo encontrar**.


## Resolvers
Funciones responsables de regresar los valores definido en el *Schema*.
*Queries y Mutations* no hacen nada por sí solos. Requieren un **backend** para realizar las operaciones en la base de datos.
Ese *backend* son los **Resolvers**.

### Nombres de los _Resolvers_
Exactamente los mismos que los definidos en el *Schema*.

### Sintaxis Resolver
La sintaxis del Resolver ya es más parecida a la de *Node*.
Un Resolver que se encarga de regresar todos los clientes:
```
obtenerClientes: async () => {
  const clientes = await Clientes.find({});
  return clientes;
}
```

### Schema y Resolver pt.2
En el *Schema* se tendría algo similar para obtener un cliente en específico:
En este *Schema* se especifica que se recibe un id y se regresa un *Cliente*.
```
type Query {
  obtenerCliente(id: ID): Cliente
}
```
En el mismo *Schema* se define a *Cliente*:
```
type Cliente {
  id: ID
  nombre: String
  apellido: String
  empresa: String
  emails: [Email]
  edad: Int
}
type Email {
  email: String
}
```
Del lado del **__Resolver__** se tiene exactamente lo mismo:
1. ```obtenerCliente```
2. Se emplea ```async``` y ```await```
3. Recibe un ```id```
```
obtenerCliente: async (_, { id }) => {
  const cliente = await Cliente.findById( id );
  return cliente;
}
```

### Ejecutar más de una consulta
En GraphQL puedes ejecutar más de una consulta al mismo tiempo:
```
query {
  obtenerCursos {
    titulo
  }
  obtenerTecnologia {
    tecnologia
  }
}
```
Y en la respuesta vendrá la info de las dos consultas:
```
{
  "data": {
    "obtenerCursos": [
      ...
    ],
    "obtenerTecnologia": [
      ...
    ]
  }
}
```

## Argumentos (Inputs)
Para poder recibir argumentos en las peticiones, hay que definir dentro del *Schema* esos argumentos.

### Sintaxis Inputs
La sintaxis es la siguiente y es muy similar a lo ya manejado, se emplea la palabra reservada **_input_**, su nombre y se abren llaves.
Dentro de las llaves se definen los parámetros que puede recibir.
Dichos parámetros pueden ser opcionales u obligatorios. Para que sean obligatorios es sólo agregar el símbolo de exclamación ```!```.
```
 input CursoInput {
   tecnologia: String
 }

 type Query {
   obtenerCursos(input: CursoInput!): [Curso]
 }
```

Ya del lado del *Resolver* se define la función ampliándola para que no sólo regrese el valor por default, sino el valor filtrado y acepte los argumentos:
```
obtenerCursos: (_, { input }, ctx) => {
  const resultado = cursos.filter(curso => curso.tecnologia === input.tecnologia);
  return resultado;
}
```
NOTA: los inputs pueden ir dentro de *Queries* o dentro de los *Resolvers* y la sintaxis es la misma.

### Argumentos como Variables por $
Cuando empleas variables se debe volver a declarar la función.
El nombre externo, la parte que envuelve todo se convierte en un alias y el interno es ya la función propiamente y como siempre con el nombre obligatorio que sea igual.
Por último, se debe establecer si es un *query* o un *mutation*.
```
query alias: ($var: DeclaracionEnSchema!) => {
  obtenerCursos(argumento: $var)
}
```
Ahora, por practicidad y no hacerse líos con los nombres, el alias y la función se pueden llamar igual:
```
query obtenerCursos: ($var: DeclaracionEnSchema!) => {
  obtenerCursos(argumento: $var)
}
```

## Context
Para manejar cosas globales como el usuario que está autenticado.
El contexto se define desde la instancia del *ApolloServer*:
```
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    const miContexto = 'Hola';
    return {
      miContexto
    }
  }
});
```
Cuando estamos ejecutando un resolver, automáticamente se pasa ese valor:
```
obtenerCursos: (_, { input }, ctx) => {
  console.log(ctx);
}
```
Con ese ```console.log()``` se podrá ver algo como:
```
{
  miContexto: 'Hola',
  _extensionStack: GraphQLExtensionStack { extensions: [] }
}
```