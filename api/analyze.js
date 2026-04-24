import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { players, fixtures, teamName } = req.body.playersData;

    const recentFixtures = fixtures?.response || [];

    // Injuries = players marked injured or unavailable by FPL
    const injuries = players
      .filter(p => p.injured || p.status === "i" || p.status === "u" || p.status === "d")
      .map(p => ({
        player: p.name,
        type: p.status === "i" ? "Injury" : p.status === "s" ? "Suspension" : "Doubt",
        reason: p.news || "No details available",
      }));

    // Squad fitness score — based on FPL availability
    const availableCount = players.filter(p => p.status === "a" || (!p.injured && p.chanceOfPlaying !== 0)).length;
    const totalPlayers = players.length;
    const squadFitnessScore = totalPlayers > 0
      ? Math.round((availableCount / totalPlayers) * 100)
      : 85;

    console.log("players length:", players.length);
    console.log("injuries length:", injuries.length);
    console.log("squadFitnessScore:", squadFitnessScore);

    // Only send players with appearances to AI
    const statsForAI = players.filter(p => p.appearances > 0);

    const prompt = `You are a sports science analyst. Given the following Premier League squad data and recent fixture history, identify the top 3 players at highest injury risk.

Consider: position, minutes played, injury status, and fixture congestion.

If a player has status "i" (injured), "u" (unavailable), or "d" (doubt), mark them High Risk.
Focus on players with the highest minutes played as they are most at risk from workload.

CRITICAL: Only mention players from the data provided. Never invent players.

Squad data: ${JSON.stringify(statsForAI)}
Recent fixtures: ${JSON.stringify(recentFixtures)}
Current injuries: ${JSON.stringify(injuries)}

For each player give:
- name
- risk (High/Medium/Low)  
- explanation (2 sentences with specific data points)
- photo (copy exactly from data)
- appearances
- minutes
- age (use null if not available)
- position

Respond in JSON format only. Raw JSON array, no markdown:
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

    // Enrich top 3 with full data
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
        injured: match?.injured || false,
        injuryHistory: injuries.filter(i =>
          i.player.toLowerCase().includes(player.name.toLowerCase()) ||
          player.name.toLowerCase().includes(i.player.toLowerCase())
        ),
      };
    });

    // Build full squad with risk merged
    const fullSquad = players.map(p => {
      const aiMatch = enriched.find(e =>
        e.name.toLowerCase() === p.name.toLowerCase() ||
        e.name.toLowerCase().includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(e.name.toLowerCase())
      );
      return {
        ...p,
        risk: aiMatch ? aiMatch.risk : p.injured ? "High" : "Low",
        injuryHistory: injuries.filter(i =>
          i.player.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(i.player.toLowerCase())
        ),
      };
    });

    const advisorPrompt = `You are a Fantasy Premier League advisor. Give a 2-3 sentence gameweek recommendation.

Team: ${teamName}
Squad Fitness Score: ${squadFitnessScore}%
High Risk Players: ${enriched.filter(p => p.risk === "High").map(p => p.name).join(", ")}
Injury Count: ${injuries.length}

Be specific and concise.`;

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
    });

  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze workload" });
  }
}