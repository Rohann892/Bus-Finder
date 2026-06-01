# 🚌 Pathik — Kolkata Multi-Modal Transit Finder

> Find the fastest route across Kolkata's bus, metro, and train networks — all in one search.

![Pathik Banner](https://img.shields.io/badge/Pathik-Kolkata%20Transit-10b981?style=for-the-badge&logo=leaflet&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS%20v4-06B6D4?style=flat-square&logo=tailwindcss)

---

## 📖 Overview

**Pathik** (পথিক — Bengali for *traveller*) is a full-stack web application that helps commuters in Kolkata find the best public transit routes across **1,900+ bus lines**, the **Kolkata Metro** (Blue & Green Lines), and **suburban train services** (Eastern Railway & South Eastern Railway).

Given a source and destination stop, Pathik computes direct routes, 1-change journeys, and 2-change journeys using a **Breadth-First Search (BFS)** algorithm, enriches results with real GPS coordinates, estimates travel time, and recommends the earliest option based on live departure schedules.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔍 **Multi-modal Search** | Search across bus, metro, and train routes simultaneously |
| 🗺️ **Interactive Map** | Leaflet.js map with colour-coded polylines per transit mode |
| ⏱️ **Travel Time Estimation** | Per-route `avgTimePerStop` × stop count + transfer wait time |
| 🕐 **Next Departure** | Shows real-time next bus/train departure based on schedule |
| 🚶 **Walk Transfers** | Auto-generates walking transfer edges between nearby stops (≤ 400 m) of different modes using the Haversine formula |
| 🌐 **Multi-language Input** | Accepts stop names in English, Bengali (বাংলা), and Hindi |
| 📱 **Fully Responsive** | Mobile-first design that works on phones, tablets, and desktops |
| 💾 **Persistent State** | Search results, selected journey, and active tab are saved to `localStorage` |
| 🔄 **Autocomplete** | Fuzzy stop name search with keyboard navigation |

---

## 🏗️ Architecture

```
BusFinder/
├── backend/                  # Node.js + Express API
│   ├── algorithm/
│   │   ├── bfs.js            # BFS journey finder (direct / 1-change / 2-change)
│   │   ├── timeEstimator.js  # Travel time calculator
│   │   ├── nextBus.js        # Next departure recommender
│   │   ├── translator.js     # Bengali/Hindi → English stop name mapper
│   │   └── transferEdges.js  # Walk transfer edge generator (Haversine)
│   ├── controllers/
│   │   └── busController.js  # Main search orchestrator
│   ├── models/
│   │   ├── routeSchema.js    # Mongoose Route model
│   │   └── StopSchema.js     # Mongoose Stop model (GeoJSON 2dsphere)
│   ├── routes/
│   │   └── bus.Routes.js     # REST API endpoints
│   ├── db/
│   │   ├── db.js             # MongoDB connection
│   │   ├── seed.js           # Bus route seeder (fetches from GitHub dataset)
│   │   └── seedMetroTrain.js # Metro & train route seeder
│   └── server.js             # Express app entry point
│
└── frontend/                 # React + Vite + Tailwind CSS v4
    └── src/
        ├── App.jsx                       # Root component, search logic
        └── components/
            ├── Header.jsx                # App title and tagline
            ├── StopInput.jsx             # Autocomplete stop search input
            ├── BestOptionBanner.jsx      # Highlighted best route card
            ├── TabsContainer.jsx         # All / Direct / 1-Change / 2-Change tabs
            ├── JourneyTimeline.jsx       # Step-by-step journey breakdown
            ├── JourneyMap.jsx            # Leaflet interactive route map
            └── LoadingSkeleton.jsx       # Shimmer loading placeholder
```

---

## 🧠 How the Algorithm Works

### 1. BFS Journey Finder (`bfs.js`)

Finds all viable routes between a source and destination stop:

- **Direct** — a single route that serves both stops in order
- **1-Change** — two routes with one transfer stop in common
- **2-Change** — three routes with two transfer stops

Each stop in the path carries `{ bus, mode, stop }` so the frontend knows which transit mode each leg uses.

### 2. Walk Transfer Edges (`transferEdges.js`)

Before the BFS runs, the controller generates virtual *walk* routes:

```
For every pair of stops (A, B):
  If distance(A, B) ≤ 400 m AND A.mode ≠ B.mode:
    Create route: { routeNumber: 'WALK:A→B', mode: 'walk', stops: [A,B], avgTimePerStop: dist/80 }
```

This allows BFS to route journeys like **Bus → Walk → Metro** seamlessly.

### 3. Time Estimator (`timeEstimator.js`)

```
totalTime = Σ (stopCount_per_leg × avgTimePerStop) + (transfers × 10 min)
```

### 4. Next Bus Recommender (`nextBus.js`)

Given the current time and a route's `{ firstBus, lastBus, frequency }` schedule:
- If before first bus → shows "not started, next at HH:MM"
- If after last bus → shows "Tomorrow at HH:MM"
- If running → calculates `waitMinutes = frequency − (minutesSinceFirst % frequency)`

Ranks all journey options by `waitMinutes + travelMinutes` to surface the best overall option.

### 5. Translator (`translator.js`)

Maps Bengali/Hindi stop names to their English canonical database names, so Bengali-speaking users can type "শিয়ালদহ" and get results for "Sealdah".

---

## 🗃️ Data Models

### Route
```js
{
  routeNumber:    String,           // e.g. "S6", "KM-BLUE", "ER-SEALDAH-SSTPL"
  routeName:      String,           // Human-readable name
  stops:          [String],         // Ordered stop names
  schedule: {
    firstBus:     String,           // "05:00"
    lastBus:      String,           // "23:00"
    frequency:    Number            // minutes between services
  },
  avgTimePerStop: Number,           // minutes per stop
  mode:           'bus'|'metro'|'train'  // default: 'bus'
}
```

### Stop
```js
{
  name:     String,                 // Canonical stop name
  location: {                       // GeoJSON Point (2dsphere indexed)
    type:        "Point",
    coordinates: [longitude, latitude]
  },
  mode:     'bus'|'metro'|'train'   // default: 'bus'
}
```

---

## 🎨 Transit Mode Colour System

| Mode | Colour | Badge |
|---|---|---|
| 🟢 Bus | Emerald `#10b981` | `bg-emerald-100` |
| 🟣 Metro | Violet `#8b5cf6` | `bg-violet-100` |
| 🔵 Train | Blue `#3b82f6` | `bg-blue-100` |
| 🟡 Walk | Amber `#f59e0b` | `bg-amber-100` (dashed on map) |

---

## 🚇 Transit Data Included

### Metro
| Line | Route | Stops |
|---|---|---|
| Blue Line (Line 1) | Dakshineswar → Kavi Subhas | 26 stops |
| Green Line (Line 2) | Howrah Maidan → Salt Lake Sector V | 11 stops |

### Suburban Trains
| Route | Service |
|---|---|
| ER-SEALDAH-SSTPL | Sealdah → Sonarpur Local |
| ER-SEALDAH-BPPL | Sealdah → Baruipur Local |
| SER-HOWRAH-SDAH | Howrah → Sealdah Circular |
| ER-HOWRAH-BRDM | Howrah → Burdwan Main Line |
| ER-SEALDAH-BNGL | Sealdah → Barasat → Bangaon |

### Bus
1,900+ government and private Kolkata bus routes seeded from the [Kolkata Bus Route dataset](https://github.com/Akash190104/kolkata-bus-route).

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the repository
```bash
git clone https://github.com/Rohann892/Bus-Finder.git
cd Bus-Finder
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/busfinder
PORT=8000
```

### 3. Seed the database
```bash
# Seed bus routes (~1,900 routes from the Kolkata dataset)
node db/seed.js

# Seed metro and train routes
node db/seedMetroTrain.js
```

### 4. Frontend setup
```bash
cd ../frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:8000/api/bus
```

### 5. Run in development
```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

The app will be available at **http://localhost:5173**

---

## 📡 API Reference

Base URL: `/api/bus`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/search?from=A&to=B` | Find all journeys between two stops |
| `GET` | `/allStops` | List all stop names (for autocomplete) |
| `POST` | `/addRoute` | Add a new route document |
| `POST` | `/addStop` | Add a new stop document |
| `GET` | `/timings/:routeNumber` | Get schedule for a specific route |

### `GET /search` — Response Shape
```json
{
  "success": true,
  "response": {
    "direct":    [{ "path": [...], "estimatedTime": { "minutes": 25, "display": "25 mins" }, "type": "Direct" }],
    "oneChange": [...],
    "twoChange": [...],
    "bestOption": {
      "journey": [{ "bus": "S6", "mode": "bus", "stop": "Esplanade Metro", "coordinates": [22.569, 88.348] }],
      "firstBus": "S6",
      "nextBusInfo": { "status": "running", "nextBus": "14:35", "waitMinutes": 8 },
      "totalMinutes": 33
    }
  }
}
```

---

## 🌍 Deployment

The app is configured for deployment on **Render** via `render.yaml`:

```yaml
services:
  - type: web
    name: bus-finder
    env: node
    buildCommand: npm run install-all && npm run build
    startCommand: npm start
```

The Express backend serves the Vite production build as static files in production.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (utility-first) |
| Map | Leaflet.js 1.9 + OpenStreetMap / CARTO tiles |
| HTTP Client | Axios |
| Backend | Node.js + Express 5 |
| Database | MongoDB Atlas + Mongoose 9 |
| Geocoding | Nominatim (OpenStreetMap) |
| Fonts | Outfit (display) + Plus Jakarta Sans (body) |
| Deployment | Render (PaaS) |

---

## 📁 Key Scripts

| Command | Description |
|---|---|
| `cd backend && npm run dev` | Start backend with hot-reload (nodemon) |
| `cd frontend && npm run dev` | Start Vite dev server |
| `node db/seed.js` | Seed bus routes from GitHub dataset |
| `node db/seedMetroTrain.js` | Seed metro & train routes |
| `cd frontend && npm run build` | Build frontend for production |

---

## 📄 License

MIT © [Rohann892](https://github.com/Rohann892)
