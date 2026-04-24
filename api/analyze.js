import axios from "axios";

const POSITION_MAP = { 1: "Goalkeeper", 2: "Defender", 3: "Midfielder", 4: "Attacker" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fplTeamId, teamName, photoMap } = req.body.playersData;

    // Fetch FPL data server-side — no CORS issues
    const fplResponse = await axios.get(
      "https://fantasy.premierleague.com/api/bootstrap-static/"
    );
    const fplData = fplResponse.data;

    const fplTeam = fplData.teams.find(t => t.id === fplTeamId);
    const resolvedTeamName = fplTeam?.name || teamName;

    const players = fplData.elements
      .filter(p => p.team === fplTeamId)
      .map(p => {
        const fullName = `${p.first_name} ${p.second_name}`;
        const fullNameLower = fullName.toLowerCase();
        const lastNameLower = p.second_name.toLowerCase();

        const photo = photoMap[fullNameLower] ||
          Object.entries(photoMap).find(([k]) =>
            k.includes(lastNameLower) || lastNameLower.includes(k.split(" ").pop())
          )?.[1] || null;

        return {
          id: p.id,
          name: fullName,
          position: POSITION_MAP[p.element_type] || "Unknown",
          age: null,
          appearances: p.starts || 0,
          minutes: p.minutes || 0,
          injured: p.status === "i" || p.status === "u",
          status: p.status,
          chanceOfPlaying: p.chance_of_playing_next_round,
          news: p.news || "",
          photo,
        };
      });

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

    const statsForAI = players.filter(p => p.appearances > 0);

    const prompt = `You are a sports science analyst. Given the following Premier League squad data, identify the top 3 players at highest injury risk.

Consider: position, minutes played, injury status, and workload.

If a player has status "i" (injured), "u" (unavailable), or "d" (doubt), mark them High Risk.
Focus on players with the highest minutes as most at risk from workload.

CRITICAL: Only mention players from the data provided. Never invent players.

Squad data: ${JSON.stringify(statsForAI)}
Current injuries: ${JSON.stringify(injuries)}

Respond in JSON format only. Raw JSON array:
[{"name":"Player Name","risk":"High","explanation":"2 sentences with specific data","photo":"url_or_null","appearances":0,"minutes":0,"age":null,"position":"Position"}]

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
        age: null,
        position: match?.position || player.position,
        injured: match?.injured || false,
        injuryHistory: injuries.filter(i =>
          i.player.toLowerCase().includes(player.name.toLowerCase()) ||
          player.name.toLowerCase().includes(i.player.toLowerCase())
        ),
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
        risk: aiMatch ? aiMatch.risk : p.injured ? "High" : "Low",
        injuryHistory: injuries.filter(i =>
          i.player.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(i.player.toLowerCase())
        ),
      };
    });

    const advisorPrompt = `You are a Fantasy Premier League advisor. Give a 2-3 sentence gameweek recommendation.

Team: ${resolvedTeamName}
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
      teamName: resolvedTeamName,
    });

  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze workload" });
  }
}