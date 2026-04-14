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
      setPlayers([]);
      const squadData = await getSquad(teamId);
      const analysisData = await analyzeWorkload(squadData);
      const content = analysisData.content?.[0]?.text || "[]";
      const clean = content.replace(/```json|```/g, "").trim();
      const parsedPlayers = JSON.parse(clean);
      setPlayers(parsedPlayers);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze squad. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">
            ⚽ Injury Risk Analyzer
          </h1>
          <p className="text-gray-400 text-lg">
            AI-powered player workload analysis
          </p>
        </div>

        <TeamSearch onTeamSelect={handleTeamSelect} loading={loading} />

        {error && (
          <div className="mt-6 p-4 bg-red-900/40 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-10 text-center text-gray-400 animate-pulse">
            Analyzing squad data...
          </div>
        )}

        {players.length > 0 && (
          <div className="mt-8 grid gap-4">
            {players.map((player, index) => (
              <PlayerCard key={index} player={player} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;