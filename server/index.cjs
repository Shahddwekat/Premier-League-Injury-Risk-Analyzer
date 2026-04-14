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

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `You are a sports science analyst. Given the following squad data, identify the top 3 players at highest injury risk based on age, position, and minutes played. For each player give a risk level (High/Medium/Low) and a 2 sentence explanation.

Data: ${JSON.stringify(playersData)}

Respond in JSON format only. No markdown, no backticks, just raw JSON array like this:
[{"name": "Player Name", "risk": "High", "explanation": "explanation here"}]`,
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