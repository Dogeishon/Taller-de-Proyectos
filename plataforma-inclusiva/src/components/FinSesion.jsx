import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useImproveDecision from "../hooks/useImproveDecision";

export default function FinSesion() {
  const decide = useImproveDecision();
  const [prob, setProb] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    decide().then(setProb);
  }, [decide]);

  if (prob === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando análisis…</p>
      </div>
    );
  }

  const avanzado = prob >= 0.6;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">
        {avanzado ? "¡Excelente progreso! 🎉" : "¡Buen esfuerzo! 💡"}
      </h1>

      <p className="text-lg text-center max-w-md">
        {avanzado
          ? "Según tu participación, creemos que puedes pasar al siguiente nivel. Te recomendamos material avanzado."
          : "Parece que aún es mejor reforzar algunos conceptos. Te sugerimos material básico para consolidar tu aprendizaje."}
      </p>

      <button
        onClick={() => navigate("/chatbot")}
        className="
          bg-madera text-crema px-6 py-2 rounded-lg shadow
          hover:bg-madera/90 focus:ring-2 focus:ring-madera
        "
      >
        {avanzado ? "Ir a material avanzado" : "Reforzar conceptos"}
      </button>

      <p className="text-sm text-gray-500">
        Probabilidad de mejora calculada: {(prob * 100).toFixed(1)} %
      </p>
    </div>
  );
}
