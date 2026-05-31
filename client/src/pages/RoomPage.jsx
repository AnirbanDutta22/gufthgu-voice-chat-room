import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  RiMicLine,
  RiMicOffLine,
  // RiHandLine,
  // RiChatLine,
  RiRecordCircleLine,
  RiStopCircleLine,
  RiArrowLeftLine,
  RiLockLine,
  RiGlobalLine,
  RiGroupLine,
  RiSettingsLine,
  RiShareLine,
  RiDoorOpenLine,
} from "react-icons/ri";
import toast from "react-hot-toast";

// Redux Actions
import {
  fetchRoomById,
  joinRoom,
  leaveRoom,
  endRoom,
} from "../store/slices/roomSlice";
import { setRecording, resetAudio } from "../store/slices/audioSlice";
import { setChatOpen, clearChat } from "../store/slices/chatSlice";
import { setAnalyticsModal } from "../store/slices/uiSlice";

// Socket & WebRTC Services
import {
  joinRoomSocket,
  leaveRoomSocket,
  emitRaiseHand,
  emitLowerHand,
  emitStartRecording,
  emitStopRecording,
} from "../services/socket";
import webRTCService from "../services/webrtc";
import { useRoom } from "../hooks";

// Components
import Avatar from "../components/ui/Avatar";
import AudioBars from "../components/ui/AudioBars";
import RoomChat from "../components/rooms/RoomChat";
import RoomSettings from "../components/rooms/RoomSettings";
import ParticipantMenu from "../components/rooms/ParticipantMenu";

const EMOJI_REACTIONS = ["👏", "❤️", "😂", "🔥", "🙌", "💯"];

