import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

import PdfCard from "./PdfCard";
import usePdfModel from "../hooks/usePdfModel";   // ⬅️ nuevo hook

/* ---------- helpers ---------- */
function sortByProb(arr) {
  return [...arr].sort((a, b) => (b.prob ?? -1) - (a.prob ?? -1));
}

export default function Library() {
  /* estado */
  const [user, setUser]       = useState(null);
  const [estilo, setEstilo]   = useState(null);   // visual / auditivo / …
  const [docs, setDocs]       = useState([]);
  const [loading, setLoading] = useState(true);

  /* modelo PDF */
  const { model, predictProb } = usePdfModel();

  /* 1) detectar auth y estilo */
  useEffect(() => {
    const stop = onAuthStateChanged(getAuth(), async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "usuarios", firebaseUser.uid));
        setEstilo(snap.data()?.estiloAprendizaje ?? null);
      }
    });
    return () => stop();
  }, []);

  /* 2) escuchar la colección biblioteca/{uid} */
  useEffect(() => {
    if (!user) {
      setDocs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const col = collection(db, "biblioteca");
    const q   = query(
      col,
      where("uid", "==", user.uid),
      orderBy("timestamp", "desc")         // fallback
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        const base = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDocs(base);          // primero carga la lista base
        setLoading(false);
      },
      (err) => {
        console.error("Error leyendo biblioteca:", err);
        setDocs([]);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  /* 3) cuando el modelo y la lista estén listos, calcula prob y reordena */
  useEffect(() => {
    if (!model || docs.length === 0) return;

    const scored = docs.map((pdf) => {
      const prob = predictProb({
        difficulty: pdf.difficulty ?? 1,
        styleMatch: estilo ? pdf.style_tag === estilo : false,
        timeSpent:  60,                        // estimación
        topic:      pdf.topic ?? "algebra",
      });
      return { ...pdf, prob };
    });

    console.table(
  scored.map(p => ({ id: p.id, prob: p.prob }))
);


    setDocs(sortByProb(scored));
  // Dependencias: solo recalcula cuando model o estilo estén listos
  //   o cambien los docs base.
  }, [model, estilo, docs.length]);  // ojo: docs.length evita efecto infinito

  /* ---------- UI ---------- */
  if (!user) return null;

  return (
    <div className="px-4">
      <h2 className="text-xl font-semibold mb-4">Tus PDFs Subidos</h2>

      {loading && <p>Cargando biblioteca…</p>}

      {!loading && docs.length === 0 && (
        <p className="text-sm text-gray-600">Aún no has subido ningún PDF.</p>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((pdf) => (
          <PdfCard key={pdf.id} pdf={pdf} />
        ))}
      </section>
    </div>
  );
}
