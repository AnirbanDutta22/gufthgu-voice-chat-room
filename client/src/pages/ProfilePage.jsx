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
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="glass rounded-3xl p-8 animate-pulse">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-surface-800" />
            <div className="flex-1">
              <div className="h-5 bg-surface-800 rounded-full w-1/3 mb-2" />
              <div className="h-3 bg-surface-800 rounded-full w-1/4" />
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
    <div className="max-w-2xl mx-auto px-6 py-8 page-enter">
      {/* Profile card */}
      <div className="glass rounded-3xl p-6 mb-6 border border-white/6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-start gap-4">
            <Avatar user={viewedProfile} size={80} showBadge />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-xl font-bold text-surface-50">
                  {viewedProfile.name}
                </h1>
                {viewedProfile.isVerified && (
                  <span className="text-xs bg-brand-600/20 text-brand-400 border border-brand-600/25 px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
              </div>
              <p className="text-surface-500 text-sm">
                @{viewedProfile.username}
              </p>
              {viewedProfile.bio && (
                <p className="text-surface-300 text-sm mt-2 leading-relaxed">
                  {viewedProfile.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex-shrink-0">
            {isOwnProfile ? (
              <button
                onClick={() => navigate("/settings")}
                className="btn-secondary flex items-center gap-2 text-sm"
              >
                <RiEditLine size={15} /> Edit
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all ${
                  following ? "btn-secondary" : "btn-primary"
                }`}
              >
                {following ? (
                  <RiUserFollowLine size={15} />
                ) : (
                  <RiUserAddLine size={15} />
                )}
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-5 mb-5">
          {[
            { label: "Followers", value: viewedProfile.followerCount || 0 },
            { label: "Following", value: viewedProfile.followingCount || 0 },
            { label: "Rooms", value: viewedProfile.roomCount || rooms.length },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display font-bold text-surface-50 text-lg leading-none">
                {stat.value}
              </p>
              <p className="text-surface-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Topics */}
        {viewedProfile.topics?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {viewedProfile.topics.map((topicId) => {
              const t = TOPICS.find((tp) => tp.id === topicId);
              return t ? (
                <Tag key={topicId} size="sm" emoji={t.emoji}>
                  {t.label}
                </Tag>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl mb-5 border border-white/5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-sm transition-all ${
              activeTab === tab.id
                ? "bg-brand-600 text-white font-500"
                : "text-surface-400 hover:text-surface-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "rooms" && (
        <div className="space-y-3">
          {rooms.length === 0 ? (
            <div className="text-center py-10 text-surface-500 text-sm">
              {isOwnProfile
                ? "You haven't hosted any rooms yet."
                : "No rooms hosted yet."}
            </div>
          ) : (
            rooms.map((room) => (
              <div
                key={room._id}
                onClick={() => room.isLive && navigate(`/room/${room._id}`)}
                className={`room-card p-4 ${room.isLive ? "cursor-pointer" : "opacity-70"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center flex-shrink-0">
                      <RiMicLine size={16} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-500 text-surface-100 text-sm truncate">
                        {room.title}
                      </p>
                      <p className="text-xs text-surface-500 mt-0.5">
                        {room.listenerCount || 0} listeners
                      </p>
                    </div>
                  </div>
                  {room.isLive && (
                    <span className="flex items-center gap-1 text-xs text-accent-coral flex-shrink-0 ml-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-coral animate-pulse inline-block" />
                      Live
                    </span>
                  )}
                </div>
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
      <div className="text-center py-8 text-surface-500 text-sm">
        Loading...
      </div>
    );
  if (!users.length)
    return (
      <div className="text-center py-8 text-surface-500 text-sm">
        No {type} yet.
      </div>
    );

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <button
          key={u._id}
          onClick={() => navigate(`/profile/${u._id}`)}
          className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/4 transition-colors text-left"
        >
          <Avatar user={u} size={40} showBadge />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-500 text-surface-100 truncate">
              {u.name}
            </p>
            <p className="text-xs text-surface-500">@{u.username}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ProfilePage;
