import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RiMicLine,
  RiLockLine,
  RiGroupLine,
  RiGlobalLine,
  RiFireLine,
  RiRefreshLine,
} from "react-icons/ri";
import { fetchRooms, setFilters } from "../store/slices/roomSlice";
import { TOPICS, ROOM_TYPES } from "../constants";
import Avatar from "../components/ui/Avatar";
import Tag from "../components/ui/Tag";

const FILTER_TYPES = [
  { id: "all", label: "All Rooms", icon: <RiGlobalLine size={14} /> },
  { id: "public", label: "Public", icon: <RiGlobalLine size={14} /> },
  { id: "social", label: "Social", icon: <RiGroupLine size={14} /> },
  { id: "private", label: "Private", icon: <RiLockLine size={14} /> },
];

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const typeIcons = {
    public: <RiGlobalLine size={13} />,
    social: <RiGroupLine size={13} />,
    private: <RiLockLine size={13} />,
  };
  const typeColors = {
    public: "text-accent-mint",
    social: "text-accent-amber",
    private: "text-accent-violet",
  };
  const speakers =
    room.participants?.filter((p) =>
      ["host", "co_host", "speaker"].includes(p.role),
    ) || [];

  return (
    <div
      className="room-card p-5 cursor-pointer"
      onClick={() => navigate(`/room/${room._id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
          <span className={typeColors[room.type]}>{typeIcons[room.type]}</span>
          <span className="text-surface-500 capitalize">{room.type}</span>
          {room.isLive && (
            <>
              <span className="text-surface-600">·</span>
              <span className="flex items-center gap-1 text-accent-coral">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-coral animate-pulse inline-block" />
                Live
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 text-surface-400 text-xs flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span>{room.listenerCount || 0}</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-display font-semibold text-surface-100 text-base leading-snug mb-3 line-clamp-2">
        {room.title}
      </h3>

      {/* Speakers row */}
      {speakers.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <div className="flex -space-x-2">
            {speakers.slice(0, 4).map((s) => (
              <Avatar
                key={s._id}
                user={s}
                size={28}
                className="border-2 border-surface-900"
              />
            ))}
          </div>
          <p className="text-xs text-surface-500 truncate">
            {speakers[0]?.name}
            {speakers.length > 1 ? ` + ${speakers.length - 1}` : ""}
          </p>
        </div>
      )}

      {/* Tags */}
      {room.topics?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {room.topics.slice(0, 3).map((topic) => {
            const t = TOPICS.find((tp) => tp.id === topic);
            return t ? (
              <Tag key={topic} size="sm" emoji={t.emoji}>
                {t.label}
              </Tag>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

const ExplorePage = () => {
  const dispatch = useDispatch();
  const { rooms, loading, filters } = useSelector((s) => s.room);
  const [activeTopic, setActiveTopic] = useState(null);

  useEffect(() => {
    dispatch(
      fetchRooms({
        type: filters.type !== "all" ? filters.type : undefined,
        topic: activeTopic,
      }),
    );
  }, [filters.type, activeTopic, dispatch]);

  const handleRefresh = () => {
    dispatch(
      fetchRooms({
        type: filters.type !== "all" ? filters.type : undefined,
        topic: activeTopic,
      }),
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-50">
            Explore Rooms
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">
            Live conversations happening right now
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="btn-secondary flex items-center gap-2 text-sm"
        >
          <RiRefreshLine size={15} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Type filters */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none pb-1">
        {FILTER_TYPES.map((f) => (
          <button
            key={f.id}
            onClick={() => dispatch(setFilters({ type: f.id }))}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm whitespace-nowrap transition-all flex-shrink-0 ${
              filters.type === f.id
                ? "bg-brand-600 text-white shadow-glow"
                : "bg-white/5 text-surface-400 hover:text-surface-200 hover:bg-white/8 border border-white/6"
            }`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      {/* Topic pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-none pb-1">
        <button
          onClick={() => setActiveTopic(null)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all flex-shrink-0 ${
            !activeTopic
              ? "bg-surface-700 text-surface-100"
              : "text-surface-500 hover:text-surface-300"
          }`}
        >
          All Topics
        </button>
        {TOPICS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTopic(activeTopic === t.id ? null : t.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all flex-shrink-0 ${
              activeTopic === t.id
                ? "bg-brand-600/20 text-brand-300 border border-brand-600/30"
                : "text-surface-500 hover:text-surface-300 hover:bg-white/5"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Rooms grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="room-card p-5">
              <div className="h-4 rounded-full bg-surface-800 mb-3 w-1/3 animate-pulse" />
              <div className="h-5 rounded-full bg-surface-800 mb-2 animate-pulse" />
              <div className="h-4 rounded-full bg-surface-800 w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
            <RiMicLine size={28} className="text-surface-500" />
          </div>
          <h3 className="font-display font-semibold text-surface-200 mb-2">
            No rooms yet
          </h3>
          <p className="text-surface-500 text-sm">
            Be the first to start a conversation!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
