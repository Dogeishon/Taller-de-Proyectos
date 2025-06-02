import { LockClosedIcon } from "@heroicons/react/24/outline";

export default function AuthCard({ title, onSubmit, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="relative z-10 w-full max-w-sm bg-crema/90 backdrop-blur-md
                rounded-2xl shadow-xl p-8 space-y-6">
        {/* encabezado */}
        <h2 className="text-xl font-semibold text-botella flex items-center gap-2">
    <LockClosedIcon className="h-6 w-6 text-botella" /> {title}
  </h2>

        {/* tu formulario real */}
        <form className="space-y-4" onSubmit={onSubmit}>
          {children}             {/* inputs y botón que ya tienes */}
        </form>

        {/* link para cambiar de login a registro o viceversa */}
        {footer}
      </div>
    </div>
  );
}

