const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

const Button = ({
  children,
  variant = "primary",
  disabled,
  loading,
  className = "",
  onClick,
  type = "button",
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    onClick={onClick}
    className={`${variants[variant]} ${disabled || loading ? "opacity-50 cursor-not-allowed" : ""} inline-flex items-center justify-center gap-2 ${className}`}
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
    ) : null}
    {children}
  </button>
);

export default Button;
