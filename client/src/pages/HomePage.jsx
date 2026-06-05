import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RiUserHeartLine } from "react-icons/ri";
import { fetchRooms } from "../store/slices/roomSlice";
import RegistryLayout from "../components/layout/RegistryLayout";
import RoomCard from "../components/ui/RoomCard";

const HomePage = () => {
  const dispatch = useDispatch();
  const { rooms, loading } = useSelector((s) => s.room);

  const loadData = () => {
    dispatch(fetchRooms({ feed: "following" }));
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const emptyStateSlot = (
    <>
      <div className="w-14 h-14 rounded-full border border-text-main flex items-center justify-center mb-4 bg-surface-card text-brand">
        <RiUserHeartLine size={24} />
      </div>
      <h3 className="font-display text-3xl text-text-main mb-2">
        Quiet waters
      </h3>
      <p className="text-text-muted font-medium text-sm max-w-sm">
        Hosts you follow are resting right now. Follow more curators over on the
        Explore deck to see active frequencies here.
      </p>
    </>
  );

  return (
    <RegistryLayout
      title="Following"
      italicTitle="Feed"
      subtitle="Live rooms broadcasted by the creators you follow."
      onRefresh={loadData}
      isLoading={loading}
      isEmpty={rooms.length === 0}
      emptyState={emptyStateSlot}
    >
      {rooms.map((room) => (
        <RoomCard key={room._id} room={room} />
      ))}
    </RegistryLayout>
  );
};

export default HomePage;
