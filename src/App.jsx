import { useState } from "react";
import TeamSearch from "./components/TeamSearch";
import PlayerCard from "./components/PlayerCard";
import SkeletonCard from "./components/SkeletonCard";
import { analyzeWorkload } from "./services/claudeApi";
import { getSquad, getTeamFixtures, getPlayerStats } from "./services/footballApi";

function App() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamLogo, setTeamLogo] = useState(null);

  const handleTeamSelect = async (teamId) => {
    try {
      setLoading(true);
      setError(null);
      setPlayers([]);

      const [squadData, fixtureData, statsData] = await Promise.all([
        getSquad(teamId),
        getTeamFixtures(teamId),
        getPlayerStats(teamId),
      ]);

      const logo = squadData?.response?.[0]?.team?.logo || null;
      setTeamLogo(logo);

      const analysisData = await analyzeWorkload({
        squad: squadData,
        fixtures: fixtureData,
        stats: statsData,
      });

      const content = analysisData.content?.[0]?.text || "[]";
      const clean = content.replace(/```json|```/g, "").trim();
      const parsedPlayers = JSON.parse(clean);
      console.log("Parsed players:", parsedPlayers);

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

        {teamLogo && (
          <img src={teamLogo} alt="Team logo" className="w-16 h-16 mx-auto mt-8" />
        )}

        {loading && (
          <div className="mt-8 grid gap-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
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