module.exports = function (req, res, next) {
  const apiKey = req.header('x-api-key');

  if (!apiKey || apiKey !== process.env.API_KEY_SECRETA) {
    return res.status(403).json({ error: 'Acceso denegado. Clave API inválida o faltante.' });
  }

  next(); // Todo bien, continúa
};
