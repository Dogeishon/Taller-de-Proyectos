router.get('/predecirUsuarios', async (req, res) => {
  try {
    const usuariosSnapshot = await db.collection('usuarios').get();
    const resultados = [];

    usuariosSnapshot.forEach(doc => {
      const datos = doc.data();

      // Aplicamos la función de predicción
      const resultado = predecirProgreso({
        interaccionesChat: datos.interaccionesChat,
        sesiones: datos.sesiones,
        nivelDiscapacidad: datos.nivelDiscapacidad
      });

      resultados.push({
        id: doc.id,
        nombre: datos.nombre,
        resultado
      });
    });

    res.json(resultados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al procesar predicciones' });
  } 
});

await db.collection('usuarios').doc(doc.id).update({
  prediccion: resultado
});

