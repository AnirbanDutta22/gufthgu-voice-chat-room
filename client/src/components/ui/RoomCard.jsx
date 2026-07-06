import { useNavigate } from "react-router-dom";
import { RiArrowRightLine, RiUserVoiceLine } from "react-icons/ri";
import Avatar from "./Avatar";
import { TOPICS } from "../../constants";

const RoomCard = ({ room, showBookmarkIcon = false, bookmarkIcon = null }) => {
  const navigate = useNavigate();

  const speakers =
    room.participants?.filter((p) =>
      ["host", "co_host", "speaker"].includes(p.role),
    ) || [];

  const hostUser = room.host || {};

  return (
    <div
      className="room-card p-5 md:p-6 cursor-pointer flex flex-col gap-4 group relative overflow-hidden"
      onClick={() => navigate(`/room/${room._id}`)}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted border border-text-main/15 px-2 py-0.5 rounded">
            {room.type || "public"}
          </span>
          {room.topics?.slice(0, 2).map((tid) => {
            const t = TOPICS.find((tp) => tp.id === tid);
            return t ? (
              <span
                key={tid}
                className="text-[10px] uppercase tracking-widest font-bold text-text-muted border border-text-main/10 px-2 py-0.5 rounded"
              >
                {t.emoji} {t.label}
              </span>
            ) : null;
          })}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {showBookmarkIcon && bookmarkIcon ? (
            <div className="flex items-center gap-1 text-xs font-bold">
              {bookmarkIcon}
            </div>
          ) : room.isLive ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              LIVE
            </div>
          ) : null}
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-display text-2xl md:text-3xl leading-tight mb-1 line-clamp-2 group-hover:text-brand transition-colors">
          {room.title}
        </h3>
        {hostUser.name && (
          <p className="text-sm font-medium text-text-muted">
            Hosted by{" "}
            <span className="text-text-main font-semibold underline decoration-text-main/20 underline-offset-2">
              {hostUser.name}
            </span>
          </p>
        )}
      </div>

      {/* Speakers avatars */}
      {speakers.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {speakers.slice(0, 4).map((s) => (
              <Avatar
                key={s._id}
                user={s}
                size={28}
                className="border-2 border-white"
              />
            ))}
          </div>
          <p className="text-xs font-semibold text-text-muted truncate">
            {speakers
              .slice(0, 2)
              .map((s) => s.name?.split(" ")[0])
              .join(", ")}
            {speakers.length > 2 && ` +${speakers.length - 2}`}
          </p>
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between border-t border-text-main/8 pt-3 mt-auto">
        <div className="flex items-center gap-1.5 text-sm font-bold text-text-muted">
          <RiUserVoiceLine size={15} />
          {room.listenerCount || 0} listening
        </div>
        <div className="w-8 h-8 rounded-full bg-text-main/5 border border-text-main/10 text-text-main flex items-center justify-center group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all">
          <RiArrowRightLine size={15} />
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
