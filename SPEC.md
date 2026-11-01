# Gradient Descent Virtual Lab - Project Specification

## FOOTER Rule
FOOTER: every screen of the app must show the Footer component (src/components/ui/Footer.jsx) with exactly these lines, in this order:
    ML CA
    by Nikunj Patil (D7C/40)
    Ayush Palde (D7C/33)
    Om Patil (D7C/41)
  Never remove, reword or hide it.

## PROJECT SPEC
Steps in App.jsx: 1 Aim, 2 Warm-up quiz, 3 Theory, 4 Dataset exploration, 5 Hiker simulation (+ mini quiz 1), 6 Experiment (+ mini quiz 2), 7 Final quiz, 8 Observations.
Files: src/App.jsx, src/index.css, src/components/ui/ (Card, Callout, Button, Chip, Footer), src/components/quiz/, src/components/experiment/, src/pages/ (Aim, Theory, DatasetExplorer, HikerSim, Experiment, Observations), src/data/concrete.json, src/data/dataset.js, src/data/quizzes.js, src/lib/gd.js, src/store/labStore.js, scripts/test-gd.mjs

DATASET  src/data/dataset.js (reads src/data/concrete.json)
  export const META = { title, source, targetKey: 'strength', targetLabel, targetUnit }
  export const FEATURES = [{ key, label, unit, blurb }]   // the 8 inputs
  export const DATA = [{ cement, slag, flyAsh, water, superplasticizer, coarseAgg, fineAgg, age, strength }, ...]
  export const DEFAULT_FEATURE = 'cement'
  export function getXY(featureKey) -> [{ x, y }, ...]    // x = that column, y = strength
  export function correlations() -> [{ key, r }]          // Pearson r with strength

ENGINE  src/lib/gd.js (pure functions, no React; data argument = getXY(feature))
  runGD(data, { lr, maxIters = 200, tol = 1e-6 }) -> { history: [{ iter, w, b, loss }], final: { w, b, loss, iters, converged, diverged }, timeMs }
    - standardises x AND y internally (population std, divide by n); w, b, loss are in the standardised space; starts at w=0, b=0; history[0] is iter 0; loss = MSE.
    - converged = |loss change| < tol before maxIters. diverged = loss is NaN/Infinity or exceeds 1e6 x the initial loss (stop early when diverged).
  closedForm(data) -> { w, b, loss }         // exact least-squares baseline, same standardised space
  toOriginalScale(data, w, b) -> { w, b }    // to draw the fitted line on raw data
  classifyRun(history, final) -> 'Smooth descent' | 'Slow crawl' | 'Overshooting' | 'Diverged'
  SUGGESTED_LRS = { small, good, large, diverge }   // validated on all 8 features so each gives the matching behaviour

STORE  src/store/labStore.js (zustand)
  useLab = { feature: DEFAULT_FEATURE, setFeature(key), runs: [], addRun(run), clearRuns(), quiz: { pre, mid1, mid2, final } (each null or { score, total }), setQuizScore(id, { score, total }) }
  run = { feature, lr, maxIters, itersUsed, converged, diverged, finalLoss, closedFormLoss, timeMs, behavior }
  addRun replaces an existing run with the same feature, lr and maxIters.

PAGES: default-exported React components with no required props. UI kit: Card, Callout (idea|tip|warning), Button (primary|ghost), Chip, Footer.

