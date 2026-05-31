const Tag = ({
  children,
  emoji,
  onRemove,
  onClick,
  active = false,
  size = "md",
}) => {
  const sizeClass =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200 ${sizeClass}
        ${
          active
            ? "bg-brand-600/20 text-brand-400 border border-brand-600/30"
            : "bg-white/5 text-surface-300 border border-white/8 hover:bg-white/8"
        }
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      {emoji && <span>{emoji}</span>}
      {children}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 text-surface-400 hover:text-surface-200"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Tag;
