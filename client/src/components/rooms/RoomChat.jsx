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
    <div className="w-72 flex flex-col border-l-2 border-text-main bg-surface-card shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-text-main/10 bg-white">
        <span className="text-xs font-bold uppercase tracking-wider text-text-main">
          Live Chat
        </span>
        <button
          onClick={() => dispatch(setChatOpen(false))}
          className="p-1.5 rounded-lg hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors"
        >
          <RiCloseLine size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-none bg-surface-bg">
        {messages.length === 0 ? (
          <div className="text-center py-10 text-text-muted text-xs font-semibold uppercase tracking-wider">
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
                  <Avatar user={sender} size={28} className="shrink-0 mt-0.5" />
                )}
                <div
                  className={`max-w-[80%] flex flex-col gap-0.5 ${isOwn ? "items-end" : "items-start"}`}
                >
                  {!isOwn && (
                    <span className="text-[10px] font-bold text-text-muted px-1 uppercase tracking-wide">
                      {sender.name}
                    </span>
                  )}
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm font-medium leading-relaxed ${
                      isOwn
                        ? "bg-text-main text-white rounded-tr-sm"
                        : "bg-white border border-text-main/10 text-text-main rounded-tl-sm"
                    }`}
                  >
                    {msg.text || msg.message}
                  </div>
                  <span className="text-[10px] text-text-muted px-1">
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

      {/* Quick emojis */}
      {showEmoji && (
        <div className="flex gap-1.5 px-3 py-2 border-t border-text-main/10 flex-wrap bg-white">
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
      <div className="px-3 py-3 border-t border-text-main/10 bg-white">
        <div className="flex items-end gap-2">
          <button
            onClick={() => setShowEmoji((v) => !v)}
            className={`p-2 rounded-xl transition-colors shrink-0 ${
              showEmoji ? "text-brand" : "text-text-muted hover:text-text-main"
            }`}
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
            className="flex-1 bg-surface-bg border border-text-main/10 rounded-xl px-3 py-2 text-sm text-text-main placeholder-text-muted outline-none resize-none focus:border-text-main transition-colors"
            style={{ maxHeight: 80 }}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className={`p-2 rounded-xl shrink-0 transition-all ${
              message.trim()
                ? "bg-text-main text-white hover:bg-brand border border-text-main"
                : "text-text-muted/30 cursor-not-allowed"
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
