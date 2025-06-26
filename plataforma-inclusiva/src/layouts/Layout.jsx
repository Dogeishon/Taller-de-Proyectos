// src/layouts/Layout.jsx
import { Outlet } from "react-router-dom";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useState, useEffect, useRef } from "react";

import useDarkMode   from "../hooks/useDarkMode";
import useHasBadges  from "../hooks/useHasBadges";       // ← nuevo hook
import BadgeShelf     from "../components/BadgeShelf";

import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Layout() {
  /* Dark / Light ------------------------------------------------ */
  const [dark, setDark] = useDarkMode();

  /* Usuario y toast -------------------------------------------- */
  const [user, setUser]       = useState(null);
  const [showBadges, setShow] = useState(false);

  /* Refs auxiliares -------------------------------------------- */
  const firstEvent    = useRef(true);    // salto primer callback (sesión persistente)
  const prevUser      = useRef(null);    // valor anterior de user
  const timerRef      = useRef(null);    // timeout para ocultar
  const pendingToast  = useRef(false);   // marca: mostrar cuando haya badge

  /* Saber si el usuario YA tiene al menos un badge -------------- */
  const hasBadges = useHasBadges(user?.uid);

  /* Listener de autenticación ---------------------------------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (firebaseUser) => {

      /* 1. Saltar primer disparo (restauración) */
      if (firstEvent.current) {
        firstEvent.current = false;
        prevUser.current   = firebaseUser;
        setUser(firebaseUser);
        return;
      }

      const loggedIn  = prevUser.current === null && firebaseUser !== null;
      const loggedOut = firebaseUser === null;

      /* 2. Login nuevo → esperar a que aparezca primer badge */
      if (loggedIn) {
        setUser(firebaseUser);        // primero guardar el user
        pendingToast.current = true;  // marcar: cuando existan badges, mostrar
      }

      /* 3. Logout → ocultar inmediatamente */
      if (loggedOut) {
        setShow(false);
        pendingToast.current = false;
        clearTimeout(timerRef.current);
        setUser(null);
      }

      /* 4. Actualizar referencia */
      prevUser.current = firebaseUser;
    });

    return unsub;
  }, []);

  /* Mostrar toast cuando pending = true y ya hay badge ---------- */
  useEffect(() => {
    if (pendingToast.current && hasBadges) {
      setShow(true);
      pendingToast.current = false;  // consumimos la marca

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShow(false), 15000);  // 15 s
    }
  }, [hasBadges]);

  /* UI ---------------------------------------------------------- */
  return (
    <div className="min-h-screen relative font-sans">
      {/* Fondo y overlay */}
      <div className="absolute inset-0 bg-gato-libro bg-cover bg-center" />
      <div className="absolute inset-0 bg-crema/70 backdrop-blur-sm dark:bg-black/60" />

      {/* Toast de insignias */}
      {user && showBadges && (
        <div className="fixed z-50 top-4 right-4 hidden sm:block">
          <div className="relative">
            <BadgeShelf uid={user.uid} large />

            {/* Botón cerrar */}
            <button
              onClick={() => setShow(false)}
              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700
                         text-white rounded-full h-6 w-6 text-xs flex items-center
                         justify-center shadow-lg"
              aria-label="Cerrar insignias"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Contenedor principal */}
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* HEADER */}
        <header className="
            h-14 px-6 flex items-center justify-between
            bg-crema/90 shadow-md
            dark:bg-black/50
          ">
          <h1 className="text-lg font-semibold text-madera dark:text-crema">
            Plataforma Inclusiva
          </h1>

          <button
            onClick={() => setDark(!dark)}
            className="p-2 rounded-full
                       bg-white/30 hover:bg-white/40
                       dark:bg-white/10 dark:hover:bg-white/20
                       backdrop-blur transition"
          >
            {dark
              ? <SunIcon className="h-5 w-5 text-yellow-300" />
              : <MoonIcon className="h-5 w-5 text-madera" />}
          </button>
        </header>

        {/* MAIN */}
        <main className="flex-1 flex justify-center items-start p-4">
          <div className="w-full max-w-4xl space-y-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
