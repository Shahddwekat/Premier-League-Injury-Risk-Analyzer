import { useState } from "react";

const AnonymousAvatar = ({ size = 64, border }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      border: `2px solid ${border || "#FF288260"}`,
      backgroundColor: "#3A1050",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    <svg viewBox="0 0 80 80" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <rect width="80" height="80" fill="#3A1050" rx="40" />
      <circle cx="40" cy="30" r="14" fill="#6A3080" />
      <ellipse cx="40" cy="68" rx="22" ry="16" fill="#6A3080" />
    </svg>
  </div>
);

const InjuredPlayerCard = ({ injury, players }) => {
  const [photoError, setPhotoError] = useState(false);

  const playerData = players?.find(p =>
    p.name.toLowerCase() === injury.player.toLowerCase() ||
    p.name.toLowerCase().includes(injury.player.toLowerCase()) ||
    injury.player.toLowerCase().includes(p.name.toLowerCase())
  );

  const typeColor = injury.type === "Injury"
    ? "#FF2882"
    : injury.type === "Suspension"
    ? "#FF8C00"
    : "#FFD700";

  return (
    <div style={{
      backgroundColor: "#2A0020",
      border: "1px solid #FF288240",
      borderRadius: "16px",
      overflow: "hidden",
    }}>
      <div className="flex items-start gap-4 p-5">
        {playerData?.photo && !photoError ? (
          <img
            src={playerData.photo}
            alt={injury.player}
            className="rounded-full object-cover shrink-0"
            style={{
              width: "64px",
              height: "64px",
              border: "2px solid #FF288260",
            }}
            onError={() => setPhotoError(true)}
          />
        ) : (
          <AnonymousAvatar size={64} border="#FF288260" />
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