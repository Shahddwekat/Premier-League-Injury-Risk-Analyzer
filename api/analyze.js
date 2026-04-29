import axios from "axios";

const POSITION_MAP = { 1: "Goalkeeper", 2: "Defender", 3: "Midfielder", 4: "Attacker" };

async function fetchFPLBootstrap() {
  const attempts = [
    {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Referer": "https://fantasy.premierleague.com/",
      "Origin": "https://fantasy.premierleague.com",
      "Cache-Control": "no-cache",
    },
    {
      "User-Agent": "curl/7.68.0",
      "Accept": "*/*",
    },
    {
      "User-Agent": "python-requests/2.28.0",
      "Accept": "*/*",
    },
  ];

  for (const headers of attempts) {
    try {
      const response = await axios.get(
        "https://fantasy.premierleague.com/api/bootstrap-static/",
        { headers, timeout: 8000 }
      );
      if (response.data?.elements) return response.data;
    } catch (e) {
      continue;
    }
  }
  throw new Error("FPL API blocked all attempts");
}

async function fetchFPLFixtures() {
  const attempts = [
    {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Referer": "https://fantasy.premierleague.com/",
    },
    {
      "User-Agent": "curl/7.68.0",
      "Accept": "*/*",
    },
  ];

  for (const headers of attempts) {
    try {
      const response = await axios.get(
        "https://fantasy.premierleague.com/api/fixtures/",
        { headers, timeout: 8000 }
      );
      if (Array.isArray(response.data)) return response.data;
    } catch (e) {
      continue;
    }
  }
  return [];
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const fplTeamId = Number(req.body.playersData.fplTeamId);
    const { teamName } = req.body.playersData;

    const [fplData, fixturesData] = await Promise.all([
      fetchFPLBootstrap(),
      fetchFPLFixtures(),
    ]);

    const fplTeam = fplData.teams.find(t => t.id === fplTeamId);
    const resolvedTeamName = fplTeam?.name || teamName;

    const currentEvent = fplData.events.find(e => e.is_current) || fplData.events.find(e => e.is_next);
    const currentGW = currentEvent?.id || 1;

    const upcomingFixtures = fixturesData.filter(f =>
      (f.team_h === fplTeamId || f.team_a === fplTeamId) &&
      f.event >= currentGW &&
      f.event <= currentGW + 3
    ).length;

    const players = fplData.elements
      .filter(p => p.team === fplTeamId)
      .map(p => {
        const age = p.birth_date
          ? Math.floor((Date.now() - new Date(p.birth_date)) / (365.25 * 24 * 60 * 60 * 1000))
          : null;

        const minutesPerGame = p.starts > 0 ? Math.round(p.minutes / p.starts) : 0;
        const ageRisk = age >= 32 ? "High" : age >= 28 ? "Medium" : "Low";
        const workloadRisk = p.minutes >= 2500 ? "High" : p.minutes >= 1500 ? "Medium" : "Low";
        const positionRisk = [2, 3].includes(p.element_type) ? "High" : p.element_type === 4 ? "Medium" : "Low";

        return {
          id: p.id,
          name: `${p.first_name} ${p.second_name}`,
          webName: p.web_name || `${p.first_name} ${p.second_name}`,
          position: POSITION_MAP[p.element_type] || "Unknown",
          age,
          ageRisk,
          appearances: p.starts || 0,
          minutes: p.minutes || 0,
          minutesPerGame,
          workloadRisk,
          positionRisk,
          goals: p.goals_scored || 0,
          assists: p.assists || 0,
          form: parseFloat(p.form) || 0,
          expectedGoals: parseFloat(p.expected_goals) || 0,
          totalPoints: p.total_points || 0,
          pointsPerGame: parseFloat(p.points_per_game) || 0,
          selectedBy: p.selected_by_percent || "0",
          epNext: parseFloat(p.ep_next) || 0,
          chanceOfPlaying: p.chance_of_playing_next_round,
          injured: p.status === "i" || p.status === "u",
          status: p.status,
          news: p.news || "",
          photo: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${p.code}.png`,
        };
      });

    console.log("FPL team ID:", fplTeamId);
    console.log("Resolved team name:", resolvedTeamName);
    console.log("Current GW:", currentGW);
    console.log("FPL players length:", players.length);
    console.log("Upcoming fixtures in next 3 GWs:", upcomingFixtures);

    const injuries = players
      .filter(p => p.status !== "a")
      .map(p => ({
        player: p.name,
        type: p.status === "i" ? "Injury" : p.status === "s" ? "Suspension" : "Doubt",
        reason: p.news || "No details available",
        chanceOfPlaying: p.chanceOfPlaying,
      }));

    const availableCount = players.filter(p => p.status === "a").length;
    const squadFitnessScore = players.length > 0
      ? Math.round((availableCount / players.length) * 100)
      : 85;

    console.log("injuries length:", injuries.length);
    console.log("squadFitnessScore:", squadFitnessScore);

    const availableForAI = players.filter(p =>
      (p.status === "a" || p.status === "d") && p.appearances > 0
    );

    const prompt = `You are a sports science analyst specializing in Premier League injury prediction. Analyze the following squad data and identify the top 3 AVAILABLE players most at risk of getting injured soon.

## INJURY RISK FACTORS TO CONSIDER:

### 1. Physical Load (Most Important)
- Total minutes played this season (2500+ = very high risk)
- Minutes per game (90 min every game = no rotation = high risk)
- High workload players have less recovery time between matches

### 2. Age Factor
- Age 32+ = significantly higher injury risk due to recovery decline
- Age 28-31 = moderate risk
- Age 27 and under = lower age-related risk
- Combine age WITH minutes — an old player with high minutes is critical risk

### 3. Position Risk
- Midfielders and Defenders = highest physical demand (most running, tackling)
- Forwards = high sprint load but less contact
- Goalkeepers = lowest injury risk from physical load

### 4. Fixture Congestion
- This team has ${upcomingFixtures} fixtures in the next 3 gameweeks
- More upcoming fixtures = higher risk for players already at high load
- Players with high minutes who face congested fixtures need rotation

### 5. Form & Involvement
- High form players (form > 6) are playing more = accumulating fatigue
- Players with high goals + assists are heavily involved = more physical stress
- High xG means lots of sprinting and attacking runs

### 6. Combined Risk Score
- High minutes + Old age + Midfielder/Defender + Congested fixtures = CRITICAL risk
- High minutes + Young age + Forward = Medium risk
- Low minutes + Any age = Low risk

## SQUAD DATA:
${JSON.stringify(availableForAI.map(p => ({
  name: p.name,
  position: p.position,
  age: p.age,
  ageRisk: p.ageRisk,
  minutes: p.minutes,
  minutesPerGame: p.minutesPerGame,
  workloadRisk: p.workloadRisk,
  positionRisk: p.positionRisk,
  appearances: p.appearances,
  goals: p.goals,
  assists: p.assists,
  form: p.form,
  expectedGoals: p.expectedGoals,
  chanceOfPlaying: p.chanceOfPlaying,
  photo: p.photo,
})))}

## ALREADY INJURED/UNAVAILABLE:
${JSON.stringify(injuries)}

## FIXTURE CONGESTION:
${upcomingFixtures} matches in next 3 gameweeks for ${resolvedTeamName}

Identify exactly 3 players. For each:
- name (exact match from data)
- risk: "High", "Medium", or "Low"
- explanation: 2-3 sentences citing specific numbers (minutes, age, position, form)
- photo (copy exactly from data)
- appearances
- minutes
- age
- position

Respond ONLY with a raw JSON array, no markdown:
[{"name":"","risk":"","explanation":"","photo":"","appearances":0,"minutes":0,"age":0,"position":""}]`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_KEY || process.env.VITE_GROQ_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    const enriched = parsed.map(player => {
      const match = players.find(p =>
        p.name.toLowerCase() === player.name.toLowerCase() ||
        p.name.toLowerCase().includes(player.name.toLowerCase()) ||
        player.name.toLowerCase().includes(p.name.toLowerCase())
      );
      return {
        ...player,
        photo: match?.photo || null,
        appearances: match?.appearances ?? player.appearances,
        minutes: match?.minutes ?? player.minutes,
        age: match?.age ?? player.age,
        position: match?.position || player.position,
        webName: match?.webName || player.name,
        goals: match?.goals ?? 0,
        assists: match?.assists ?? 0,
        form: match?.form ?? 0,
        injured: false,
        injuryHistory: [],
      };
    });

    const fullSquad = players.map(p => {
      const aiMatch = enriched.find(e =>
        e.name.toLowerCase() === p.name.toLowerCase() ||
        e.name.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(e.name.toLowerCase())
      );
      return {
        ...p,
        risk: p.injured ? "High" : aiMatch ? aiMatch.risk : "Low",
        injuryHistory: injuries.filter(i =>
          i.player.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(i.player.toLowerCase())
        ),
      };
    });

    const topPerformers = players
      .filter(p => p.status === "a" && p.appearances > 0)
      .sort((a, b) => b.form - a.form)
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        position: p.position,
        form: p.form,
        totalPoints: p.totalPoints,
        pointsPerGame: p.pointsPerGame,
        goals: p.goals,
        assists: p.assists,
        minutes: p.minutes,
        selectedBy: p.selectedBy,
        epNext: p.epNext,
      }));

    const lowFormPlayers = players
      .filter(p => p.status === "a" && p.appearances > 0)
      .sort((a, b) => a.form - b.form)
      .slice(0, 3)
      .map(p => ({
        name: p.name,
        position: p.position,
        form: p.form,
        totalPoints: p.totalPoints,
        minutes: p.minutes,
      }));

    const advisorPrompt = `You are a Fantasy Premier League advisor. Give a specific 3-4 sentence gameweek recommendation based ONLY on the data provided below.

RULES:
- Only mention players from the data provided
- Base captaincy on form (last 4 GW average) and ep_next (predicted points next GW)
- Flag players with high form + high minutes as strong picks
- Flag players with low form as ones to avoid or transfer out
- Mention ownership % for differential picks (under 15% ownership = differential)
- Be specific with numbers — mention actual form scores, points, goals, assists
- Do NOT give generic FPL advice — every sentence must reference specific players from this team

Team: ${resolvedTeamName}
Current Gameweek: ${currentGW}
Squad Fitness: ${squadFitnessScore}%
Upcoming fixtures in next 3 GWs: ${upcomingFixtures}

Top performing available players (sorted by recent form):
${JSON.stringify(topPerformers)}

Low form available players (consider transferring out):
${JSON.stringify(lowFormPlayers)}

At injury risk (available but high workload): ${enriched.filter(p => p.risk === "High").map(p => p.name).join(", ")}
Currently injured/unavailable: ${injuries.map(i => `${i.player} (${i.type})`).join(", ")}

Give specific advice: who to captain, who are differentials, who to avoid, and whether the team is worth investing in.`;

    const advisorResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: advisorPrompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_KEY || process.env.VITE_GROQ_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const gameweekAdvice = advisorResponse.data.choices[0].message.content;

    res.json({
      content: [{ text: JSON.stringify(enriched) }],
      fullSquad,
      injuries,
      gameweekAdvice,
      squadFitnessScore,
      teamName: resolvedTeamName,
      teamCode: fplTeam?.code || null,
    });

  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze workload" });
  }
}