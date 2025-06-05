export default function CardGlass({ children, className = "" }) {
  return (
    <div
      className={`
        rounded-2xl border border-white/40 bg-white/30
        backdrop-blur-md shadow-lg
        transition-transform duration-300 ease-out
        hover:-translate-y-2 hover:shadow-2xl
        ${className}
      `}
    >
      {children}
    </div>
  );
}
