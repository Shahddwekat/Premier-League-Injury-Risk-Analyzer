const PlayerCard = ({ player }) => {
  const getRiskColor = (risk) => {
    if (risk === "High") return "red";
    if (risk === "Medium") return "orange";
    if (risk === "Low") return "green";
    return "black";
  };

  return (
    <div>
      <h3>{player.name}</h3>

      <p style={{ color: getRiskColor(player.risk) }}>
        Risk: {player.risk}
      </p>

      <p>{player.explanation}</p>
    </div>
  );
};

export default PlayerCard;