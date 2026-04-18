require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/analyze", async (req, res) => {
  try {
    const playersData = req.body.playersData;

    const { squad, fixtures } = playersData;
    console.log("squad keys:", Object.keys(squad || {}));

    // ✅ Extract clean data
    const players = squad?.response?.[0]?.players || [];
    const recentFixtures = fixtures?.response || [];

    console.log("Players:", JSON.stringify(players, null, 2));
    console.log("Fixtures:", JSON.stringify(recentFixtures, null, 2));

    const prompt = `You are a sports science analyst. Given the following Premier League squad data and recent fixture history, identify the top 3 players at highest injury risk.

Consider: player age, position, minutes played, and fixture congestion (how many games in the last 30 days).

Squad data: ${JSON.stringify(players)}

Recent fixtures: ${JSON.stringify(recentFixtures)}

For each player give:
- name
- risk (High/Medium/Low)
- explanation (2 sentences mentioning specific data points)

Respond in JSON format only. No markdown, no backticks. Raw JSON array:
[{"name": "Player Name", "risk": "High", "explanation": "..."}]`;

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

    res.json({ content: [{ text }] });
  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to analyze workload" });
  }
});

app.listen(3001, () => console.log("Server running on port 3001"));
