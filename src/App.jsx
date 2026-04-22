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
            style={{ backgroundColor: "#1A0020" }}
          >
            {/* Top stripe */}
            <div style={{
              height: "3px",
              background: "linear-gradient(90deg, #00FF85, #FF2882)",
              width: "100%",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 100
            }} />

            {/* Header bar */}
            <div style={{
              position: "fixed",
              top: "3px",
              left: 0,
              right: 0,
              zIndex: 99,
              backgroundColor: "#1A0020",
              borderBottom: "1px solid #3A1050",
              padding: "12px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
            }}>
              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                <span style={{ fontSize: "24px" }}>⚽</span>
                <div>
                  <h1 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "22px",
                    letterSpacing: "0.1em",
                    color: "white",
                    lineHeight: 1,
                    margin: 0,
                  }}>
                    Injury Risk Analyzer
                  </h1>
                  <p style={{
                    fontSize: "10px",
                    color: "#00FF85",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    margin: 0,
                    marginTop: "2px",
                  }}>
                    AI-Powered Analysis
                  </p>
                </div>
              </div>

              {/* Team selector in header */}
              <TeamSearch onTeamSelect={handleTeamSelect} loading={loading} />

              {/* PL badge */}
              <div style={{
                backgroundColor: "#2D0040",
                border: "1px solid #6A2080",
                borderRadius: "8px",
                padding: "6px 14px",
                fontSize: "11px",
                color: "#C0A0C0",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: "600",
                flexShrink: 0,
              }}>
                Premier League · 2024/25
              </div>
            </div>

            {/* Spacer for fixed header */}
            <div style={{ height: "80px" }} />

            <div className="max-w-4xl mx-auto px-6 py-12">
              <div style={{ paddingTop: "48px" }}>
                {/* Feature cards - only show before analysis */}
                {!players.length && !loading && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "16px",
                    marginTop: "40px",
                  }}>
                    {[
                      { icon: "🏥", title: "Injury Risk", desc: "AI analysis of player workload and injury probability" },
                      { icon: "📊", title: "Squad Fitness", desc: "Real-time fitness score based on squad availability" },
                      { icon: "🎯", title: "FPL Advisor", desc: "Gameweek recommendations for fantasy managers" },
                    ].map((card, i) => (
                      <div key={i} style={{
                        background: "linear-gradient(135deg, #2D0040, #1A0028)",
                        border: "1px solid #3A1050",
                        borderRadius: "16px",
                        padding: "24px 20px",
                        textAlign: "center",
                      }}>
                        <div style={{ fontSize: "28px", marginBottom: "12px" }}>{card.icon}</div>
                        <h3 style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: "18px",
                          color: "white",
                          letterSpacing: "0.1em",
                          marginBottom: "8px",
                        }}>{card.title}</h3>
                        <p style={{ color: "#8060A0", fontSize: "12px", lineHeight: "1.5" }}>{card.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-900/40 border border-red-500 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              {teamLogo && (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  marginTop: "32px",
                  padding: "20px 24px",
                  background: "linear-gradient(135deg, #2D0040, #1A0028)",
                  border: "1px solid #4A1060",
                  borderRadius: "16px",
                }}>
                  <img
                    src={teamLogo}
                    alt="Team logo"
                    style={{ width: "56px", height: "56px", objectFit: "contain" }}
                  />
                  <div>
                    <p style={{ color: "#C0A0C0", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
                      Currently Analyzing
                    </p>
                    <h2 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "28px",
                      color: "white",
                      letterSpacing: "0.05em",
                      margin: 0,
                      lineHeight: 1.1
                    }}>
                      {teamName}
                    </h2>
                  </div>
                </div>
              )}

              {players.length > 0 && (
                <div style={{
                  marginTop: "24px",
                  background: "linear-gradient(135deg, #2D0040, #1A0028)",
                  border: "1px solid #4A1060",
                  borderRadius: "16px",
                  padding: "20px 24px",
                }}>
                  <div className="flex justify-between items-center mb-3">
                    <span style={{ color: "#00FF85", fontSize: "11px", fontWeight: "800", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                      Squad Fitness
                    </span>
                    <span style={{ color: "white", fontWeight: "800", fontSize: "24px" }}>
                      {squadFitnessScore}%
                    </span>
                  </div>
                  <div style={{ backgroundColor: "#1A0028", borderRadius: "999px", height: "8px" }}>
                    <div style={{
                      height: "8px",
                      borderRadius: "999px",
                      width: `${squadFitnessScore}%`,
                      background: squadFitnessScore >= 75
                        ? "linear-gradient(90deg, #00FF85, #00CC6A)"
                        : squadFitnessScore >= 50
                        ? "linear-gradient(90deg, #FF8C00, #FF6000)"
                        : "linear-gradient(90deg, #FF2882, #CC0060)",
                      transition: "width 0.8s ease",
                      boxShadow: squadFitnessScore >= 75
                        ? "0 0 12px #00FF8560"
                        : squadFitnessScore >= 50
                        ? "0 0 12px #FF8C0060"
                        : "0 0 12px #FF288260"
                    }} />
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