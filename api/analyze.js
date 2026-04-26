import axios from "axios";

const POSITION_MAP = { 1: "Goalkeeper", 2: "Defender", 3: "Midfielder", 4: "Attacker" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fplTeamId, teamName } = req.body.playersData;

    // Fetch FPL data server-side with browser-like headers to avoid 403
    const fplResponse = await axios.get(
      "https://fantasy.premierleague.com/api/bootstrap-static/",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Referer": "https://fantasy.premierleague.com/",
          "Origin": "https://fantasy.premierleague.com",
        }
      }
    );
    const fplData = fplResponse.data;

    const fplTeam = fplData.teams.find(t => t.id === fplTeamId);
    const resolvedTeamName = fplTeam?.name || teamName;

    const players = fplData.elements
      .filter(p => p.team === fplTeamId)
      .map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.second_name}`,
        position: POSITION_MAP[p.element_type] || "Unknown",
        age: p.birth_date
          ? Math.floor((Date.now() - new Date(p.birth_date)) / (365.25 * 24 * 60 * 60 * 1000))
          : null,
        appearances: p.starts || 0,
        minutes: p.minutes || 0,
        goals: p.goals_scored || 0,
        assists: p.assists || 0,
        injured: p.status === "i" || p.status === "u",
        status: p.status,
        chanceOfPlaying: p.chance_of_playing_next_round,
        news: p.news || "",
        photo: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${p.code}.png`,
      }));

    console.log("FPL players length:", players.length);

    const injuries = players
      .filter(p => p.status !== "a")
      .map(p => ({
        player: p.name,
        type: p.status === "i" ? "Injury" : p.status === "s" ? "Suspension" : "Doubt",
        reason: p.news || "No details available",
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

    const prompt = `You are a sports science analyst. Given the following Premier League squad data, identify the top 3 AVAILABLE players most at risk of getting injured soon.

IMPORTANT RULES:
- IGNORE players who are already injured (status "i"), unavailable (status "u"), or suspended (status "s")
- ONLY pick from players with status "a" (available) or "d" (doubt)
- Base your risk assessment on: high minutes played, age (older players tire more), position (defenders/midfielders run most), and heavy workload
- A player with 2500+ minutes is at significantly higher risk than one with 1000 minutes
- Focus on players who COULD get injured, not ones who already are

Available squad: ${JSON.stringify(availableForAI)}
Already injured/unavailable: ${JSON.stringify(injuries)}

For each of the 3 players give:
- name
- risk (High/Medium/Low) — based on workload and physical risk factors only
- explanation (2 sentences explaining WHY they are at risk of injury, mention minutes, age, position)
- photo (copy exactly from data)
- appearances
- minutes
- age
- position

Respond in JSON format only. Raw JSON array:
[{"name":"Player Name","risk":"High","explanation":"...","photo":"url_or_null","appearances":0,"minutes":0,"age":null,"position":"Position"}]

IMPORTANT: Return ONLY the JSON array.`;

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
        risk: p.injured
          ? "High"
          : aiMatch
          ? aiMatch.risk
          : "Low",
        injuryHistory: injuries.filter(i =>
          i.player.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(i.player.toLowerCase())
        ),
      };
    });

    const advisorPrompt = `You are a Fantasy Premier League advisor. Give a 2-3 sentence gameweek recommendation.

Team: ${resolvedTeamName}
Squad Fitness Score: ${squadFitnessScore}%
Players at injury risk (available but high workload): ${enriched.filter(p => p.risk === "High").map(p => p.name).join(", ")}
Currently injured/unavailable: ${injuries.map(i => i.player).join(", ")}
Injury Count: ${injuries.length}

Be specific and concise. Focus on who to pick and who to avoid.`;

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