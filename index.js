const { ApolloServer } = require('apollo-server');
const resolvers = require('./db/resolvers');
const typeDefs = require('./db/schema');
const conectarDB = require('./config/db');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: '.env' });

// Conectar a la base de datos
conectarDB();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Sin esto estipulado, no sirve el ctx en ningún resolver
  context: ({ req }) => {
    const token = req.headers['authorization'] || '';
    if (token) {
      try {
        const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET);
        return {
          usuario
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
});

/**
 * Puerto default es 4000
 * Para deploy en Heroku, el puerto te lo da automáticamente por "process.env.PORT"
 * 4000 lo mantenemos como el default
*/
server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Servidor listo en la URL: ${url}`);
});