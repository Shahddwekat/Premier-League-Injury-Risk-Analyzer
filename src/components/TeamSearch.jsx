import { useState } from "react";

const TEAMS = [
  { id: 42, name: "Arsenal" },
  { id: 66, name: "Aston Villa" },
  { id: 35, name: "Bournemouth" },
  { id: 55, name: "Brentford" },
  { id: 51, name: "Brighton" },
  { id: 44, name: "Burnley" },
  { id: 49, name: "Chelsea" },
  { id: 52, name: "Crystal Palace" },
  { id: 45, name: "Everton" },
  { id: 36, name: "Fulham" },
  { id: 63, name: "Leeds United" },
  { id: 40, name: "Liverpool" },
  { id: 50, name: "Manchester City" },
  { id: 33, name: "Manchester United" },
  { id: 34, name: "Newcastle" },
  { id: 65, name: "Nottingham Forest" },
  { id: 746, name: "Sunderland" },
  { id: 47, name: "Tottenham" },
  { id: 48, name: "West Ham" },
  { id: 39, name: "Wolves" },
];

const TeamSearch = ({ onTeamSelect, loading }) => {
  const [selectedTeam, setSelectedTeam] = useState("");

  const handleAnalyze = () => {
    if (!selectedTeam) return;
    onTeamSelect(Number(selectedTeam));
  };

  return (
    <div style={{ display: "flex", gap: "8px", width: "100%" }}>
      <select
        value={selectedTeam}
        onChange={(e) => setSelectedTeam(e.target.value)}
        style={{
          backgroundColor: "#2D0040",
          border: "1px solid #6A2080",
          color: "white",
          borderRadius: "12px",
          padding: "10px 12px",
          fontSize: "14px",
          fontWeight: "600",
          outline: "none",
          cursor: "pointer",
          flex: 1,
          minWidth: 0,
        }}
      >
        <option value="">Select a team</option>
        {[...TEAMS].sort((a, b) => a.name.localeCompare(b.name)).map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>
      <button
        onClick={handleAnalyze}
        disabled={loading || !selectedTeam}
        style={{
          background: loading || !selectedTeam
            ? "#3A2040"
            : "linear-gradient(135deg, #00FF85, #00CC6A)",
          color: loading || !selectedTeam ? "#6A5070" : "#1A0020",
          border: "none",
          borderRadius: "12px",
          padding: "10px 20px",
          fontSize: "14px",
          fontWeight: "800",
          cursor: loading || !selectedTeam ? "not-allowed" : "pointer",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
    </div>
  );
};

export default TeamSearch;