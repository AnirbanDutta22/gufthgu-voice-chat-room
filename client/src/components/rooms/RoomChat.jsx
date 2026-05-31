import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RiCloseLine, RiSendPlane2Line, RiEmotionLine } from "react-icons/ri";
import { setChatOpen } from "../../store/slices/chatSlice";
import { sendChatMessage } from "../../services/socket";
import Avatar from "../ui/Avatar";
import { formatDistanceToNow } from "date-fns";

const QUICK_EMOJIS = ["👏", "❤️", "😂", "🔥", "🙌", "💯", "😮", "🎉"];

const RoomChat = ({ roomId }) => {
  const dispatch = useDispatch();
  const { messages } = useSelector((s) => s.chat);
  const { user } = useSelector((s) => s.auth);
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    sendChatMessage(roomId, text);
    setMessage("");
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-72 flex flex-col border-l border-white/5 glass flex-shrink-0 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <span className="text-sm font-500 text-surface-100">Room Chat</span>
        <button
          onClick={() => dispatch(setChatOpen(false))}
          className="p-1.5 rounded-lg hover:bg-white/5 text-surface-400 hover:text-surface-200 transition-colors"
        >
          <RiCloseLine size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-none">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-surface-500 text-xs">
            Chat is open — say something! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn =
              msg.userId === user?._id || msg.sender?._id === user?._id;
            const sender = msg.sender || {
              name: msg.userName,
              avatar: msg.userAvatar,
            };
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
              >
                {!isOwn && (
                  <Avatar
                    user={sender}
                    size={28}
                    className="flex-shrink-0 mt-0.5"
                  />
                )}
                <div
                  className={`max-w-[80%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-0.5`}
                >
                  {!isOwn && (
                    <span className="text-[10px] text-surface-500 px-1">
                      {sender.name}
                    </span>
                  )}
                  <div
                    className={`px-3 py-1.5 rounded-2xl text-sm leading-relaxed ${
                      isOwn
                        ? "bg-brand-600/30 text-surface-100 rounded-tr-sm border border-brand-600/20"
                        : "bg-white/6 text-surface-200 rounded-tl-sm border border-white/5"
                    }`}
                  >
                    {msg.text || msg.message}
                  </div>
                  <span className="text-[10px] text-surface-600 px-1">
                    {msg.timestamp
                      ? formatDistanceToNow(new Date(msg.timestamp), {
                          addSuffix: true,
                        })
                      : "just now"}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick emoji row */}
      {showEmoji && (
        <div className="flex gap-1.5 px-3 py-2 border-t border-white/5 flex-wrap">
          {QUICK_EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => {
                setMessage((m) => m + e);
                setShowEmoji(false);
                inputRef.current?.focus();
              }}
              className="text-xl hover:scale-125 transition-transform"
            >
              {e}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowEmoji((v) => !v)}
            className={`p-2 rounded-xl transition-colors flex-shrink-0 ${showEmoji ? "text-brand-400" : "text-surface-500 hover:text-surface-300"}`}
          >
            <RiEmotionLine size={18} />
          </button>
          <textarea
            ref={inputRef}
            rows={1}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Send a message..."
            className="flex-1 bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-sm text-surface-100 placeholder-surface-600 outline-none resize-none focus:border-brand-600/40 transition-colors"
            style={{ maxHeight: 80 }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`p-2 rounded-xl flex-shrink-0 transition-all ${
              message.trim()
                ? "bg-brand-600 text-white hover:bg-brand-500 shadow-glow"
                : "text-surface-600 cursor-not-allowed"
            }`}
          >
            <RiSendPlane2Line size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomChat;
