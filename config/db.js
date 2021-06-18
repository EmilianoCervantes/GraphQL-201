const mongoose = require('mongoose');
// No hay que asignar una variable
require('dotenv').config({ path: '.env' });

const conectarDB = async () => {
  try {
    // La configuración dentro es sólo algo extra
    // Es por tema de deprecated
    await mongoose.connect(process.env.DB_MONGO, {
      useCreateIndex: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('DB CONECTADO');
  } catch (error) {
    console.log('ERROR CONECCIÓN DB', error);
    process.exit(1); // Detener la app
  }
};

module.exports = conectarDB;