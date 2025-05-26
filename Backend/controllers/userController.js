const { validationResult } = require('express-validator');
const { predecirProgreso } = require('../services/mlService');
const { db } = require('../services/firebase');

exports.getUsuarios = async (req, res) => {
  try {
    const snapshot = await db.collection('usuarios').get();
    const usuarios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.predecir = async (req, res) => {
  // Validar errores de entrada
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const datos = req.body;

  try {
    const resultado = predecirProgreso(datos);

    await db.collection('predicciones').add({
      ...datos,
      resultado,
      fecha: new Date()
    });

    res.status(200).json({ mensaje: 'Predicción exitosa', resultado });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar predicción' });
  }
};
