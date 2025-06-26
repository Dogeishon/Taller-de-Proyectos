// src/hooks/useHasBadges.js
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";               // ajusta la ruta si tu archivo cambia

/**
 * Devuelve true cuando la sub-colección /usuarios/{uid}/badges
 * contiene al menos un documento (badge).
 */
export default function useHasBadges(uid) {
  const [hasBadges, setHasBadges] = useState(false);

  useEffect(() => {
    if (!uid) return;                                 // aún sin usuario
    const q = query(collection(db, "usuarios", uid, "badges"), limit(1));
    const unsub = onSnapshot(q, snap => setHasBadges(!snap.empty));
    return unsub;
  }, [uid]);

  return hasBadges;
}
