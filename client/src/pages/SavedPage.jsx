import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RiBookmarkLine } from "react-icons/ri";
import { fetchRooms } from "../store/slices/roomSlice";
import RegistryLayout from "../components/layout/RegistryLayout";
import RoomCard from "../components/ui/RoomCard";

const SavedPage = () => {
  const dispatch = useDispatch();
  const { rooms, loading } = useSelector((s) => s.room);

  const loadData = () => {
    dispatch(fetchRooms({ saved: true }));
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const emptyStateSlot = (
    <>
      <div className="w-14 h-14 rounded-full border border-text-main flex items-center justify-center mb-4 bg-surface-card text-brand">
        <RiBookmarkLine size={24} />
      </div>
      <h3 className="font-display text-3xl text-text-main mb-2">
        Your shelf is empty
      </h3>
      <p className="text-text-muted font-medium text-sm max-w-sm">
        Bookmark active sessions over on the Explore deck to curate your
        collection here.
      </p>
    </>
  );

  const bookmarkIconSlot = (
    <>
      <RiBookmarkLine size={13} className="text-brand" />
      <span className="text-text-muted">Archived</span>
    </>
  );

  return (
    <RegistryLayout
      title="Saved"
      italicTitle="Rooms"
      subtitle="Your personal catalog of bookmarked conversations."
      onRefresh={loadData}
      isLoading={loading}
      isEmpty={rooms.length === 0}
      emptyState={emptyStateSlot}
    >
      {rooms.map((room) => (
        <RoomCard
          key={room._id}
          room={room}
          showBookmarkIcon={true}
          bookmarkIcon={bookmarkIconSlot}
        />
      ))}
    </RegistryLayout>
  );
};

export default SavedPage;
