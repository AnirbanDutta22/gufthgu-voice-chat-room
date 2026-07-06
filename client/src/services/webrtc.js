import { getSocket } from "./socket";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // Add TURN servers for production relay
  ],
};

class WebRTCService {
  constructor() {
    this.peerConnections = new Map(); // userId -> RTCPeerConnection
    this.localStream = null;
    this.remoteAudios = new Map(); // userId -> <audio> element
    this.onAudioLevel = null;
    this.audioContext = null;
    this.analyser = null;
    this.animationFrame = null;
  }

  // Permission
  async requestMicPermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch {
      return false;
    }
  }

  async getAudioDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      microphones: devices.filter((d) => d.kind === "audioinput"),
      speakers: devices.filter((d) => d.kind === "audiooutput"),
    };
  }

  // Local Stream
  async initLocalStream(micId = null) {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
    }

    const constraints = {
      audio: micId
        ? {
            deviceId: { exact: micId },
            echoCancellation: true,
            noiseSuppression: true,
          }
        : { echoCancellation: true, noiseSuppression: true },
      video: false,
    };

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      // Start muted — user must explicitly unmute
      this.localStream.getAudioTracks().forEach((t) => {
        t.enabled = false;
      });
      this._setupAnalyser();
      return this.localStream;
    } catch (err) {
      console.warn("[WebRTC] Could not get mic:", err.message);
      return null;
    }
  }

  _setupAnalyser() {
    if (!this.localStream) return;
    try {
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      const source = this.audioContext.createMediaStreamSource(
        this.localStream,
      );
      source.connect(this.analyser);
      this._monitorAudioLevel();
    } catch (err) {
      console.warn("[WebRTC] Analyser setup failed:", err.message);
    }
  }

  _monitorAudioLevel() {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const tick = () => {
      this.analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      if (this.onAudioLevel) this.onAudioLevel(avg / 255);
      this.animationFrame = requestAnimationFrame(tick);
    };
    tick();
  }

  setMuted(muted) {
    this.localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !muted;
    });
  }

  // Peer Connections
  async createPeerConnection(remoteUserId, isInitiator = false) {
    // Close any existing connection for this user
    this.closePeerConnection(remoteUserId);

    const pc = new RTCPeerConnection(ICE_SERVERS);
    this.peerConnections.set(remoteUserId, pc);
    const socket = getSocket();

    // Add local tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream);
      });
    }

    // ICE candidate relay
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket?.emit("webrtc:ice_candidate", { to: remoteUserId, candidate });
      }
    };

    // Remote track → play audio
    pc.ontrack = ({ streams: [stream] }) => {
      // Remove old audio element if any
      const old = this.remoteAudios.get(remoteUserId);
      if (old) {
        old.srcObject = null;
        old.remove();
      }

      const audio = document.createElement("audio");
      audio.srcObject = stream;
      audio.autoplay = true;
      audio.id = `audio-${remoteUserId}`;
      document.body.appendChild(audio);
      this.remoteAudios.set(remoteUserId, audio);
    };

    pc.oniceconnectionstatechange = () => {
      if (
        ["failed", "disconnected", "closed"].includes(pc.iceConnectionState)
      ) {
        console.log(
          `[WebRTC] ICE ${pc.iceConnectionState} for ${remoteUserId}`,
        );
      }
    };

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket?.emit("webrtc:offer", { to: remoteUserId, offer });
    }

    return pc;
  }

  async handleOffer(fromUserId, offer) {
    const pc = await this.createPeerConnection(fromUserId, false);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    getSocket()?.emit("webrtc:answer", { to: fromUserId, answer });
  }

  async handleAnswer(fromUserId, answer) {
    const pc = this.peerConnections.get(fromUserId);
    if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleIceCandidate(fromUserId, candidate) {
    const pc = this.peerConnections.get(fromUserId);
    if (pc) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("[WebRTC] addIceCandidate failed:", err.message);
      }
    }
  }

  closePeerConnection(userId) {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }
    const audio = this.remoteAudios.get(userId);
    if (audio) {
      audio.srcObject = null;
      audio.remove();
      this.remoteAudios.delete(userId);
    }
  }

  cleanup() {
    this.peerConnections.forEach((_, userId) =>
      this.closePeerConnection(userId),
    );
    this.peerConnections.clear();

    this.localStream?.getTracks().forEach((t) => t.stop());
    this.localStream = null;

    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch {
        //
      }
    }
    this.audioContext = null;
    this.analyser = null;
    this.onAudioLevel = null;
  }
}

const webRTCService = new WebRTCService();
export default webRTCService;
