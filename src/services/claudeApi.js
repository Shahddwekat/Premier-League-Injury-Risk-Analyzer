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

// Fetch FPL data from browser (no CORS issues)
async function fetchFPLData() {
  const cached = getCached("fpl_bootstrap");
  if (cached) return cached;

  const response = await fetch("https://fantasy.premierleague.com/api/bootstrap-static/");
  const data = await response.json();

  // Cache bootstrap for 1 hour
  try {
    localStorage.setItem("fpl_bootstrap", JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {}

  return data;
}

async function fetchFPLFixtures() {
  const cached = getCached("fpl_fixtures");
  if (cached) return cached;

  const response = await fetch("https://fantasy.premierleague.com/api/fixtures/");
  const data = await response.json();

  try {
    localStorage.setItem("fpl_fixtures", JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch {}

  return data;
}

export const analyzeWorkload = async (playersData) => {
  const cacheKey = `fpl_team_${playersData.fplTeamId}`;

  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`Cache hit for team ${playersData.fplTeamId}`);
    return cached;
  }

  // Fetch FPL data from browser
  const [bootstrapData, fixturesData] = await Promise.all([
    fetchFPLData(),
    fetchFPLFixtures(),
  ]);

  // Send everything to server
  const response = await axios.post("/api/analyze", {
    playersData: {
      ...playersData,
      bootstrapData,
      fixturesData,
    }
  });

  setCache(cacheKey, response.data);
  return response.data;
};