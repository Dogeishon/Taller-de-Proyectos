import { useState } from "react";

const preguntas = [
  {
    nivel: "medio",
    pregunta: "¿Cuál es la capital de Perú?",
    opciones: ["Cusco", "Arequipa", "Lima", "Trujillo"],
    correcta: "Lima",
  },
  {
    nivel: "difícil",
    pregunta: "¿Qué algoritmo de Machine Learning es supervisado?",
    opciones: ["K-Means", "Regresión logística", "Apriori", "PCA"],
    correcta: "Regresión logística",
  },
  {
    nivel: "fácil",
    pregunta: "¿Cuánto es 2 + 2?",
    opciones: ["3", "4", "5", "6"],
    correcta: "4",
  },
];

export default function EvaluacionAdaptativa() {
  const [fase, setFase] = useState("inicio");
  const [preguntaActual, setPreguntaActual] = useState(preguntas[0]);
  const [resultado, setResultado] = useState("");

  const manejarRespuesta = (respuesta) => {
    if (fase === "inicio") {
      if (respuesta === preguntaActual.correcta) {
        setPreguntaActual(preguntas[1]); // difícil
        setFase("dificil");
      } else {
        setPreguntaActual(preguntas[2]); // fácil
        setFase("facil");
      }
    } else {
      if (fase === "dificil" && respuesta === preguntaActual.correcta) {
        setResultado("¡Excelente! Dominio alto del contenido.");
      } else if (fase === "facil" && respuesta === preguntaActual.correcta) {
        setResultado("Bien, pero necesitas consolidar lo básico.");
      } else {
        setResultado("Te recomendamos repasar conceptos clave.");
      }
      setFase("final");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-2xl font-bold text-center">Evaluación Adaptativa</h2>

      {fase !== "final" ? (
        <>
          <p className="text-lg">{preguntaActual.pregunta}</p>
          <div className="grid grid-cols-2 gap-4">
            {preguntaActual.opciones.map((opcion, i) => (
              <button
                key={i}
                onClick={() => manejarRespuesta(opcion)}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                {opcion}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center">
          <p className="text-xl font-semibold">{resultado}</p>
          <button
            className="mt-4 bg-green-500 text-white py-2 px-6 rounded hover:bg-green-600"
            onClick={() => {
              setFase("inicio");
              setPreguntaActual(preguntas[0]);
              setResultado("");
            }}
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
