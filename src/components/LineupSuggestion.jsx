import { useState } from "react";

const POSITION_MAP = {
  Goalkeeper: "GK",
  Defender: "DEF",
  Midfielder: "MID",
  Attacker: "FWD",
};

const riskColor = {
  Low: "#00FF85",
  Medium: "#FF8C00",
  High: "#FF2882",
};

const PlayerBubble = ({ player }) => {
  const color = riskColor[player.risk] || "#00FF85";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{
        width: "48px",
        height: "48px",
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
        maxWidth: "60px",
        lineHeight: 1.2,
        textShadow: "0 1px 3px rgba(0,0,0,0.8)",
      }}>
        {player.name.split(" ").pop()}
      </span>
      <span style={{
        backgroundColor: color,
        color: color === "#00FF85" ? "#1A0020" : "white",
        fontSize: "8px",
        fontWeight: "800",
        padding: "1px 6px",
        borderRadius: "999px",
        textTransform: "uppercase",
      }}>
        {POSITION_MAP[player.position] || player.position?.slice(0, 3).toUpperCase()}
      </span>
    </div>
  );
};

const LineupSuggestion = ({ players, teamName }) => {
  const [open, setOpen] = useState(false);

  // Sort by risk: Low first, then Medium, then High
  const riskOrder = { Low: 0, Medium: 1, High: 2 };
  const sorted = [...players].sort((a, b) => (riskOrder[a.risk] ?? 1) - (riskOrder[b.risk] ?? 1));

  // Pick best 11 by position
  const gks = sorted.filter(p => p.position === "Goalkeeper").slice(0, 1);
  const defs = sorted.filter(p => p.position === "Defender").slice(0, 4);
  const mids = sorted.filter(p => p.position === "Midfielder").slice(0, 3);
  const fwds = sorted.filter(p => p.position === "Attacker").slice(0, 3);

  // Fill gaps if not enough in a position
  const selected = [...gks, ...defs, ...mids, ...fwds];
  const remaining = sorted.filter(p => !selected.includes(p));
  while (selected.length < 11 && remaining.length > 0) {
    selected.push(remaining.shift());
  }

  const lineup = {
    gk: selected.slice(0, 1),
    def: selected.slice(1, 5),
    mid: selected.slice(5, 8),
    fwd: selected.slice(8, 11),
  };

  const rows = [lineup.fwd, lineup.mid, lineup.def, lineup.gk];

  return (
    <div style={{ marginTop: "24px" }}>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: "100%",
          background: open ? "linear-gradient(135deg, #2D0040, #1A0028)" : "linear-gradient(135deg, #00FF85, #00CC6A)",
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
              Based on injury risk · Low risk players prioritized · 4-3-3
            </p>
          </div>

          {/* Pitch */}
          <div style={{
            background: "linear-gradient(180deg, #1a5c2a 0%, #1e6b30 25%, #1a5c2a 50%, #1e6b30 75%, #1a5c2a 100%)",
            padding: "24px 16px",
            position: "relative",
            minHeight: "420px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
          }}>

            {/* Pitch markings */}
            <div style={{
              position: "absolute",
              top: "50%",
              left: "10%",
              right: "10%",
              height: "1px",
              backgroundColor: "rgba(255,255,255,0.15)",
              transform: "translateY(-50%)",
            }} />
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "80px",
              height: "80px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "50%",
              transform: "translate(-50%, -50%)",
            }} />
            <div style={{
              position: "absolute",
              top: "5%",
              left: "25%",
              right: "25%",
              height: "15%",
              border: "1px solid rgba(255,255,255,0.15)",
            }} />
            <div style={{
              position: "absolute",
              bottom: "5%",
              left: "25%",
              right: "25%",
              height: "15%",
              border: "1px solid rgba(255,255,255,0.15)",
            }} />

            {/* Player rows */}
            {rows.map((row, rowIdx) => (
              <div key={rowIdx} style={{
                display: "flex",
                justifyContent: "space-around",
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

          {/* Legend */}
          <div style={{
            background: "linear-gradient(135deg, #2D0040, #1A0028)",
            padding: "12px 20px",
            display: "flex",
            gap: "16px",
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