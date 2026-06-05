import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RiCameraLine,
  RiArrowRightLine,
  RiArrowLeftLine,
  RiCheckLine,
  RiUserLine,
} from "react-icons/ri";
import { updateUserProfile } from "../../store/slices/authSlice";
import { TOPICS } from "../../constants";
import api from "../../services/api";
import toast from "react-hot-toast";

const STEPS = [
  { id: "profile", label: "Your Profile" },
  { id: "photo", label: "Profile Photo" },
  { id: "topics", label: "Your Interests" },
  { id: "done", label: "All Set!" },
];

const ProfileStep = ({ data, onChange }) => (
  <div className="space-y-4 animate-slide-up text-text-main">
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
        Display Name *
      </label>
      <input
        type="text"
        placeholder="How should people call you?"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="input-field focus:border-text-main placeholder:text-text-muted/40"
        autoFocus
      />
    </div>
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
        Username *
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">
          @
        </span>
        <input
          type="text"
          placeholder="yourhandle"
          value={data.username}
          onChange={(e) =>
            onChange({
              username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
            })
          }
          className="input-field pl-8 focus:border-text-main placeholder:text-text-muted/40"
        />
      </div>
    </div>
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1.5">
        Bio
      </label>
      <textarea
        placeholder="Tell people a little about yourself..."
        value={data.bio}
        onChange={(e) => onChange({ bio: e.target.value })}
        rows={3}
        className="input-field resize-none focus:border-text-main placeholder:text-text-muted/40"
      />
    </div>
  </div>
);

