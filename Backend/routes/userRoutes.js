const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { db } = require('../services/firebase');


router.get('/usuarios', authMiddleware, userController.getUsuarios);

router.post(
  '/predecir',
  authMiddleware, // 👈 protección aquí también
  [
    body('interaccionesChat').isInt({ min: 0 }).withMessage('Debe ser número entero ≥ 0'),
    body('sesiones').isInt({ min: 0 }).withMessage('Debe ser número entero ≥ 0'),
    body('nivelDiscapacidad').isIn([1, 2, 3]).withMessage('Debe ser 1, 2 o 3')
  ],
  userController.predecir
);

router.post('/usuarios', async (req, res) => {
  try {
    const { nombre, nivelDiscapacidad } = req.body;

    if (!nombre || !nivelDiscapacidad) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    await db.collection('usuarios').add({
      nombre,
      nivelDiscapacidad,
      fechaRegistro: new Date()
    });

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});


module.exports = router;
