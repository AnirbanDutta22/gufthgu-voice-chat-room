import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RiGlobalLine,
  RiGroupLine,
  RiLockLine,
  RiRecordCircleLine,
} from "react-icons/ri";
import { createRoom } from "../../store/slices/roomSlice";
import { TOPICS } from "../../constants";
import Modal from "../ui/Modal";
import toast from "react-hot-toast";

const ROOM_TYPE_OPTIONS = [
  {
    value: "public",
    label: "Public",
    desc: "Anyone can join",
    icon: <RiGlobalLine size={18} />,
  },
  {
    value: "social",
    label: "Social",
    desc: "Followers only",
    icon: <RiGroupLine size={18} />,
  },
  {
    value: "private",
    label: "Private",
    desc: "Invite only",
    icon: <RiLockLine size={18} />,
  },
];

const CreateRoomModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { creating } = useSelector((s) => s.room);
  const [form, setForm] = useState({
    title: "",
    type: "public",
    topics: [],
    allowRecording: false,
    description: "",
  });

  const handleTopicToggle = (topicId) => {
    setForm((f) => ({
      ...f,
      topics: f.topics.includes(topicId)
        ? f.topics.filter((t) => t !== topicId)
        : f.topics.length < 3
          ? [...f.topics, topicId]
          : f.topics,
    }));
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return toast.error("Room title is required");
    const res = await dispatch(createRoom(form));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Room created!");
      onClose();
      navigate(`/room/${res.payload.room._id}`);
    } else {
      toast.error("Failed to create room");
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Initialize Room" size="lg">
      <div className="space-y-6 text-text-main">
        {/* Title input frame */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Room Title *
          </label>
          <input
            type="text"
            placeholder="What frequency are you tuning into?"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="input-field placeholder:text-text-muted/50"
            maxLength={80}
            autoFocus
          />
          <p className="text-[10px] font-mono font-bold text-text-muted mt-1 text-right">
            {form.title.length}/80 UNITS
          </p>
        </div>

        {/* Description panel */}
        {/* <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Index Description{" "}
            <span className="text-text-muted/60 font-medium lowercase">
              (optional)
            </span>
          </label>
          <textarea
            placeholder="Outline the scope of this conversation channel..."
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={2}
            className="input-field resize-none placeholder:text-text-muted/50"
            maxLength={200}
          />
        </div> */}

        {/* Access type grid matrix */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
            Transmission Mode
          </label>
          <div className="grid grid-cols-3 gap-3">
            {ROOM_TYPE_OPTIONS.map((opt) => {
              const isSelected = form.type === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                  className={`flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-xl border transition-all text-center group cursor-pointer ${
                    isSelected
                      ? "border-text-main bg-text-main text-white shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                      : "border-text-main/10 hover:border-text-main bg-surface-bg text-text-muted hover:text-text-main"
                  }`}
                >
                  <span
                    className={isSelected ? "text-white" : "text-text-main"}
                  >
                    {opt.icon}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider mt-0.5">
                    {opt.label}
                  </span>
                  <span
                    className={`text-[10px] font-medium leading-tight ${isSelected ? "text-white/80" : "text-text-muted"}`}
                  >
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Topic tags registry */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
            Topic Affiliations{" "}
            <span className="text-text-muted/60 font-medium lowercase">
              (max 3)
            </span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map((topic) => {
              const isSelected = form.topics.includes(topic.id);
              const isLimitReached = form.topics.length >= 3 && !isSelected;
              return (
                <button
                  key={topic.id}
                  type="button"
                  disabled={isLimitReached}
                  onClick={() => handleTopicToggle(topic.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brand border-text-main text-white shadow-[2px_2px_0px_rgba(0,0,0,0.15)]"
                      : "bg-surface-bg text-text-main border-text-main/10 hover:border-text-main"
                  } ${isLimitReached ? "opacity-30 cursor-not-allowed" : ""}`}
                >
                  <span>{topic.emoji}</span>
                  <span>{topic.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Recording config card */}
        {/* <div className="flex items-center justify-between p-4 rounded-xl bg-surface-bg border border-text-main/10">
          <div className="flex items-center gap-3 min-w-0">
            <RiRecordCircleLine
              size={20}
              className={
                form.allowRecording
                  ? "text-brand animate-pulse"
                  : "text-text-muted"
              }
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-text-main leading-tight">
                Archive Transmission Session
              </p>
              <p className="text-xs font-medium text-text-muted mt-0.5">
                Enable participants to record or log this live channel archive.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setForm((f) => ({ ...f, allowRecording: !f.allowRecording }))
            }
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 cursor-pointer border ${
              form.allowRecording
                ? "bg-text-main border-text-main"
                : "bg-text-main/10 border-text-main/20"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white border border-text-main/20 shadow-sm transition-all ${
                form.allowRecording ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div> */}

        {/* Operational buttons action deck */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary flex-1 text-xs font-bold uppercase tracking-wider py-3!"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !form.title.trim()}
            className="btn-primary flex-1 text-xs font-bold uppercase tracking-wider py-3! shadow-[3px_3px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? "Launching Channel..." : "Deploy Transmission"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateRoomModal;
