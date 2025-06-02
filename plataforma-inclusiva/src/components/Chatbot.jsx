import Linkify from 'react-linkify';
import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { addDoc, collection, serverTimestamp, doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";          // ← ajusta si tu ruta es distinta
import VoiceInput from "./VoiceInput";           // ← ajusta si está en otra carpeta

const neon = "#39FF14";
const topics = ["algebra","matrices","probabilidad" /* …otros temas… */];
const CONTENT_THRESHOLD = 5;

export default function Chatbot() {
  /* -------------------- estados -------------------- */
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState("");
  const [uid,      setUid]      = useState(null);
  const [style,    setStyle]    = useState("visual");
  const bottomRef              = useRef(null);

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
    <section className="flex flex-col gap-4">
      {/* historial */}
      <div className="h-[60vh] overflow-y-auto space-y-3 p-4
                bg-crema/90 backdrop-blur-sm rounded-xl shadow-inner">
  {messages.map((m,i)=>(  
  <div  
    key={i}  
    className={clsx(  
      "max-w-xs px-4 py-2 rounded-lg text-sm",
      "max-w-xs px-4 py-2 rounded-lg text-sm break-words",  
      m.role==="user"  
        ? "ml-auto bg-botella text-crema"  
        : "bg-grisazo text-crema"  
    )}  
  >  
  <Linkify
      componentDecorator={(decoratedHref, decoratedText, key) => (
        <a
          key={key}
          href={decoratedHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: neon,
            textDecoration: 'underline',
          }}
        >
          {decoratedText}
        </a>
      )}
    >
      {m.text}
    </Linkify>
  </div>  
))}
</div>

      {/* entrada texto */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTextSend()}
          placeholder="Escribe…"
          className="flex-1 rounded-lg border-gray-300 px-3 py-2 focus:ring-brand-500 focus:border-brand-500"
        />
        <button
          onClick={handleTextSend}
          className="px-4 rounded-lg bg-brand-500 text-white hover:bg-brand-600"
        >
          Enviar
        </button>
      </div>

      {/* entrada voz */}
      {style !== "visual" && <VoiceInput onSubmit={handleVoiceSend} />}
    </section>
  );
}


