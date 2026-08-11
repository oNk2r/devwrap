# DevWrap

A web application that compiles an interactive, terminal-styled developer fingerprint from public GitHub profile data. DevWrap aggregates repository telemetry, computes developer traits, and synthesizes developer archetypes using Gemini AI.

## Key Features

- **Real-Time Data Streaming**: Uses Server-Sent Events (SSE) to stream compilation status logs and parsed metrics directly to the client terminal UI.
- **Interactive Visualizations**: Renders data modules including orbital repository galaxies, engineering radar charts, dialect flow paths, polar activity clocks, and skill matrix trees.
- **AI Archetype Synthesis**: Evaluates repository languages, stars, and commit data using the Gemini AI API (with deterministic offline fallbacks) to classify coding personalities.
- **PNG Story Export**: Provides client-side export for developer recap story cards and RPG character sheets using `html-to-image`.
- **Resilient Fallbacks**: Graceful degradation when facing GitHub API rate limits, missing contribution heatmaps, or unauthenticated API usage.

## Tech Stack

### Frontend (`/client`)
- **Framework**: React 19, Vite, TypeScript
- **State Management**: Zustand
- **Routing**: React Router v7
- **Styling & Motion**: TailwindCSS v4, Framer Motion, Lucide Icons

### Backend (`/server`)
- **Runtime**: Node.js, Express.js (v5), `tsx`
- **Services**: Google Generative AI (`@google/generative-ai`), Axios

## Project Structure

```text
DevWrap/
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── components/      # RadarChart, RepositoryGalaxy, RPGCard, SankeyDiagram, etc.
│   │   ├── pages/           # Home, Loading, Workspace, NotFound
│   │   ├── store/           # Zustand profile state store
│   │   └── types/           # TypeScript interface definitions
│   ├── package.json
│   └── vite.config.ts
│
└── server/                  # Backend Express API
    ├── controllers/         # GitHub controller with SSE streaming
    ├── routes/              # Express routes
    ├── services/            # Analytics, Gemini AI, and GitHub services
    ├── types/               # Server-side TypeScript interfaces
    ├── index.ts             # Express application entrypoint
    └── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Environment Setup

1. **Backend Environment** (`server/.env`):
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   GITHUB_TOKEN=your_github_token  # Optional (prevents API rate limits)
   GEMINI_API_KEY=your_gemini_key  # Optional (falls back to deterministic selection)
   ```

2. **Frontend Environment** (`client/.env.local`):
   ```env
   VITE_API_URL=http://localhost:5000
   ```

### Running Locally

1. **Launch Backend**:
   ```bash
   cd server
   npm install
   npm run dev
   ```
   The backend server runs on `http://localhost:5000`.

2. **Launch Frontend**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   The web application runs on `http://localhost:5173`.

## API Endpoints

- `GET /api/health`: Health check endpoint.
- `GET /api/github/:username`: Server-Sent Events (SSE) stream yielding profile logs and compiled metrics.

## Production Build

```bash
# Compile Frontend Client
cd client && npm run build

# Compile Backend Server
cd server && npm run build
```

## License

ISC License.