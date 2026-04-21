import { useLocation, useNavigate } from "react-router-dom";

function InjuriesPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const injuries = location.state?.injuries || [];
  const teamName = location.state?.teamName || "Team";
  const teamLogo = location.state?.teamLogo || null;

  return (
    <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
      <div className="max-w-3xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm text-gray-400 hover:text-white"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {teamLogo && (
            <img src={teamLogo} alt={teamName} className="w-12 h-12" />
          )}
          <h1 className="text-2xl font-bold">{teamName} Injuries</h1>
        </div>

        {/* Injuries List */}
        <div className="bg-gray-900 border border-orange-500/40 rounded-xl overflow-hidden">
          {injuries.length > 0 ? (
            injuries.map((injury, index) => (
              <div
                key={index}
                className="flex justify-between items-center px-4 py-3 border-b border-gray-800 last:border-none"
              >
                <span className="font-semibold text-white">
                  {injury.player}
                </span>
                <span className="text-orange-300 text-sm">
                  {injury.type} · {injury.reason}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-gray-400">
              No current injuries
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InjuriesPage;