import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { motion } from "framer-motion";

/**
 *  Muestra las insignias del usuario.
 *
 *  Props:
 *    - uid        : string  → id del usuario
 *    - large      : bool    → tamaño grande (sólo variante “default”)
 *    - variant    : "default" | "toast"
 */
export default function BadgeShelf({ uid, large = false, variant = "default" }) {
  const [badges, setBadges] = useState([]);

  useEffect(() => {
    if (!uid) return;
    const q = collection(db, "usuarios", uid, "badges");
    const unsub = onSnapshot(q, snap =>
      setBadges(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, [uid]);

  if (!badges.length) return null;

  /* ───────── VARIANTE “TOAST” ───────── */
  if (variant === "toast") {
    return (
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        exit={{   y: -16, opacity: 0 }}
        className="bg-white/70 dark:bg-black/50 backdrop-blur-lg
                   rounded-xl shadow-xl px-6 py-4 min-w-[260px]"
      >
        <h3 className="text-sm font-semibold text-center mb-3
                       text-madera dark:text-crema">
          ¡Tus logros!
        </h3>

        <div className="flex flex-wrap justify-center gap-4">
          {badges.map(({ id, title, icon }) => (
            <div key={id} className="flex flex-col items-center w-20">
              <img src={icon} alt={title} className="w-12 h-12" />
              <span className="text-[10px] text-center mt-1">{title}</span>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  /* ───────── VARIANTE “DEFAULT” (círculos) ───────── */
  const size     = large ? "w-20 h-20" : "w-14 h-14";
  const iconSize = large ? "w-10 h-10" : "w-8  h-8";
  const gap      = large ? "gap-6"     : "gap-4";

  return (
    <div className={`grid grid-cols-3 ${gap}`}>
      {badges.map(({ id, title, icon }) => (
        <motion.div
          key={id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className={`${size} rounded-full bg-white/70 flex
                           items-center justify-center shadow`}>
            <img src={icon} alt={title} className={`${iconSize} object-contain`} />
          </div>
          <span className="text-xs mt-1 text-center">{title}</span>
        </motion.div>
      ))}
    </div>
  );
}
