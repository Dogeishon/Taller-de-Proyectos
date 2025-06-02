// src/components/Registro.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "./AuthCard";

export default function Registro() {
  const [nombre,            setNombre]            = useState("");
  const [correo,            setCorreo]            = useState("");
  const [password,          setPassword]          = useState("");
  const [nivelDiscapacidad, setNivelDiscapacidad] = useState(1);
  const [mensaje,           setMensaje]           = useState("");
  const navigate = useNavigate();

  /* ---------- lógica Firebase (sin cambios) ---------- */
  async function handleRegistro(e) {
    e.preventDefault();
    setMensaje("");

    try {
      const cred = await createUserWithEmailAndPassword(auth, correo, password);
      const user = cred.user;

      await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        nombre,
        correo,
        nivelDiscapacidad,
        estiloAprendizaje: null,
        estiloTestCompletado: false,
        fechaRegistro: new Date(),
      });

      setMensaje("✅ Usuario registrado correctamente");
      navigate("/EstiloAprendizaje");                            // ir al test
    } catch (err) {
      console.error(err);
      setMensaje("❌ Error al registrar usuario");
    }
  }

  /* ----------------- UI estilizada ------------------- */
  return (
    <AuthCard
      title="Crear cuenta"
      onSubmit={handleRegistro}
      footer={
        <p className="text-sm text-center text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/" className="text-brand-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      }
    >
      {/* Nombre */}
      <Input
        label="Nombre"
        type="text"
        value={nombre}
        onChange={setNombre}
      />

      {/* Correo */}
      <Input
        label="Correo"
        type="email"
        value={correo}
        onChange={setCorreo}
      />

      {/* Contraseña */}
      <Input
        label="Contraseña"
        type="password"
        value={password}
        onChange={setPassword}
      />

      {/* Nivel de discapacidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nivel de discapacidad
        </label>
        <select
          value={nivelDiscapacidad}
          onChange={(e) => setNivelDiscapacidad(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border-gray-300 px-3 py-2
                     focus:ring-brand-500 focus:border-brand-500"
        >
          <option value={1}>Leve</option>
          <option value={2}>Moderada</option>
          <option value={3}>Severa</option>
        </select>
      </div>

      {/* mensaje de éxito / error */}
      {mensaje && <p className="text-sm mt-2">{mensaje}</p>}

      {/* botón */}
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
  Registrarse
</button>
    </AuthCard>
  );
}

/* --- input reutilizable --- */
function Input({ label, type, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="mt-1 w-full rounded-lg border-gray-300 px-3 py-2
                   focus:ring-brand-500 focus:border-brand-500"
      />
    </div>
  );
}
