// src/components/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, increment, updateDoc, getFirestore } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "./AuthCard";               // ⬅️ contenedor visual


export default function Login() {
  const [correo,    setCorreo]    = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const navigate = useNavigate();

  /* ------- lógica Firebase (sin cambios) ------- */
  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
      const { user } = await signInWithEmailAndPassword(auth, correo, password)
      const uid = user.uid

      const userRef = doc(db, 'usuarios', uid)
      await updateDoc(userRef, {
        num_logins: increment(1)
      })

      const snap = await getDoc(doc(db, "usuarios", user.uid));
      if (!snap.exists()) throw new Error("Usuario sin documento");

      const datos = snap.data();
      if (!datos.estiloTestCompletado) {
        navigate("/estilo");
      } else {
        navigate("/chatbot");
      }
    } catch (err) {
      console.error(err);
      setError("Correo o contraseña incorrectos");
    }
  }

  /* ------------- UI estilizada ----------------- */
  return (
    <AuthCard
      title="Iniciar sesión"
      onSubmit={handleLogin}          /* AuthCard ya incluye <form> */
      footer={
        <p className="text-sm text-center text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="text-brand-600 hover:underline">
            Regístrate
          </Link>
        </p>
      }
    >
      {/* Campo correo */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Correo
        </label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border-gray-300 px-3 py-2
                     focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      {/* Campo contraseña */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 w-full rounded-lg border-gray-300 px-3 py-2
                     focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      {/* Mensaje de error */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Botón */}
      <button
  type="submit"
  className="
    w-full py-2 rounded-lg 
    bg-madera text-crema font-semibold 
    hover:bg-madera/90 
    focus:outline-none focus:ring-2 focus:ring-madera
    shadow-md
  "
>
        Ingresar
      </button>
    </AuthCard>
  );
}
