import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TeamSearch from "./components/TeamSearch";
import PlayerCard from "./components/PlayerCard";
import SkeletonCard from "./components/SkeletonCard";
import InjuriesPage from "./pages/InjuryReport";
import { analyzeWorkload } from "./services/claudeApi";
import { getSquad, getTeamFixtures, getPlayerStats, getInjuries } from "./services/footballApi";

function App() {
  const [players, setPlayers] = useState([]);
  const [teamInjuries, setTeamInjuries] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamLogo, setTeamLogo] = useState(null);

  const navigate = useNavigate();

  const calculateFitnessScore = (players) => {
    if (!players || players.length === 0) return 0;

    const riskToFitness = {
      High: 33,
      Medium: 66,
      Low: 100,
    };

    const totalScore = players.reduce((sum, player) => {
      return sum + (riskToFitness[player.risk] ?? 100);
    }, 0);

    return Math.round(totalScore / players.length);
  };

  const fitnessScore = calculateFitnessScore(players);

  const handleTeamSelect = async (teamId) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Reset all state cleanly
      setPlayers([]);
      setTeamInjuries([]);
      setTeamLogo(null);
      setTeamName("");

      const [squadData, fixtureData, statsData, injuryData] = await Promise.all([
        getSquad(teamId),
        getTeamFixtures(teamId),
        getPlayerStats(teamId),
        getInjuries(teamId),
      ]);

      const team = squadData?.response?.[0]?.team || {};
      const logo = team.logo || null;
      const name = team.name || "";

      setTeamLogo(logo);
      setTeamName(name);

      const analysisData = await analyzeWorkload({
        squad: squadData,
        fixtures: fixtureData,
        stats: statsData,
        injuries: injuryData,
      });

      const content = analysisData.content?.[0]?.text || "[]";
      const clean = content.replace(/```json|```/g, "").trim();
      const parsedPlayers = JSON.parse(clean);

      setTeamInjuries(analysisData.injuries || []);
      setPlayers(parsedPlayers);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze squad. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route path="/injuries" element={<InjuriesPage />} />
      <Route
        path="/"
        element={
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
                <img
                  src={teamLogo}
                  alt="Team logo"
                  className="w-16 h-16 mx-auto mt-8"
                />
              )}

              {players.length > 0 && (
                <div className="mt-6 bg-gray-900 border border-gray-700 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm font-semibold uppercase tracking-wide">
                      Squad Fitness
                    </span>
                    <span className="text-white font-bold text-lg">
                      {fitnessScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        fitnessScore >= 75
                          ? "bg-green-500"
                          : fitnessScore >= 50
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${fitnessScore}%` }}
                    />
                  </div>
                </div>
              )}

              {teamInjuries.length > 0 && (
                <button
                  onClick={() =>
                    navigate("/injuries", {
                      state: { injuries: teamInjuries, teamName, teamLogo },
                    })
                  }
                  className="mt-6 w-full bg-orange-500/20 border border-orange-500/40 text-orange-300 font-semibold py-3 rounded-xl hover:bg-orange-500/30 transition-colors"
                >
                  ⚠️ View Full Injury Report ({teamInjuries.length} players)
                </button>
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
        }
      />
    </Routes>
  );
}

export default App;