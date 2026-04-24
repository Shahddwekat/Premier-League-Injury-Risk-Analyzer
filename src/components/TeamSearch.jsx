import { useState } from "react";

const TEAMS = [
  { id: 1,  fplId: 1,  name: "Arsenal" },
  { id: 2,  fplId: 2,  name: "Aston Villa" },
  { id: 3,  fplId: 3,  name: "Bournemouth" },
  { id: 4,  fplId: 4,  name: "Brentford" },
  { id: 5,  fplId: 5,  name: "Brighton" },
  { id: 6,  fplId: 6,  name: "Burnley" },
  { id: 7,  fplId: 7,  name: "Chelsea" },
  { id: 8,  fplId: 8,  name: "Crystal Palace" },
  { id: 9,  fplId: 9,  name: "Everton" },
  { id: 10, fplId: 10, name: "Fulham" },
  { id: 11, fplId: 11, name: "Leeds United" },
  { id: 12, fplId: 12, name: "Liverpool" },
  { id: 13, fplId: 13, name: "Manchester City" },
  { id: 14, fplId: 14, name: "Manchester United" },
  { id: 15, fplId: 15, name: "Newcastle" },
  { id: 16, fplId: 16, name: "Nottingham Forest" },
  { id: 17, fplId: 17, name: "Sunderland" },
  { id: 18, fplId: 18, name: "Tottenham" },
  { id: 19, fplId: 19, name: "West Ham" },
  { id: 20, fplId: 20, name: "Wolves" },
];

const TeamSearch = ({ onTeamSelect, loading }) => {
  const [selectedTeam, setSelectedTeam] = useState("");

  const handleAnalyze = () => {
    if (!selectedTeam) return;
    const team = TEAMS.find(t => t.id === Number(selectedTeam));
    onTeamSelect(team);
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