import { useState } from "react";
import TeamSearch from "./components/TeamSearch";
import PlayerCard from "./components/PlayerCard";
import { getSquad } from "./services/footballApi";
import { analyzeWorkload } from "./services/claudeApi";

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTeamSelect = async (teamId) => {
    try {
      setLoading(true);
      setError(null);

      const squadData = await getSquad(teamId);
      const analysisData = await analyzeWorkload(squadData);

      const content = analysisData.content?.[0]?.text || "[]";
      const parsedPlayers = JSON.parse(content);

      setPlayers(parsedPlayers);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze squad.");
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Premier League Injury Risk Analyzer</h1>

      <TeamSearch onTeamSelect={handleTeamSelect} loading={loading} />

      {error && <p>{error}</p>}

      {players.length > 0 &&
        players.map((player, index) => (
          <PlayerCard key={index} player={player} />
        ))}
    </div>
  );
}

export default App;