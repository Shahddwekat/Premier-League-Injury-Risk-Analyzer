import { useState } from "react";

const riskColor = {
  Low: "#00FF85",
  Medium: "#FF8C00",
  High: "#FF2882",
};

const PlayerBubble = ({ player }) => {
  const color = riskColor[player.risk] || "#00FF85";
  const lastName = player.name.split(" ").pop();
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "64px" }}>
      <div style={{
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        overflow: "hidden",
        border: `2px solid ${color}`,
        backgroundColor: "#2D0040",
        flexShrink: 0,
      }}>
        {player.photo ? (
          <img src={player.photo} alt={player.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#4A003C" }} />
        )}
      </div>
      <span style={{
        color: "white",
        fontSize: "10px",
        fontWeight: "700",
        textAlign: "center",
        lineHeight: 1.2,
        textShadow: "0 1px 3px rgba(0,0,0,0.9)",
        width: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}>
        {lastName}
      </span>
      <div style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        backgroundColor: color,
        flexShrink: 0,
      }} />
    </div>
  );
};

const LineupSuggestion = ({ players, teamName }) => {
  const [open, setOpen] = useState(false);

  // Sort: Low risk first, then Medium, then High
  const riskOrder = { Low: 0, Medium: 1, High: 2 };
  const sorted = [...players].sort((a, b) => (riskOrder[a.risk] ?? 1) - (riskOrder[b.risk] ?? 1));

  // Pick best 11 by position
  const gks  = sorted.filter(p => p.position === "Goalkeeper").slice(0, 1);
  const defs = sorted.filter(p => p.position === "Defender").slice(0, 4);
  const mids = sorted.filter(p => p.position === "Midfielder").slice(0, 3);
  const fwds = sorted.filter(p => p.position === "Attacker").slice(0, 3);

  const picked = [...gks, ...defs, ...mids, ...fwds];

  // Fill to 11 if positions are short
  const unpicked = sorted.filter(p => !picked.includes(p));
  while (picked.length < 11 && unpicked.length > 0) {
    picked.push(unpicked.shift());
  }

  const finalGK   = picked.slice(0, 1);
  const finalDEF  = picked.slice(1, 5);
  const finalMID  = picked.slice(5, 8);
  const finalFWD  = picked.slice(8, 11);

  // Bench: next 4 lowest risk not in starting 11
  const bench = sorted.filter(p => !picked.includes(p)).slice(0, 4);

  const rows = [finalFWD, finalMID, finalDEF, finalGK];

  return (
    <div style={{ marginTop: "24px" }}>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: "100%",
          background: open
            ? "linear-gradient(135deg, #2D0040, #1A0028)"
            : "linear-gradient(135deg, #00FF85, #00CC6A)",
          color: open ? "#00FF85" : "#1A0020",
          border: open ? "1px solid #00FF8540" : "none",
          borderRadius: "16px",
          padding: "14px",
          fontSize: "14px",
          fontWeight: "800",
          cursor: "pointer",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {open ? "▲ Hide Suggested Lineup" : "⚽ Suggest Starting XI"}
      </button>

      {open && (
        <div style={{
          marginTop: "16px",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #3A1050",
        }}>
          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #2D0040, #1A0028)",
            padding: "14px 20px",
            borderBottom: "1px solid #3A1050",
          }}>
            <p style={{ color: "#00FF85", fontSize: "11px", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
              Suggested Starting XI — {teamName}
            </p>
            <p style={{ color: "#8060A0", fontSize: "11px", margin: "4px 0 0 0" }}>
              4-3-3 · Low risk players prioritized · High risk players benched
            </p>
          </div>

          {/* Pitch */}
          <div style={{
            background: "linear-gradient(180deg, #1a5c2a 0%, #1e6b30 25%, #1a5c2a 50%, #1e6b30 75%, #1a5c2a 100%)",
            padding: "20px 12px",
            position: "relative",
            minHeight: "400px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            gap: "8px",
          }}>
            {/* Pitch markings */}
            <div style={{
              position: "absolute", top: "50%", left: "8%", right: "8%",
              height: "1px", backgroundColor: "rgba(255,255,255,0.12)",
              transform: "translateY(-50%)",
            }} />
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              width: "70px", height: "70px",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: "50%",
              transform: "translate(-50%, -50%)",
            }} />
            <div style={{
              position: "absolute", top: "4%", left: "28%", right: "28%",
              height: "14%", border: "1px solid rgba(255,255,255,0.12)",
            }} />
            <div style={{
              position: "absolute", bottom: "4%", left: "28%", right: "28%",
              height: "14%", border: "1px solid rgba(255,255,255,0.12)",
            }} />

            {/* Player rows: FWD → MID → DEF → GK */}
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} style={{
                display: "flex",
                justifyContent: "space-evenly",
                alignItems: "center",
                position: "relative",
                zIndex: 1,
              }}>
                {row.map((player, i) => (
                  <PlayerBubble key={i} player={player} />
                ))}
              </div>
            ))}
          </div>

          {/* Bench */}
          {bench.length > 0 && (
            <div style={{
              background: "linear-gradient(135deg, #1A0028, #150020)",
              borderTop: "1px solid #3A1050",
              padding: "14px 20px",
            }}>
              <p style={{ color: "#8060A0", fontSize: "10px", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 12px 0" }}>
                Bench
              </p>
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                {bench.map((player, i) => (
                  <PlayerBubble key={i} player={player} />
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{
            background: "linear-gradient(135deg, #2D0040, #1A0028)",
            padding: "12px 20px",
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            borderTop: "1px solid #3A1050",
          }}>
            {[
              { color: "#00FF85", label: "Low Risk" },
              { color: "#FF8C00", label: "Medium Risk" },
              { color: "#FF2882", label: "High Risk" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: color }} />
                <span style={{ color: "#C0A0C0", fontSize: "11px" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LineupSuggestion;