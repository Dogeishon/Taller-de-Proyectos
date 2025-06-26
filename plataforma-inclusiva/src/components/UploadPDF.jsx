import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

/* ─── lista de temas reconocidos por el modelo ─── */
const TOPICS = [
  "algebra", "geometry", "calculus", "physics",
  "history", "literature", "biology", "chemistry",
  "english", "programming"
];

/* eliminar tildes y símbolos */
function sanitizeName(str) {
  return str
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "_");
}

export default function UploadPDF() {
  /* --------------- estado --------------- */
  const [user, setUser] = useState(null);

  const [nivel, setNivel]                 = useState("Básico");
  const [displayName, setDisplayName]     = useState("");
  const [tipoAprendizaje, setTipo]        = useState("visual");
  const [topic, setTopic]                 = useState("algebra");
  const [file,  setFile]                  = useState(null);

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const navigate = useNavigate();

  /* detectar usuario logueado */
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), setUser);
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-crema/90 backdrop-blur-sm">
        <p className="text-xl text-red-600 mb-4">
          Debes iniciar sesión para subir archivos.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Ir a Login
        </button>
      </div>
    );
  }

  /* --------------- submit --------------- */
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("El nombre del archivo es obligatorio.");
      return;
    }
    if (!file) {
      setError("Selecciona un archivo PDF.");
      return;
    }
    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF.");
      return;
    }

    setLoading(true);
    try {
      const timestamp = Date.now();
      const safeName  = sanitizeName(displayName);
      const filePath  = `${user.uid}/${safeName}_${timestamp}.pdf`;

      /* subir a Supabase Storage */
      const { error: uploadError } = await supabase
        .storage.from("pdfs")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      /* obtener URL pública */
      const { data: { publicUrl } } = supabase
        .storage.from("pdfs")
        .getPublicUrl(filePath);

      /* mapear nivel → difficulty numérico */
      const nivelMap     = { Básico: 1, Intermedio: 3, Avanzado: 5 };
      const difficulty   = nivelMap[nivel] ?? 3;

      /* guardar metadatos */
      const docRef = doc(db, "biblioteca", `${user.uid}_${timestamp}`);
      await setDoc(docRef, {
        uid: user.uid,
        difficulty,            // numérico
        style_tag: tipoAprendizaje,
        topic,
        name: safeName,
        url: publicUrl,
        timestamp
      });

      alert("PDF subido correctamente.");

      /* reset */
      setNivel("Básico");
      setDisplayName("");
      setTipo("visual");
      setTopic("algebra");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  /* --------------- UI --------------- */
  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Subir PDF</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nivel */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nivel
            </label>
            <select
              value={nivel}
              onChange={e => setNivel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option>Básico</option>
              <option>Intermedio</option>
              <option>Avanzado</option>
            </select>
          </div>

          {/* Nombre del archivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del archivo
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Ej: Algebra_basico"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tipo de aprendizaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de aprendizaje
            </label>
            <select
              value={tipoAprendizaje}
              onChange={e => setTipo(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="visual">Visual</option>
              <option value="auditivo">Auditivo</option>
              <option value="kinestésico">Kinestésico</option>
            </select>
          </div>

          {/* Tema */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tema
            </label>
            <select
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              {TOPICS.map(t => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Seleccionar PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Seleccionar PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={e => setFile(e.target.files[0])}
              className="mt-1 block w-full text-gray-700"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center px-4 py-2 rounded text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300"
            }`}
          >
            {loading ? "Subiendo…" : "Subir PDF"}
          </button>
        </form>
      </div>
    </div>
  );
}