const PhotoStep = ({ data, onChange }) => {
  const fileRef = useRef();
  const [preview, setPreview] = useState(data.avatarPreview || null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange({ avatarFile: file, avatarPreview: url });
  };

  return (
    <div className="flex flex-col items-center animate-slide-up">
      <div
        onClick={() => fileRef.current?.click()}
        className="relative w-32 h-32 rounded-full cursor-pointer group border-2 border-text-main shadow-[3px_3px_0px_rgba(0,0,0,1)] overflow-hidden"
      >
        {preview ? (
          <img
            src={preview}
            className="w-32 h-32 rounded-full object-cover"
            alt="Avatar preview"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-surface-bg flex items-center justify-center">
            <RiUserLine size={40} className="text-text-muted" />
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-text-main/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <RiCameraLine size={28} className="text-white" />
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => fileRef.current?.click()}
        className="btn-secondary mt-5 text-xs font-bold uppercase tracking-wider !py-2.5 !px-4 bg-white"
      >
        {preview ? "Change Avatar Image" : "Upload Image Source"}
      </button>
      <p className="text-text-muted text-[10px] font-mono font-bold uppercase tracking-wide mt-3">
        JPG, PNG or GIF · Max 5MB
      </p>
    </div>
  );
};

const TopicsStep = ({ selected, onChange }) => (
  <div className="animate-slide-up">
    <p className="text-text-muted text-xs font-bold uppercase tracking-wider mb-5 text-center">
      Pick at least 3 topics you enjoy
    </p>
    <div className="flex flex-wrap gap-2 justify-center">
      {TOPICS.map((topic) => {
        const isSelected = selected.includes(topic.id);
        return (
          <button
            key={topic.id}
            type="button"
            onClick={() =>
              onChange(
                isSelected
                  ? selected.filter((t) => t !== topic.id)
                  : [...selected, topic.id],
              )
            }
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold tracking-wide border transition-all cursor-pointer ${
              isSelected
                ? "bg-brand text-white border-text-main shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                : "bg-surface-bg text-text-main border-text-main/10 hover:border-text-main"
            }`}
          >
            <span>{topic.emoji}</span> <span>{topic.label}</span>
            {isSelected && <RiCheckLine size={13} className="ml-1" />}
          </button>
        );
      })}
    </div>
  </div>
);

const DoneStep = ({ name }) => (
  <div className="text-center animate-slide-up py-4">
    <div className="w-16 h-16 rounded-full bg-brand text-white flex items-center justify-center mx-auto mb-5 border-2 border-text-main shadow-[3px_3px_0px_rgba(0,0,0,1)]">
      <RiCheckLine size={32} />
    </div>
    <h3 className="font-display text-2xl font-black tracking-tight text-text-main mb-2">
      You're in, {name || "friend"}! 🎉
    </h3>
    <p className="text-text-muted text-xs font-bold uppercase tracking-wider">
      Your profile is ready. Let's find some rooms.
    </p>
  </div>
);

const OnboardingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    bio: "",
  });
  const [photoData, setPhotoData] = useState({
    avatarFile: null,
    avatarPreview: null,
  });
  const [selectedTopics, setSelectedTopics] = useState([]);

  const isStepValid = () => {
    if (step === 0)
      return profileData.name.trim() && profileData.username.trim();
    if (step === 2) return selectedTopics.length >= 3;
    return true;
  };

  const handleNext = async () => {
    if (step === STEPS.length - 2) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("name", profileData.name);
        formData.append("username", profileData.username);
        formData.append("bio", profileData.bio);
        formData.append("topics", JSON.stringify(selectedTopics));
        formData.append("isProfileComplete", "true");
        if (photoData.avatarFile)
          formData.append("avatar", photoData.avatarFile);

        const res = await api.put("/users/profile", formData);
        dispatch(updateUserProfile(res.data.user));
        toast.success("Profile saved!");
        setStep((s) => s + 1);
      } catch (err) {
        toast.error("Failed to save profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else if (step === STEPS.length - 1) {
      navigate("/explore");
    } else {
      setStep((s) => s + 1);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col items-center justify-center px-4 py-12 selection:bg-brand selection:text-white">
      <div className="w-full max-w-md">
        {/* Header Block */}
        <div className="text-center mb-6">
          <h1 className="font-display text-3xl font-black tracking-tight text-text-main mb-1">
            Create your profile
          </h1>
          <p className="text-text-muted text-xs font-bold uppercase tracking-widest">
            Step {step + 1} of {STEPS.length} — {STEPS[step].label}
          </p>
        </div>

        {/* Heavy Matrix Progress Bar */}
        <div className="w-full h-3.5 bg-white border-2 border-text-main rounded-full mb-8 overflow-hidden p-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <div
            className="h-full rounded-full bg-brand border border-text-main transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Modular Step Matrix Indicators */}
        <div className="flex items-center justify-between mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                  i < step
                    ? "bg-text-main text-white border-text-main"
                    : i === step
                      ? "bg-brand text-white border-text-main shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-text-muted/40 border-text-main/10"
                }`}
              >
                {i < step ? <RiCheckLine size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-6 sm:w-12 h-0.5 transition-all ${i < step ? "bg-text-main" : "bg-text-main/10"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Central Core Interactive Shell */}
        <div className="bg-surface-card rounded-3xl p-8 border-2 border-text-main mb-6 shadow-[5px_5px_0px_rgba(0,0,0,1)]">
          {step === 0 && (
            <ProfileStep
              data={profileData}
              onChange={(d) => setProfileData((p) => ({ ...p, ...d }))}
            />
          )}
          {step === 1 && (
            <PhotoStep
              data={photoData}
              onChange={(d) => setPhotoData((p) => ({ ...p, ...d }))}
            />
          )}
          {step === 2 && (
            <TopicsStep
              selected={selectedTopics}
              onChange={setSelectedTopics}
            />
          )}
          {step === 3 && <DoneStep name={profileData.name} />}
        </div>

        {/* Operational Flow Controls Navigation Panel */}
        <div className="flex items-center gap-3">
          {step > 0 && step < STEPS.length - 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary flex items-center gap-2 text-xs font-bold uppercase tracking-wider py-3! px-4 bg-white"
            >
              <RiArrowLeftLine size={14} /> Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider shadow-[3px_3px_0px_rgba(0,0,0,1)] disabled:opacity-40"
          >
            <span>
              {loading
                ? "Saving..."
                : step === STEPS.length - 1
                  ? "Enter gufthgu"
                  : "Continue"}
            </span>
            {!loading && step !== STEPS.length - 1 && (
              <RiArrowRightLine size={14} />
            )}
          </button>
        </div>

        {step < STEPS.length - 1 && step !== 0 && (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="w-full text-center text-text-muted hover:text-text-main font-mono text-[10px] font-bold uppercase tracking-wide mt-5"
          >
            [&gt;&gt; Skip this step]
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
