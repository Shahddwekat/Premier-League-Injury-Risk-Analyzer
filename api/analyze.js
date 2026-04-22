import axios from "axios";

// ── In-memory cache ──
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const playersData = req.body.playersData;
    const { squad, fixtures, stats, injuries: injuryData } = playersData;

    const teamId = squad?.response?.[0]?.team?.id;
    const cacheKey = `team_${teamId}`;

    // ── Return cached result if available ──
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`Cache hit for team ${teamId}`);
      return res.json(cached);
    }

    const recentFixtures = fixtures?.response || [];

    const playerStats = stats?.response?.map(p => ({
      id: p.player.id,
      name: p.player.name,
      age: p.player.age,
      photo: p.player.photo,
      appearances: p.statistics[0]?.games?.appearences || 0,
      minutes: p.statistics[0]?.games?.minutes || 0,
      position: p.statistics[0]?.games?.position || "Unknown",
      injured: p.player.injured || false,
    })) || [];

    const activePlayers = playerStats.filter(p => p.appearances > 0);
    const squadPlayerIds = squad?.response?.[0]?.players?.map(p => p.id) || [];
    const filteredStats = activePlayers.filter(p => squadPlayerIds.includes(p.id));
    const statsToUse = filteredStats.length >= 3 ? filteredStats : activePlayers;

    console.log("statsToUse length:", statsToUse.length);

    const injuriesRaw = injuryData?.response?.map(i => ({
      player: i.player.name,
      type: i.player.type,
      reason: i.player.reason,
    })) || [];

    const seen = new Set();
    const injuries = injuriesRaw.filter(i => {
      if (seen.has(i.player)) return false;
      seen.add(i.player);
      return true;
    });

    console.log("injuries length:", injuries.length);

    // ── FIXED: stricter name matching to avoid false positives ──
    const injuredPlayerNames = injuries.map(i => i.player.toLowerCase().trim());

    const availablePlayers = statsToUse.filter(p => {
      const playerName = p.name.toLowerCase().trim();
      return !injuredPlayerNames.some(injuredName => {
        // Must be an exact match or last name match — not just "includes"
        if (injuredName === playerName) return true;
        const playerLastName = playerName.split(" ").pop();
        const injuredLastName = injuredName.split(" ").pop();
        // Last names must be at least 4 chars to avoid short false matches
        return playerLastName.length >= 4 && playerLastName === injuredLastName;
      });
    }).length;

    const totalPlayers = statsToUse.length;
    const squadFitnessScore = totalPlayers > 0
      ? Math.round((availablePlayers / totalPlayers) * 100)
      : injuries.length > 0 ? 70 : 85;

    console.log("squadFitnessScore:", squadFitnessScore);

    const prompt = `You are a sports science analyst. Given the following Premier League squad data and recent fixture history, identify the top 3 players at highest injury risk.

Consider: player age, position, minutes played, and fixture congestion (how many games in the last 30 days).

Only consider players with more than 0 appearances. Focus on players with the highest minutes played as they are most at risk from workload.

If a player is currently injured, mark them High Risk regardless of minutes played.

CRITICAL: Only mention players that appear in the Squad data provided above. Never suggest or reference players not in this dataset.

Squad with season stats: ${JSON.stringify(statsToUse)}

Recent fixtures: ${JSON.stringify(recentFixtures)}

Current injuries: ${JSON.stringify(injuries)}

For each player give:
- name
- risk (High/Medium/Low)
- explanation (2 sentences mentioning specific data points like age, minutes, and appearances)

For each player, copy their exact photo URL, appearances, minutes, age and position from the data provided.

Respond in JSON format only. No markdown, no backticks. Raw JSON array:
[{"name": "Player Name", "risk": "High", "explanation": "...", "photo": "photo_url_from_data", "appearances": 0, "minutes": 0, "age": 0, "position": "Position"}]

IMPORTANT: Return ONLY the JSON array. No text before or after. No explanation. Just the raw JSON array starting with [ and ending with ]`;

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
      const match = statsToUse.find(p =>
        p.name.toLowerCase() === player.name.toLowerCase() ||
        p.name.toLowerCase().includes(player.name.toLowerCase()) ||
        player.name.toLowerCase().includes(p.name.toLowerCase())
      );
      const playerInjuries = injuries.filter(i =>
        i.player.toLowerCase() === player.name.toLowerCase() ||
        i.player.toLowerCase().includes(player.name.toLowerCase()) ||
        player.name.toLowerCase().includes(i.player.toLowerCase())
      );
      return {
        ...player,
        photo: match?.photo || null,
        appearances: match?.appearances || player.appearances,
        minutes: match?.minutes || player.minutes,
        age: match?.age || player.age,
        position: match?.position || player.position,
        injured: match?.injured || false,
        injuryHistory: playerInjuries,
      };
    });

    const teamName = squad?.response?.[0]?.team?.name || "This team";

    const advisorPrompt = `You are a Fantasy Premier League advisor. Based on this squad analysis, give a 2-3 sentence gameweek recommendation.

Team: ${teamName}
Squad Fitness Score: ${squadFitnessScore}%
High Risk Players: ${enriched.filter(p => p.risk === "High").map(p => p.name).join(", ")}
Injury Count: ${injuries.length}

Give practical fantasy advice about whether to pick players from this team, captaincy considerations, and transfer suggestions. Be specific and concise.`;

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

    const result = {
      content: [{ text: JSON.stringify(enriched) }],
      injuries,
      gameweekAdvice,
      squadFitnessScore,
    };

    // ── Cache the result ──
    setCache(cacheKey, result);

    res.json(result);

  } catch (error) {
    console.error("API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze workload" });
  }
}