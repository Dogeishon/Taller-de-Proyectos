// src/components/UploadPDF.jsx

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

// ──── Función para eliminar acentos y caracteres inválidos ────
function sanitizeName(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "_");
}

export default function UploadPDF() {
  const [user, setUser] = useState(null);
  const [nivel, setNivel] = useState("Básico");
  const [displayName, setDisplayName] = useState("");
  const [tipoAprendizaje, setTipoAprendizaje] = useState("visual");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Detectar usuario autenticado
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Si no está logueado, mostramos mensaje
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

  // Manejar el submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
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

      // ────── Sanitizar “displayName” antes de usarlo en la key ──────
      const safeName = sanitizeName(displayName);
      const filePath = `${user.uid}/${safeName}_${timestamp}.pdf`;

      // Subir a Supabase Storage (bucket “pdfs”)
      const { error: uploadError } = await supabase
        .storage
        .from("pdfs")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      // Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase
        .storage
        .from("pdfs")
        .getPublicUrl(filePath);

      // Guardar metadatos en Firestore
      const docRef = doc(db, "biblioteca", `${user.uid}_${timestamp}`);
      await setDoc(docRef, {
        uid: user.uid,
        nivel,
        name: safeName,
        tipoAprendizaje,
        url: publicUrl,
        timestamp,
      });

      alert("PDF subido correctamente.");
      // Limpiar formulario
      setNivel("Básico");
      setDisplayName("");
      setTipoAprendizaje("visual");
      setFile(null);
    } catch (err) {
      console.error("Error al subir PDF:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 space-y-6">
        <h1 className="text-2xl font-bold text-center">Subir PDF</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo “Nivel” */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nivel
            </label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Básico">Básico</option>
              <option value="Intermedio">Intermedio</option>
              <option value="Avanzado">Avanzado</option>
            </select>
          </div>

          {/* Campo “Nombre del archivo” */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre del archivo
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ej: Algebra_basico"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Campo “Tipo de aprendizaje” */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tipo de aprendizaje
            </label>
            <select
              value={tipoAprendizaje}
              onChange={(e) => setTipoAprendizaje(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="visual">Visual</option>
              <option value="auditivo">Auditivo</option>
              <option value="kinestésico">Kinestésico</option>
            </select>
          </div>

          {/* Campo “Seleccionar PDF” */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Seleccionar PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 block w-full text-gray-700"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Botón de “Subir PDF” (verde, visible) */}
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

