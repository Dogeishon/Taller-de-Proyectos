// src/components/EstiloAprendizaje.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const preguntas = [
  {
    texto: "¿Cómo prefieres aprender algo nuevo?",
    opciones: [
      { texto: "Viendo imágenes o diagramas", tipo: "visual" },
      { texto: "Escuchando explicaciones", tipo: "auditivo" },
      { texto: "Haciendo algo con tus manos", tipo: "kinestesico" }
    ]
  },
  {
    texto: "Cuando estudias, ¿qué método usas más?",
    opciones: [
      { texto: "Haces mapas o esquemas", tipo: "visual" },
      { texto: "Grabas y escuchas audio", tipo: "auditivo" },
      { texto: "Practicas con ejercicios o experimentos", tipo: "kinestesico" }
    ]
  },
  {
    texto: "¿Qué haces cuando alguien te da direcciones?",
    opciones: [
      { texto: "Dibujas un mapa mentalmente", tipo: "visual" },
      { texto: "Repites las instrucciones en voz alta", tipo: "auditivo" },
      { texto: "Te guías por puntos de referencia", tipo: "kinestesico" }
    ]
  }
];

export default function EstiloAprendizaje() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState([]);
  const navigate = useNavigate();
  const total = preguntas.length;

  const manejarRespuesta = (tipo) => {
    const nuevas = [...respuestas, tipo];
    setRespuestas(nuevas);

    if (preguntaActual < total - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      finalizarTest(nuevas);
    }
  };

  const finalizarTest = async (respuestasFinales) => {
    const conteo = { visual: 0, auditivo: 0, kinestesico: 0 };
    respuestasFinales.forEach((t) => conteo[t]++);
    const estiloFinal = Object.keys(conteo).reduce((a, b) =>
      conteo[a] > conteo[b] ? a : b
    );

    try {
      const user = auth.currentUser;
      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, {
        estiloAprendizaje: estiloFinal,
        estiloTestCompletado: true
      });
      navigate("/Chatbot");
    } catch (error) {
      console.error("Error al guardar estilo de aprendizaje:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 py-10">
      <div className="w-full max-w-lg bg-crema/90 backdrop-blur-md
                rounded-2xl shadow-xl p-8 space-y-6">
        {/* Barra de progreso */}
         <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-300"
            style={{ width: `${((preguntaActual + 1) / total) * 100}%` }}
          />
        </div>

        {/* Pregunta */}
        <h2 className="text-lg font-medium text-gray-800">
          {preguntas[preguntaActual].texto}
        </h2>

        {/* Opciones */}
        <div className="grid gap-4">
          {preguntas[preguntaActual].opciones.map((opcion, idx) => (
            <button
              key={idx}
              onClick={() => manejarRespuesta(opcion.tipo)}
              className="w-full py-2 rounded-lg bg-botella text-crema hover:bg-botella/90"
  >
              {opcion.texto}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
