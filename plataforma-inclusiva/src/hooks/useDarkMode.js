import { useEffect, useState } from "react";

export default function useDarkMode() {
  const [enabled, setEnabled] = useState(() => {
    // ① lee preferencia guardada o la del SO
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // ② aplica o quita la clase en <html>
    document.documentElement.classList.toggle("dark", enabled);
    // ③ guarda preferencia
    localStorage.setItem("theme", enabled ? "dark" : "light");
  }, [enabled]);

  return [enabled, setEnabled];
}
