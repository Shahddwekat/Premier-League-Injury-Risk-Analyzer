import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import TeamSearch from "./components/TeamSearch";
import PlayerCard from "./components/PlayerCard";
import InjuredPlayerCard from "./components/InjuredPlayerCard";
import SkeletonCard from "./components/SkeletonCard";
import InjuriesPage from "./pages/InjuryReport";
import LineupSuggestion from "./components/LineupSuggestion";
import { analyzeWorkload } from "./services/claudeApi";

function App() {
  const [players, setPlayers] = useState([]);
  const [fullSquad, setFullSquad] = useState([]);
  const [teamInjuries, setTeamInjuries] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [teamLogo, setTeamLogo] = useState(null);
  const [gameweekAdvice, setGameweekAdvice] = useState("");
  const [squadFitnessScore, setSquadFitnessScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleTeamSelect = async (team) => {
    try {
      setLoading(true);
      setError(null);
      setPlayers([]);
      setFullSquad([]);
      setTeamInjuries([]);
      setTeamName("");
      setTeamLogo(null);
      setGameweekAdvice("");
      setSquadFitnessScore(0);

      const analysisData = await analyzeWorkload({
        fplTeamId: team.fplId,
        teamName: team.name,
      });

      const content = analysisData.content?.[0]?.text || "[]";
      const clean = content.replace(/```json|```/g, "").trim();
      const parsedPlayers = JSON.parse(clean);

      setTeamInjuries(analysisData.injuries || []);
      setPlayers(parsedPlayers);
      setFullSquad(analysisData.fullSquad || []);
      setGameweekAdvice(analysisData.gameweekAdvice || "");
      setSquadFitnessScore(analysisData.squadFitnessScore || 0);
      setTeamName(analysisData.teamName || team.name);
      setTeamLogo(
        analysisData.teamCode
          ? `https://resources.premierleague.com/premierleague/badges/t${analysisData.teamCode}.png`
          : null
      );
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
          <div className="min-h-screen text-white" style={{ backgroundColor: "#1A0020" }}>

            <style>{`
              .desktop-selector { display: flex; }
              .mobile-selector  { display: none; }
              .pl-badge         { display: flex; }
              .header-spacer { height: 72px; }

              @media (max-width: 640px) {
                .desktop-selector { display: none; }
                .mobile-selector  { display: block; }
                .pl-badge         { display: none; }
                .header-spacer    { height: 118px; }
              }
            `}</style>

            {/* Top stripe */}
            <div style={{
              height: "3px",
              background: "linear-gradient(90deg, #00FF85, #FF2882)",
              width: "100%",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 100,
            }} />

            {/* Header */}
            <header style={{
              position: "fixed",
              top: "3px",
              left: 0,
              right: 0,
              zIndex: 99,
              backgroundColor: "#1A0020",
              borderBottom: "1px solid #3A1050",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                padding: "12px 24px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <span style={{ fontSize: "22px" }}>⚽</span>
                  <div>
                    <h1 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "20px",
                      letterSpacing: "0.1em",
                      color: "white",
                      lineHeight: 1,
                      margin: 0,
                      whiteSpace: "nowrap",
                    }}>
                      Injury Risk Analyzer
                    </h1>
                    <p style={{
                      fontSize: "9px",
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

                <div className="desktop-selector" style={{ flex: 1, maxWidth: "460px" }}>
                  <TeamSearch onTeamSelect={handleTeamSelect} loading={loading} />
                </div>

                <div className="pl-badge" style={{
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
                  whiteSpace: "nowrap",
                }}>
                  Premier League · 2025/26
                </div>
              </div>

              <div className="mobile-selector" style={{ padding: "0 16px 12px" }}>
                <TeamSearch onTeamSelect={handleTeamSelect} loading={loading} />
              </div>
            </header>

            <div className="header-spacer" />

            <div className="max-w-4xl mx-auto px-4 py-8">

              {/* Empty state */}
              {!players.length && !loading && (
                <>
                  {/* Hero */}
                  <div style={{ textAlign: "center", padding: "40px 0 32px" }}>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "#2D0040",
                      border: "1px solid #6A2080",
                      borderRadius: "999px",
                      padding: "6px 16px",
                      marginBottom: "24px",
                    }}>
                      <span style={{
                        fontSize: "10px",
                        color: "#00FF85",
                        fontWeight: "800",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}>
                        ⚡ AI-Powered · 2025/26 Season
                      </span>
                    </div>

                    <h1 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "clamp(36px, 6vw, 72px)",
                      color: "white",
                      letterSpacing: "0.05em",
                      margin: "0 0 16px 0",
                      lineHeight: 1,
                    }}>
                      Premier League<br />
                      <span style={{ color: "#00FF85" }}>Injury Risk</span> Analyzer
                    </h1>

                    <p style={{
                      color: "#8060A0",
                      fontSize: "16px",
                      maxWidth: "480px",
                      margin: "0 auto 40px",
                      lineHeight: "1.6",
                    }}>
                      Select any PL team to get AI-powered injury risk analysis, squad fitness scores, and FPL gameweek advice.
                    </p>

                    {/* Team logos */}
                    <div style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "12px",
                      maxWidth: "600px",
                      margin: "0 auto 48px",
                    }}>
                      {[
                        { name: "Arsenal", code: 3 },
                        { name: "Aston Villa", code: 7 },
                        { name: "Bournemouth", code: 91 },
                        { name: "Brentford", code: 94 },
                        { name: "Brighton", code: 36 },
                        { name: "Burnley", code: 90 },
                        { name: "Chelsea", code: 8 },
                        { name: "Crystal Palace", code: 31 },
                        { name: "Everton", code: 11 },
                        { name: "Fulham", code: 54 },
                        { name: "Leeds", code: 2 },
                        { name: "Liverpool", code: 14 },
                        { name: "Man City", code: 43 },
                        { name: "Man Utd", code: 1 },
                        { name: "Newcastle", code: 4 },
                        { name: "Nott'm Forest", code: 17 },
                        { name: "Sunderland", code: 56 },
                        { name: "Tottenham", code: 6 },
                        { name: "West Ham", code: 21 },
                        { name: "Wolves", code: 39 },
                      ].map((team) => (
                        <div
                          key={team.code}
                          title={team.name}
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "50%",
                            backgroundColor: "#2D0040",
                            border: "1px solid #3A1050",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "8px",
                            transition: "border-color 0.2s, transform 0.2s",
                            cursor: "default",
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = "#00FF85";
                            e.currentTarget.style.transform = "scale(1.15)";
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = "#3A1050";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          <img
                            src={`https://resources.premierleague.com/premierleague/badges/t${team.code}.png`}
                            alt={team.name}
                            style={{ width: "100%", height: "100%", objectFit: "contain" }}
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feature cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {[
                      {
                        icon: "🏥",
                        title: "Injury Risk",
                        desc: "AI analysis of player workload and injury probability based on minutes, age and position",
                        color: "#FF2882",
                        number: "01",
                      },
                      {
                        icon: "📊",
                        title: "Squad Fitness",
                        desc: "Real time fitness score calculated from squad availability and injury data",
                        color: "#00FF85",
                        number: "02",
                      },
                      {
                        icon: "🎯",
                        title: "FPL Advisor",
                        desc: "Gameweek recommendations for fantasy managers, who to captain, transfer and avoid",
                        color: "#A78BFA",
                        number: "03",
                      },
                    ].map((card, i) => (
                      <div
                        key={i}
                        style={{
                          background: "linear-gradient(135deg, #2D0040, #1A0028)",
                          border: `1px solid ${card.color}25`,
                          borderLeft: `3px solid ${card.color}`,
                          borderRadius: "16px",
                          padding: "20px 24px",
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                          transition: "transform 0.2s, box-shadow 0.2s",
                          cursor: "default",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "translateX(4px)";
                          e.currentTarget.style.boxShadow = `0 0 24px ${card.color}20`;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "translateX(0)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        {/* Number */}
                        <div style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: "40px",
                          color: card.color,
                          opacity: 0.3,
                          lineHeight: 1,
                          flexShrink: 0,
                          width: "48px",
                        }}>
                          {card.number}
                        </div>

                        {/* Icon */}
                        <div style={{
                          fontSize: "24px",
                          flexShrink: 0,
                          width: "44px",
                          height: "44px",
                          backgroundColor: `${card.color}15`,
                          border: `1px solid ${card.color}30`,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          {card.icon}
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1 }}>
                          <h3 style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontSize: "18px",
                            color: "white",
                            letterSpacing: "0.1em",
                            margin: "0 0 4px 0",
                          }}>{card.title}</h3>
                          <p style={{
                            color: "#8060A0",
                            fontSize: "12px",
                            lineHeight: "1.5",
                            margin: 0,
                          }}>{card.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p style={{
                    textAlign: "center",
                    color: "#6A4080",
                    fontSize: "11px",
                    marginTop: "24px",
                    letterSpacing: "0.1em",
                  }}>
                    ⚠️ Squad data powered by FPL API · Updated every gameweek
                  </p>
                </>
              )}

              {error && (
                <div className="mt-6 p-4 bg-red-900/40 border border-red-500 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              {teamName && !loading && (
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
                  {teamLogo && (
                    <img
                      src={teamLogo}
                      alt="Team logo"
                      style={{ width: "56px", height: "56px", objectFit: "contain" }}
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  )}
                  <div>
                    <p style={{
                      color: "#C0A0C0",
                      fontSize: "10px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}>
                      Currently Analyzing
                    </p>
                    <h2 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "28px",
                      color: "white",
                      letterSpacing: "0.05em",
                      margin: 0,
                      lineHeight: 1.1,
                    }}>
                      {teamName}
                    </h2>
                  </div>
                </div>
              )}

              {fullSquad.length > 0 && (
                <LineupSuggestion players={fullSquad} teamName={teamName} />
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
                    <span style={{
                      color: "#00FF85",
                      fontSize: "11px",
                      fontWeight: "800",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                    }}>
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
                        : "0 0 12px #FF288260",
                    }} />
                  </div>
                </div>
              )}

              {gameweekAdvice && (
                <div className="mt-6" style={{
                  border: "1px solid #00FF8540",
                  backgroundColor: "#4A003C",
                  borderRadius: "16px",
                  padding: "20px",
                }}>
                  <h2 className="text-green-300 font-bold text-sm uppercase tracking-wide mb-3">
                    🎯 Gameweek Advisor
                  </h2>
                  <p className="text-gray-200 text-sm leading-relaxed">{gameweekAdvice}</p>
                </div>
              )}

              {/* Injury Risk Players */}
              {players.length > 0 && (
                <div className="mt-8">
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "16px",
                  }}>
                    <span style={{ fontSize: "18px" }}>⚠️</span>
                    <h2 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "20px",
                      color: "white",
                      letterSpacing: "0.1em",
                      margin: 0,
                    }}>
                      Injury Risk Players
                    </h2>
                    <span style={{
                      backgroundColor: "#FF28821A",
                      border: "1px solid #FF288240",
                      color: "#FF2882",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 10px",
                      borderRadius: "999px",
                    }}>
                      Available but at risk
                    </span>
                  </div>
                  <div className="grid gap-4">
                    {players.map((player, index) => (
                      <PlayerCard key={index} player={player} />
                    ))}
                  </div>
                </div>
              )}

              {/* Currently Injured Players */}
              {teamInjuries.length > 0 && (
                <div className="mt-8">
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "16px",
                  }}>
                    <span style={{ fontSize: "18px" }}>🏥</span>
                    <h2 style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "20px",
                      color: "white",
                      letterSpacing: "0.1em",
                      margin: 0,
                    }}>
                      Currently Injured
                    </h2>
                    <span style={{
                      backgroundColor: "#FF28821A",
                      border: "1px solid #FF288240",
                      color: "#FF2882",
                      fontSize: "11px",
                      fontWeight: "700",
                      padding: "2px 10px",
                      borderRadius: "999px",
                    }}>
                      {teamInjuries.length} players
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {teamInjuries.map((injury, index) => (
                      <InjuredPlayerCard
                        key={index}
                        injury={injury}
                        players={fullSquad}
                      />
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="mt-8 grid gap-4">
                  {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
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