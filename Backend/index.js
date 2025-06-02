require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require("../actions/firebase-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Importar rutas
const userRoutes = require('./routes/userRoutes');
app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.send('Servidor Backend funcionando correctamente ✅');
});


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


