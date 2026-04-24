import axios from "axios";

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

const footballApi = axios.create({
  baseURL: BASE_URL,
  headers: { "x-apisports-key": API_KEY },
});

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