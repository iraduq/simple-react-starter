export default function RoomSkeleton() {
  return (
    <div className="rounded-[40px] overflow-hidden border border-[#e2e8f0] bg-white p-8 shadow-sm">
      <div className="h-[340px] bg-[#f1f5f9] rounded-[28px] animate-pulse mb-6" />
      <div className="h-8 w-1/2 rounded bg-[#f1f5f9] animate-pulse mb-4" />
      <div className="h-20 w-full rounded bg-[#f1f5f9] animate-pulse" />
    </div>
  );
}
