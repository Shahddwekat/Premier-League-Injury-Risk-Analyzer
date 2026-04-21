import { useState } from "react";

const riskConfig = {
  High: { bg: "#4A0030", border: "#FF2882", badge: "#FF2882", badgeText: "white" },
  Medium: { bg: "#2A1A00", border: "#FF8C00", badge: "#FF8C00", badgeText: "white" },
  Low: { bg: "#002A1A", border: "#00FF85", badge: "#00FF85", badgeText: "#37003C" },
};

const PlayerCard = ({ player }) => {
  const config = riskConfig[player.risk] || riskConfig.Low;
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div style={{
      backgroundColor: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: "16px",
      overflow: "hidden",
    }}>
      <div className="flex items-start gap-4 p-5">
        {player.photo ? (
          <img
            src={player.photo}
            alt={player.name}
            className="w-20 h-20 rounded-full object-cover shrink-0"
            style={{ border: `2px solid ${config.border}` }}
          />
        ) : (
          <div className="w-20 h-20 rounded-full shrink-0" style={{ backgroundColor: "#4A003C" }} />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{player.name}</h3>
            <span style={{
              backgroundColor: config.badge,
              color: config.badgeText,
              fontSize: "11px",
              fontWeight: "800",
              padding: "4px 12px",
              borderRadius: "999px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}>
              {player.risk} Risk
            </span>
          </div>
          <p style={{ color: "#C0A0C0", fontSize: "13px", marginTop: "4px" }}>
            {player.position} · Age {player.age}
          </p>
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <p className="text-white font-bold text-lg">{player.appearances}</p>
              <p style={{ color: "#C0A0C0", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Apps</p>
            </div>
            <div style={{ width: "1px", backgroundColor: "#5A2060" }} />
            <div className="text-center">
              <p className="text-white font-bold text-lg">{player.minutes}</p>
              <p style={{ color: "#C0A0C0", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Mins</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid #5A2060", padding: "16px 20px" }}>
        <p style={{ color: "#E0C0E0", fontSize: "13px", lineHeight: "1.6" }}>{player.explanation}</p>
      </div>

      <div style={{ borderTop: "1px solid #5A2060", padding: "12px 20px" }}>
        <button
          onClick={() => setShowHistory(prev => !prev)}
          style={{ color: "#C0A0C0", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          {showHistory ? "Hide Injury History ▲" : "View Injury History ▼"}
        </button>
        {showHistory && (
          <div className="mt-3 space-y-2">
            {player.injuryHistory?.length > 0 ? (
              player.injuryHistory.map((injury, idx) => (
                <div key={idx} style={{ backgroundColor: "#3A0030", borderRadius: "8px", padding: "10px 14px" }}>
                  <p className="text-white text-sm font-semibold">{injury.type}</p>
                  <p style={{ color: "#C0A0C0", fontSize: "12px", marginTop: "2px" }}>{injury.reason}</p>
                </div>
              ))
            ) : (
              <p style={{ color: "#8A608A", fontSize: "13px" }}>No recent injuries recorded.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCard;