import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { evaluateBadges } from "../services/badgeService";

/**
 * Devuelve el documento de stats del usuario
 * y dispara evaluateBadges cuando cambia.
 *
 * @param {string} uid
 * @returns {object|null} stats
 */
export function useUserStats(uid) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!uid) return;                       // aún no hay usuario

    const ref = doc(db, "usuarios", uid, "stats", "current");
    const unsub = onSnapshot(ref, snap => {
      const data = snap.exists() ? snap.data() : null;
      setStats(data);
      if (data) evaluateBadges(uid, data);
    });

    return unsub;
  }, [uid]);

  return stats;
}
