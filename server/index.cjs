require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.post("/api/analyze", async (req, res) => {
  try {
    const playersData = req.body.playersData;

    const { squad, fixtures, stats, injuries: injuryData } = playersData;

    const recentFixtures = fixtures?.response || [];
    const playerStats = stats?.response?.map(p => ({
      name: p.player.name,
      age: p.player.age,
      photo: p.player.photo,
      appearances: p.statistics[0]?.games?.appearences || 0,
      minutes: p.statistics[0]?.games?.minutes || 0,
      position: p.statistics[0]?.games?.position || "Unknown",
    })) || [];

    const injuries = injuryData?.response?.map(i => ({
      player: i.player.name,
      type: i.player.type,
      reason: i.player.reason,
    })) || [];

    console.log("Player stats:", JSON.stringify(playerStats, null, 2));

    const prompt = `You are a sports science analyst. Given the following Premier League squad data and recent fixture history, identify the top 3 players at highest injury risk.

Consider: player age, position, minutes played, and fixture congestion (how many games in the last 30 days).

Only consider players with more than 0 appearances. Focus on players with the highest minutes played as they are most at risk from workload.

If a player is currently injured, mark them High Risk regardless of minutes played.

Squad with season stats: ${JSON.stringify(playerStats)}

Recent fixtures: ${JSON.stringify(recentFixtures)}

Current injuries: ${JSON.stringify(injuries)}

For each player give:
- name
- risk (High/Medium/Low)
- explanation (2 sentences mentioning specific data points like age, minutes, and appearances)

For each player, copy their exact photo URL, appearances, minutes, age and position from the data provided.

Respond in JSON format only. No markdown, no backticks. Raw JSON array:
[{"name": "Player Name", "risk": "High", "explanation": "...", "photo": "photo_url_from_data", "appearances": 0, "minutes": 0, "age": 0, "position": "Position"}]`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VITE_GROQ_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data.choices[0].message.content;
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // Match photos from our data
    const enriched = parsed.map(player => {
      const match = playerStats.find(p =>
        p.name.toLowerCase().includes(player.name.toLowerCase()) ||
        player.name.toLowerCase().includes(p.name.toLowerCase())
      );
      return {
        ...player,
        photo: match?.photo || null,
        appearances: match?.appearances || player.appearances,
        minutes: match?.minutes || player.minutes,
        age: match?.age || player.age,
        position: match?.position || player.position,
      };
    });

    res.json({ content: [{ text: JSON.stringify(enriched) }] });
  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze workload" });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));