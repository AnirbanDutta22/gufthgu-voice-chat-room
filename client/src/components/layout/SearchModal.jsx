import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RiSearchLine, RiCloseLine, RiMicLine } from "react-icons/ri";
import { searchUsers } from "../../store/slices/userSlice";
import Avatar from "../ui/Avatar";

const SearchModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { searchResults, searchLoading } = useSelector((s) => s.user);
  const { rooms } = useSelector((s) => s.room);
  const [query, setQuery] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length >= 2) dispatch(searchUsers(query));
    }, 300);
    return () => clearTimeout(t);
  }, [query, dispatch]);

  const filteredRooms = rooms
    .filter(
      (r) =>
        r.title?.toLowerCase().includes(query.toLowerCase()) ||
        r.host?.name?.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
      <div
        className="absolute inset-0 bg-text-main/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl bg-surface-card border-2 border-text-main rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-text-main/10">
          <RiSearchLine size={18} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search rooms, people..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-text-main placeholder-text-muted outline-none text-sm font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-text-muted hover:text-text-main"
            >
              <RiCloseLine size={16} />
            </button>
          )}
          <kbd className="hidden sm:block text-[10px] text-text-muted font-mono border border-text-main/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Esc
          </kbd>
        </div>

        {query.length < 2 ? (
          <div className="p-6 text-center text-text-muted text-sm font-medium">
            Type to search rooms & people...
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {searchLoading && (
              <div className="px-4 py-3 text-text-muted text-sm font-medium">
                Searching...
              </div>
            )}
            {!searchLoading && searchResults.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-3 pt-2 pb-1">
                  People
                </p>
                {searchResults.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => {
                      navigate(`/profile/${u._id}`);
                      onClose();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-surface-bg transition-colors text-left"
                  >
                    <Avatar user={u} size={36} />
                    <div>
                      <p className="text-sm font-semibold text-text-main">
                        {u.name}
                      </p>
                      <p className="text-xs text-text-muted">@{u.username}</p>
                    </div>
                    {u.isOnline && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-green-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
            {filteredRooms.length > 0 && (
              <div className="p-2 border-t border-text-main/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-3 pt-2 pb-1">
                  Live Rooms
                </p>
                {filteredRooms.map((room) => (
                  <button
                    key={room._id}
                    onClick={() => {
                      navigate(`/room/${room._id}`);
                      onClose();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-surface-bg transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/20">
                      <RiMicLine size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-main truncate">
                        {room.title}
                      </p>
                      <p className="text-xs text-text-muted">
                        {room.listenerCount || 0} listening
                      </p>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse shrink-0" />
                  </button>
                ))}
              </div>
            )}
            {!searchLoading &&
              searchResults.length === 0 &&
              filteredRooms.length === 0 && (
                <div className="py-10 text-center text-text-muted text-sm font-medium">
                  No results for "{query}"
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
