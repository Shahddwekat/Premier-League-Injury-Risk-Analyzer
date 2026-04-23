import axios from "axios";

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCached(teamId) {
  try {
    const raw = localStorage.getItem(`team_${teamId}`);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(`team_${teamId}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(teamId, data) {
  try {
    localStorage.setItem(`team_${teamId}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export const analyzeWorkload = async (playersData) => {
  const teamId = playersData?.squad?.response?.[0]?.team?.id;

  if (teamId) {
    const cached = getCached(teamId);
    if (cached) {
      console.log(`Cache hit for team ${teamId}`);
      return cached;
    }
  }

  const response = await axios.post("/api/analyze", { playersData });

  if (teamId) {
    setCache(teamId, response.data);
  }

  return response.data;
};