# ⚽ Premier League Injury Risk Analyzer

A full stack AI-powered web application that analyzes Premier League squad fitness and injury risk using real football data and large language models.

## 🔗 Live Demo
[premier-league-injury-risk-analyzer.vercel.app](https://premier-league-injury-risk-analyzer.vercel.app)

## 🚀 Features
- **AI Injury Risk Analysis** : identifies the top 3 available players most at risk of getting injured based on minutes played, age, position, form, xG, and fixture congestion
- **Currently Injured Section** : separate view showing all injured, unavailable, doubtful, and suspended players with FPL news and injury details
- **Squad Fitness Score** : calculates overall team fitness based on real-time FPL availability data
- **Suggested Starting XI** : builds a recommended 4-3-3 lineup prioritizing low risk players and benching high risk ones
- **Gameweek Advisor** : AI-generated Fantasy Premier League recommendations per team including captaincy, transfers and players to avoid
- **All 20 Premier League Teams** : complete 2025/26 season coverage with correct team badges and player photos
- **Hero Landing Page** : displays all 20 team logos with hover effects before analysis
- **Browser Caching** : 24-hour localStorage cache for instant repeat lookups with zero API calls
- **Responsive Design** : works on both mobile and desktop
- **Loading Skeletons** : smooth loading states while data is fetched

## 🛠 Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, React Router
- **Backend:** Vercel Serverless Functions
- **AI Model:** Groq API (Llama 3.3 70B)
- **Data:** Fantasy Premier League API (official, free, no key required)
- **Photos & Badges:** FPL CDN (resources.premierleague.com)
- **Deployment:** Vercel

## 🏗 Architecture
The app uses a serverless backend to call the FPL API (bypassing browser CORS restrictions) and the Groq AI model. When a user selects a team:

1. The server fetches the full squad from the official FPL API
2. The server fetches upcoming fixtures for fixture congestion analysis
3. Players are split into available vs injured/unavailable
4. Available players are sent to Llama 3.3 70B with a detailed sports science prompt covering: minutes load, age risk brackets, position risk, fixture congestion, form, and expected goals
5. The AI returns a structured JSON risk assessment that drives the UI directly
6. Results are cached in localStorage for 24 hours for instant repeat lookups

## 🧠 Injury Risk Factors
The AI considers the following when assessing injury risk:
- **Physical load** : total minutes (2500+ = very high risk)
- **Age** : 32+ significantly higher risk, 28-31 moderate
- **Position** : midfielders and defenders cover most ground
- **Fixture congestion** : upcoming fixtures in next 3 gameweeks
- **Form** : high form players accumulate more fatigue
- **Expected goals** : high xG means more sprinting and attacking runs
- **Minutes per game** : playing every minute with no rotation increases risk

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
- **[Fantasy Premier League API](https://fantasy.premierleague.com/api/bootstrap-static/)**  official PL squad data, player stats, injury status, updated every gameweek
- **[Groq API](https://groq.com/)**  LLM inference using Llama 3.3 70B

## ⚠️ Limitations
- **Groq free tier** : limited to 500,000 tokens per day and 30 requests per minute. Heavy usage may temporarily hit rate limits
- **FPL API CORS** : the FPL API blocks browser requests, so all data fetching happens server side via Vercel functions
- **FPL API availability** : the FPL API occasionally blocks requests from cloud datacenter IPs. Browser-like headers are sent to mitigate this but occasional 403 errors may occur
- **Injury data** : injury status reflects FPL availability, not real time club medical reports. There may be a delay between actual injury news and FPL updates
- **Player photos** : photos come from the FPL CDN and may not be available for all players
- **Age** : calculated from FPL birth_date field, which may not be available for all players
- **Injury risk assessment is AI generated** based on available public data and should not be used for medical or professional sporting decisions

## 👩‍💻 Author
Shahd Dwekat