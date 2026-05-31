const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger:
    "px-5 py-2.5 rounded-xl font-body font-500 text-white transition-all duration-200 bg-red-500/80 hover:bg-red-500",
  icon: "p-2.5 rounded-xl transition-all duration-200 hover:bg-white/5 text-surface-400 hover:text-surface-100",
};

const sizes = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm",
  lg: "text-base px-6 py-3",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconRight,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${variants[variant]} ${size !== "md" ? sizes[size] : ""} ${disabled || loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} inline-flex items-center justify-center gap-2 ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        icon
      )}
      {children}
      {!loading && iconRight}
    </button>
  );
};

export default Button;
