import { useRef } from "react";
import { useDispatch } from "react-redux";
import { RiUserVoiceLine, RiArrowDownLine } from "react-icons/ri";
import { emitSpeakerPromote, emitSpeakerDemote } from "../../services/socket";
import { useClickOutside } from "../../hooks";
import Avatar from "../ui/Avatar";

const ParticipantMenu = ({ participant, roomId, isHost, onClose }) => {
  const dispatch = useDispatch();
  const ref = useRef();
  useClickOutside(ref, onClose);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        ref={ref}
        className="relative w-full max-w-xs glass rounded-3xl border border-white/8 shadow-2xl overflow-hidden animate-slide-up"
      >
        {/* Participant info */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/5">
          <Avatar user={participant} size={48} />
          <div>
            <p className="font-500 text-surface-100">{participant.name}</p>
            <p className="text-sm text-surface-500">
              @{participant.username} · {participant.role}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2">
          {!isSpeaker ? (
            <button
              onClick={handlePromote}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-surface-200 text-left"
            >
              <RiUserVoiceLine size={18} className="text-accent-mint" />
              Invite to speak
            </button>
          ) : (
            <button
              onClick={handleDemote}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-surface-200 text-left"
            >
              <RiArrowDownLine size={18} className="text-accent-amber" />
              Move to audience
            </button>
          )}

          <button
            onClick={onClose}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-colors text-sm text-surface-400 text-left"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantMenu;
