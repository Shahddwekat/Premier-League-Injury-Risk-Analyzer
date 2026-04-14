import axios from "axios";

export const analyzeWorkload = async (playersData) => {

  const response = await axios.post("http://localhost:3001/api/analyze", {

    playersData,

  });

  return response.data;

};