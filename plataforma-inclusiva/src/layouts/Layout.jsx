import { Outlet } from "react-router-dom";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import useDarkMode from "../hooks/useDarkMode";          // ⬅️ ajusta ruta si no usas alias

export default function Layout() {
  // hook: devuelve [bool, setBool]
  const [dark, setDark] = useDarkMode();

  return (
    /* 1️⃣ Contenedor raíz relativo */
    <div className="min-h-screen relative font-sans">

      {/* 2️⃣ Capa de la foto */}
      <div className="absolute inset-0 bg-gato-libro bg-cover bg-center" />

      {/* 3️⃣ Overlay que cambia con el modo */}
      <div className="
        absolute inset-0
        bg-crema/70 backdrop-blur-sm
        dark:bg-black/60
      " />

      {/* 4️⃣ Capa de contenido */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* HEADER -------------------------------------------------- */}
        <header
          className="
            h-14 px-6 flex items-center justify-between
            bg-crema/90 shadow-md
            dark:bg-black/50
          "
        >
          <h1 className="text-lg font-semibold text-madera dark:text-crema">
            Plataforma Inclusiva
          </h1>

          {/* 🔘 Botón dark / light */}
          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-full
                       bg-white/30 hover:bg-white/40
                       dark:bg-white/10 dark:hover:bg-white/20
                       backdrop-blur transition"
          >
            {dark
              ? <SunIcon  className="h-5 w-5 text-yellow-300" />
              : <MoonIcon className="h-5 w-5 text-madera" />}
          </button>
        </header>

        {/* MAIN ---------------------------------------------------- */}
        <main className="flex-1 flex justify-center items-start p-4">
          <div className="w-full max-w-4xl space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


