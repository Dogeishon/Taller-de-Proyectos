// src/layouts/Layout.jsx
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div
      className="
        min-h-screen flex flex-col font-sans
        bg-gato-libro bg-cover bg-center
      "
    >
      <header className="h-14 flex items-center justify-between px-6
        bg-crema/90 shadow-md"
      >
        <h1 className="text-lg font-semibold text-madera">
          Plataforma Inclusiva
        </h1>
      </header>

      <main className="flex-1 flex justify-center p-4">
        <div className="w-full max-w-4xl space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

