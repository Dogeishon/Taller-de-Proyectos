// src/components/ActionButton.jsx
import { useNavigate } from "react-router-dom";

export default function ActionButton({ icon: Icon, label, to, onClick }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
    else if (onClick) onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center p-2 space-y-1
                 bg-white/90 dark:bg-gray-800/90 rounded-lg shadow
                 hover:bg-white dark:hover:bg-gray-700 transition"
    >
      <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
      <span className="text-xs text-gray-700 dark:text-gray-200">{label}</span>
    </button>
  );
}
