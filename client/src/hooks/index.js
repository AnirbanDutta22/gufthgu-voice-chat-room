import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSocket,
  initSocket,
  joinRoomSocket,
  leaveRoomSocket,
  emitMuteToggle,
} from "../services/socket";
import webRTCService from "../services/webrtc";
import {
  addParticipant,
  removeParticipant,
  updateSpeakerMute,
  raiseHand,
  lowerHand,
  promoteToSpeaker,
  demoteToListener,
  toggleRecording,
} from "../store/slices/roomSlice";
import { addMessage } from "../store/slices/chatSlice";
import {
  setMuted,
  setIsSpeaker,
  setRecording,
  setAudioLevel,
  setActiveSpeaker,
  setHasPermission,
} from "../store/slices/audioSlice";
import { addNotification } from "../store/slices/uiSlice";

export const useSocket = () => {
  const token = useSelector((s) => s.auth.token);
  const socketRef = useRef(null);

  useEffect(() => {
    if (token) {
      socketRef.current = initSocket(token);
    }
    return () => {};
  }, [token]);

  return socketRef.current || getSocket();
};

export const useRoom = (roomId) => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { isMuted, isSpeaker } = useSelector((s) => s.audio);

  const setupSocketListeners = useCallback(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("room:user_joined", (data) =>
      dispatch(addParticipant(data.user)),
    );
    socket.on("room:user_left", (data) =>
      dispatch(removeParticipant(data.userId)),
    );
    socket.on("chat:message", (data) => dispatch(addMessage(data)));
    socket.on("room:raise_hand", (data) => dispatch(raiseHand(data.userId)));
    socket.on("room:lower_hand", (data) => dispatch(lowerHand(data.userId)));
    socket.on("room:promoted", (data) => {
      dispatch(promoteToSpeaker(data.userId));
      if (data.userId === user?._id) dispatch(setIsSpeaker(true));
    });
    socket.on("room:demoted", (data) => {
      dispatch(demoteToListener(data.userId));
      if (data.userId === user?._id) dispatch(setIsSpeaker(false));
    });
    socket.on("audio:mute_toggle", (data) => dispatch(updateSpeakerMute(data)));
    socket.on("room:recording_started", () => dispatch(toggleRecording(true)));
    socket.on("room:recording_stopped", () => dispatch(toggleRecording(false)));
    socket.on("room:notification", (data) => dispatch(addNotification(data)));

    // WebRTC signaling
    socket.on("webrtc:offer", ({ from, offer }) =>
      webRTCService.handleOffer(from, offer),
    );
    socket.on("webrtc:answer", ({ from, answer }) =>
      webRTCService.handleAnswer(from, answer),
    );
    socket.on("webrtc:ice_candidate", ({ from, candidate }) =>
      webRTCService.handleIceCandidate(from, candidate),
    );

    return () => {
      socket.off("room:user_joined");
      socket.off("room:user_left");
      socket.off("chat:message");
      socket.off("room:raise_hand");
      socket.off("room:lower_hand");
      socket.off("room:promoted");
      socket.off("room:demoted");
      socket.off("audio:mute_toggle");
      socket.off("room:recording_started");
      socket.off("room:recording_stopped");
      socket.off("room:notification");
      socket.off("webrtc:offer");
      socket.off("webrtc:answer");
      socket.off("webrtc:ice_candidate");
    };
  }, [dispatch, user]);

  const joinRoomAudio = useCallback(async () => {
    const hasPermission = await webRTCService.requestMicPermission();
    dispatch(setHasPermission(hasPermission));
    if (hasPermission) {
      await webRTCService.initLocalStream();
      webRTCService.onAudioLevel = (level) => {
        dispatch(setAudioLevel({ userId: user?._id, level }));
        if (level > 0.1) dispatch(setActiveSpeaker(user?._id));
      };
    }
  }, [dispatch, user]);

  const handleMuteToggle = useCallback(() => {
    const newMuted = !isMuted;
    dispatch(setMuted(newMuted));
    webRTCService.setMuted(newMuted);
    emitMuteToggle(roomId, newMuted);
  }, [isMuted, roomId, dispatch]);

  return { setupSocketListeners, joinRoomAudio, handleMuteToggle };
};

export const useClickOutside = (ref, callback) => {
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) callback();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, callback]);
};

export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useRef(value);
  useEffect(() => {
    const t = setTimeout(() => {
      debouncedValue.current = value;
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue.current;
};

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useRef(window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => {
      matches.current = e.matches;
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);
  return matches.current;
};
