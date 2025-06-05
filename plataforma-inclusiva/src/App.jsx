// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";


/* ---------- layouts / páginas ---------- */
import Layout from "./layouts/Layout";           
import LandingPage      from "./components/LandingPage";
import Login            from "./components/Login";
import Registro         from "./components/registro";
import EstiloTest       from "./components/EstiloAprendizaje";
import Chatbot          from "./components/Chatbot";
import UploadPDF        from "./components/UploadPDF";
import Library          from "./components/Library";

/* ---------- wrapper para rutas privadas ---------- */
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

  if (loading) return null;           // puedes colocar un spinner aquí
  return authed ? element : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PrivateRoute element={<Layout />} />}>
        {/* públicas */}
          <Route path="/"          element={<LandingPage />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/registro"  element={<Registro />} />

        {/* privadas dentro del layout común */}
        
          <Route path="/EstiloAprendizaje" element={<EstiloTest />} />
          <Route path="/chatbot"           element={<Chatbot />} />
          <Route path="/upload-pdf"        element={<UploadPDF />} />
          <Route path="/biblioteca"        element={<Library />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
