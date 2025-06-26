import { useState } from "react";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";
import usePdfFeedback from "../hooks/usePdfFeedback";
import { auth } from "../firebaseConfig";

/**
 * pdf = { id, url, name, nivel, tipoAprendizaje, topic, difficulty, style_tag, timestamp }
 */
export default function PdfCard({ pdf }) {
  const [votes, setVotes]   = useState({ useful: 0, notUseful: 0 });
  const [openTime, setOpen] = useState(null);       // para medir tiempo
  const [sent, setSent]     = useState(false);      // evita doble voto

  const sendFeedback = usePdfFeedback();
  const uid = auth.currentUser?.uid;

  function handleOpen() {
    window.open(pdf.url, "_blank");
    setOpen(Date.now());
  }

  async function handleVote(useful) {
    if (sent || !uid) return;
    const spent = openTime ? Math.round((Date.now() - openTime) / 1000) : 0;

    // guarda en Firestore
    await sendFeedback({
      pdfId:       pdf.id,
      topic:       pdf.topic ?? "desconocido",
      difficulty:  pdf.difficulty ?? 1,
      styleMatch:  pdf.style_tag === pdf.tipoAprendizaje, // ajusta a tu lógica real
      timeSpent:   spent,
      wasUseful:   useful,
    });

    // actualiza contador local
    setVotes((v) => ({
      useful:    useful ? v.useful + 1 : v.useful,
      notUseful: useful ? v.notUseful : v.notUseful + 1,
    }));
    setSent(true);
  }

  return (
    <article className="bg-white/90 backdrop-blur rounded-xl shadow p-4 space-y-2 hover:shadow-lg transition">
      <button onClick={handleOpen} className="text-blue-600 hover:underline font-medium">
        {pdf.name}.pdf
      </button>

      <div className="text-sm text-gray-700">
        <span className="inline-block bg-gray-200 px-2 py-1 rounded mr-2">
          Nivel: {pdf.nivel}
        </span>
        <span className="inline-block bg-gray-200 px-2 py-1 rounded">
          Estilo: {pdf.tipoAprendizaje}
        </span>
      </div>

      {pdf.timestamp && (
        <p className="text-xs text-gray-500">
          Subido el{" "}
          {new Date(pdf.timestamp).toLocaleString("es-PE", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </p>
      )}

      {/* Botones 👍 👎 */}
      <div className="flex items-center gap-4 pt-2 text-sm select-none">
        <button
          onClick={() => handleVote(true)}
          disabled={sent}
          className="flex items-center gap-1 hover:text-green-600 disabled:opacity-50"
        >
          <HandThumbUpIcon className="h-5 w-5" /> {votes.useful}
        </button>

        <button
          onClick={() => handleVote(false)}
          disabled={sent}
          className="flex items-center gap-1 hover:text-red-600 disabled:opacity-50"
        >
          <HandThumbDownIcon className="h-5 w-5" /> {votes.notUseful}
        </button>
      </div>
    </article>
  );
}
