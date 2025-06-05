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

      <ul className="space-y-4">
        {docs.map((docItem) => (
          <li
            key={docItem.id}
            className="border rounded-lg p-4 hover:shadow-lg transition"
          >
            <a
              href={docItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              {docItem.name}.pdf
            </a>

            <div className="mt-1 text-sm text-gray-700">
              <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded mr-2">
                Nivel: {docItem.nivel}
              </span>
              <span className="inline-block bg-gray-200 text-gray-800 px-2 py-1 rounded">
                Estilo: {docItem.tipoAprendizaje}
              </span>
            </div>

            {docItem.timestamp && (
              <p className="mt-1 text-xs text-gray-500">
                Subido el {new Date(docItem.timestamp).toLocaleString()}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
