import axios from "axios";

const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

const footballApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-apisports-key": API_KEY,
  },
});

export const getSquad = async (teamId) => {
  const response = await footballApi.get("/players/squads", {
    params: { team: teamId },
  });
  return response.data;
};

export const getTeamFixtures = async (teamId) => {
  const response = await footballApi.get("/fixtures", {
    params: { team: teamId, last: 10, season: 2024 },
  });
  return response.data;
};
