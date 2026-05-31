import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  RiMicLine,
  RiTimeLine,
  RiGroupLine,
  RiHand,
  RiMessageLine,
  RiBarChartLine,
  RiDownloadLine,
  RiCloseLine,
} from "react-icons/ri";
import api from "../../services/api";
import Avatar from "../ui/Avatar";

const StatCard = ({ icon, label, value, sub, color = "text-brand-400" }) => (
  <div className="glass rounded-2xl p-4 border border-white/6">
    <div className={`${color} mb-2`}>{icon}</div>
    <p className="text-2xl font-display font-bold text-surface-50">{value}</p>
    <p className="text-sm text-surface-400">{label}</p>
    {sub && <p className="text-xs text-surface-600 mt-0.5">{sub}</p>}
  </div>
);

const AnalyticsModal = ({ roomId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMockAnalytics = () => ({
    title: "Session Summary",
    duration: 2820, // seconds
    peakListeners: 47,
    totalJoined: 63,
    messagesCount: 124,
    handRaisesCount: 8,
    speakersCount: 4,
    topSpeakers: [],
    recordingAvailable: false,
    topTopics: ["technology", "startup"],
  });

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/rooms/${roomId}/analytics`);
        setData(res.data);
      } catch {
        // Use mock data for demonstration
        setData(getMockAnalytics());
      } finally {
        setLoading(false);
      }
    };
    if (roomId) fetch();
    else {
      setData(getMockAnalytics());
      setLoading(false);
    }
  }, [roomId]);

  const formatDuration = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="glass rounded-3xl p-8 text-center border border-white/8">
          <RiBarChartLine size={32} className="text-brand-400 mx-auto mb-3" />
          <p className="text-surface-300 text-sm">Generating analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg glass rounded-3xl border border-white/8 shadow-2xl overflow-hidden animate-slide-up max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-center justify-between sticky top-0 glass">
          <div>
            <h2 className="font-display text-xl font-bold text-surface-50">
              Session Wrapped
            </h2>
            <p className="text-surface-500 text-sm mt-0.5">
              Your room just ended
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/5 text-surface-400 hover:text-surface-200 transition-colors"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Title */}
          {data?.title && (
            <div className="text-center py-2">
              <div className="w-12 h-12 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-3 shadow-glow">
                <RiMicLine size={22} className="text-white" />
              </div>
              <p className="font-display font-semibold text-surface-100">
                {data.title}
              </p>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<RiTimeLine size={20} />}
              label="Duration"
              value={formatDuration(data?.duration || 0)}
              color="text-brand-400"
            />
            <StatCard
              icon={<RiGroupLine size={20} />}
              label="Peak Listeners"
              value={data?.peakListeners || 0}
              sub={`${data?.totalJoined || 0} total joined`}
              color="text-accent-mint"
            />
            <StatCard
              icon={<RiMessageLine size={20} />}
              label="Messages"
              value={data?.messagesCount || 0}
              color="text-accent-amber"
            />
            <StatCard
              icon={<RiHand size={20} />}
              label="Hand Raises"
              value={data?.handRaisesCount || 0}
              sub={`${data?.speakersCount || 0} speakers`}
              color="text-accent-violet"
            />
          </div>

          {/* Engagement bar */}
          {data?.peakListeners > 0 && (
            <div className="glass rounded-2xl p-4 border border-white/6">
              <p className="text-sm font-500 text-surface-200 mb-3">
                Listener Activity
              </p>
              <div className="space-y-2">
                {["Joined", "Spoke", "Chatted", "Reacted"].map((label, i) => {
                  const values = [
                    data.totalJoined || 0,
                    data.speakersCount || 0,
                    Math.floor((data.messagesCount || 0) / 2),
                    Math.floor((data.peakListeners || 0) * 0.6),
                  ];
                  const max = Math.max(...values);
                  const pct = max > 0 ? (values[i] / max) * 100 : 0;
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs text-surface-500 w-14">
                        {label}
                      </span>
                      <div className="flex-1 h-2 bg-surface-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full gradient-brand transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-surface-400 w-6 text-right">
                        {values[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recording */}
          {data?.recordingAvailable && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/8 border border-red-500/20">
              <div>
                <p className="text-sm font-500 text-surface-200">
                  Recording Available
                </p>
                <p className="text-xs text-surface-500">Session was recorded</p>
              </div>
              <button className="btn-secondary flex items-center gap-2 text-sm">
                <RiDownloadLine size={14} /> Download
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-primary flex-1 py-2.5">
              Back to Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
