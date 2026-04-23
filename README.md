# ⚽ Premier League Injury Risk Analyzer

A full stack AI-powered web application that analyzes Premier League squad fitness and injury risk using real football data and large language models.

## 🔗 Live Demo
[premier-league-injury-risk-analyzer.vercel.app](https://premier-league-injury-risk-analyzer.vercel.app)

## 🚀 Features
- **AI Injury Risk Analysis** : identifies the top 3 players at highest injury risk based on age, position, minutes played, and injury history
- **Squad Fitness Score** : calculates overall team fitness based on real injury data
- **Suggested Starting XI** : builds a recommended 4-3-3 lineup prioritizing low risk players and benching high risk ones
- **Gameweek Advisor** : AI-generated Fantasy Premier League recommendations
- **Full Injury Report** : dedicated page showing all currently injured players with injury type and reason
- **Player Stats** : real season data including appearances, minutes, position, and age
- **All 20 Premier League Teams** : complete 2025/26 season coverage
- **Browser Caching** : 24-hour localStorage cache to minimize API usage
- **Responsive Design** : works on both mobile and desktop
- **Loading Skeletons** : professional loading states while data is fetched

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Vercel Serverless Functions
- **AI Model:** Groq API (Llama 3.3 70B)
- **Data:** API-Football (squad data, player stats, injury reports)
- **Deployment:** Vercel

## 🏗 Architecture
The app uses a serverless backend to protect API keys and act as a proxy between the React frontend and external APIs. When a user selects a team, the app makes 4 parallel API calls to fetch squad data, fixtures, player statistics, and injury reports. This data is sent to the Groq AI model which returns a structured JSON injury risk assessment that drives the UI components directly. Results are cached in localStorage for 24 hours to conserve API quota.

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
4. Start the development server
```bash
npm run dev
```

5. In a separate terminal, start the local API server
```bash
node server/index.cjs
```

## 📊 Data Sources
- **[API-Football](https://www.api-football.com/)** : squad rosters, player statistics, injury reports
- **[Groq API](https://groq.com/)** : LLM inference using Llama 3.3 70B

## ⚠️ Limitations
- Squad data comes from API-Football and may lag on recent transfers
- Free tier limited to 100 API requests per day
- Player statistics are based on season totals, not recent match-by-match workload
- Injury risk assessment is AI-generated based on available data and should not be used for medical decisions

## 👩‍💻 Author
Shahd Dwekat