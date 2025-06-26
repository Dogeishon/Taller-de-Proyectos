// src/services/badgeService.js  (versión modular)
import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebaseConfig";          // ajusta si tu ruta es otra
import localSeed from "../data/badgesSeed.json";

let masterCache = null;

/* ---------- 1. Obtener catálogo ---------- */
export async function getMasterBadges() {
  if (masterCache) return masterCache;

  try {
    const snap = await getDocs(collection(db, "badgesMaster"));
    masterCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.warn("⚠️ No se pudo leer badgesMaster, usando seed local");
    masterCache = localSeed;
  }
  return masterCache;
}

/* ---------- 2. Evaluar y otorgar ---------- */
export async function evaluateBadges(uid, stats) {
  const master = await getMasterBadges();

  // sub‐colección: /usuarios/{uid}/badges
  const userBadgesRef = collection(db, "usuarios", uid, "badges");
  const ownedSnap     = await getDocs(userBadgesRef);
  const owned         = new Set(ownedSnap.docs.map((d) => d.id));

  const ops = master.map(async (badge) => {
    if (owned.has(badge.id)) return;

    const { criteria } = badge;
    const earned =
      (criteria.logins            && stats.logins >= criteria.logins) ||
      (criteria.completedModules  && stats.completedModules >= criteria.completedModules) ||
      (criteria.bestLevel         && stats.bestLevel === criteria.bestLevel);

    if (earned) {
      // doc: /usuarios/{uid}/badges/{badgeId}
      const badgeDoc = doc(db, "usuarios", uid, "badges", badge.id);
      await setDoc(badgeDoc, {
        title:      badge.title,
        icon:       badge.icon,
        awardedAt:  serverTimestamp(),
      });
    }
  });

  return Promise.all(ops);
}
