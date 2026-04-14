const riskConfig = {
  High: { bg: "bg-red-900/40", border: "border-red-500", text: "text-red-400", badge: "bg-red-500" },
  Medium: { bg: "bg-yellow-900/40", border: "border-yellow-500", text: "text-yellow-400", badge: "bg-yellow-500" },
  Low: { bg: "bg-green-900/40", border: "border-green-500", text: "text-green-400", badge: "bg-green-500" },
};

const PlayerCard = ({ player }) => {
  const config = riskConfig[player.risk] || riskConfig.Low;

  return (
    <div className={`${config.bg} border ${config.border} rounded-xl p-5`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-white">{player.name}</h3>
        <span className={`${config.badge} text-white text-sm font-semibold px-3 py-1 rounded-full`}>
          {player.risk} Risk
        </span>
      </div>
      <p className="text-gray-300 leading-relaxed">{player.explanation}</p>
    </div>
  );
};

export default PlayerCard;