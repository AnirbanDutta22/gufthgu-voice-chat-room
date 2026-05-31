import { useDispatch, useSelector } from "react-redux";
import { RiBellLine, RiCloseLine, RiCheckLine } from "react-icons/ri";
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
        className="absolute top-16 right-4 w-80 glass rounded-2xl border border-white/8 shadow-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <RiBellLine size={18} className="text-surface-300" />
            <span className="text-sm font-500 text-surface-100">
              Notifications
            </span>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={() => dispatch(clearNotifications())}
                className="text-xs text-surface-500 hover:text-surface-300 transition-colors"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/5 text-surface-400"
            >
              <RiCloseLine size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-surface-500 text-sm">
              All caught up!
            </div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => dispatch(markNotificationRead(notif.id))}
                className={`flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-white/4 transition-colors border-b border-white/4 last:border-0 ${
                  !notif.read ? "bg-brand-600/5" : ""
                }`}
              >
                {!notif.read && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0 mt-1.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-surface-200 leading-snug">
                    {notif.message}
                  </p>
                  <p className="text-xs text-surface-500 mt-0.5">
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
