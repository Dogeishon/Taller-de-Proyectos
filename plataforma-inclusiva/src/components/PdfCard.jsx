import { useState } from "react";
import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/24/solid";

/**
 * pdf = { id, url, name, nivel, tipoAprendizaje, timestamp }
 */
export default function PdfCard({ pdf }) {
  const [votes, setVotes] = useState({ useful: 0, notUseful: 0 });

  function handleVote(useful) {
    setVotes((v) => ({
      useful: useful ? v.useful + 1 : v.useful,
      notUseful: !useful ? v.notUseful + 1 : v.notUseful,
    }));
  }

  return (
    <article className="bg-white/90 backdrop-blur rounded-xl shadow p-4 space-y-2 hover:shadow-lg transition">
      <a
        href={pdf.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline font-medium"
      >
        {pdf.name}.pdf
      </a>

      <div className="text-sm text-gray-700">
        <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2">
          Nivel: {pdf.nivel}
        </span>
        <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded">
          Estilo: {pdf.tipoAprendizaje}
        </span>
      </div>

      {pdf.timestamp && (
        <p className="mt-1 text-xs text-gray-500">
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
          className="flex items-center gap-1 hover:text-green-600"
        >
          <HandThumbUpIcon className="h-5 w-5" /> {votes.useful}
        </button>

        <button
          onClick={() => handleVote(false)}
          className="flex items-center gap-1 hover:text-red-600"
        >
          <HandThumbDownIcon className="h-5 w-5" /> {votes.notUseful}
        </button>
      </div>
    </article>
  );
}
