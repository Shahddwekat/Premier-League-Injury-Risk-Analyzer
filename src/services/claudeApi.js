import axios from "axios";

const CACHE_TTL = 24 * 60 * 60 * 1000;

function getCached(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function setCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch {}
}

export const analyzeWorkload = async (playersData) => {
  const cacheKey = `fpl_team_${playersData.fplTeamId}`;

  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`Cache hit for team ${playersData.fplTeamId}`);
    return cached;
  }

  const response = await axios.post("/api/analyze", { playersData });
  setCache(cacheKey, response.data);
  return response.data;
};