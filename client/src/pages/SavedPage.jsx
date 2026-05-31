import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RiBookmarkLine, RiRefreshLine } from "react-icons/ri";
import { fetchRooms } from "../store/slices/roomSlice";
import { TOPICS } from "../constants";
import Avatar from "../components/ui/Avatar";
import Tag from "../components/ui/Tag";

const RoomCard = ({ room }) => {
  const navigate = useNavigate();
  const speakers =
    room.participants?.filter((p) =>
      ["host", "co_host", "speaker"].includes(p.role),
    ) || [];

  return (
    <div
      className="room-card p-5 cursor-pointer"
      onClick={() => navigate(`/room/${room._id}`)}
    >
      <h3 className="font-display font-semibold text-surface-100 text-base leading-snug mb-3 line-clamp-2">
        {room.title}
      </h3>
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
          </p>
        </div>
      )}
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

const SavedPage = () => {
  const dispatch = useDispatch();
  const { rooms, loading } = useSelector((s) => s.room);

  useEffect(() => {
    dispatch(fetchRooms({ saved: true }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchRooms({ saved: true }));
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-50">
            Saved Rooms
          </h1>
          <p className="text-surface-500 text-sm mt-0.5">
            Rooms you bookmarked for later
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="room-card p-5">
              <div className="h-5 rounded-full bg-surface-800 mb-2 animate-pulse" />
              <div className="h-4 rounded-full bg-surface-800 w-2/3 animate-pulse" />
            </div>
          ))}
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
            <RiBookmarkLine size={28} className="text-surface-500" />
          </div>
          <h3 className="font-display font-semibold text-surface-200 mb-2">
            No saved rooms yet
          </h3>
          <p className="text-surface-500 text-sm">
            Bookmark rooms from Explore to find them here.
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

export default SavedPage;
