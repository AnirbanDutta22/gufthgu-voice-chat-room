const Tag = ({ children, className = "", onRemove, onClick }) => (
  <span
    onClick={onClick}
    className={`inline-flex items-center gap-1 text-xs font-medium rounded-md ${onClick ? "cursor-pointer" : ""} ${className}`}
  >
    {children}
    {onRemove && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 text-text-muted hover:text-text-main"
      >
        ×
      </button>
    )}
  </span>
);

export default Tag;
