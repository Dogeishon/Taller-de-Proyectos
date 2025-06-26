import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

/* ---------- layouts / páginas ---------- */
import Layout               from "./layouts/Layout";
import LandingPage          from "./components/LandingPage";
import Login                from "./components/Login";
import Registro             from "./components/Registro";
import Chatbot              from "./components/Chatbot";
import UploadPDF            from "./components/UploadPDF";
import Library              from "./components/Library";
import DashboardProgreso    from "./components/DashboardProgreso";
import EvaluacionAdaptativa from "./components/EvaluacionAdaptativa";
import FinSesion            from "./components/FinSesion";

/* ---------- wrapper para rutas privadas ---------- */
function PrivateRoute({ element }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed]   = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), user => {
      setAuthed(!!user);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return null;      // o un spinner
  return authed ? element : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTAS PÚBLICAS */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* RUTAS PRIVADAS */}
        <Route element={<PrivateRoute element={<Layout />} />}>
          {/* apunta a tu componente EvaluacionAdaptativa */}
          <Route path="/evaluacion" element={<EvaluacionAdaptativa />} />
          <Route path="/chatbot"     element={<Chatbot />} />
          <Route path="/upload-pdf"  element={<UploadPDF />} />
          <Route path="/biblioteca"  element={<Library />} />
          <Route path="/dashboard"   element={<DashboardProgreso />} />
          <Route path="/fin"         element={<FinSesion />} />
        </Route>

        {/* cualquier otra va a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
