import { useState } from "react";

const TEAMS = [
  { id: 42, name: "Arsenal" },
  { id: 66, name: "Aston Villa" },
  { id: 35, name: "Bournemouth" },
  { id: 55, name: "Brentford" },
  { id: 51, name: "Brighton" },
  { id: 49, name: "Chelsea" },
  { id: 52, name: "Crystal Palace" },
  { id: 45, name: "Everton" },
  { id: 36, name: "Fulham" },
  { id: 57, name: "Ipswich" },
  { id: 40, name: "Liverpool" },
  { id: 50, name: "Manchester City" },
  { id: 33, name: "Manchester United" },
  { id: 34, name: "Newcastle" },
  { id: 65, name: "Nottingham Forest" },
  { id: 41, name: "Southampton" },
  { id: 47, name: "Tottenham" },
  { id: 46, name: "Leicester" },
  { id: 39, name: "Wolves" },
  { id: 48, name: "West Ham" },
];

const TeamSearch = ({ onTeamSelect, loading }) => {
  const [selectedTeam, setSelectedTeam] = useState("");

  const handleAnalyze = () => {
    if (!selectedTeam) return;
    onTeamSelect(Number(selectedTeam));
  };

  return (
    <div className="flex gap-3 justify-center">
      <select
        value={selectedTeam}
        onChange={(e) => setSelectedTeam(e.target.value)}
        className="bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
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
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
      >
        {loading ? "Analyzing..." : "Analyze Squad"}
      </button>
    </div>
  );
};

export default TeamSearch;