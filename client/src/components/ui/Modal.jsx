import { useEffect } from "react";
import { RiCloseLine } from "react-icons/ri";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-text-main/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} bg-surface-card border-2 border-text-main rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "slideUp 0.2s ease-out" }}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-text-main/10">
            <h2 className="font-display text-2xl tracking-tight text-text-main">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors border border-transparent hover:border-text-main/10"
            >
              <RiCloseLine size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
};

export default Modal;
