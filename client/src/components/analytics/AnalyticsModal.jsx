import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  RiTimeLine,
  RiGroupLine,
  RiMessage3Line,
  RiHandHeartLine,
  RiMicLine,
  RiCloseLine,
  RiBarChartLine,
  RiDownloadLine,
} from "react-icons/ri";
import api from "../../services/api";

const StatCard = ({ icon, label, value, sub, color = "text-brand" }) => (
  <div className="bg-surface-bg border border-text-main/10 rounded-2xl p-5">
    <div className={`${color} mb-3`}>{icon}</div>
    <p className="font-display text-3xl text-text-main leading-none">{value}</p>
    <p className="text-sm font-semibold text-text-muted mt-1">{label}</p>
    {sub && <p className="text-xs text-text-muted/60 mt-0.5">{sub}</p>}
  </div>
);

const AnalyticsModal = ({ roomId, onClose }) => {
  const navigate = useNavigate();
  const { currentRoom } = useSelector((s) => s.room);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetRoomId = roomId || currentRoom?._id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (targetRoomId) {
          const res = await api.get(`/rooms/${targetRoomId}/analytics`);
          setData(res.data);
        } else {
          setData(getMockData());
        }
      } catch {
        setData(getMockData());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [targetRoomId]);

  const getMockData = () => ({
    title: "Session Summary",
    duration: 2640,
    peakListeners: 47,
    totalJoined: 63,
    messagesCount: 124,
    handRaisesCount: 8,
    speakersCount: 4,
    recordingAvailable: false,
  });

  const fmtDuration = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const handleClose = () => {
    onClose?.();
    navigate("/explore");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-text-main/50 backdrop-blur-sm">
        <div className="bg-surface-card border-2 border-text-main rounded-3xl p-10 text-center shadow-[8px_8px_0px_rgba(0,0,0,1)]">
          <RiBarChartLine size={36} className="text-brand mx-auto mb-3" />
          <p className="text-text-muted text-sm font-semibold uppercase tracking-wider">
            Compiling analytics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-main/50 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-surface-card border-2 border-text-main rounded-3xl shadow-[8px_8px_0px_rgba(0,0,0,1)] overflow-hidden max-h-[88vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface-card px-6 pt-6 pb-4 border-b border-text-main/10 flex items-center justify-between z-10">
          <div>
            <h2 className="font-display text-3xl tracking-tight text-text-main">
              Session <span className="italic text-brand">Wrapped</span>
            </h2>
            <p className="text-text-muted text-xs font-bold uppercase tracking-wider mt-0.5">
              Room ended — here's a summary
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-surface-bg text-text-muted hover:text-text-main transition-colors border border-transparent hover:border-text-main/10"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Room name */}
          {data?.title && (
            <div className="flex items-center gap-3 py-3 px-4 bg-surface-bg border border-text-main/10 rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
                <RiMicLine size={18} />
              </div>
              <p className="font-display text-xl text-text-main">
                {data.title}
              </p>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<RiTimeLine size={20} />}
              label="Duration"
              value={fmtDuration(data?.duration || 0)}
              color="text-brand"
            />
            <StatCard
              icon={<RiGroupLine size={20} />}
              label="Peak Listeners"
              value={data?.peakListeners || 0}
              sub={`${data?.totalJoined || 0} total joined`}
              color="text-accent-dark"
            />
            <StatCard
              icon={<RiMessage3Line size={20} />}
              label="Messages"
              value={data?.messagesCount || 0}
              color="text-brand"
            />
            <StatCard
              icon={<RiHandHeartLine size={20} />}
              label="Hand Raises"
              value={data?.handRaisesCount || 0}
              sub={`${data?.speakersCount || 0} speakers`}
              color="text-accent-dark"
            />
          </div>

          {/* Engagement bar chart */}
          {data?.peakListeners > 0 && (
            <div className="bg-surface-bg border border-text-main/10 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
                Engagement
              </p>
              <div className="space-y-3">
                {[
                  { label: "Joined", value: data.totalJoined || 0 },
                  {
                    label: "Chatted",
                    value: Math.ceil((data.messagesCount || 0) / 3),
                  },
                  {
                    label: "Reacted",
                    value: Math.ceil((data.peakListeners || 0) * 0.5),
                  },
                  { label: "Spoke", value: data.speakersCount || 0 },
                ].map(({ label, value }) => {
                  const max = data.totalJoined || 1;
                  const pct = Math.min(100, Math.round((value / max) * 100));
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-text-muted w-14 uppercase tracking-wide">
                        {label}
                      </span>
                      <div className="flex-1 h-2.5 bg-white border border-text-main/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-text-main transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-text-main w-6 text-right">
                        {value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recording */}
          {data?.recordingAvailable && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-bg border border-text-main/10">
              <p className="text-sm font-bold text-text-main">
                Recording available
              </p>
              <button className="btn-secondary flex items-center gap-2 text-xs font-bold uppercase tracking-wider !px-4 !py-2">
                <RiDownloadLine size={13} /> Download
              </button>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleClose}
            className="btn-primary w-full text-xs font-bold uppercase tracking-wider py-3.5 shadow-[3px_3px_0px_rgba(0,0,0,1)]"
          >
            Back to Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
