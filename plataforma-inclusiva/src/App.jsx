// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import Layout          from "./layouts/Layout";
import LandingPage     from "./components/LandingPage";
import Login           from "./components/Login";
import Registro        from "./components/registro";
import EstiloTest      from "./components/EstiloAprendizaje";
import Chatbot         from "./components/Chatbot";

/* ---- envoltorio para rutas protegidas ---- */
function PrivateRoute({ element }) {
  const [loading, setLoading] = useState(true);
  const [authed,  setAuthed]  = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (user) => {
      setAuthed(!!user);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return null;                  // puedes poner un spinner
  return authed ? element : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LandingPage />} />
        {/* 1. Login en la raíz */}
        <Route path="/login"    element={<Login />} />

        {/* 2. Registro */}
        <Route path="/registro" element={<Registro />} />

        {/* 3-4. Rutas protegidas (dentro del Layout) */}
        <Route
          element={
            <PrivateRoute element={<Layout />} />   // header + fondo
          }
        >
          <Route path="/EstiloAprendizaje"    element={<EstiloTest />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
