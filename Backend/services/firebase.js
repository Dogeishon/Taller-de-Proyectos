const admin = require('firebase-admin');
const path = require('path');

let app;

// Verificar si ya se inicializó
if (!admin.apps.length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(
      require(path.resolve(__dirname, '../taller-de-proyectos-fa7ee-firebase-adminsdk-fbsvc-b4703c356d.json'))
    )
  });
} else {
  app = admin.app(); // Usa la app ya inicializada
}

const db = admin.firestore();

module.exports = { admin, db };
