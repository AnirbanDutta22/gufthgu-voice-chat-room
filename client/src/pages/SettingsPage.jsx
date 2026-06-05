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
  { id: "profile", label: "Profile", icon: <RiUserLine size={15} /> },
  { id: "topics", label: "Topics", icon: <RiPaletteLine size={15} /> },
  { id: "notifications", label: "Alerts", icon: <RiBellLine size={15} /> },
  { id: "audio", label: "Audio", icon: <RiMicLine size={15} /> },
  { id: "privacy", label: "Privacy", icon: <RiShieldLine size={15} /> },
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
      toast.success("Profile records updated!");
    } catch {
      toast.error("Failed to execute save operations.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="pb-6 border-b border-text-main/10 mb-8">
        <h1 className="font-display text-5xl tracking-tight text-text-main">
          System <span className="italic text-brand">Preferences</span>
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Deck */}
        <div className="w-full md:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                  activeTab === tab.id
                    ? "bg-text-main text-white border-text-main"
                    : "bg-transparent text-text-muted border-transparent hover:border-text-main/10 hover:text-text-main hover:bg-text-main/5"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
            <div className="pt-4 border-t border-text-main/10 mt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 text-red-600 border border-transparent hover:border-red-600/20 hover:bg-red-50"
              >
                <RiLogoutBoxLine size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Content Console */}
        <div className="flex-1 bg-surface-card border border-text-main rounded-2xl p-6 md:p-8 shadow-[4px_4px_0px_rgba(20,20,20,0.05)]">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <h2 className="font-display text-3xl text-text-main border-b border-text-main/5 pb-2">
                Identity Profile
              </h2>

              {/* Avatar Module */}
              <div className="flex items-center gap-5">
                <div
                  className="relative cursor-pointer group rounded-full border border-text-main overflow-hidden flex-shrink-0"
                  onClick={() => fileRef.current?.click()}
                >
                  <Avatar user={{ ...user, avatar: avatarPreview }} size={76} />
                  <div className="absolute inset-0 bg-text-main/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
                    className="btn-secondary !px-4 !py-2 text-xs font-bold uppercase tracking-wider"
                  >
                    Replace Image
                  </button>
                  <p className="text-[11px] font-medium text-text-muted mt-1.5">
                    Supports JPG or PNG format. (Max limit 5MB)
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
                  label: "Handle Username",
                  placeholder: "yourhandle",
                  prefix: "@",
                },
                {
                  key: "website",
                  label: "External Index / Website",
                  placeholder: "https://yoursite.com",
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                    {field.label}
                  </label>
                  <div className="relative">
                    {field.prefix && (
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">
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
                      className={`input-field ${field.prefix ? "pl-9" : ""}`}
                    />
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
                  Identity Biography
                </label>
                <textarea
                  placeholder="Draft your brief summary index here..."
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
                className="btn-primary w-full sm:w-auto text-xs font-bold uppercase tracking-wider !px-6"
              >
                {saving ? "Commiting Changes..." : "Save Identity Records"}
              </button>
            </div>
          )}

          {activeTab === "topics" && (
            <div className="space-y-6">
              <h2 className="font-display text-3xl text-text-main border-b border-text-main/5 pb-2">
                Personalized Topics
              </h2>
              <p className="text-text-muted text-sm font-medium">
                Affix your primary content frequencies to customize dashboard
                recommendations.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
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
                      className={`inline-flex items-center gap-1.5 px-4 py-2 border rounded-full text-xs font-semibold tracking-wide transition-all ${
                        isSelected
                          ? "bg-text-main border-text-main text-white"
                          : "bg-transparent border-text-main/10 text-text-muted hover:border-text-main hover:text-text-main"
                      }`}
                    >
                      <span>{topic.emoji}</span>
                      <span>{topic.label}</span>
                      {isSelected && <RiCheckLine size={13} />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary text-xs font-bold uppercase tracking-wider px-6! mt-4"
              >
                {saving ? "Saving Matrices..." : "Confirm Selected Topics"}
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-5">
              <h2 className="font-display text-3xl text-text-main border-b border-text-main/5 pb-2">
                Alert Matrices
              </h2>
              {[
                { label: "New follower transmissions", key: "follows" },
                { label: "Inbound panel room invitations", key: "roomInvite" },
                {
                  label: "Followed entities initializing dynamic audio rooms",
                  key: "friendRoom",
                },
                {
                  label: "Speaker hand elevation permission confirmations",
                  key: "handApproved",
                },
                {
                  label:
                    "Broadcast session sound recordings availability archives",
                  key: "recordingReady",
                },
              ].map((pref) => (
                <div
                  key={pref.key}
                  className="flex items-center justify-between py-3 border-b border-text-main/5 last:border-0"
                >
                  <p className="text-sm font-semibold text-text-main">
                    {pref.label}
                  </p>
                  <button className="w-11 h-6 rounded-full bg-text-main relative shrink-0 transition-colors">
                    <span className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-surface-card border border-text-main/20 shadow-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "audio" && (
            <div className="space-y-6">
              <h2 className="font-display text-3xl text-text-main border-b border-text-main/5 pb-2">
                Audio Peripheral Configurations
              </h2>
              <div className="p-4 rounded-xl bg-surface-bg border border-text-main/10 text-xs font-semibold text-text-muted leading-relaxed">
                Hardware device driver paths bind automatically inside active
                broadcast room layout viewports.
              </div>
              {[
                {
                  label: "Algorithmic noise suppression",
                  desc: "Isolate environment background interference",
                },
                {
                  label: "Acoustic echo feedback cancellation",
                  desc: "Mitigate signal bounce bleed loops",
                },
                {
                  label: "Automatic hardware gain controls",
                  desc: "Normalize dynamic mic signal ceilings",
                },
              ].map((opt) => (
                <div
                  key={opt.label}
                  className="flex items-center justify-between py-2 border-b border-text-main/5 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-main">
                      {opt.label}
                    </p>
                    <p className="text-xs font-medium text-text-muted mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                  <button className="w-11 h-6 rounded-full bg-text-main relative shrink-0">
                    <span className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-surface-card border border-text-main/20 shadow-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-5">
              <h2 className="font-display text-3xl text-text-main border-b border-text-main/5 pb-2">
                Privacy & Shield Profiles
              </h2>
              {[
                {
                  label: "Enclosed Private Profile Vault",
                  desc: "Restrict visibility layers strictly to approved entities",
                },
                {
                  label: "Permit Unrestricted Direct Inbound Invites",
                  desc: "Allow general accounts access to trigger invite hooks",
                },
                {
                  label: "Broadcast Network Online Status Matrix",
                  desc: "Render immediate activity visibility indexes",
                },
              ].map((opt) => (
                <div
                  key={opt.label}
                  className="flex items-center justify-between py-3 border-b border-text-main/5 last:border-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-main">
                      {opt.label}
                    </p>
                    <p className="text-xs font-medium text-text-muted mt-0.5">
                      {opt.desc}
                    </p>
                  </div>
                  <button className="w-11 h-6 rounded-full bg-text-main/10 border border-text-main/20 relative shrink-0">
                    <span className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-surface-card border border-text-main/20 shadow-sm" />
                  </button>
                </div>
              ))}

              <div className="pt-6 border-t border-text-main/10 mt-6 flex justify-between items-center">
                <button className="text-red-600 font-bold text-xs uppercase tracking-wider border border-transparent hover:border-red-600/20 px-4 py-2 rounded-lg transition-colors">
                  Purge / Delete Identity
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
