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
import { TOPICS, ROOM_TYPES } from "../../constants";
import Modal from "../ui/Modal";
import Tag from "../ui/Tag";
import toast from "react-hot-toast";

const ROOM_TYPE_OPTIONS = [
  {
    value: "public",
    label: "Public",
    desc: "Anyone can join",
    icon: <RiGlobalLine size={18} />,
    color: "text-accent-mint",
  },
  {
    value: "social",
    label: "Social",
    desc: "Followers only",
    icon: <RiGroupLine size={18} />,
    color: "text-accent-amber",
  },
  {
    value: "private",
    label: "Private",
    desc: "Invite only",
    icon: <RiLockLine size={18} />,
    color: "text-accent-violet",
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
    <Modal isOpen onClose={onClose} title="Start a Room" size="lg">
      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm text-surface-300 mb-1.5">
            Room Title *
          </label>
          <input
            type="text"
            placeholder="What's this room about?"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="input-field"
            maxLength={80}
            autoFocus
          />
          <p className="text-xs text-surface-600 mt-1 text-right">
            {form.title.length}/80
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm text-surface-300 mb-1.5">
            Description <span className="text-surface-600">(optional)</span>
          </label>
          <textarea
            placeholder="A brief description of the conversation..."
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            rows={2}
            className="input-field resize-none"
            maxLength={200}
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm text-surface-300 mb-2">
            Room Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ROOM_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border transition-all text-center ${
                  form.type === opt.value
                    ? "border-brand-500 bg-brand-600/15"
                    : "border-white/8 hover:border-white/15 bg-white/3"
                }`}
              >
                <span
                  className={
                    form.type === opt.value ? opt.color : "text-surface-400"
                  }
                >
                  {opt.icon}
                </span>
                <span
                  className={`text-xs font-500 ${form.type === opt.value ? "text-surface-100" : "text-surface-400"}`}
                >
                  {opt.label}
                </span>
                <span className="text-[10px] text-surface-600 leading-tight">
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div>
          <label className="block text-sm text-surface-300 mb-2">
            Topics <span className="text-surface-600">(up to 3)</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TOPICS.map((topic) => (
              <button
                key={topic.id}
                onClick={() => handleTopicToggle(topic.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${
                  form.topics.includes(topic.id)
                    ? "bg-brand-600/20 text-brand-300 border border-brand-600/30"
                    : "bg-white/5 text-surface-400 border border-white/6 hover:bg-white/8"
                } ${form.topics.length >= 3 && !form.topics.includes(topic.id) ? "opacity-40" : ""}`}
              >
                {topic.emoji} {topic.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recording option */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
          <div className="flex items-center gap-2.5">
            <RiRecordCircleLine size={18} className="text-accent-coral" />
            <div>
              <p className="text-sm font-500 text-surface-200">
                Allow Recording
              </p>
              <p className="text-xs text-surface-500">
                Participants can record this session
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setForm((f) => ({ ...f, allowRecording: !f.allowRecording }))
            }
            className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${
              form.allowRecording ? "bg-brand-600" : "bg-surface-700"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                form.allowRecording ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !form.title.trim()}
            className="btn-primary flex-1 py-2.5"
          >
            {creating ? "Creating..." : "Start Room"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateRoomModal;
