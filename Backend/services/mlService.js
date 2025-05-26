exports.predecirProgreso = ({ interaccionesChat, sesiones, nivelDiscapacidad }) => {
  const puntaje = interaccionesChat + sesiones - nivelDiscapacidad;
  return puntaje > 10 ? "mejorará" : "se mantendrá igual";
};
