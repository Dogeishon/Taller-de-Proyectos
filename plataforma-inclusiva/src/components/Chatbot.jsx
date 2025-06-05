import Linkify from 'react-linkify';
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";          // ← ajusta si tu ruta es distinta
import VoiceInput from "./VoiceInput";           // ← ajusta si está en otra carpeta
import { motion } from "framer-motion";
import {
  PaperAirplaneIcon,
  MicrophoneIcon,
  PlusIcon
} from "@heroicons/react/24/solid";
import CardGlass from "../components/CardGlass";
import { useNavigate } from "react-router-dom";

const neon = "#39FF14";
const topics = ["algebra","matrices","probabilidad" /* …otros temas… */];
const CONTENT_THRESHOLD = 5;
const bubble = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.23 } },
};


export default function Chatbot() {
  /* -------------------- estados -------------------- */
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [uid,      setUid]      = useState(null);
  const [style,    setStyle]    = useState("visual");
  const bottomRef              = useRef(null);
  const navigate = useNavigate();

  /* ---------------- usuario y estilo ---------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) return;
      setUid(user.uid);

      const snap   = await getDoc(doc(db, "usuarios", user.uid));
      const estilo = snap.data()?.estiloAprendizaje ?? "visual";
      setStyle(estilo);
    });
    return unsub;
  }, []);

  /* ---------------- helpers accesibilidad ---------- */
  const pickEmoji = (s) =>
    s === "visual"  ? "👁️"
    : s === "auditivo" ? "🎧"
    :                    "🤖";

  const speak = (txt) => {
    if (style !== "auditivo") return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "es-PE";
    speechSynthesis.speak(u);
  };

  /* ---------------- envío central ------------------ */
  const sendMessage = async (userText, source = "text") => {
    if (!userText.trim()) return;

    setMessages((m) => [...m, { role: "user", text: userText }]);

    try {
      const res   = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method : "POST",
        headers: { "Content-Type": "application/json" },
        body   : JSON.stringify({ sender: uid, message: userText, metadata: { style } }),
      });
      const data  = await res.json();
      const reply = data[0]?.text ?? "…";
      const replyWithIcon = `${pickEmoji(style)} ${reply}`;

      speak(reply);
      setMessages((m) => [...m, { role: "bot", text: replyWithIcon }]);

      await addDoc(collection(db, "chat_messages"), {
        uid,
        userText,
        botReply: reply,
        source,                          // 'text' | 'voice'
        ts: serverTimestamp(),
      });

      const userRef = doc(db, "usuarios", uid);

      const updates = {
        num_interactions: increment(1)
      };

      const textLower = userText.toLowerCase();
// comprueba si alguno de los topics aparece en el texto
      const isContentRequest = topics.some(topic =>
      textLower.includes(topic)
      );

      if (isContentRequest) {
      updates.num_content_requests = increment(1);
      }

      await updateDoc(userRef, updates);

      const snap2 = await getDoc(userRef);
      const data2 = snap2.data() || {};

      const inicial = data2.nivelDiscapacidad ?? 0;
      const requests = data2.num_content_requests || 0;

      const aumentó = requests >= CONTENT_THRESHOLD ? 1 : 0;
      let final = inicial - aumentó;

      if (final < 0) final = 0;

      await updateDoc(userRef, {
      nivelDiscapacidadFinal: final
      });

    } catch (err) {
      console.error("Error llamando a Rasa:", err);
      setMessages((m) => [...m, { role: "bot", text: "⚠️ Error al responder." }]);
    }
  };

  const handleTextSend  = () => { sendMessage(input, "text");  setInput(""); };
  const handleVoiceSend = (t) => { sendMessage(t,    "voice"); };

  /* ---------------- auto-scroll -------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- render ------------------------ */
  return (
  <div className="flex justify-center">
    <CardGlass className="w-full max-w-lg h-[80vh] flex flex-col">

      {/* CABECERA -------------------------------------------------- */}
      <header className="flex items-center gap-3 pb-3 border-b border-white/30">
        <img
          src="/bot-avatar.png"           /* cambia a tu avatar */
          alt="Bot"
          className="h-10 w-10 rounded-full border-2 border-white/70"
        />
        <h2 className="font-semibold text-lg text-madera">Chat Inclusivo</h2>
      </header>

      {/* MENSAJES -------------------------------------------------- */}
      <section
        className="flex-1 overflow-y-auto space-y-4 py-4 pr-1
                   scrollbar-thin scrollbar-thumb-madera/40"
      >
        {messages.map((m, i) => (
          <motion.div
            key={i}
            variants={bubble}
            initial="hidden"
            animate="show"
            className={clsx(
              "max-w-[75%] px-4 py-2 rounded-2xl shadow break-words",
              m.role === "user"
                ? "ml-auto bg-botella text-crema"
                : "mr-auto bg-crema/90 text-madera"
            )}
          >
            <Linkify
              componentDecorator={(href, text, key) => (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: neon, textDecoration: "underline" }}
                >
                  {text}
                </a>
              )}
            >
              {m.text}
            </Linkify>
          </motion.div>
        ))}
        {/* ref para scroll al final */}
        <div ref={bottomRef} />
      </section>

      {/* INPUT ----------------------------------------------------- */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleTextSend(); }}
        className="pt-3 flex items-center gap-2 border-t border-white/30"
      >
        <button type="button" className="icon-btn">
          <MicrophoneIcon className="h-6 w-6" />
        </button>
        <button type="button" className="icon-btn">
          <PlusIcon className="h-6 w-6" />
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe…"
          className="flex-1 px-3 py-2 rounded-lg border border-white/40
                     bg-white/25 backdrop-blur placeholder:text-madera/60
                     focus:outline-none focus:ring-2 focus:ring-madera"
        />

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="icon-btn bg-acento text-white"
        >
          <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
        </motion.button>
      </form>

      {/* VOZ + ACCESOS EXTERNOS ------------------------------------ */}
      {style !== "visual" && (
        <div className="pt-3">
          <VoiceInput onSubmit={handleVoiceSend} />
        </div>
      )}

      <div className="pt-4 flex flex-col md:flex-row gap-2 justify-center">
        <button
          onClick={() => navigate('/upload-pdf')}
          className="inline-flex items-center gap-2 bg-green-600 text-white
                     px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          📄 Subir un PDF
        </button>
        <button
          onClick={() => navigate('/biblioteca')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg
                     hover:bg-blue-700 transition"
        >
          Biblioteca
        </button>
      </div>
    </CardGlass>
  </div>
);

}


