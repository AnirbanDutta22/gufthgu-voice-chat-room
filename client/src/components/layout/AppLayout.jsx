import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  RiMicLine,
  RiCompassLine,
  RiUserLine,
  RiBellLine,
  RiSearchLine,
  RiAddCircleLine,
  RiSettings3Line,
  RiLogoutBoxLine,
  RiMenuLine,
  RiCloseLine,
  RiHome4Line,
  RiBookmarkLine,
} from "react-icons/ri";
import { logoutUser } from "../../store/slices/authSlice";
import { setCreateRoomModal } from "../../store/slices/uiSlice";
import Avatar from "../ui/Avatar";
import CreateRoomModal from "../rooms/CreateRoomModal";
import SearchModal from "./SearchModal";
import NotificationPanel from "./NotificationPanel";

const NAV_LINKS = [
  { to: "/explore", icon: <RiCompassLine size={20} />, label: "Explore" },
  { to: "/home", icon: <RiHome4Line size={20} />, label: "Following" },
  { to: "/saved", icon: <RiBookmarkLine size={20} />, label: "Saved" },
  { to: "/profile", icon: <RiUserLine size={20} />, label: "My Profile" },
];

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { createRoomModalOpen } = useSelector((s) => s.ui);
  const { notifications } = useSelector((s) => s.ui);
  const { currentRoom } = useSelector((s) => s.room);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Sidebar */}
      <aside
        className={`flex-shrink-0 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "w-60" : "w-16"
        } glass border-r border-white/5 h-full z-30`}
      >
        {/* Logo */}
        <div className="flex items-center px-4 h-16 border-b border-white/5 gap-3">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
            <RiMicLine className="text-white" size={16} />
          </div>
          {sidebarOpen && (
            <span className="font-display font-bold text-lg text-surface-50 tracking-tight">
              gufthgu
            </span>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className={`${sidebarOpen ? "ml-auto" : "hidden"} p-1 rounded-lg text-surface-500 hover:text-surface-200 transition-colors`}
          >
            <RiMenuLine size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-none">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`sidebar-link w-full ${!sidebarOpen ? "justify-center" : ""}`}
          >
            <RiSearchLine size={20} />
            {sidebarOpen && <span>Search</span>}
          </button>

          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""} ${!sidebarOpen ? "justify-center" : ""}`
              }
            >
              {link.icon}
              {sidebarOpen && <span>{link.label}</span>}
            </NavLink>
          ))}

          <div className="pt-4 border-t border-white/5 mt-4">
            {/* Create room */}
            <button
              onClick={() => dispatch(setCreateRoomModal(true))}
              className={`sidebar-link w-full text-brand-400 ${!sidebarOpen ? "justify-center" : ""}`}
            >
              <RiAddCircleLine size={20} />
              {sidebarOpen && <span>Start a Room</span>}
            </button>
          </div>
        </nav>

        {/* Bottom user section */}
        <div
          className={`p-3 border-t border-white/5 ${!sidebarOpen ? "flex justify-center" : ""}`}
        >
          {sidebarOpen ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group">
              <Avatar user={user} size={32} showBadge />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-500 text-surface-100 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-surface-500 truncate">
                  @{user?.username}
                </p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => navigate("/settings")}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-surface-400"
                >
                  <RiSettings3Line size={14} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-surface-400"
                >
                  <RiLogoutBoxLine size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setSidebarOpen(true)}>
              <Avatar user={user} size={32} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-white/5 glass flex-shrink-0">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-white/5 text-surface-400 hover:text-surface-200 transition-colors"
              >
                <RiMenuLine size={20} />
              </button>
            )}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/4 border border-white/6 text-surface-500 hover:border-white/12 transition-all text-sm w-56 group"
            >
              <RiSearchLine size={16} />
              <span>Search rooms, people...</span>
              <kbd className="ml-auto text-xs text-surface-600 font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2.5 rounded-xl hover:bg-white/5 text-surface-400 hover:text-surface-200 transition-colors"
            >
              <RiBellLine size={20} />
              {unreadNotifs > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-coral animate-pulse" />
              )}
            </button>
            <button
              onClick={() => dispatch(setCreateRoomModal(true))}
              className="btn-primary text-sm flex items-center gap-2 py-2"
            >
              <RiAddCircleLine size={16} />
              <span className="hidden sm:inline">New Room</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* Modals & Panels */}
      {createRoomModalOpen && (
        <CreateRoomModal onClose={() => dispatch(setCreateRoomModal(false))} />
      )}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
    </div>
  );
};

export default AppLayout;
