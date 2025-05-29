import React, { useState, useEffect } from "react";
import { serperSearch } from "../api/serperApi";

const Chatbot = ({ estiloUsuario }) => {
  const [mensajes, setMensajes] = useState([
    { autor: "bot", texto: "Hola 👋 ¿En qué puedo ayudarte hoy?" },
  ]);
  const [input, setInput] = useState("");

  const enviarMensaje = async () => {
    if (!input.trim()) return;

    const nuevoMensajeUsuario = { autor: "usuario", texto: input };
    setMensajes((prev) => [...prev, nuevoMensajeUsuario]);

    const consulta = input;
    const mensajeBusqueda = {
      autor: "bot",
      texto: `Estoy buscando información sobre "${consulta}"...`,
    };
    setMensajes((prev) => [...prev, mensajeBusqueda]);

    const resultados = await serperSearch(consulta);

    let respuestaBot = "Lo siento, no se encontraron resultados en este momento.";

    if (resultados.length > 0) {
      respuestaBot = "Aquí tienes recursos recomendados:\n\n" + resultados
        .map((item) => `📌 [${item.title}](${item.link})`)
        .join("\n");
    }

    setMensajes((prev) => [...prev, { autor: "bot", texto: respuestaBot }]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") enviarMensaje();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Chatbot Educativo</h2>
      <div style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px", marginBottom: "10px" }}>
        {mensajes.map((msg, idx) => (
          <p key={idx}>
            <strong>{msg.autor === "bot" ? "Chatbot:" : "Tú:"}</strong> {msg.texto}
          </p>
        ))}
      </div>
      <input
        type="text"
        placeholder="Escribe tu mensaje..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{ padding: "8px", width: "70%" }}
      />
      <button onClick={enviarMensaje} style={{ padding: "8px 12px", marginLeft: "10px" }}>
        Enviar
      </button>
    </div>
  );
};

export default Chatbot;

