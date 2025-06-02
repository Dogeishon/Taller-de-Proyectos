// src/components/VoiceInput.jsx
import { useState, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

export default function VoiceInput({ onSubmit }) {
  const [busy, setBusy] = useState(false);

  const {
    transcript,         // transcripción en vivo
    finalTranscript,    // solo cambia cuando el motor decide que terminaste
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  /* ① Cuando finalTranscript cambia y ya no estamos escuchando,
        enviamos el mensaje y limpiamos todo */
  useEffect(() => {
    if (!listening && finalTranscript.trim()) {
      setBusy(true);
      onSubmit(finalTranscript.trim());
      resetTranscript();
      setBusy(false);
    }
  }, [listening, finalTranscript, onSubmit, resetTranscript]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <p className="text-red-600">
        Tu navegador no soporta reconocimiento de voz.
      </p>
    );
  }

  /* ② Arrancar / detener escucha */
  const toggle = () => {
    if (listening) {
      SpeechRecognition.stopListening();       // el user forzó stop
    } else {
      SpeechRecognition.startListening({
        continuous: false,      // se detiene al detectar silencio (~1 s)
        interimResults: true,   // muestra palabras mientras hablas
        language: "es-PE",
      });
    }
  };

  /* ③ UI */
  return (
    <div className="flex flex-col gap-3">
      {/* pantalla de transcripción */}
      <div className="h-24 p-3 rounded border overflow-y-auto bg-white shadow-inner">
        {transcript ||
          (listening ? "Escuchando…" : "Pulsa el micrófono y habla")}
      </div>

      {/* botón único */}
      <button
        onClick={toggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center
          ${listening ? "bg-red-500" : "bg-indigo-600"} text-white shadow-lg`}
        aria-label={listening ? "Detener grabación" : "Hablar"}
      >
        {busy ? (
          <Loader2 className="animate-spin" />
        ) : listening ? (
          <MicOff />
        ) : (
          <Mic />
        )}
      </button>
    </div>
  );
}

