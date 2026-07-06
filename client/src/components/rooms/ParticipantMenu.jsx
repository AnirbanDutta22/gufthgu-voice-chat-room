import { useRef } from "react";
import { RiUserVoiceLine, RiArrowDownLine } from "react-icons/ri";
import { emitSpeakerPromote, emitSpeakerDemote } from "../../services/socket";
import Avatar from "../ui/Avatar";

const ParticipantMenu = ({ participant, roomId, isHost, onClose }) => {
  const ref = useRef();
  const isSpeaker = ["speaker", "co_host"].includes(participant.role);

  const handlePromote = () => {
    emitSpeakerPromote(roomId, participant._id);
    onClose();
  };

  const handleDemote = () => {
    emitSpeakerDemote(roomId, participant._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-text-main/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="relative w-full max-w-xs bg-surface-card border-2 border-text-main rounded-3xl shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-hidden"
        style={{ animation: "slideUp 0.2s ease-out" }}
      >
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-text-main/10">
          <Avatar user={participant} size={48} />
          <div>
            <p className="font-bold text-text-main">{participant.name}</p>
            <p className="text-sm text-text-muted">
              @{participant.username} · {participant.role}
            </p>
          </div>
        </div>

        <div className="p-2">
          {!isSpeaker ? (
            <button
              onClick={handlePromote}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-surface-bg transition-colors text-sm font-semibold text-text-main text-left"
            >
              <RiUserVoiceLine size={18} className="text-brand" />
              Invite to speak
            </button>
          ) : (
            <button
              onClick={handleDemote}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-surface-bg transition-colors text-sm font-semibold text-text-main text-left"
            >
              <RiArrowDownLine size={18} className="text-text-muted" />
              Move to audience
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-surface-bg transition-colors text-sm text-text-muted text-left"
          >
            Cancel
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }`}</style>
    </div>
  );
};

export default ParticipantMenu;
