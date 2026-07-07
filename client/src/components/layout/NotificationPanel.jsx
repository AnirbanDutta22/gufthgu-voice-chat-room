import { useDispatch, useSelector } from "react-redux";
import { RiBellLine, RiCloseLine } from "react-icons/ri";
import {
  markNotificationRead,
  clearNotifications,
} from "../../store/slices/uiSlice";
import { formatDistanceToNow } from "date-fns";

const NotificationPanel = ({ onClose }) => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((s) => s.ui);

  return (
    <div className="fixed inset-0 z-40" onClick={onClose}>
      <div
        className="absolute top-16 right-4 w-80 bg-surface-card border-2 border-text-main rounded-2xl shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-text-main/10 bg-white">
          <div className="flex items-center gap-2">
            <RiBellLine size={16} className="text-text-main" />
            <span className="text-sm font-bold uppercase tracking-wider text-text-main">
              Notifications
            </span>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={() => dispatch(clearNotifications())}
                className="text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-text-main transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-surface-bg text-text-muted transition-colors"
            >
              <RiCloseLine size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-text-muted text-sm font-medium">
              All caught up! ✓
            </div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => dispatch(markNotificationRead(notif.id))}
                className={`flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-surface-bg transition-colors border-b border-text-main/5 last:border-0 ${
                  !notif.read ? "bg-brand/5" : ""
                }`}
              >
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-1.5" />
                )}
                <div className={`flex-1 min-w-0 ${notif.read ? "pl-5" : ""}`}>
                  <p className="text-sm font-semibold text-text-main leading-snug">
                    {notif.message}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {notif.timestamp
                      ? formatDistanceToNow(new Date(notif.timestamp), {
                          addSuffix: true,
                        })
                      : "Just now"}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
