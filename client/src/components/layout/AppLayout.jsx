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
  RiHome4Line,
  RiBookmarkLine,
  RiRadioLine,
} from "react-icons/ri";
import { logoutUser } from "../../store/slices/authSlice";
import { setCreateRoomModal } from "../../store/slices/uiSlice";
import Avatar from "../ui/Avatar";
import CreateRoomModal from "../rooms/CreateRoomModal";
import SearchModal from "./SearchModal";
import NotificationPanel from "./NotificationPanel";

const NAV_LINKS = [
  { to: "/explore", icon: <RiCompassLine size={18} />, label: "Explore" },
  { to: "/home", icon: <RiHome4Line size={18} />, label: "Following" },
  { to: "/saved", icon: <RiBookmarkLine size={18} />, label: "Saved" },
];

const AppLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { createRoomModalOpen, notifications } = useSelector((s) => s.ui);
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
    <div className="flex h-screen overflow-hidden bg-surface-bg text-text-main font-sans selection:bg-brand selection:text-white">
      {/* Sidebar */}
      <aside
        className={`shrink-0 flex flex-col transition-all duration-200 ${
          sidebarOpen ? "w-64" : "w-20"
        } bg-surface-card border-r border-text-main h-full z-30`}
      >
        {/* Logo Identity Unit */}
        <div className="flex items-center px-5 h-16 border-b border-text-main gap-3 bg-white">
          <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center shrink-0 border border-text-main shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <RiMicLine size={16} />
          </div>
          {sidebarOpen && (
            <span className="font-display font-black text-xl tracking-tight text-text-main">
              gufthgu<span className="text-brand">.</span>
            </span>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className={`${sidebarOpen ? "ml-auto" : "mx-auto"} p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-surface-bg transition-colors border border-transparent hover:border-text-main/10`}
          >
            <RiMenuLine size={16} />
          </button>
        </div>

        {/* Navigation Panel */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-none bg-surface-card">
          {/* Global Terminal Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-main hover:bg-surface-bg border border-transparent hover:border-text-main/10 transition-all ${
              !sidebarOpen ? "justify-center" : ""
            }`}
          >
            <RiSearchLine size={18} className="text-text-main" />
            {sidebarOpen && <span>Search Console</span>}
          </button>

          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  isActive
                    ? "bg-text-main text-white border-text-main shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                    : "text-text-muted border-transparent hover:bg-surface-bg hover:text-text-main hover:border-text-main/10"
                } ${!sidebarOpen ? "justify-center" : ""}`
              }
            >
              {link.icon}
              {sidebarOpen && <span>{link.label}</span>}
            </NavLink>
          ))}

          {/* Dynamic Link Bound to Dynamic Active Route User State ID */}
          <NavLink
            to={`/profile/${user?._id}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                isActive
                  ? "bg-text-main text-white border-text-main shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                  : "text-text-muted border-transparent hover:bg-surface-bg hover:text-text-main hover:border-text-main/10"
              } ${!sidebarOpen ? "justify-center" : ""}`
            }
          >
            <RiUserLine size={18} />
            {sidebarOpen && <span>My Profile</span>}
          </NavLink>

          <div className="pt-4 border-t border-text-main/10 mt-4">
            {/* Initialize Room Transmission Action */}
            <button
              onClick={() => dispatch(setCreateRoomModal(true))}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-brand/10 text-brand border border-brand/20 hover:bg-brand hover:text-white hover:border-text-main transition-all shadow-[2px_2px_0px_rgba(235,94,40,0.1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                !sidebarOpen ? "justify-center" : ""
              }`}
            >
              <RiAddCircleLine size={18} />
              {sidebarOpen && <span>Start a Room</span>}
            </button>
          </div>
        </nav>

        {/* Live Audio Monitor Floating Ribbon */}
        {currentRoom && sidebarOpen && (
          <div className="mx-3 mb-2 p-3 bg-accent-dark text-white rounded-xl border border-text-main flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)] animate-bounce">
            <div className="flex items-center gap-2.5 min-w-0">
              <RiRadioLine
                size={16}
                className="text-brand shrink-0 animate-pulse"
              />
              <p className="text-xs font-bold uppercase tracking-wide truncate pr-1">
                {currentRoom.title}
              </p>
            </div>
            <button
              onClick={() => navigate(`/room/${currentRoom._id}`)}
              className="text-[10px] bg-white text-accent-dark font-black px-2 py-1 rounded border border-text-main uppercase tracking-wider hover:bg-brand hover:text-white transition-colors"
            >
              Join
            </button>
          </div>
        )}

        {/* User Identity Footer Dock */}
        <div
          className={`p-4 border-t border-text-main bg-white ${!sidebarOpen ? "flex justify-center" : ""}`}
        >
          {sidebarOpen ? (
            <div className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-text-main/10 hover:bg-surface-bg transition-all group">
              <Avatar
                user={user}
                size={36}
                showBadge
                className="border border-text-main"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-main truncate leading-tight">
                  {user?.name || "Anonymous Index"}
                </p>
                <p className="text-xs text-text-muted font-medium truncate mt-0.5">
                  @{user?.username}
                </p>
              </div>
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => navigate("/settings")}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-white border border-transparent hover:border-text-main/10"
                  title="System Preferences"
                >
                  <RiSettings3Line size={15} />
                </button>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200"
                  title="Purge Session Token"
                >
                  <RiLogoutBoxLine size={15} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="focus:outline-none transition-transform active:scale-95"
            >
              <Avatar
                user={user}
                size={36}
                className="border border-text-main shadow-sm"
              />
            </button>
          )}
        </div>
      </aside>

      {/* Main Framework Block */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Deck */}
        <header className="flex items-center justify-between px-8 h-16 border-b border-text-main bg-white shrink-0 z-20">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl border border-text-main/10 text-text-muted hover:text-text-main hover:bg-surface-bg transition-colors"
              >
                <RiMenuLine size={18} />
              </button>
            )}

            {/* Command Box Mock Button UI */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-surface-bg border border-text-main/10 text-text-muted hover:border-text-main transition-all text-xs font-bold uppercase tracking-wider w-64 text-left"
            >
              <RiSearchLine size={14} className="text-text-main" />
              <span>Search Registry...</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Alarm Notifications Terminal Dropdown Button */}
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className={`relative p-2.5 rounded-xl border transition-colors ${
                notifOpen
                  ? "bg-text-main text-white border-text-main"
                  : "bg-transparent border-text-main/10 text-text-muted hover:text-text-main hover:bg-surface-bg"
              }`}
            >
              <RiBellLine size={18} />
              {unreadNotifs > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand border-2 border-white animate-pulse" />
              )}
            </button>

            <button
              onClick={() => dispatch(setCreateRoomModal(true))}
              className="btn-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 py-2.5! px-4! shadow-[2px_2px_0px_rgba(0,0,0,1)]"
            >
              <RiAddCircleLine size={15} />
              <span className="hidden sm:inline">Broadcast Room</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Viewport Deck */}
        <div className="flex-1 overflow-y-auto bg-surface-bg relative">
          <Outlet />
        </div>
      </main>

      {/* Configuration Overlays Matrices */}
      {createRoomModalOpen && (
        <CreateRoomModal onClose={() => dispatch(setCreateRoomModal(false))} />
      )}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
      {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
    </div>
  );
};

export default AppLayout;