const RoomPage = () => {
  const { roomId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Global State
  const { currentRoom, activeParticipants, raisedHands, loading } = useSelector(
    (s) => s.room,
  );
  const { user } = useSelector((s) => s.auth);
  const { isMuted, isRecording, audioLevels, activeSpeaker } = useSelector(
    (s) => s.audio,
  );
  const { isChatOpen, unreadCount } = useSelector((s) => s.chat);

  // Local State
  const [handRaised, setHandRaised] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [reactions, setReactions] = useState([]);

  // Custom Hook for specific room logic (WebRTC mapping, standard listeners)
  const { setupSocketListeners, joinRoomAudio, handleMuteToggle } =
    useRoom(roomId);

  // Role & Permissions
  const isHost = currentRoom?.host?._id === user?._id;
  const myRole =
    activeParticipants.find((p) => p._id === user?._id)?.role || "listener";
  const canSpeak = ["host", "co_host", "speaker"].includes(myRole);

  // Stage Segregation
  const speakers = activeParticipants.filter((p) =>
    ["host", "co_host", "speaker"].includes(p.role),
  );
  const listeners = activeParticipants.filter((p) => p.role === "listener");

  const typeIcon = {
    public: <RiGlobalLine size={14} />,
    social: <RiGroupLine size={14} />,
    private: <RiLockLine size={14} />,
  };

  // ----------------------------------------------------------------------
  // Lifecycle Initialization & Cleanup
  // ----------------------------------------------------------------------
  useEffect(() => {
    let cleanupSocket;

    const initRoom = async () => {
      try {
        await dispatch(joinRoom(roomId));
        joinRoomSocket(roomId);
        await joinRoomAudio();
      } catch (error) {
        toast.error("Failed to join room securely.");
        navigate("/explore");
      }
    };

    initRoom();
    cleanupSocket = setupSocketListeners();

    // Cleanup function on component unmount
    return () => {
      if (cleanupSocket) cleanupSocket();
      leaveRoomSocket(roomId);
      webRTCService.cleanup();
      dispatch(resetAudio());
      dispatch(clearChat());
    };
  }, [roomId, dispatch]); // setupSocketListeners and joinRoomAudio should be stable references in useRoom hook

  // ----------------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------------
  const handleLeave = async () => {
    await dispatch(leaveRoom(roomId));
    leaveRoomSocket(roomId);
    webRTCService.cleanup();
    dispatch(resetAudio());
    navigate("/explore");
    toast("Left the room", { icon: "👋" });
  };

  const handleEndRoom = async () => {
    await dispatch(endRoom(roomId));
    leaveRoomSocket(roomId);
    webRTCService.cleanup();
    dispatch(resetAudio());
    dispatch(setAnalyticsModal(true));
    navigate("/explore");
  };

  const handleRaiseHand = () => {
    const newState = !handRaised;
    setHandRaised(newState);
    newState ? emitRaiseHand(roomId) : emitLowerHand(roomId);
    if (newState) toast("✋ Hand raised", { duration: 2000 });
  };

  const handleRecording = () => {
    if (isRecording) {
      emitStopRecording(roomId);
      dispatch(setRecording(false));
      toast.success("Recording stopped");
    } else {
      if (!currentRoom?.allowRecording) {
        toast.error("Recording not allowed in this room");
        return;
      }
      emitStartRecording(roomId);
      dispatch(setRecording(true));
      toast.success("Recording started");
    }
  };

  const addFloatingReaction = (emoji) => {
    const id = Date.now();
    setReactions((r) => [...r, { id, emoji, x: Math.random() * 80 + 10 }]);
    // Remove reaction after animation completes (2.5s)
    setTimeout(() => setReactions((r) => r.filter((re) => re.id !== id)), 2500);
  };

  // ----------------------------------------------------------------------
  // Loading State
  // ----------------------------------------------------------------------
  if (loading || !currentRoom) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-4 animate-float">
            <RiMicLine size={28} className="text-white" />
          </div>
          <p className="text-surface-400 text-sm">Joining room...</p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // Main Render
  // ----------------------------------------------------------------------
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Floating Reactions Overlay */}
      <div className="fixed bottom-32 left-0 right-0 pointer-events-none z-50">
        {reactions.map((r) => (
          <div
            key={r.id}
            className="absolute text-3xl animate-float"
            style={{
              left: `${r.x}%`,
              animation: "float-up 2.5s ease-out forwards",
              bottom: 0,
            }}
          >
            {r.emoji}
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Room Area */}
        <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full px-6 py-6">
          {/* Room Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLeave}
                className="p-2 rounded-xl hover:bg-white/5 text-surface-400 hover:text-surface-200 transition-colors"
                aria-label="Leave Room"
              >
                <RiArrowLeftLine size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-surface-500 flex items-center gap-1 text-xs">
                    {typeIcon[currentRoom.type] || <RiGlobalLine size={14} />}
                    <span className="capitalize">
                      {currentRoom.type || "Public"}
                    </span>
                  </span>

                  {currentRoom.isLive && (
                    <>
                      <span className="text-surface-700">·</span>
                      <span className="flex items-center gap-1 text-xs text-accent-coral">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-coral animate-pulse inline-block" />
                        Live
                      </span>
                    </>
                  )}

                  {isRecording && (
                    <>
                      <span className="text-surface-700">·</span>
                      <span className="flex items-center gap-1.5 text-xs text-red-400">
                        <RiRecordCircleLine
                          size={12}
                          className="animate-pulse"
                        />
                        Recording
                      </span>
                    </>
                  )}
                </div>
                <h1 className="font-display font-bold text-xl text-surface-50 leading-snug">
                  {currentRoom.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-surface-400 text-sm bg-white/5 px-3 py-1.5 rounded-lg">
                <RiGroupLine size={16} />
                <span className="font-medium">{activeParticipants.length}</span>
              </div>
              <button className="btn-ghost p-2 hover:bg-white/5 rounded-xl transition-colors">
                <RiShareLine size={18} />
              </button>
              {isHost && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="btn-ghost p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <RiSettingsLine size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Body Container (Scrollable) */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {/* Speakers Section / "On Stage" */}
            <div className="mb-2">
              <p className="text-xs text-surface-500 uppercase tracking-wider mb-4 font-semibold">
                On Stage
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-5 mb-8">
                {speakers.map((participant) => {
                  const isSpeaking = audioLevels[participant._id] > 0.08;
                  const isActive = activeSpeaker === participant._id;
                  const hasHandRaised = raisedHands.includes(participant._id);

                  return (
                    <div
                      key={participant._id}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                      onClick={() => {
                        if (isHost && participant._id !== user?._id) {
                          setSelectedParticipant(participant);
                        }
                      }}
                    >
                      <div className="relative">
                        <Avatar
                          user={participant}
                          size={64}
                          isSpeaking={isSpeaking || isActive}
                          isMuted={participant.isMuted}
                        />
                        {isSpeaking && (
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                            <AudioBars active={true} height={14} />
                          </div>
                        )}
                        {hasHandRaised && !isSpeaking && (
                          <div className="absolute -top-1 -right-1 text-base drop-shadow-md">
                            ✋
                          </div>
                        )}
                        {participant.role === "host" && (
                          <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-accent-amber flex items-center justify-center text-[9px] shadow-lg">
                            ★
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-surface-300 font-medium text-center truncate w-full max-w-[70px]">
                        {participant._id === user?._id
                          ? "You"
                          : participant.name?.split(" ")[0]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Listeners Section / "Audience" */}
            {listeners.length > 0 && (
              <div>
                <p className="text-xs text-surface-500 uppercase tracking-wider mb-4 font-semibold">
                  Audience ({listeners.length})
                </p>
                <div className="flex flex-wrap gap-3">
                  {listeners.map((p) => {
                    const hasHandRaised = raisedHands.includes(p._id);
                    return (
                      <div
                        key={p._id}
                        className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          if (isHost && p._id !== user?._id) {
                            setSelectedParticipant(p);
                          }
                        }}
                      >
                        <div className="relative">
                          <Avatar user={p} size={40} />
                          {hasHandRaised && (
                            <div className="absolute -top-1 -right-1 text-sm drop-shadow-md">
                              ✋
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] text-surface-500 max-w-[48px] truncate text-center">
                          {p._id === user?._id ? "You" : p.name?.split(" ")[0]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Control Bar */}
          <div className="mt-6 pt-4 border-t border-white/5">
            {/* Emoji Reaction Bar */}
            <div className="flex justify-center gap-2 mb-4">
              {EMOJI_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addFloatingReaction(emoji)}
                  className="text-xl p-1.5 rounded-xl hover:bg-white/10 transition-all hover:-translate-y-1"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Core Interaction Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLeave}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-surface-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all flex items-center gap-2"
                >
                  <RiDoorOpenLine size={16} />
                  Leave
                </button>
                {isHost && (
                  <button
                    onClick={handleEndRoom}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    End Room
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Listener Actions */}
                {!canSpeak && (
                  <button
                    onClick={handleRaiseHand}
                    className={`p-3 rounded-xl transition-all ${
                      handRaised
                        ? "bg-accent-amber/15 text-accent-amber border border-accent-amber/25"
                        : "bg-white/5 text-surface-400 hover:text-surface-200 hover:bg-white/10 border border-white/10"
                    }`}
                    title="Raise Hand"
                  >
                    {/* <RiHandLine size={20} /> */}
                  </button>
                )}

                {/* Speaker Actions */}
                {canSpeak && (
                  <button
                    onClick={handleMuteToggle}
                    className={`p-3 rounded-xl transition-all border ${
                      isMuted
                        ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                        : "bg-brand-600/15 text-brand-400 border-brand-600/25 shadow-glow hover:bg-brand-600/25"
                    }`}
                    title={isMuted ? "Unmute Mic" : "Mute Mic"}
                  >
                    {isMuted ? (
                      <RiMicOffLine size={20} />
                    ) : (
                      <RiMicLine size={20} />
                    )}
                  </button>
                )}

                {/* Chat Toggle */}
                <button
                  onClick={() => dispatch(setChatOpen(!isChatOpen))}
                  className={`relative p-3 rounded-xl transition-all border ${
                    isChatOpen
                      ? "bg-brand-600/15 text-brand-400 border-brand-600/25"
                      : "bg-white/5 text-surface-400 hover:text-surface-200 hover:bg-white/10 border border-white/10"
                  }`}
                  title="Open Chat"
                >
                  {/* <RiChatLine size={20} /> */}
                  {unreadCount > 0 && !isChatOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent-coral text-[9px] flex items-center justify-center text-white font-bold border border-bg-primary">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Recording Control (Host Only) */}
                {isHost && currentRoom.allowRecording && (
                  <button
                    onClick={handleRecording}
                    className={`p-3 rounded-xl transition-all border ${
                      isRecording
                        ? "bg-red-500/15 text-red-400 border-red-500/25 animate-pulse"
                        : "bg-white/5 text-surface-400 hover:text-red-400 border border-white/10"
                    }`}
                    title={isRecording ? "Stop Recording" : "Start Recording"}
                  >
                    {isRecording ? (
                      <RiStopCircleLine size={20} />
                    ) : (
                      <RiRecordCircleLine size={20} />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar Panel */}
        {isChatOpen && <RoomChat roomId={roomId} />}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Modals & Overlays */}
      {/* ------------------------------------------------------------------ */}
      {showSettings && (
        <RoomSettings
          room={currentRoom}
          onClose={() => setShowSettings(false)}
          isHost={isHost}
        />
      )}

      {selectedParticipant && (
        <ParticipantMenu
          participant={selectedParticipant}
          roomId={roomId}
          isHost={isHost}
          onClose={() => setSelectedParticipant(null)}
        />
      )}
    </div>
  );
};

export default RoomPage;
