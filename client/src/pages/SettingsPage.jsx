import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RiUserLine,
  RiBellLine,
  RiMicLine,
  RiShieldLine,
  RiPaletteLine,
  RiLogoutBoxLine,
  RiCameraLine,
  RiCheckLine,
} from "react-icons/ri";
import { updateUserProfile } from "../store/slices/authSlice";
import { TOPICS } from "../constants";
import Avatar from "../components/ui/Avatar";
import api from "../services/api";
import toast from "react-hot-toast";
import { logoutUser } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const TABS = [
  { id: "profile", label: "Profile", icon: <RiUserLine size={16} /> },
  { id: "topics", label: "Topics", icon: <RiPaletteLine size={16} /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <RiBellLine size={16} />,
  },
  { id: "audio", label: "Audio", icon: <RiMicLine size={16} /> },
  { id: "privacy", label: "Privacy", icon: <RiShieldLine size={16} /> },
];

const SettingsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    website: user?.website || "",
  });
  const [selectedTopics, setSelectedTopics] = useState(user?.topics || []);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileRef = useRef();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => formData.append(k, v));
      formData.append("topics", JSON.stringify(selectedTopics));
      if (avatarFile) formData.append("avatar", avatarFile);
      const res = await api.put("/users/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      dispatch(updateUserProfile(res.data.user));
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 page-enter">
      <h1 className="font-display text-2xl font-bold text-surface-50 mb-6">
        Settings
      </h1>

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-44 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`sidebar-link w-full ${activeTab === tab.id ? "active" : ""}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
            <div className="pt-4 border-t border-white/5 mt-4">
              <button
                onClick={handleLogout}
                className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/5"
              >
                <RiLogoutBoxLine size={16} />
                <span>Log out</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 glass rounded-2xl p-6 border border-white/6">
          {activeTab === "profile" && (
            <div className="space-y-5">
              <h2 className="font-display font-semibold text-surface-100">
                Edit Profile
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div
                  className="relative cursor-pointer group"
                  onClick={() => fileRef.current?.click()}
                >
                  <Avatar user={{ ...user, avatar: avatarPreview }} size={72} />
                  <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <RiCameraLine size={20} className="text-white" />
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <div>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="btn-secondary text-sm"
                  >
                    Change Photo
                  </button>
                  <p className="text-xs text-surface-600 mt-1">
                    JPG, PNG · Max 5MB
                  </p>
                </div>
              </div>

              {[
                {
                  key: "name",
                  label: "Display Name",
                  placeholder: "Your name",
                },
                {
                  key: "username",
                  label: "Username",
                  placeholder: "yourhandle",
                  prefix: "@",
                },
                {
                  key: "website",
                  label: "Website",
                  placeholder: "https://yoursite.com",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm text-surface-300 mb-1.5">
                    {field.label}
                  </label>
                  <div className="relative">
                    {field.prefix && (
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 text-sm">
                        {field.prefix}
                      </span>
                    )}
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      value={profileForm[field.key]}
                      onChange={(e) =>
                        setProfileForm((f) => ({
                          ...f,
                          [field.key]: e.target.value,
                        }))
                      }
                      className={`input-field ${field.prefix ? "pl-8" : ""}`}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm text-surface-300 mb-1.5">
                  Bio
                </label>
                <textarea
                  placeholder="Tell people about yourself..."
                  value={profileForm.bio}
                  onChange={(e) =>
                    setProfileForm((f) => ({ ...f, bio: e.target.value }))
                  }
                  rows={3}
                  className="input-field resize-none"
                  maxLength={200}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}

          {activeTab === "topics" && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-surface-100">
                Your Topics
              </h2>
              <p className="text-surface-500 text-sm">
                Choose topics to personalize your feed
              </p>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => {
                  const isSelected = selectedTopics.includes(topic.id);
                  return (
                    <button
                      key={topic.id}
                      onClick={() =>
                        setSelectedTopics((t) =>
                          isSelected
                            ? t.filter((id) => id !== topic.id)
                            : [...t, topic.id],
                        )
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                        isSelected
                          ? "bg-brand-600 text-white shadow-glow"
                          : "bg-white/5 text-surface-300 border border-white/8 hover:bg-white/10"
                      }`}
                    >
                      {topic.emoji} {topic.label}
                      {isSelected && <RiCheckLine size={12} />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary mt-4"
              >
                {saving ? "Saving..." : "Save Topics"}
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-surface-100">
                Notifications
              </h2>
              {[
                { label: "Someone follows you", key: "follows" },
                { label: "You're invited to a room", key: "roomInvite" },
                {
                  label: "Someone you follow starts a room",
                  key: "friendRoom",
                },
                { label: "Hand raise approved", key: "handApproved" },
                { label: "Room recording ready", key: "recordingReady" },
              ].map((pref) => (
                <div
                  key={pref.key}
                  className="flex items-center justify-between py-2"
                >
                  <p className="text-sm text-surface-200">{pref.label}</p>
                  <button
                    className="w-11 h-6 rounded-full bg-brand-600 relative flex-shrink-0"
                    style={{ width: 44, height: 24 }}
                  >
                    <span className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "audio" && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-surface-100">
                Audio Settings
              </h2>
              <p className="text-surface-500 text-sm">
                Configure your microphone and speaker
              </p>
              <div className="p-4 rounded-xl bg-white/3 border border-white/6">
                <p className="text-sm text-surface-400">
                  Audio device settings are available when you're in a room.
                </p>
              </div>
              {[
                { label: "Noise suppression", desc: "Reduce background noise" },
                { label: "Echo cancellation", desc: "Prevent audio echo" },
                {
                  label: "Auto gain control",
                  desc: "Adjust microphone volume automatically",
                },
              ].map((opt) => (
                <div
                  key={opt.label}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm text-surface-200">{opt.label}</p>
                    <p className="text-xs text-surface-500">{opt.desc}</p>
                  </div>
                  <button
                    className="w-11 h-6 rounded-full bg-brand-600 relative flex-shrink-0"
                    style={{ width: 44, height: 24 }}
                  >
                    <span className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-4">
              <h2 className="font-display font-semibold text-surface-100">
                Privacy & Safety
              </h2>
              {[
                {
                  label: "Private account",
                  desc: "Only approved followers can see your profile",
                },
                {
                  label: "Allow direct invites",
                  desc: "Let anyone invite you to their room",
                },
                {
                  label: "Show online status",
                  desc: "Let others see when you're active",
                },
              ].map((opt) => (
                <div
                  key={opt.label}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <p className="text-sm text-surface-200">{opt.label}</p>
                    <p className="text-xs text-surface-500">{opt.desc}</p>
                  </div>
                  <button
                    className="w-11 h-6 rounded-full bg-surface-700 relative flex-shrink-0"
                    style={{ width: 44, height: 24 }}
                  >
                    <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow" />
                  </button>
                </div>
              ))}

              <div className="pt-4 border-t border-white/5">
                <button className="text-red-400 hover:text-red-300 text-sm transition-colors">
                  Delete account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
