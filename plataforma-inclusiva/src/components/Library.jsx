// src/components/Library.jsx

import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import PdfCard from "./PdfCard";

export default function Library() {
  const [user, setUser] = useState(null);
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setDocs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const firestore = getFirestore();
    const colRef = collection(firestore, "biblioteca");
    const q = query(
      colRef,
      where("uid", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const unsubscribeSnap = onSnapshot(
      q,
      (snapshot) => {
        const arr = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setDocs(arr);
        setLoading(false);
      },
      (err) => {
        console.error("Error leyendo biblioteca:", err);
        setDocs([]);
        setLoading(false);
      }
    );

    return () => unsubscribeSnap();
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Tus PDFs Subidos</h2>

      {loading && <p>Cargando biblioteca…</p>}

      {!loading && docs.length === 0 && (
        <p className="text-sm text-gray-600">
          Aún no has subido ningún PDF.
        </p>
      )}

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {docs.map((docItem) => (
         <PdfCard key={docItem.id} pdf={docItem} />
        ))}
      </section>
    </div>
  );
}
