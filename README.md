# Gradient Descent Virtual Lab

An interactive, educational single-page web application designed for engineering students exploring Batch Gradient Descent for simple linear regression ($y = w \cdot x + b$, MSE loss) across real-world benchmark datasets: UCI Concrete Compressive Strength and UCI Energy Efficiency.

---

## Run Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Development Server
```bash
npm run dev
```
Open your browser at the URL shown in the terminal (typically `http://localhost:5173`).

### 3. Build for Production
```bash
npm run build
```

### 4. Run Test Suite
```bash
node scripts/test-gd.mjs
```

---

## File Table

| Path | Purpose |
| :--- | :--- |
| `SPEC.md` | Master project specification and mandatory footer rule |
| `README.md` | Run instructions, architecture table, and author credits |
| `index.html` | HTML entry point |
| `package.json` | Project dependencies (React, Vite, Tailwind CSS, Recharts, Zustand) |
| `vite.config.js` | Vite bundler configuration with React plugin |
| `tailwind.config.js` | Tailwind theme configuration with custom colors and font sizes |
| `postcss.config.js` | PostCSS configuration for Tailwind CSS and Autoprefixer |
| `src/main.jsx` | React root mount script |
| `src/index.css` | Global stylesheet (warm off-white, typography, 17px base, card shadows) |
| `src/App.jsx` | Main application shell with 8-step stepper, gentle gating, navigation dots, and persistent footer |
| `src/store/labStore.js` | Zustand state store for active feature, experiment runs history, and quiz scores |
| `src/components/ui/Card.jsx` | Reusable soft-shadow card component with rounded-2xl border |
| `src/components/ui/Callout.jsx` | Callout alerts (`idea`, `tip`, `warning`) with icons and bold headers |
| `src/components/ui/Button.jsx` | Button component supporting `primary` (indigo) and `ghost` variants |
| `src/components/ui/Chip.jsx` | Colored status pill component for labels and statuses |
| `src/components/ui/Footer.jsx` | Mandatory footer component displayed on every screen |
| `src/components/quiz/QuizCard.jsx` | Interactive assessment card with runtime option shuffling, hints, and feedback |
| `src/components/experiment/SetupCard.jsx` | Feature selector and raw scatter plot view |
| `src/components/experiment/StepSizeCard.jsx` | Logarithmic learning rate slider, iteration slider, and preset buttons |
| `src/components/experiment/WatchItLearnCard.jsx` | Side-by-side regression line animation and loss progression chart with playback scrubber |
| `src/components/experiment/WhatHappenedCard.jsx` | Telemetry stat chips and auto-written plain-English behavior analysis |
| `src/components/experiment/RaceStepSizesCard.jsx` | Simultaneous 4-rate benchmark chart with log-scale toggle and capped divergence |
| `src/components/experiment/PerformanceReportCard.jsx` | Benchmark table against closed-form baseline and three 'Try this' challenge chips |
| `src/components/experiment/RunsTable.jsx` | Session runs history table |
| `src/data/concrete.json` | UCI Concrete Compressive Strength dataset (1,030 mix samples) |
| `src/data/energy.json` | UCI Energy Efficiency dataset (768 building simulation samples) |
| `src/data/dataset.js` | Multi-dataset registry (`DATASETS`, `getDataset`, `getXY`, `correlations`, `getDatasetStats`) |
| `src/data/quizzes.js` | Quiz definitions for pre-test, mini-quizzes, and final assessment |
| `src/lib/gd.js` | Pure mathematical gradient descent engine, analytical closed-form, and scale transformations |
| `src/pages/Aim.jsx` | Step 1: Hiker story, lab aim, roadmap, and dataset attribution |
| `src/pages/Theory.jsx` | Step 3: Five-card conceptual theory stepper with inline SVG diagrams |
| `src/pages/DatasetExplorer.jsx` | Step 4: Interactive dataset exploration with dynamic statistics and correlation bar chart |
| `src/pages/HikerSim.jsx` | Step 5: Interactive 1D gradient descent playground with live tangent line and mini cost chart |
| `src/pages/Experiment.jsx` | Step 6: Virtual experiment workbench |
| `src/pages/Observations.jsx` | Step 8: Dynamic observation table, auto-derived findings, student reflections, editable conclusion, and summary export |
| `scripts/test-gd.mjs` | Automated Node.js test suite for gradient descent math verification |

---

ML CA
by Nikunj Patil (D7C/40)
Ayush Palde (D7C/33)
Om Patil (D7C/41)
