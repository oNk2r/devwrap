# DevWrap 🖥️🚀

> A **"Spotify Wrapped"** experience for developers, compiling and showcasing an interactive, terminal-styled GitHub profile fingerprint with AI-generated archetypes and insights.

---

## ✨ Features

- **📺 Retro-Futuristic Terminal UI**: Sleek, glassmorphic terminal theme built with Vanilla CSS, TailwindCSS, and Framer Motion micro-animations.
- **⚡ Real-time SSE Telemetry Stream**: Server-Sent Events (SSE) stream logs and progress back to the user interface dynamically, showing compiler progress logs as your profile aggregates.
- **📅 Real-Time GitHub Contribution Heatmap**: An interactive, 5-level green calendar grid pulling actual contributions from the last year with hover tooltips displaying exact contribution counts and dates.
- **🤖 Gemini AI Profile Archetype**: Queries Gemini AI model to generate a custom developer archetype (e.g. *THE ARCHITECT*, *THE SYSTEM BUILDER*, *THE ANALYST*, *THE BUILDER*) and profile summary statements based on your repositories' languages and metrics.
- **📸 High-Quality PNG Recap Card Export**: One-click screenshot capture to export your terminal dashboard directly as a PNG using `html-to-image`.
- **⚙️ Robust Fail-Safe System**: Graceful fallbacks for heatmaps, repositories, and AI endpoints if rate limits are hit or network connections drop.

---

## 🛠️ Technology Stack

### Client (Frontend)
- **Framework**: [React](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Routing**: [React Router](https://reactrouter.com/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) + Custom CSS
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Server (Backend)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js (v5)](https://expressjs.com/)
- **SDKs & Libraries**:
  - `@google/generative-ai` (Gemini API Integration)
  - `axios` (External requests & GitHub API integration)
  - `tsx` (TypeScript execute engine)

---

## 📂 Project Structure

```text
DevWrap/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components (terminal, loaders, layout)
│   │   ├── hooks/          # Custom react hooks
│   │   ├── pages/          # Home, Loading, Workspace Dashboard, NotFound
│   │   ├── store/          # Zustand state store
│   │   ├── types/          # TypeScript interface definitions
│   │   └── App.tsx         # Router setup
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Backend Node/Express API
│   ├── controllers/        # Express router controller (SSE logic)
│   ├── routes/             # API routes definition
│   ├── services/
│   │   ├── analytics/      # Metric processors
│   │   ├── gemini/         # AI generator wrappers
│   │   └── github/         # API & scraper services
│   ├── types/              # Type definitions
│   ├── index.ts            # Entrypoint file
│   └── package.json
```

---

## ⚙️ Environment Configuration

Set up configuration variables in your project directories before starting the dev servers.

### Backend (`server/.env`)
Create a `.env` file in the `server` directory:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
GITHUB_TOKEN=your_personal_github_access_token_here
GEMINI_API_KEY=your_gemini_api_key_here
```

> [!TIP]
> Specifying a `GITHUB_TOKEN` is highly recommended to prevent standard GitHub API rate limiting.

### Frontend (`client/.env.local`)
Create a `.env.local` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Running Locally

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Launch the Backend Server
```bash
cd server
npm install
npm run dev
```
The server will boot up on `http://localhost:5000` with hot-reloading active.

### 2. Launch the Client
```bash
cd client
npm install
npm run dev
```
The dev server will boot up on `http://localhost:5173`. Open this URL in your web browser.

---

## 🏗️ Building for Production

### Compile Client
```bash
cd client
npm run build
```
This runs the TypeScript compiler and compiles the assets into the `dist/` directory.

### Compile Server
```bash
cd server
npm run build
```
This compiles the server files into JavaScript inside the `dist/` directory.

---

## 📜 License

Distributed under the ISC License. See `LICENSE` for more information.