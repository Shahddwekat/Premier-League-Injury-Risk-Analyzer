const SkeletonCard = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-40 bg-gray-700 rounded animate-pulse" />
        <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
};

export default SkeletonCard;