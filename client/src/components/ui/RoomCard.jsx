import { useNavigate } from "react-router-dom";
import {
  RiGlobalLine,
  RiGroupLine,
  RiLockLine,
  RiUserVoiceLine,
} from "react-icons/ri";
import { TOPICS } from "../../constants";
import Avatar from "./Avatar";
import Tag from "./Tag";

const RoomCard = ({ room, showBookmarkIcon, bookmarkIcon }) => {
  const navigate = useNavigate();
  const typeIcons = {
    public: <RiGlobalLine size={13} />,
    social: <RiGroupLine size={13} />,
    private: <RiLockLine size={13} />,
  };

  const typeColors = {
    public: "text-accent-dark",
    social: "text-brand",
    private: "text-text-muted",
  };

  const speakers =
    room.participants?.filter((p) =>
      ["host", "co_host", "speaker"].includes(p.role),
    ) || [];

  return (
    <div
      className="room-card p-6 cursor-pointer relative flex flex-col justify-between"
      onClick={() => navigate(`/room/${room._id}`)}
    >
      <div>
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
            {showBookmarkIcon && bookmarkIcon ? (
              bookmarkIcon
            ) : (
              <>
                <span className={typeColors[room.type]}>
                  {typeIcons[room.type]}
                </span>
                <span className="text-text-muted">{room.type}</span>
              </>
            )}
            {room.isLive && (
              <>
                <span className="text-text-main/20">·</span>
                <span className="flex items-center gap-1 text-brand">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse inline-block" />
                  Live
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-text-muted text-xs font-semibold bg-surface-bg px-2 py-0.5 rounded border border-text-main/10">
            <RiUserVoiceLine size={12} />
            <span>{room.listenerCount || 0}</span>
          </div>
        </div>

        <h3 className="font-display text-2xl tracking-tight text-text-main leading-tight mb-4 line-clamp-2">
          {room.title}
        </h3>
      </div>

      <div>
        {speakers.length > 0 && (
          <div className="flex items-center gap-2 mb-4 border-t border-text-main/10 pt-4">
            <div className="flex -space-x-2">
              {speakers.slice(0, 4).map((s) => (
                <Avatar
                  key={s._id}
                  user={s}
                  size={26}
                  className="border border-text-main ring-2 ring-white"
                />
              ))}
            </div>
            <p className="text-xs font-semibold text-text-muted truncate">
              By{" "}
              <span className="text-text-main underline decoration-text-main/20 underline-offset-2">
                {speakers[0]?.name}
              </span>
              {speakers.length > 1 ? ` & ${speakers.length - 1} others` : ""}
            </p>
          </div>
        )}

        {room.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {room.topics.slice(0, 3).map((topic) => {
              const t = TOPICS.find((tp) => tp.id === topic);
              return t ? (
                <Tag
                  key={topic}
                  size="sm"
                  className="bg-surface-bg border border-text-main/20 text-text-main rounded-md font-medium px-2 py-0.5 text-xs"
                >
                  {t.emoji} {t.label}
                </Tag>
              ) : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
