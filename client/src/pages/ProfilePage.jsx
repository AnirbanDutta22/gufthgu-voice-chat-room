import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  RiUserAddLine,
  RiUserFollowLine,
  RiMicLine,
  RiEditLine,
} from "react-icons/ri";
import {
  fetchUserProfile,
  followUser,
  unfollowUser,
} from "../store/slices/userSlice";
import { TOPICS } from "../constants";
import Avatar from "../components/ui/Avatar";
import Tag from "../components/ui/Tag";
import api from "../services/api";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((s) => s.auth);
  const { viewedProfile, loading } = useSelector((s) => s.user);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [activeTab, setActiveTab] = useState("rooms");

  const profileId = userId || currentUser?._id;
  const isOwnProfile = profileId === currentUser?._id;

  const fetchUserRooms = async () => {
    try {
      const res = await api.get(`/users/${profileId}/rooms`);
      setRooms(res.data.rooms || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (profileId) dispatch(fetchUserProfile(profileId));
  }, [profileId, dispatch]);

  useEffect(() => {
    if (viewedProfile) {
      setFollowing(viewedProfile.isFollowedByMe || false);
      fetchUserRooms();
    }
  }, [viewedProfile]);

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (following) {
        await dispatch(unfollowUser(profileId));
        setFollowing(false);
        toast("Unfollowed");
      } else {
        await dispatch(followUser(profileId));
        setFollowing(true);
        toast.success("Following!");
      }
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 pt-28">
        <div className="bg-surface-card border border-text-main/10 rounded-3xl p-8 space-y-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-text-main/5" />
            <div className="flex-1 space-y-2">
              <div className="h-6 bg-text-main/5 rounded w-1/3" />
              <div className="h-4 bg-text-main/5 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!viewedProfile) return null;

  const TABS = [
    { id: "rooms", label: `Rooms (${rooms.length})` },
    {
      id: "followers",
      label: `Followers (${viewedProfile.followerCount || 0})`,
    },
    {
      id: "following",
      label: `Following (${viewedProfile.followingCount || 0})`,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pt-28">
      {/* Profile Card */}
      <div className="bg-surface-card border border-text-main rounded-3xl p-8 mb-8 shadow-[4px_4px_0px_rgba(20,20,20,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <Avatar
              user={viewedProfile}
              size={84}
              showBadge
              className="border-2 border-text-main"
            />
            <div className="min-w-0">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <h1 className="font-display text-3xl tracking-tight text-text-main">
                  {viewedProfile.name}
                </h1>
                {viewedProfile.isVerified && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-accent-dark text-white px-2.5 py-0.5 rounded">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-text-muted font-medium text-sm mt-0.5">
                @{viewedProfile.username}
              </p>
              {viewedProfile.bio && (
                <p className="text-text-main font-medium text-sm mt-3 leading-relaxed">
                  {viewedProfile.bio}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 self-center sm:self-start">
            {isOwnProfile ? (
              <button
                onClick={() => navigate("/settings")}
                className="btn-secondary px-5! py-2.5! flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
              >
                <RiEditLine size={14} /> Edit Identity
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-2 text-xs uppercase font-bold tracking-wider px-5 py-2.5 rounded-full border transition-all duration-200 ${
                  following
                    ? "bg-transparent text-text-main border-text-main hover:bg-text-main hover:text-white"
                    : "bg-brand text-white border-brand hover:bg-brand-hover hover:border-brand-hover"
                }`}
              >
                {following ? (
                  <RiUserFollowLine size={14} />
                ) : (
                  <RiUserAddLine size={14} />
                )}
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Stats Registry */}
        <div className="flex gap-8 py-4 my-2 border-y border-text-main/10">
          {[
            { label: "Followers", value: viewedProfile.followerCount || 0 },
            { label: "Following", value: viewedProfile.followingCount || 0 },
            { label: "Rooms", value: viewedProfile.roomCount || rooms.length },
          ].map((stat) => (
            <div key={stat.label} className="text-left">
              <p className="font-display text-2xl text-text-main leading-none">
                {stat.value}
              </p>
              <p className="text-text-muted text-xs font-bold uppercase tracking-wider mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Topic Pills */}
        {viewedProfile.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {viewedProfile.topics.map((topicId) => {
              const t = TOPICS.find((tp) => tp.id === topicId);
              return t ? (
                <Tag
                  key={topicId}
                  className="bg-surface-bg border border-text-main/10 text-text-main rounded-md font-medium px-2.5 py-0.5 text-xs"
                >
                  {t.emoji} {t.label}
                </Tag>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Segmented Tab Bar */}
      <div className="flex p-1 bg-surface-alt rounded-xl mb-6 border border-text-main/5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-text-main text-white shadow-sm"
                : "text-text-muted hover:text-text-main"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs Layout Matrices */}
      {activeTab === "rooms" && (
        <div className="space-y-3">
          {rooms.length === 0 ? (
            <div className="text-center py-12 bg-white/50 rounded-2xl border border-dashed border-text-main/10 text-text-muted text-sm font-medium">
              {isOwnProfile
                ? "You haven't hosted any rooms yet."
                : "No archives listed under this profile."}
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => room.isLive && navigate(`/room/${room._id}`)}
                className={`bg-surface-card border border-text-main/10 hover:border-text-main rounded-2xl p-5 flex items-center justify-between transition-all duration-200 shadow-sm ${
                  room.isLive ? "cursor-pointer" : "opacity-75"
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/20">
                    <RiMicLine size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-text-main text-sm truncate">
                      {room.title}
                    </p>
                    <p className="text-xs font-medium text-text-muted mt-0.5">
                      {room.listenerCount || 0} listening units
                    </p>
                  </div>
                </div>
                {room.isLive && (
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-0.5 rounded">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse inline-block" />
                    Live
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "followers" && (
        <FollowersList userId={profileId} type="followers" />
      )}
      {activeTab === "following" && (
        <FollowersList userId={profileId} type="following" />
      )}
    </div>
  );
};

const FollowersList = ({ userId, type }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/users/${userId}/${type}`);
        setUsers(res.data.users || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId, type]);

  if (loading)
    return (
      <div className="text-center py-12 text-text-muted text-sm font-medium animate-pulse">
        Loading listings...
      </div>
    );
  if (!users.length)
    return (
      <div className="text-center py-12 text-text-muted text-sm font-medium border border-dashed border-text-main/10 rounded-2xl bg-white/50">
        No profiles categorized yet.
      </div>
    );

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <button
          key={u._id}
          onClick={() => navigate(`/profile/${u._id}`)}
          className="flex items-center gap-3 w-full p-4 rounded-xl bg-surface-card border border-text-main/5 hover:border-text-main transition-all duration-200 text-left shadow-sm"
        >
          <Avatar user={u} size={40} showBadge />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-main truncate">
              {u.name}
            </p>
            <p className="text-xs text-text-muted font-medium">@{u.username}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ProfilePage;
