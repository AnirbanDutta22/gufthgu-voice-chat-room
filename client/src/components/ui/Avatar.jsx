import { COLORS_AVATAR } from "../../constants";

const Avatar = ({
  user,
  size = 40,
  isSpeaking = false,
  isMuted = false,
  showBadge = false,
  className = "",
}) => {
  const sizeClass =
    {
      24: "w-6 h-6 text-xs",
      32: "w-8 h-8 text-xs",
      40: "w-10 h-10 text-sm",
      48: "w-12 h-12 text-sm",
      56: "w-14 h-14 text-base",
      64: "w-16 h-16 text-base",
      80: "w-20 h-20 text-xl",
      96: "w-24 h-24 text-2xl",
    }[size] || "w-10 h-10 text-sm";

  const name = user?.name || user?.username || "?";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const colorIndex = name.charCodeAt(0) % COLORS_AVATAR.length;
  const bgColor = COLORS_AVATAR[colorIndex];

  const ringStyle = isSpeaking
    ? {
        boxShadow: `0 0 0 2px #14142b, 0 0 0 4px #6bcb9e`,
        animation: "pulse 2s ease-in-out infinite",
      }
    : {};

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div
        className={`${sizeClass} rounded-full flex items-center justify-center font-display font-bold overflow-hidden`}
        style={{
          backgroundColor: user?.avatar ? "transparent" : bgColor,
          ...ringStyle,
        }}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-white select-none">{initials}</span>
        )}
      </div>

      {isMuted && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-surface-900 flex items-center justify-center border border-surface-800">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3l18 18M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"
              stroke="#ff6b6b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {showBadge && user?.isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent-mint border-2 border-surface-900" />
      )}
    </div>
  );
};

export default Avatar;
