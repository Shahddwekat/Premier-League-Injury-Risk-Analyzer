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
  const [gameweekAdvice, setGameweekAdvice] = useState("");
  const [squadFitnessScore, setSquadFitnessScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [teamLogo, setTeamLogo] = useState(null);

  const navigate = useNavigate();

  const handleTeamSelect = async (teamId) => {
    try {
      setLoading(true);
      setError(null);

      setPlayers([]);
      setTeamInjuries([]);
      setTeamLogo(null);
      setTeamName("");
      setGameweekAdvice("");
      setSquadFitnessScore(0);

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
      setGameweekAdvice(analysisData.gameweekAdvice || "");
      setSquadFitnessScore(analysisData.squadFitnessScore || 0);
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
          <div
            className="min-h-screen text-white"
            style={{ backgroundColor: "#37003C" }}
          >
            <div className="max-w-4xl mx-auto px-6 py-12">
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white mb-2">
                  ⚽ Injury Risk Analyzer
                </h1>
                <p className="text-gray-300 text-lg">
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
                    <span className="text-gray-300 text-sm font-semibold uppercase tracking-wide">
                      Squad Fitness
                    </span>
                    <span className="text-white font-bold text-lg">
                      {squadFitnessScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${squadFitnessScore}%`,
                        backgroundColor:
                          squadFitnessScore >= 75
                            ? "#00FF85"
                            : squadFitnessScore >= 50
                            ? "#FF8C00"
                            : "#FF2882",
                      }}
                    />
                  </div>
                </div>
              )}

              {gameweekAdvice && (
                <div
                  className="mt-6"
                  style={{
                    border: "1px solid #00FF8540",
                    backgroundColor: "#4A003C",
                    borderRadius: "16px",
                    padding: "20px",
                  }}
                >
                  <h2 className="text-green-300 font-bold text-sm uppercase tracking-wide mb-3">
                    🎯 Gameweek Advisor
                  </h2>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {gameweekAdvice}
                  </p>
                </div>
              )}

              {teamInjuries.length > 0 && (
                <button
                  onClick={() =>
                    navigate("/injuries", {
                      state: { injuries: teamInjuries, teamName, teamLogo },
                    })
                  }
                  className="mt-6 hover:opacity-90 transition-opacity"
                  style={{
                    border: "1px solid #FF288240",
                    backgroundColor: "#FF28821A",
                    borderRadius: "16px",
                    padding: "12px",
                    width: "100%",
                    color: "#FF2882",
                    fontWeight: "700",
                  }}
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