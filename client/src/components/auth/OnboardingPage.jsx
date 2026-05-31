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
  <div className="space-y-4 animate-slide-up">
    <div>
      <label className="block text-sm text-surface-300 mb-1.5">
        Display Name *
      </label>
      <input
        type="text"
        placeholder="How should people call you?"
        value={data.name}
        onChange={(e) => onChange({ name: e.target.value })}
        className="input-field"
        autoFocus
      />
    </div>
    <div>
      <label className="block text-sm text-surface-300 mb-1.5">
        Username *
      </label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 text-sm">
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
          className="input-field pl-8"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm text-surface-300 mb-1.5">Bio</label>
      <textarea
        placeholder="Tell people a little about yourself..."
        value={data.bio}
        onChange={(e) => onChange({ bio: e.target.value })}
        rows={3}
        className="input-field resize-none"
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
        className="relative w-32 h-32 rounded-full cursor-pointer group"
      >
        {preview ? (
          <img
            src={preview}
            className="w-32 h-32 rounded-full object-cover"
            alt="Avatar preview"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-surface-800 border-2 border-dashed border-surface-600 flex items-center justify-center">
            <RiUserLine size={40} className="text-surface-500" />
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
        className="btn-secondary mt-4 text-sm"
      >
        {preview ? "Change Photo" : "Upload Photo"}
      </button>
      <p className="text-surface-500 text-xs mt-3">JPG, PNG or GIF · Max 5MB</p>
    </div>
  );
};

const TopicsStep = ({ selected, onChange }) => (
  <div className="animate-slide-up">
    <p className="text-surface-400 text-sm mb-5 text-center">
      Pick at least 3 topics you enjoy
    </p>
    <div className="flex flex-wrap gap-2 justify-center">
      {TOPICS.map((topic) => {
        const isSelected = selected.includes(topic.id);
        return (
          <button
            key={topic.id}
            onClick={() =>
              onChange(
                isSelected
                  ? selected.filter((t) => t !== topic.id)
                  : [...selected, topic.id],
              )
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
              isSelected
                ? "bg-brand-600 text-white shadow-glow"
                : "bg-white/5 text-surface-300 border border-white/8 hover:bg-white/10"
            }`}
          >
            <span>{topic.emoji}</span> {topic.label}
            {isSelected && <RiCheckLine size={13} />}
          </button>
        );
      })}
    </div>
  </div>
);

const DoneStep = ({ name }) => (
  <div className="text-center animate-slide-up py-4">
    <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center mx-auto mb-5 shadow-glow-lg">
      <RiCheckLine size={36} className="text-white" />
    </div>
    <h3 className="font-display text-2xl font-bold text-surface-50 mb-2">
      You're in, {name || "friend"}! 🎉
    </h3>
    <p className="text-surface-400 text-sm">
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
    console.log("Pressed");

    // If we are on the Topics step (index 2)
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

        console.log(res.data);
        console.log(res.data.user);

        dispatch(updateUserProfile(res.data.user));
        toast.success("Profile saved!");

        // Move to the "Done" step (Index 3)
        setStep((s) => s + 1);
      } catch (err) {
        toast.error("Failed to save profile");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    // If we are on the final "Done" step (index 3)
    else if (step === STEPS.length - 1) {
      navigate("/explore"); // This is where the navigation belongs!
    }
    // For steps 0 and 1
    else {
      setStep((s) => s + 1);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-50 mb-2">
            Create your profile
          </h1>
          <p className="text-surface-400 text-sm">
            Step {step + 1} of {STEPS.length} — {STEPS[step].label}
          </p>
        </div>

        {/* Progress */}
        <div className="w-full h-1 bg-surface-800 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full gradient-brand transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step
                    ? "bg-accent-mint text-surface-900"
                    : i === step
                      ? "bg-brand-600 text-white"
                      : "bg-surface-800 text-surface-500"
                }`}
              >
                {i < step ? <RiCheckLine size={14} /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 sm:w-16 h-px transition-all ${i < step ? "bg-accent-mint" : "bg-surface-700"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="glass rounded-3xl p-8 border border-white/8 mb-6">
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

        {/* Navigation */}
        <div className="flex items-center gap-3">
          {step > 0 && step < STEPS.length - 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="btn-secondary flex items-center gap-2"
            >
              <RiArrowLeftLine size={16} /> Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!isStepValid() || loading}
            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
          >
            {loading
              ? "Saving..."
              : step === STEPS.length - 1
                ? "Enter gufthgu"
                : "Continue"}
            {!loading && step !== STEPS.length - 1 && (
              <RiArrowRightLine size={16} />
            )}
          </button>
        </div>

        {step < STEPS.length - 1 && step !== 0 && (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="w-full text-center text-surface-500 text-xs mt-4 hover:text-surface-400 transition-colors"
          >
            Skip this step
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
