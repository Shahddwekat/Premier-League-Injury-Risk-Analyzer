import { useState } from "react";

const TEAMS = [
  { id: 40, name: "Liverpool" },
  { id: 33, name: "Manchester United" },
  { id: 49, name: "Chelsea" },
  { id: 42, name: "Arsenal" },
  { id: 50, name: "Manchester City" },
];

const TeamSearch = ({ onTeamSelect, loading }) => {
  const [selectedTeam, setSelectedTeam] = useState("");

  const handleChange = (e) => {
    setSelectedTeam(e.target.value);
  };

  const handleAnalyze = () => {
    if (!selectedTeam) return;
    onTeamSelect(Number(selectedTeam));
  };

  return (
    <div>
      <select value={selectedTeam} onChange={handleChange}>
        <option value="">Select a team</option>
        {TEAMS.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      <button onClick={handleAnalyze} disabled={loading || !selectedTeam}>
        {loading ? "Analyzing..." : "Analyze Squad"}
      </button>
    </div>
  );
};

export default TeamSearch;