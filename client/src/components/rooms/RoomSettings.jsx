import { useState } from "react";
import {
  RiRecordCircleLine,
  RiLockLine,
  RiGlobalLine,
  RiGroupLine,
} from "react-icons/ri";
import Modal from "../ui/Modal";
import api from "../../services/api";
import toast from "react-hot-toast";

const TYPE_OPTIONS = [
  { value: "public", label: "Public", icon: <RiGlobalLine size={16} /> },
  { value: "social", label: "Social", icon: <RiGroupLine size={16} /> },
  { value: "private", label: "Private", icon: <RiLockLine size={16} /> },
];

const RoomSettings = ({ room, onClose, isHost }) => {
  const [form, setForm] = useState({
    title: room.title || "",
    type: room.type || "public",
    allowRecording: room.allowRecording || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!isHost) return;
    setSaving(true);
    try {
      await api.put(`/rooms/${room._id}/settings`, form);
      toast.success("Room settings saved");
      onClose();
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Room Settings" size="sm">
      <div className="space-y-5 text-text-main">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
            Room Title
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="input-field"
            disabled={!isHost}
          />
        </div>

        {isHost && (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                Room Type
              </label>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all text-xs font-bold uppercase tracking-wider ${
                      form.type === opt.value
                        ? "border-text-main bg-text-main text-white"
                        : "border-text-main/10 hover:border-text-main bg-surface-bg text-text-muted hover:text-text-main"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-bg border border-text-main/10">
              <div className="flex items-center gap-3">
                <RiRecordCircleLine
                  size={18}
                  className={
                    form.allowRecording
                      ? "text-red-500 animate-pulse"
                      : "text-text-muted"
                  }
                />
                <div>
                  <p className="text-sm font-bold text-text-main">
                    Allow Recording
                  </p>
                  <p className="text-xs text-text-muted">
                    Let participants record this room
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setForm((f) => ({ ...f, allowRecording: !f.allowRecording }))
                }
                className={`w-11 h-6 rounded-full transition-all relative shrink-0 border ${
                  form.allowRecording
                    ? "bg-text-main border-text-main"
                    : "bg-text-main/10 border-text-main/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white border border-text-main/20 shadow transition-all ${
                    form.allowRecording ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={onClose}
                className="btn-secondary flex-1 py-2.5! text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1 py-2.5! text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default RoomSettings;
