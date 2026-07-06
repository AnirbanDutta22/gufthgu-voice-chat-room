import { COLORS_AVATAR } from "../../constants";

const Avatar = ({
  user,
  size = 40,
  isSpeaking = false,
  isMuted = false,
  showBadge = false,
  className = "",
}) => {
  const px =
    {
      24: "w-6 h-6 text-[9px]",
      28: "w-7 h-7 text-[10px]",
      32: "w-8 h-8 text-xs",
      36: "w-9 h-9 text-xs",
      40: "w-10 h-10 text-sm",
      48: "w-12 h-12 text-sm",
      56: "w-14 h-14 text-base",
      64: "w-16 h-16 text-base",
      72: "w-18 h-18 text-lg",
      76: "w-[76px] h-[76px] text-xl",
      80: "w-20 h-20 text-xl",
      84: "w-[84px] h-[84px] text-xl",
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

  const speakingRing = isSpeaking
    ? {
        outline: "3px solid #f59e0b",
        outlineOffset: "2px",
        transition: "outline 0.2s ease",
      }
    : {};

  const avatarUrl = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${import.meta.env.VITE_API_URL?.replace("/api/v1", "") || "http://localhost:5000"}${user.avatar}`
    : null;

  return (
    <div className={`relative inline-flex flex-shrink-0 ${className}`}>
      <div
        className={`${px} rounded-full flex items-center justify-center font-display font-bold overflow-hidden select-none`}
        style={{
          backgroundColor: avatarUrl ? "transparent" : bgColor,
          ...speakingRing,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <span className="text-white">{initials}</span>
        )}
      </div>

      {/* Muted badge */}
      {isMuted && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white border border-text-main/20 flex items-center justify-center shadow-sm">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 3l18 18M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6M17 16.95A7 7 0 015 12v-2m14 0v2a7 7 0 01-.11 1.23"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Online badge */}
      {showBadge && user?.isOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white shadow-sm" />
      )}
    </div>
  );
};

export default Avatar;
