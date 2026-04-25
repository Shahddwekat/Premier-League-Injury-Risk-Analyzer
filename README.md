# ⚽ Premier League Injury Risk Analyzer

A full stack AI-powered web application that analyzes Premier League squad fitness and injury risk using real football data and large language models.

## 🔗 Live Demo
[premier-league-injury-risk-analyzer.vercel.app](https://premier-league-injury-risk-analyzer.vercel.app)

## 🚀 Features
- **AI Injury Risk Analysis** : identifies the top 3 available players at highest injury risk based on minutes played, position, and workload
- **Currently Injured Section** : separate view showing all injured, unavailable, and doubtful players with injury details
- **Squad Fitness Score** : calculates overall team fitness based on real-time FPL availability data
- **Suggested Starting XI** : builds a recommended 4-3-3 lineup prioritizing low risk players and benching high risk ones
- **Gameweek Advisor** : AI-generated Fantasy Premier League recommendations per team
- **All 20 Premier League Teams** : complete 2025/26 season coverage
- **Browser Caching** : 24-hour localStorage cache for instant repeat lookups
- **Responsive Design** : works on both mobile and desktop
- **Loading Skeletons** : smooth loading states while data is fetched

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Vercel Serverless Functions
- **AI Model:** Groq API (Llama 3.3 70B)
- **Data:** Fantasy Premier League API (official, free, no key required)
- **Deployment:** Vercel

## 🏗 Architecture
The app uses a serverless backend to call the FPL API (avoiding CORS restrictions) and the Groq AI model. When a user selects a team, the server fetches the full squad from the official FPL API, filters available vs injured players, and sends available players to Llama 3.3 70B for workload-based injury risk analysis. The AI returns a structured JSON response that drives the UI directly. Results are cached in localStorage for 24 hours for instant repeat lookups with zero API calls.

## ⚙️ Running Locally

1. Clone the repository
```bash
git clone https://github.com/Shahddwekat/Premier-League-Injury-Risk-Analyzer.git
cd Premier-League-Injury-Risk-Analyzer
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env` file in the root:
VITE_GROQ_KEY=your_groq_key
GROQ_KEY=your_groq_key

4. Start the development server
```bash
npm run dev
```

5. In a separate terminal, start the local API server
```bash
node server/index.cjs
```

## 📊 Data Sources
- **[Fantasy Premier League API](https://fantasy.premierleague.com/api/bootstrap-static/)** — official PL squad data, player stats, injury status, updated every gameweek
- **[Groq API](https://groq.com/)** — LLM inference using Llama 3.3 70B

## ⚠️ Limitations
- Data is sourced from the official FPL API and reflects FPL availability status, not always real time injury news
- Injury risk assessment is AI-generated based on workload data and should not be used for medical decisions
- Player statistics are season totals, not match-by-match workload

## 👩‍💻 Author
Shahd Dwekat