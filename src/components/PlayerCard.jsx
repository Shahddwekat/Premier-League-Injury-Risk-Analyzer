const riskConfig = {
  High: { bg: "bg-gray-900", border: "border-red-500", badge: "bg-red-500", bar: "bg-red-500" },
  Medium: { bg: "bg-gray-900", border: "border-yellow-500", badge: "bg-yellow-500", bar: "bg-yellow-500" },
  Low: { bg: "bg-gray-900", border: "border-green-500", badge: "bg-green-500", bar: "bg-green-500" },
};

const PlayerCard = ({ player }) => {
  const config = riskConfig[player.risk] || riskConfig.Low;

  return (
    <div className={`${config.bg} border ${config.border} rounded-2xl overflow-hidden`}>
      {/* Top section - photo + details */}
      <div className="flex items-center gap-5 p-5">
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gray-700 shrink-0" />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{player.name}</h3>
            <span className={`${config.badge} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide`}>
              {player.risk} Risk
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">{player.position} · Age {player.age}</p>
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <p className="text-white font-bold text-lg">{player.appearances}</p>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Apps</p>
            </div>
            <div className="w-px bg-gray-700" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">{player.minutes}</p>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Mins</p>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom section - explanation */}
      <div className="border-t border-gray-800 px-5 py-4">
        <p className="text-gray-300 text-sm leading-relaxed">{player.explanation}</p>
      </div>
    </div>
  );
};

export default PlayerCard;