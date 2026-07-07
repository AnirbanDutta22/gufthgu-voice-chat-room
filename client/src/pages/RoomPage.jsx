/* eslint-disable react-hooks/purity */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  RiMicLine,
  RiMicOffLine,
  RiHandHeartLine,
  RiMessage3Line,
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

import { joinRoom, leaveRoom, endRoom } from "../store/slices/roomSlice";
import { setRecording, resetAudio } from "../store/slices/audioSlice";
import { setChatOpen, clearChat } from "../store/slices/chatSlice";
import { setAnalyticsModal } from "../store/slices/uiSlice";

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

  const { currentRoom, activeParticipants, raisedHands, loading } = useSelector(
    (s) => s.room,
  );
  const { user } = useSelector((s) => s.auth);
  const { isMuted, isRecording, audioLevels, activeSpeaker } = useSelector(
    (s) => s.audio,
  );
  const { isChatOpen, unreadCount } = useSelector((s) => s.chat);

  const [handRaised, setHandRaised] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [reactions, setReactions] = useState([]);

  const { setupSocketListeners, joinRoomAudio, handleMuteToggle } =
    useRoom(roomId);

  const isHost =
    currentRoom?.host?._id === user?._id || currentRoom?.host === user?._id;
  const myParticipant = activeParticipants.find((p) => p._id === user?._id);
  const myRole = myParticipant?.role || "listener";
  const canSpeak = ["host", "co_host", "speaker"].includes(myRole);

  const speakers = activeParticipants.filter((p) =>
    ["host", "co_host", "speaker"].includes(p.role),
  );
  const listeners = activeParticipants.filter((p) => p.role === "listener");

  const typeIcon = {
    public: <RiGlobalLine size={13} />,
    social: <RiGroupLine size={13} />,
    private: <RiLockLine size={13} />,
  };

  // Lifecycle
  useEffect(() => {
    let cleanupSocket;
    const initRoom = async () => {
      try {
        await dispatch(joinRoom(roomId));
        joinRoomSocket(roomId);
        await joinRoomAudio();
      } catch {
        toast.error("Failed to join room.");
        navigate("/explore");
      }
    };
    initRoom();
    cleanupSocket = setupSocketListeners();

    return () => {
      cleanupSocket?.();
      leaveRoomSocket(roomId);
      webRTCService.cleanup();
      dispatch(resetAudio());
      dispatch(clearChat());
    };
  }, [roomId]);

  // Handlers
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
    const next = !handRaised;
    setHandRaised(next);
    next ? emitRaiseHand(roomId) : emitLowerHand(roomId);
    if (next) toast("✋ Hand raised", { duration: 2000 });
  };

  const handleRecording = () => {
    if (isRecording) {
      emitStopRecording(roomId);
      dispatch(setRecording(false));
      toast.success("Recording stopped");
    } else {
      if (!currentRoom?.allowRecording) {
        toast.error("Recording is not enabled for this room");
        return;
      }
      emitStartRecording(roomId);
      dispatch(setRecording(true));
      toast.success("Recording started");
    }
  };

  const addFloatingReaction = (emoji) => {
    const id = Date.now();
    setReactions((r) => [...r, { id, emoji, x: Math.random() * 70 + 15 }]);
    setTimeout(() => setReactions((r) => r.filter((re) => re.id !== id)), 2500);
  };

  // Loading
  if (loading || !currentRoom) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-text-main text-white flex items-center justify-center mx-auto mb-4 border border-text-main animate-pulse">
            <RiMicLine size={28} />
          </div>
          <p className="text-text-muted text-sm font-semibold uppercase tracking-wider">
            Joining room...
          </p>
        </div>
      </div>
    );
  }

  // Render
  return (
    <div className="min-h-screen flex flex-col bg-surface-bg text-text-main">
      {/* Floating reactions */}
      <div className="fixed bottom-36 left-0 right-0 pointer-events-none z-50 overflow-hidden h-32">
        {reactions.map((r) => (
          <span
            key={r.id}
            className="absolute text-3xl"
            style={{
              left: `${r.x}%`,
              bottom: 0,
              animation: "floatUp 2.5s ease-out forwards",
            }}
          >
            {r.emoji}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-120px); opacity: 0; }
        }
      `}</style>

      <div className="flex flex-1 overflow-hidden">
        {/*Main room area*/}
        <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full px-6 py-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLeave}
                className="p-2 rounded-xl hover:bg-text-main/5 text-text-muted hover:text-text-main transition-colors border border-transparent hover:border-text-main/10"
              >
                <RiArrowLeftLine size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-text-muted flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
                    {typeIcon[currentRoom.type] || <RiGlobalLine size={13} />}
                    <span>{currentRoom.type || "public"}</span>
                  </span>
                  {currentRoom.isLive && (
                    <>
                      <span className="text-text-muted/30">·</span>
                      <span className="flex items-center gap-1 text-xs font-bold text-brand">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse inline-block" />
                        Live
                      </span>
                    </>
                  )}
                  {isRecording && (
                    <>
                      <span className="text-text-muted/30">·</span>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                        <RiRecordCircleLine
                          size={12}
                          className="animate-pulse"
                        />
                        Recording
                      </span>
                    </>
                  )}
                </div>
                <h1 className="font-display text-2xl md:text-3xl text-text-main leading-tight">
                  {currentRoom.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-text-muted text-sm font-bold border border-text-main/10 px-3 py-1.5 rounded-full bg-surface-card">
                <RiGroupLine size={14} />
                {activeParticipants.length}
              </div>
              <button className="p-2 rounded-xl hover:bg-text-main/5 text-text-muted transition-colors border border-transparent hover:border-text-main/10">
                <RiShareLine size={18} />
              </button>
              {isHost && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-xl hover:bg-text-main/5 text-text-muted transition-colors border border-transparent hover:border-text-main/10"
                >
                  <RiSettingsLine size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto scrollbar-none">
            {/* On Stage — Speakers */}
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">
                On Stage
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-5">
                {speakers.map((participant) => {
                  const isSpeaking = (audioLevels[participant._id] || 0) > 0.08;
                  const isActive = activeSpeaker === participant._id;
                  const handUp = raisedHands.includes(participant._id);

                  return (
                    <div
                      key={participant._id}
                      className="flex flex-col items-center gap-2 cursor-pointer group"
                      onClick={() => {
                        if (isHost && participant._id !== user?._id)
                          setSelectedParticipant(participant);
                      }}
                    >
                      <div className="relative">
                        <Avatar
                          user={participant}
                          size={64}
                          isSpeaking={isSpeaking || isActive}
                          isMuted={participant.isMuted}
                          className="transition-transform group-hover:scale-105"
                        />
                        {isSpeaking && (
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                            <AudioBars active color="#f59e0b" />
                          </div>
                        )}
                        {handUp && !isSpeaking && (
                          <div className="absolute -top-1 -right-1 text-base drop-shadow">
                            ✋
                          </div>
                        )}
                        {participant.role === "host" && (
                          <div className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center text-[9px] border border-white shadow">
                            ★
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-text-main text-center truncate w-full max-w-[72px]">
                        {participant._id === user?._id
                          ? "You"
                          : participant.name?.split(" ")[0]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Audience — Listeners */}
            {listeners.length > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">
                  Audience ({listeners.length})
                </p>
                <div className="flex flex-wrap gap-4">
                  {listeners.map((p) => {
                    const handUp = raisedHands.includes(p._id);
                    return (
                      <div
                        key={p._id}
                        className="flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => {
                          if (isHost && p._id !== user?._id)
                            setSelectedParticipant(p);
                        }}
                      >
                        <div className="relative">
                          <Avatar user={p} size={40} />
                          {handUp && (
                            <div className="absolute -top-1 -right-1 text-sm drop-shadow">
                              ✋
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] font-medium text-text-muted max-w-[48px] truncate text-center">
                          {p._id === user?._id ? "You" : p.name?.split(" ")[0]}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Control Bar */}
          <div className="mt-6 pt-5 border-t border-text-main/10">
            {/* Emoji reactions */}
            <div className="flex justify-center gap-2 mb-4">
              {EMOJI_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addFloatingReaction(emoji)}
                  className="text-xl p-2 rounded-xl hover:bg-text-main/5 transition-all hover:-translate-y-1 border border-transparent hover:border-text-main/10"
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between">
              {/* Left: Leave / End */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLeave}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide bg-surface-card border border-text-main/10 text-text-muted hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all flex items-center gap-2"
                >
                  <RiDoorOpenLine size={16} />
                  Leave
                </button>
                {isHost && (
                  <button
                    onClick={handleEndRoom}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wide bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                  >
                    End Room
                  </button>
                )}
              </div>

              {/* Right: Action buttons */}
              <div className="flex items-center gap-2">
                {/* Raise hand (listeners only) */}
                {!canSpeak && (
                  <button
                    onClick={handleRaiseHand}
                    title="Raise Hand"
                    className={`p-3 rounded-xl transition-all border ${
                      handRaised
                        ? "bg-brand/10 text-brand border-brand/30 shadow-sm"
                        : "bg-surface-card text-text-muted border-text-main/10 hover:text-text-main hover:border-text-main/20"
                    }`}
                  >
                    <RiHandHeartLine size={20} />
                  </button>
                )}

                {/* Mute/unmute (speakers) */}
                {canSpeak && (
                  <button
                    onClick={handleMuteToggle}
                    title={isMuted ? "Unmute" : "Mute"}
                    className={`p-3 rounded-xl transition-all border ${
                      isMuted
                        ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        : "bg-brand/10 text-brand border-brand/30 hover:bg-brand/20"
                    }`}
                  >
                    {isMuted ? (
                      <RiMicOffLine size={20} />
                    ) : (
                      <RiMicLine size={20} />
                    )}
                  </button>
                )}

                {/* Chat */}
                <button
                  onClick={() => dispatch(setChatOpen(!isChatOpen))}
                  title="Chat"
                  className={`relative p-3 rounded-xl transition-all border ${
                    isChatOpen
                      ? "bg-brand/10 text-brand border-brand/30"
                      : "bg-surface-card text-text-muted border-text-main/10 hover:text-text-main hover:border-text-main/20"
                  }`}
                >
                  <RiMessage3Line size={20} />
                  {unreadCount > 0 && !isChatOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand text-[9px] flex items-center justify-center text-white font-bold border-2 border-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Recording (host + allowed) */}
                {isHost && currentRoom.allowRecording && (
                  <button
                    onClick={handleRecording}
                    title={isRecording ? "Stop Recording" : "Start Recording"}
                    className={`p-3 rounded-xl transition-all border ${
                      isRecording
                        ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                        : "bg-surface-card text-text-muted border-text-main/10 hover:text-red-600 hover:border-red-200"
                    }`}
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

        {/* Chat sidebar */}
        {isChatOpen && <RoomChat roomId={roomId} />}
      </div>

      {/* Modals */}
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
