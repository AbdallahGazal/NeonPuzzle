# 🟪 Neon Puzzle

A sleek, neon-themed **8-puzzle sliding game** built with **Angular 21**. Slide tiles to reconstruct the target image — or let the built-in **A\* AI solver** do it for you with a satisfying step-by-step animation.

![Angular](https://img.shields.io/badge/Angular-21-dd0031?logo=angular&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🧩 **Image-Based Puzzle** | Tiles display fragments of a real image instead of plain numbers |
| 🤖 **AI Solver (A\*)** | One-click solver using the A\* search algorithm with Manhattan distance heuristic |
| 🔀 **Smart Shuffle** | Fisher-Yates shuffle with inversion-parity check guarantees every puzzle is solvable |
| ⏱️ **Live Timer & Move Counter** | Tracks your time and move count in real time |
| 🎨 **Neon Aesthetic** | Dark UI with glowing neon accents, smooth hover effects, and polished transitions |
| 📱 **Responsive Layout** | Adapts from mobile to desktop with a two-column grid layout |

---

## 🛠️ Tech Stack

- **Framework** — Angular 21 (Standalone Components, Signals)
- **Styling** — Tailwind CSS 4 via PostCSS
- **Language** — TypeScript 5.9
- **Testing** — Vitest
- **Package Manager** — npm

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 11

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/neon-puzzle.git
cd neon-puzzle

# Install dependencies
npm install
```

### Development Server

```bash
npm start
# or
ng serve
```

Navigate to **http://localhost:4200/**. The app hot-reloads on file changes.

### Production Build

```bash
npm run build
```

Build output is written to the `dist/` directory.

### Running Tests

```bash
npm test
```

---

## 📁 Project Structure

```
neonPuzzle/
├── public/
│   ├── favicon.ico
│   └── puzzle.jpg          # Target puzzle image
├── src/
│   ├── app/
│   │   ├── app.ts          # Root component — game logic & A* solver
│   │   ├── app.html        # Template — puzzle grid, sidebar, controls
│   │   ├── app.css          # Component styles
│   │   └── app.config.ts   # App configuration & providers
│   ├── styles.css           # Global styles & Tailwind imports
│   ├── index.html
│   └── main.ts              # Bootstrap entry point
├── angular.json
├── tailwind.config.*
├── tsconfig.json
└── package.json
```

---

## 🎮 How to Play

1. **Start** — The puzzle shuffles automatically when the page loads.
2. **Slide** — Click a tile adjacent to the empty space to slide it.
3. **Goal** — Reconstruct the target image shown in the sidebar.
4. **Stuck?** — Hit the **"SOLVE WITH AI"** button and watch the A\* algorithm solve it step by step.
5. **Restart** — Click the refresh icon in the header to start a new game.

---

## 🧠 How the AI Solver Works

The solver uses the **A\* search algorithm**:

1. **State Space** — Each board configuration is a node in the search graph.
2. **Heuristic** — **Manhattan distance** sums how far each tile is from its goal position.
3. **Search** — A\* explores the state with the lowest `f = g + h` (moves so far + estimated remaining).
4. **Replay** — Once a solution path is found, each state is replayed on-screen with a 400ms delay.

For the standard 8-puzzle (3×3 grid), A\* with Manhattan distance finds optimal solutions almost instantly.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
