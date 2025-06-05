// src/components/AuthCard.jsx
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export default function AuthCard({ title, onSubmit, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* ⬇️ Caja glass animada */}
      <motion.div
        whileHover={{ y: -8, boxShadow: "0 12px 30px rgba(0,0,0,0.18)" }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="
          relative w-full max-w-sm p-8 space-y-6
          rounded-2xl border border-white/40
          bg-crema/60 backdrop-blur-md shadow-lg
        "
      >
        {/* encabezado */}
        <h2 className="text-xl font-semibold text-botella flex items-center gap-2">
          <LockClosedIcon className="h-6 w-6 text-botella" />
          {title}
        </h2>

        {/* formulario */}
        <form className="space-y-4" onSubmit={onSubmit}>
          {children}
        </form>

        {/* footer */}
        {footer}
      </motion.div>
    </div>
  );
}


