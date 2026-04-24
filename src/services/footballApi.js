import axios from "axios";

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

const footballApi = axios.create({
  baseURL: BASE_URL,
  headers: { "x-apisports-key": API_KEY },
});

// ── FPL API — free, no key, always current ──
const FPL_BASE = "https://fantasy.premierleague.com/api";

const POSITION_MAP = { 1: "Goalkeeper", 2: "Defender", 3: "Midfielder", 4: "Attacker" };

export const getSquadFromFPL = async (fplTeamId) => {
  const response = await axios.get(`${FPL_BASE}/bootstrap-static/`);
  const data = response.data;

  const team = data.teams.find(t => t.id === fplTeamId);
  const players = data.elements
    .filter(p => p.team === fplTeamId)
    .map(p => ({
      id: p.id,
      name: `${p.first_name} ${p.second_name}`,
      position: POSITION_MAP[p.element_type] || "Unknown",
      age: null, // FPL doesn't provide age
      appearances: p.starts || 0,
      minutes: p.minutes || 0,
      injured: p.chance_of_playing_next_round === 0 || p.status === "i" || p.status === "u",
      status: p.status, // a=available, i=injured, d=doubt, u=unavailable, s=suspended
      chanceOfPlaying: p.chance_of_playing_next_round,
      news: p.news || "",
      photo: null, // will be filled by API-Football
    }));

  return { team, players };
};

// ── API-Football — used ONLY for player photos ──
export const getPlayerPhotos = async (apiFootballTeamId) => {
  try {
    let response = await footballApi.get("/players", {
      params: { team: apiFootballTeamId, season: 2025 },
    });
    if (!response.data?.response?.length) {
      response = await footballApi.get("/players", {
        params: { team: apiFootballTeamId, season: 2024 },
      });
    }
    const photoMap = {};
    response.data?.response?.forEach(p => {
      photoMap[p.player.name.toLowerCase()] = p.player.photo;
    });
    return photoMap;
  } catch {
    return {};
  }
};

export const getTeamFixtures = async (apiFootballTeamId) => {
  try {
    let response = await footballApi.get("/fixtures", {
      params: { team: apiFootballTeamId, last: 10, season: 2025 },
    });
    if (!response.data?.response?.length) {
      response = await footballApi.get("/fixtures", {
        params: { team: apiFootballTeamId, last: 10, season: 2024 },
      });
    }
    return response.data;
  } catch {
    return { response: [] };
  }
};