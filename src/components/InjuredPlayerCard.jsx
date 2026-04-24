const InjuredPlayerCard = ({ injury, players }) => {
  // Find the player in fullSquad to get photo and stats
  const playerData = players?.find(p =>
    p.name.toLowerCase() === injury.player.toLowerCase() ||
    p.name.toLowerCase().includes(injury.player.toLowerCase()) ||
    injury.player.toLowerCase().includes(p.name.toLowerCase())
  );

  const typeColor = injury.type === "Injury"
    ? "#FF2882"
    : injury.type === "Suspension"
    ? "#FF8C00"
    : "#FFD700"; // Doubt = yellow

  return (
    <div style={{
      backgroundColor: "#2A0020",
      border: "1px solid #FF288240",
      borderRadius: "16px",
      overflow: "hidden",
    }}>
      <div className="flex items-start gap-4 p-5">
        {playerData?.photo ? (
          <img
            src={playerData.photo}
            alt={injury.player}
            className="w-16 h-16 rounded-full object-cover shrink-0"
            style={{ border: "2px solid #FF288260" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="w-16 h-16 rounded-full shrink-0" style={{ backgroundColor: "#4A003C" }} />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white">{injury.player}</h3>
            <span style={{
              backgroundColor: typeColor,
              color: "white",
              fontSize: "10px",
              fontWeight: "800",
              padding: "3px 10px",
              borderRadius: "999px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              flexShrink: 0,
            }}>
              {injury.type}
            </span>
          </div>
          {playerData && (
            <p style={{ color: "#C0A0C0", fontSize: "12px", marginTop: "4px" }}>
              {playerData.position}
              {playerData.appearances > 0 && ` · ${playerData.appearances} apps · ${playerData.minutes} mins`}
            </p>
          )}
          <p style={{
            color: "#FF8080",
            fontSize: "12px",
            marginTop: "8px",
            lineHeight: "1.5",
          }}>
            {injury.reason || "No details available"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InjuredPlayerCard;