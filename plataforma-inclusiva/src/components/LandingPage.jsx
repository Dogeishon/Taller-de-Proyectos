import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div
      className="
        min-h-screen flex items-center justify-center
        bg-gato-libro bg-cover bg-center
      "
    >
      <div
        className="
          bg-crema/80 backdrop-blur-md
          rounded-2xl p-12 max-w-md text-center space-y-6
          shadow-xl
        "
      >
        <h1 className="text-3xl font-bold text-madera">
          Bienvenido a Plataforma Inclusiva
        </h1>
        <p className="text-grisazo">
          Tu asistente inclusivo para aprender a tu manera
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <Link
            to="/Login"
            className="
              px-6 py-3 rounded-lg
              bg-botella text-crema font-medium
              hover:bg-botella/90
              focus:outline-none focus:ring-2 focus:ring-botella
            "
          >
            Iniciar sesión
          </Link>

          <Link
            to="/registro"
            className="
              px-6 py-3 rounded-lg
              bg-madera text-crema font-medium
              hover:bg-madera/90
              focus:outline-none focus:ring-2 focus:ring-madera
            "
          >
            Regístrate
          </Link>
        </div>
      </div>
    </div>
  );
}