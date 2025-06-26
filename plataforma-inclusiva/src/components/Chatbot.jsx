// src/components/Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import Linkify from "react-linkify";
import clsx from "clsx";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import VoiceInput from "./VoiceInput";
import { motion } from "framer-motion";
import { PaperAirplaneIcon, MicrophoneIcon, PlusIcon } from "@heroicons/react/24/solid";
import CardGlass from "./CardGlass";
import { useNavigate } from "react-router-dom";

/* 🏅  gamificación */
import { useUserStats } from "../hooks/useUserStats";
import useHasBadges from "../hooks/useHasBadges";
import BadgeShelf from "./BadgeShelf";

import ActionButton from "./ActionButton";
import { FilePlus, Library, ClipboardList, ChartBar, LogOut } from "lucide-react";

const neon = "#39FF14";
const topics = ["algebra", "matrices", "probabilidad"];
const CONTENT_THRESHOLD = 5;
const bubble = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.23 } },
};

export default function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uid, setUid] = useState(null);
  const [style, setStyle] = useState("visual");
  const bottomRef = useRef(null);
  const navigate = useNavigate();
  const hasBadges = useHasBadges(uid);
  const [showBadges, setShowBadges] = useState(false);

  useUserStats(uid);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), async (user) => {
      if (!user) return;
      setUid(user.uid);
      const snap = await getDoc(doc(db, "usuarios", user.uid));
      setStyle(snap.data()?.estiloAprendizaje ?? "visual");
      await setDoc(
        doc(db, "usuarios", user.uid, "stats", "current"),
        { logins: increment(1) },
        { merge: true }
      );
      setShowBadges(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (uid && hasBadges && showBadges) {
      const t = setTimeout(() => setShowBadges(false), 15000);
      return () => clearTimeout(t);
    }
  }, [uid, hasBadges, showBadges]);

  const pickEmoji = (s) => (s === "visual" ? "👁️" : s === "auditivo" ? "🎧" : "🤖");
  const speak = (txt) => {
    if (style !== "auditivo") return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = "es-PE";
    speechSynthesis.speak(u);
  };

  const sendMessage = async (userText, source = "text") => {
    if (!userText.trim()) return;
    setMessages((m) => [...m, { role: "user", text: userText }]);
    try {
      const res = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: uid, message: userText, metadata: { style } }),
      });
      const data = await res.json();
      const reply = data[0]?.text ?? "…";
      const replyWithIcon = `${pickEmoji(style)} ${reply}`;
      speak(reply);
      setMessages((m) => [...m, { role: "bot", text: replyWithIcon }]);

      await addDoc(collection(db, "chat_messages"), {
        uid,
        userText,
        botReply: reply,
        source,
        ts: serverTimestamp(),
      });

      const userRef = doc(db, "usuarios", uid);
      const low = userText.toLowerCase();
      const isReq = topics.some((tp) => low.includes(tp));
      await updateDoc(userRef, {
        num_interactions: increment(1),
        ...(isReq && { num_content_requests: increment(1) }),
      });

      const snap2 = await getDoc(userRef);
      const d = snap2.data() || {};
      const base = d.nivelDiscapacidad ?? 0;
      const reqs = d.num_content_requests || 0;
      const final = Math.max(0, base - (reqs >= CONTENT_THRESHOLD ? 1 : 0));
      await updateDoc(userRef, { nivelDiscapacidadFinal: final });
    } catch (err) {
      console.error("Error llamando a Rasa:", err);
      setMessages((m) => [...m, { role: "bot", text: "⚠️ Error al responder." }]);
    }
  };

  const handleTextSend = () => {
    sendMessage(input, "text");
    setInput("");
  };
  const handleVoiceSend = (t) => sendMessage(t, "voice");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {uid && hasBadges && showBadges && (
        <div className="fixed top-4 right-4 z-50">
          <BadgeShelf uid={uid} variant="toast" />
          <button
            onClick={() => setShowBadges(false)}
            className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full h-6 w-6 text-xs flex items-center justify-center shadow-lg"
            aria-label="Cerrar insignias"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex justify-center py-4">
        <CardGlass className="w-full max-w-lg h-[90vh] flex flex-col">
          {/* Cabecera */}
          <header className="flex items-center gap-3 pb-3 border-b border-white/30">
            <img
              src="/bot-avatar.png"
              alt="Bot"
              className="h-10 w-10 rounded-full border-2 border-white/70"
            />
            <h2 className="font-semibold text-lg text-madera">Chat Inclusivo</h2>
          </header>

          {/* Mensajes */}
          <section className="flex-1 overflow-y-auto space-y-4 py-4 pr-1 scrollbar-thin scrollbar-thumb-madera/40">
            {messages.map((m, i) => (
              <motion.div
                key={i}
                variants={bubble}
                initial="hidden"
                animate="show"
                className={clsx(
                  "max-w-[75%] px-4 py-2 rounded-2xl shadow break-words",
                  m.role === "user" ? "ml-auto bg-botella text-crema" : "mr-auto bg-crema/90 text-madera"
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
            <div ref={bottomRef} />
          </section>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTextSend();
            }}
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
              className="flex-1 px-3 py-2 rounded-lg border border-white/40 bg-white/25 backdrop-blur placeholder:text-madera/60 focus:outline-none focus:ring-2 focus:ring-madera"
            />
            <motion.button whileTap={{ scale: 0.9 }} className="icon-btn bg-acento text-white">
              <PaperAirplaneIcon className="h-6 w-6 rotate-90" />
            </motion.button>
          </form>

          {/* VoiceInput */}
          {style !== "visual" && (
            <div className="pt-3">
              <VoiceInput onSubmit={handleVoiceSend} />
            </div>
          )}

          {/* Barra de Navegación Inferior */}
          <div className="mt-auto">
            <div className="grid grid-cols-5 gap-2 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur rounded-t-lg">
              <ActionButton icon={FilePlus}      label="Subir PDF"  to="/upload-pdf" />
              <ActionButton icon={Library}       label="Biblioteca" to="/biblioteca" />
              <ActionButton icon={ClipboardList} label="Evaluar"    to="/evaluacion" />
              <ActionButton icon={ChartBar}      label="Dashboard"  to="/dashboard" />
              {/* Salir ahora lleva a la ventana ML de evidencia */}
              <ActionButton icon={LogOut}        label="Salir"      to="/fin" />
            </div>
          </div>
        </CardGlass>
      </div>
    </>
  );
}
