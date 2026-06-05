import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RiMicLine,
  RiGlobalLine,
  RiGroupLine,
  RiLockLine,
} from "react-icons/ri";
import { fetchRooms, setFilters } from "../store/slices/roomSlice";
import { TOPICS } from "../constants";
import RegistryLayout from "../components/layout/RegistryLayout";
import RoomCard from "../components/ui/RoomCard";

const FILTER_TYPES = [
  { id: "all", label: "All Rooms", icon: <RiGlobalLine size={14} /> },
  { id: "public", label: "Public", icon: <RiGlobalLine size={14} /> },
  { id: "social", label: "Social", icon: <RiGroupLine size={14} /> },
  { id: "private", label: "Private", icon: <RiLockLine size={14} /> },
];

const ExplorePage = () => {
  const dispatch = useDispatch();
  const { rooms, loading, filters } = useSelector((s) => s.room);
  const [activeTopic, setActiveTopic] = useState(null);

  const loadData = () => {
    dispatch(
      fetchRooms({
        type: filters.type !== "all" ? filters.type : undefined,
        topic: activeTopic,
      }),
    );
  };

  useEffect(() => {
    loadData();
  }, [filters.type, activeTopic, dispatch]);

  // Constructing UI components as cleaner slots to feed layout parameters
  const typeFiltersSlot = (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
      {FILTER_TYPES.map((f) => (
        <button
          key={f.id}
          onClick={() => dispatch(setFilters({ type: f.id }))}
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
            filters.type === f.id
              ? "bg-text-main text-white border-text-main"
              : "bg-surface-card text-text-main border-text-main/20 hover:border-text-main"
          }`}
        >
          {f.icon}
          {f.label}
        </button>
      ))}
    </div>
  );

  const topicFiltersSlot = (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2 border-b border-text-main/5">
      <button
        onClick={() => setActiveTopic(null)}
        className={`inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
          !activeTopic
            ? "bg-brand text-white"
            : "text-text-muted hover:text-text-main"
        }`}
      >
        All Topics
      </button>
      {TOPICS.map((t) => (
        <button
          key={t.id}
          onClick={() => setActiveTopic(activeTopic === t.id ? null : t.id)}
          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all border ${
            activeTopic === t.id
              ? "bg-accent-dark text-white border-accent-dark"
              : "bg-transparent text-text-muted border-transparent hover:border-text-main/20 hover:text-text-main"
          }`}
        >
          <span>{t.emoji}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );

  const emptyStateSlot = (
    <>
      <div className="w-14 h-14 rounded-full border border-text-main flex items-center justify-center mb-4 bg-surface-card text-brand">
        <RiMicLine size={24} />
      </div>
      <h3 className="font-display text-3xl text-text-main mb-2">
        The halls are quiet
      </h3>
      <p className="text-text-muted font-medium text-sm max-w-sm">
        There are no rooms under this filter right now. Why not initiate a new
        thread?
      </p>
    </>
  );

  return (
    <RegistryLayout
      title="Explore"
      italicTitle="Rooms"
      subtitle="Live audio rooms broadcasting around the world right now."
      onRefresh={loadData}
      isLoading={loading}
      filters={typeFiltersSlot}
      subFilters={topicFiltersSlot}
      isEmpty={rooms.length === 0}
      emptyState={emptyStateSlot}
    >
      {rooms.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </RegistryLayout>
  );
};

export default ExplorePage;
