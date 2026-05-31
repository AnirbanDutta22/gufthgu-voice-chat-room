import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  RiUserAddLine,
  RiUserUnfollowLine,
  RiMicLine,
} from "react-icons/ri";
import {
  fetchUserProfile,
  followUser,
  unfollowUser,
  clearViewedProfile,
} from "../../store/slices/userSlice";
import { TOPICS } from "../../constants";
import Avatar from "../ui/Avatar";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((s) => s.auth);
  const { viewedProfile, loading, following } = useSelector((s) => s.user);

  const isOwnProfile = !userId || userId === currentUser?._id;
  const profile = isOwnProfile ? currentUser : viewedProfile;
  const profileId = isOwnProfile ? currentUser?._id : userId;

  useEffect(() => {
    if (!isOwnProfile && userId) {
      dispatch(fetchUserProfile(userId));
    }
    return () => {
      if (!isOwnProfile) dispatch(clearViewedProfile());
    };
  }, [dispatch, userId, isOwnProfile]);

  const isFollowing = following?.some(
    (f) => f._id === profileId || f === profileId,
  );

  const handleFollowToggle = async () => {
    if (!profileId || isOwnProfile) return;
    const action = isFollowing ? unfollowUser : followUser;
    const res = await dispatch(action(profileId));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success(isFollowing ? "Unfollowed" : "Following!");
      dispatch(fetchUserProfile(profileId));
    }
  };

  if (!isOwnProfile && loading && !profile) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="glass rounded-3xl p-8 border border-white/8 animate-pulse h-64" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <p className="text-surface-500">Profile not found.</p>
      </div>
    );
  }

  const topicLabels = (profile.topics || [])
    .map((id) => TOPICS.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="glass rounded-3xl p-8 border border-white/8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <Avatar user={profile} size={96} showBadge />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-surface-50">
              {profile.name}
            </h1>
            <p className="text-surface-400 text-sm">@{profile.username}</p>
            {profile.bio && (
              <p className="text-surface-300 text-sm mt-3 leading-relaxed">
                {profile.bio}
              </p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-surface-500">
              <span>
                <strong className="text-surface-200">
                  {profile.followersCount ?? 0}
                </strong>{" "}
                followers
              </span>
              <span>
                <strong className="text-surface-200">
                  {profile.followingCount ?? 0}
                </strong>{" "}
                following
              </span>
            </div>
            {!isOwnProfile && (
              <button
                onClick={handleFollowToggle}
                className={`mt-5 btn-primary flex items-center gap-2 text-sm ${
                  isFollowing ? "btn-secondary" : ""
                }`}
              >
                {isFollowing ? (
                  <>
                    <RiUserUnfollowLine size={16} /> Unfollow
                  </>
                ) : (
                  <>
                    <RiUserAddLine size={16} /> Follow
                  </>
                )}
              </button>
            )}
            {isOwnProfile && (
              <button
                onClick={() => navigate("/settings")}
                className="mt-5 btn-secondary text-sm"
              >
                Edit profile
              </button>
            )}
          </div>
        </div>

        {topicLabels.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <h2 className="text-sm font-500 text-surface-400 mb-3">Interests</h2>
            <div className="flex flex-wrap gap-2">
              {topicLabels.map((t) => (
                <span
                  key={t.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white/5 text-surface-300 border border-white/6"
                >
                  {t.emoji} {t.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {isOwnProfile && (
        <button
          onClick={() => navigate("/explore")}
          className="mt-6 w-full room-card p-5 flex items-center gap-3 text-left hover:border-brand-600/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
            <RiMicLine className="text-white" size={18} />
          </div>
          <div>
            <p className="font-500 text-surface-100">Start or join a room</p>
            <p className="text-xs text-surface-500">Explore live conversations</p>
          </div>
        </button>
      )}
    </div>
  );
};

export default ProfilePage;
