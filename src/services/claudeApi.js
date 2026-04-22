import axios from "axios";

export const analyzeWorkload = async (playersData) => {

  const response = await axios.post("/api/analyze", {
    playersData,

  });

  return response.data;

};