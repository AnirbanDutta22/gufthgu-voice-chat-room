export const ROOM_TYPES = {
  PUBLIC: "public",
  SOCIAL: "social",
  PRIVATE: "private",
};

export const ROOM_TYPE_LABELS = {
  public: "Public",
  social: "Social",
  private: "Private",
};

export const ROOM_TYPE_DESCRIPTIONS = {
  public: "Anyone can join and listen",
  social: "Followers and friends",
  private: "Invite only",
};

export const PARTICIPANT_ROLES = {
  HOST: "host",
  CO_HOST: "co_host",
  SPEAKER: "speaker",
  LISTENER: "listener",
};

export const TOPICS = [
  { id: "technology", label: "Technology", emoji: "💻" },
  { id: "startup", label: "Startups", emoji: "🚀" },
  { id: "design", label: "Design", emoji: "🎨" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "finance", label: "Finance", emoji: "💰" },
  { id: "wellness", label: "Wellness", emoji: "🧘" },
  { id: "education", label: "Education", emoji: "📚" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "art", label: "Art & Culture", emoji: "🖼️" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "politics", label: "Politics", emoji: "🏛️" },
  { id: "comedy", label: "Comedy", emoji: "😂" },
  { id: "crypto", label: "Web3 & Crypto", emoji: "₿" },
  { id: "food", label: "Food & Cooking", emoji: "🍳" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "relationships", label: "Relationships", emoji: "❤️" },
  { id: "career", label: "Career", emoji: "💼" },
];

export const ONBOARDING_STEPS = [
  { id: 0, label: "Verify Contact", description: "Enter your phone or email" },
  {
    id: 1,
    label: "OTP Verification",
    description: "Enter the code we sent you",
  },
  { id: 2, label: "Create Profile", description: "Tell us about yourself" },
  { id: 3, label: "Upload Photo", description: "Add a profile picture" },
  { id: 4, label: "Pick Interests", description: "Choose topics you love" },
  { id: 5, label: "Follow People", description: "Connect with others" },
];

export const REACTIONS = ["👏", "❤️", "😂", "😮", "🔥", "🙌", "💯", "🎉"];

export const COLORS_AVATAR = [
  "#6272f3",
  "#a78bfa",
  "#fb7185",
  "#f5a623",
  "#6bcb9e",
  "#38bdf8",
  "#f472b6",
  "#34d399",
];

export const DEFAULT_AVATAR_URL = null;
