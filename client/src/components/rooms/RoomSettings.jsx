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
      await api.put(`/rooms/${room._id}`, form);
      toast.success("Room settings updated");
      onClose();
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const TYPE_OPTIONS = [
    {
      value: "public",
      label: "Public",
      icon: <RiGlobalLine size={15} />,
      color: "text-accent-mint",
    },
    {
      value: "social",
      label: "Social",
      icon: <RiGroupLine size={15} />,
      color: "text-accent-amber",
    },
    {
      value: "private",
      label: "Private",
      icon: <RiLockLine size={15} />,
      color: "text-accent-violet",
    },
  ];

  return (
    <Modal isOpen onClose={onClose} title="Room Settings" size="sm">
      <div className="space-y-5">
        <div>
          <label className="block text-sm text-surface-300 mb-1.5">
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
              <label className="block text-sm text-surface-300 mb-2">
                Room Type
              </label>
              <div className="flex gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                    className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border transition-all text-xs ${
                      form.type === opt.value
                        ? "border-brand-500 bg-brand-600/15"
                        : "border-white/8 hover:border-white/15 bg-white/3"
                    }`}
                  >
                    <span
                      className={
                        form.type === opt.value ? opt.color : "text-surface-500"
                      }
                    >
                      {opt.icon}
                    </span>
                    <span
                      className={
                        form.type === opt.value
                          ? "text-surface-100"
                          : "text-surface-500"
                      }
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/6">
              <div className="flex items-center gap-2.5">
                <RiRecordCircleLine size={17} className="text-accent-coral" />
                <div>
                  <p className="text-sm font-500 text-surface-200">
                    Allow Recording
                  </p>
                  <p className="text-xs text-surface-500">
                    Participants can record
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setForm((f) => ({ ...f, allowRecording: !f.allowRecording }))
                }
                className={`w-10 h-5.5 rounded-full transition-all relative flex-shrink-0 ${form.allowRecording ? "bg-brand-600" : "bg-surface-700"}`}
                style={{ width: 44, height: 24 }}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.allowRecording ? "right-0.5" : "left-0.5"}`}
                />
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1"
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
