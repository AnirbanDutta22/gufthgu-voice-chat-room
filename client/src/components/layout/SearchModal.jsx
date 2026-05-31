import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RiSearchLine,
  RiCloseLine,
  RiUserLine,
  RiMicLine,
} from "react-icons/ri";
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
        r.topic?.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl glass rounded-2xl border border-white/8 shadow-2xl overflow-hidden animate-slide-up">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
          <RiSearchLine size={20} className="text-surface-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search rooms, people, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-surface-100 placeholder-surface-500 outline-none text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-surface-400 hover:text-surface-200"
            >
              <RiCloseLine size={18} />
            </button>
          )}
          <kbd className="text-xs text-surface-600 font-mono border border-surface-700 px-1.5 py-0.5 rounded">
            Esc
          </kbd>
        </div>

        {/* Results */}
        {query.length < 2 ? (
          <div className="p-4">
            <p className="text-surface-500 text-xs text-center py-4">
              Type to search rooms & people
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {/* People */}
            {(searchResults.length > 0 || searchLoading) && (
              <div className="p-3">
                <p className="text-xs text-surface-500 uppercase tracking-wider mb-2 px-2">
                  People
                </p>
                {searchLoading ? (
                  <div className="px-2 py-2 text-surface-500 text-sm">
                    Searching...
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => {
                        navigate(`/profile/${user._id}`);
                        onClose();
                      }}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                    >
                      <Avatar user={user} size={36} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-500 text-surface-100 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-surface-500">
                          @{user.username}
                        </p>
                      </div>
                      {user.isOnline && (
                        <span className="dot-online flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Rooms */}
            {filteredRooms.length > 0 && (
              <div className="p-3 border-t border-white/5">
                <p className="text-xs text-surface-500 uppercase tracking-wider mb-2 px-2">
                  Live Rooms
                </p>
                {filteredRooms.map((room) => (
                  <button
                    key={room._id}
                    onClick={() => {
                      navigate(`/room/${room._id}`);
                      onClose();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                      <RiMicLine size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-500 text-surface-100 truncate">
                        {room.title}
                      </p>
                      <p className="text-xs text-surface-500">
                        {room.listenerCount || 0} listening
                      </p>
                    </div>
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-coral animate-pulse flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {!searchLoading &&
              searchResults.length === 0 &&
              filteredRooms.length === 0 && (
                <div className="py-8 text-center text-surface-500 text-sm">
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
