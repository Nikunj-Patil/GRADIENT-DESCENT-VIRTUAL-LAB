// scripts/test-gd.mjs
// Test suite for multi-dataset processing and gradient descent engine.
// Run with: node scripts/test-gd.mjs

import {
  DATA,
  FEATURES,
  DEFAULT_FEATURE,
  META,
  getXY,
  correlations,
  getDataset,
  getDatasetStats,
  DATASETS
} from '../src/data/dataset.js';
import { runGD, closedForm, toOriginalScale, classifyRun, SUGGESTED_LRS } from '../src/lib/gd.js';
import { useLab } from '../src/store/labStore.js';

console.log('====================================================');
console.log('🧪 GRADIENT DESCENT VIRTUAL LAB - TEST SUITE');
console.log('====================================================\n');

let allPassed = true;

function check(testName, condition, detail = '') {
  if (condition) {
    console.log(`[PASS] ${testName} ${detail}`);
  } else {
    console.error(`[FAIL] ${testName} ${detail}`);
    allPassed = false;
  }
}

// ----------------------------------------------------------------------------
// 1. Multi-Dataset Registry & Schema Validation
// ----------------------------------------------------------------------------
console.log('--- Multi-Dataset Architecture Validation ---');

const concreteDs = getDataset('concrete');
const energyDs = getDataset('energy');

// 1.1 Record counts
check('Concrete must return 1030 records', concreteDs.DATA.length === 1030, `(got ${concreteDs.DATA.length})`);
check('Energy must return 768 records', energyDs.DATA.length === 768, `(got ${energyDs.DATA.length})`);

// 1.2 Feature counts
check('Concrete exposes 8 features', concreteDs.FEATURES.length === 8, `(got ${concreteDs.FEATURES.length})`);
check('Energy exposes 8 features', energyDs.FEATURES.length === 8, `(got ${energyDs.FEATURES.length})`);

// 1.3 Target counts
check('Concrete exposes 1 target (strength)', concreteDs.TARGETS.length === 1 && concreteDs.TARGETS[0].key === 'strength');
check('Energy must expose 2 targets', energyDs.TARGETS.length === 2, `(got ${energyDs.TARGETS.map(t => t.key).join(', ')})`);

// 1.4 Target schema
const energyHeating = energyDs.TARGETS.find(t => t.key === 'heatingLoad');
const energyCooling = energyDs.TARGETS.find(t => t.key === 'coolingLoad');
check('Energy targets have key, label, description, and unit',
  energyHeating && energyCooling &&
  energyHeating.unit === 'kWh/m²' && energyCooling.unit === 'kWh/m²' &&
  energyHeating.description && energyCooling.description
);

// 1.5 Default features and targets
check('Concrete default feature is cement', concreteDs.DEFAULT_FEATURE === 'cement');
check('Concrete default target is strength', concreteDs.DEFAULT_TARGET === 'strength');
check('Energy default feature is relativeCompactness', energyDs.DEFAULT_FEATURE === 'relativeCompactness');
check('Energy default target is heatingLoad', energyDs.DEFAULT_TARGET === 'heatingLoad');

// 1.6 Valid numerical X-Y pairs for both targets
const heatXY = getXY('energy', 'overallHeight', 'heatingLoad');
const coolXY = getXY('energy', 'overallHeight', 'coolingLoad');

const heatValid = heatXY.length === 768 && heatXY.every(pt => Number.isFinite(pt.x) && Number.isFinite(pt.y));
const coolValid = coolXY.length === 768 && coolXY.every(pt => Number.isFinite(pt.x) && Number.isFinite(pt.y));
check('Both targets return valid numerical X-Y pairs (heatingLoad)', heatValid, `(${heatXY.length} pairs)`);
check('Both targets return valid numerical X-Y pairs (coolingLoad)', coolValid, `(${coolXY.length} pairs)`);

// 1.7 Correlations must change when selected target changes
const heatCorrs = correlations('energy', 'heatingLoad');
const coolCorrs = correlations('energy', 'coolingLoad');

const rGlazeHeat = heatCorrs.find(c => c.key === 'glazingArea')?.r;
const rGlazeCool = coolCorrs.find(c => c.key === 'glazingArea')?.r;
const rOrientHeat = heatCorrs.find(c => c.key === 'orientation')?.r;
const rOrientCool = coolCorrs.find(c => c.key === 'orientation')?.r;

const corrsChanged = Math.abs(rGlazeHeat - rGlazeCool) > 0.01 && Math.abs(rOrientHeat - rOrientCool) > 0.01;
check(
  'Correlations must change when the selected target changes',
  corrsChanged,
  `(glazingArea: ${rGlazeHeat.toFixed(4)} vs ${rGlazeCool.toFixed(4)}, orientation: ${rOrientHeat.toFixed(4)} vs ${rOrientCool.toFixed(4)})`
);

// 1.8 getDatasetStats validation
const concreteStats = getDatasetStats('concrete');
const energyStats = getDatasetStats('energy');
check('Concrete stats has 0 missing cells', concreteStats.missingCount === 0);
check('Energy stats has 0 missing cells', energyStats.missingCount === 0);
check('Energy stats lists 8 features + 2 targets (10 columns)', energyStats.columnsSummary.length === 10);

// 1.9 Safe fallback on invalid selection
const fallbackDs = getDataset('invalid_key');
const fallbackXY = getXY('invalid_ds', 'invalid_feat', 'invalid_target');
check('Invalid dataset key safely falls back to Concrete', fallbackDs.id === 'concrete');
check('Invalid parameters in getXY return valid numerical pairs from default', fallbackXY.length === 1030 && Number.isFinite(fallbackXY[0].x));

// 1.10 Backwards compatibility with single-argument getXY('cement')
const legacyXY = getXY('cement');
check('Legacy getXY("cement") returns 1030 Concrete pairs', legacyXY.length === 1030 && Number.isFinite(legacyXY[0].x));

// ----------------------------------------------------------------------------
// 2. Closed-form vs Gradient Descent accuracy for Cement
// ----------------------------------------------------------------------------
console.log('\n--- Check 1: Cement Good Run Loss vs Closed-Form Baseline ---');
const cementXY = getXY('cement');
const cfCement = closedForm(cementXY);
const goodRunCement = runGD(cementXY, { lr: SUGGESTED_LRS.good, maxIters: 200, tol: 1e-6 });

const lossDiffRatio = Math.abs(goodRunCement.final.loss - cfCement.loss) / cfCement.loss;
check(
  'Good run final loss is within 1% of closedForm loss for cement',
  lossDiffRatio < 0.01,
  `(GD loss: ${goodRunCement.final.loss.toFixed(6)}, CF loss: ${cfCement.loss.toFixed(6)}, diff: ${(lossDiffRatio * 100).toFixed(4)}%)`
);

// ----------------------------------------------------------------------------
// 3. Behavioral verification across all 8 features with SUGGESTED_LRS
// ----------------------------------------------------------------------------
console.log('\n--- Check 2: SUGGESTED_LRS Labels across ALL 8 Features (Concrete) ---');
const behaviorMap = [
  { key: 'small', expected: 'Slow crawl', lr: SUGGESTED_LRS.small },
  { key: 'good', expected: 'Smooth descent', lr: SUGGESTED_LRS.good },
  { key: 'large', expected: 'Overshooting', lr: SUGGESTED_LRS.large },
  { key: 'diverge', expected: 'Diverged', lr: SUGGESTED_LRS.diverge }
];

let allBehaviorsPassed = true;
for (const feat of FEATURES) {
  const data = getXY(feat.key);
  const results = [];
  for (const { key, expected, lr } of behaviorMap) {
    const run = runGD(data, { lr, maxIters: 200, tol: 1e-6 });
    const label = classifyRun(run.history, run.final);
    const passed = label === expected;
    if (!passed) allBehaviorsPassed = false;
    results.push(`${key} (${lr}): ${label}`);
  }
  check(
    `Feature '${feat.key}' behaviors`,
    allBehaviorsPassed,
    `-> ${results.join(' | ')}`
  );
}

// ----------------------------------------------------------------------------
// 4. Zustand Store Selection & Preservation Validation
// ----------------------------------------------------------------------------
console.log('\n--- Check 3: Zustand Store Transitions & Run Preservation ---');

// Reset store to known state
useLab.getState().clearRuns();
useLab.getState().setDataset('concrete');

const sInit = useLab.getState();
check('Default datasetKey is "concrete"', sInit.datasetKey === 'concrete');
check('Default targetKey is "strength"', sInit.targetKey === 'strength');
check('Default feature is "cement"', sInit.feature === 'cement');

// Add a test run on concrete
useLab.getState().addRun({ feature: 'cement', lr: 0.3, maxIters: 200, finalLoss: 0.752 });
check('One run recorded for Concrete', useLab.getState().runs.length === 1);

// Switch to Energy dataset
useLab.getState().setDataset('energy');
const sEnergy = useLab.getState();
check('setDataset("energy") updates datasetKey', sEnergy.datasetKey === 'energy');
check('setDataset("energy") sets default target "heatingLoad"', sEnergy.targetKey === 'heatingLoad');
check('setDataset("energy") sets default feature "relativeCompactness"', sEnergy.feature === 'relativeCompactness');
check('Switching dataset preserves prior experiment runs', sEnergy.runs.length === 1);

// Add a test run on Energy heatingLoad
useLab.getState().addRun({ feature: 'relativeCompactness', lr: 0.3, maxIters: 200, finalLoss: 0.301 });
check('Second run recorded under Energy', useLab.getState().runs.length === 2);

// Switch target to coolingLoad
useLab.getState().setTarget('coolingLoad');
const sCooling = useLab.getState();
check('setTarget("coolingLoad") updates targetKey', sCooling.targetKey === 'coolingLoad');
check('setTarget preserves datasetKey', sCooling.datasetKey === 'energy');
check('setTarget preserves selected feature', sCooling.feature === 'relativeCompactness');
check('Switching target preserves all prior experiment runs', sCooling.runs.length === 2);

// ----------------------------------------------------------------------------
// 5. PART 6: Validation Across the 3 Benchmark Combinations
// ----------------------------------------------------------------------------
console.log('\n--- Check 4: PART 6 Benchmark Combinations Validation ---');

const testCombinations = [
  {
    name: '1. Concrete -> Cement -> Strength',
    dsKey: 'concrete',
    featKey: 'cement',
    tgtKey: 'strength'
  },
  {
    name: '2. Energy -> Relative Compactness -> Heating Load',
    dsKey: 'energy',
    featKey: 'relativeCompactness',
    tgtKey: 'heatingLoad'
  },
  {
    name: '3. Energy -> Relative Compactness -> Cooling Load',
    dsKey: 'energy',
    featKey: 'relativeCompactness',
    tgtKey: 'coolingLoad'
  }
];

// Clear runs to start clean for benchmark validation
useLab.getState().clearRuns();

for (const combo of testCombinations) {
  console.log(`\nValidating: ${combo.name}`);
  const xy = getXY(combo.dsKey, combo.featKey, combo.tgtKey);
  const ds = getDataset(combo.dsKey);
  const tgtObj = ds.TARGETS.find(t => t.key === combo.tgtKey);
  const featObj = ds.FEATURES.find(f => f.key === combo.featKey);

  // a. Run GD with good learning rate
  const goodRun = runGD(xy, { lr: SUGGESTED_LRS.good, maxIters: 200, tol: 1e-6 });
  const cf = closedForm(xy);
  const goodLabel = classifyRun(goodRun.history, goodRun.final);

  // b. Verify fitted line (toOriginalScale)
  const origLine = toOriginalScale(xy, goodRun.final.w, goodRun.final.b);
  check(
    `${combo.name}: Fitted line produces valid physical slope & intercept`,
    Number.isFinite(origLine.w) && Number.isFinite(origLine.b),
    `(slope: ${origLine.w.toFixed(4)}, intercept: ${origLine.b.toFixed(4)})`
  );

  // c. Verify loss curve
  const initialLoss = goodRun.history[0].loss;
  const finalLoss = goodRun.final.loss;
  check(
    `${combo.name}: Loss curve decreases monotonically from ~1.0 to optimum`,
    Math.abs(initialLoss - 1.0) < 1e-5 && finalLoss < initialLoss && finalLoss <= cf.loss + 1e-4,
    `(init: ${initialLoss.toFixed(4)}, final: ${finalLoss.toFixed(4)}, CF: ${cf.loss.toFixed(4)})`
  );

  // d. Compare final loss with closed-form loss
  const lossGap = Math.abs(finalLoss - cf.loss) / cf.loss;
  check(
    `${combo.name}: Final GD loss is within 0.01% of closed-form loss`,
    lossGap < 0.0001,
    `(diff: ${(lossGap * 100).toFixed(4)}%)`
  );

  // e. Verify convergence behavior
  check(
    `${combo.name}: Classified as Smooth descent`,
    goodLabel === 'Smooth descent',
    `(${goodLabel})`
  );

  // Verify behavior across all 4 presets
  const smallRun = runGD(xy, { lr: SUGGESTED_LRS.small, maxIters: 200 });
  const largeRun = runGD(xy, { lr: SUGGESTED_LRS.large, maxIters: 200 });
  const divergeRun = runGD(xy, { lr: SUGGESTED_LRS.diverge, maxIters: 200 });

  check(
    `${combo.name}: Presets classification matches expected dynamics`,
    classifyRun(smallRun.history, smallRun.final) === 'Slow crawl' &&
    classifyRun(largeRun.history, largeRun.final) === 'Overshooting' &&
    classifyRun(divergeRun.history, divergeRun.final) === 'Diverged'
  );

  // f. Store runs into useLab and check metadata
  useLab.getState().addRun({
    datasetKey: combo.dsKey,
    datasetName: ds.title,
    targetKey: combo.tgtKey,
    targetLabel: tgtObj.label,
    targetUnit: tgtObj.unit,
    feature: combo.featKey,
    featureLabel: featObj.label,
    lr: SUGGESTED_LRS.good,
    maxIters: 200,
    itersUsed: goodRun.final.iters,
    converged: goodRun.final.converged,
    diverged: goodRun.final.diverged,
    finalLoss: goodRun.final.loss,
    closedFormLoss: cf.loss,
    timeMs: goodRun.timeMs,
    behavior: goodLabel
  });
}

// Check that runs from all 3 combinations coexist in store
const allStoredRuns = useLab.getState().runs;
check(
  'All 3 benchmark combinations coexist in store',
  allStoredRuns.length === 3,
  `(stored ${allStoredRuns.length} runs)`
);

// Verify fields in stored runs
const sampleRun = allStoredRuns[1];
check(
  'Stored runs contain all required metadata fields',
  sampleRun.datasetKey === 'energy' &&
  sampleRun.datasetName === 'Energy Efficiency' &&
  sampleRun.targetKey === 'heatingLoad' &&
  sampleRun.targetLabel === 'Heating Load' &&
  sampleRun.feature === 'relativeCompactness' &&
  Number.isFinite(sampleRun.lr) &&
  Number.isFinite(sampleRun.finalLoss) &&
  Number.isFinite(sampleRun.closedFormLoss) &&
  sampleRun.converged === true &&
  sampleRun.diverged === false &&
  sampleRun.behavior === 'Smooth descent'
);

// ----------------------------------------------------------------------------
// 6. Comparison with Python Results for Cement (200 iterations)
// ----------------------------------------------------------------------------
console.log('\n--- Check 5: Python Comparison for Cement (200 iterations) ---');
console.log('Running learning rates 0.01, 0.3, and 0.95 for 200 iterations:\n');

console.log('lr   w        b        loss');
console.log('---------------------------------');
for (const lr of [0.01, 0.3, 0.95]) {
  const run200 = runGD(cementXY, { lr, maxIters: 200, tol: 0 });
  const wStr = run200.final.w.toFixed(4);
  const bStr = run200.final.b.toFixed(4);
  const lossStr = run200.final.loss.toFixed(4);
  console.log(`${lr.toString().padEnd(4)} ${wStr.padEnd(8)} ${bStr.padEnd(8)} ${lossStr}`);
}

const rCement = cfCement.w;
console.log(`closed form: w = ${rCement.toFixed(4)} loss = ${(1 - rCement ** 2).toFixed(4)}`);

// ----------------------------------------------------------------------------
// 7. Regression Testing: Quizzes & Hiker Simulation Math
// ----------------------------------------------------------------------------
console.log('\n--- Check 6: Regression Testing (Quizzes & Hiker Math) ---');
import { QUIZZES } from '../src/data/quizzes.js';

check('All 4 quiz sections exist (pre, mid1, mid2, final)',
  Boolean(QUIZZES.pre && QUIZZES.mid1 && QUIZZES.mid2 && QUIZZES.final)
);

for (const quizId of ['pre', 'mid1', 'mid2', 'final']) {
  const qObj = QUIZZES[quizId];
  const validQuestions = qObj.questions.every(
    (q) => q.prompt && Array.isArray(q.options) && q.options.length === 4 &&
           typeof q.correctIndex === 'number' && q.hint && q.explanation
  );
  check(`Quiz '${quizId}' (${qObj.questions.length} questions) is well-formed`, validQuestions);
}

// Hiker 1D Cost Math: J(w) = (w - 3)^2 + 1, dJ/dw = 2*(w - 3)
const cost1D = (w) => (w - 3) ** 2 + 1;
const grad1D = (w) => 2 * (w - 3);
check('Hiker cost minimum is at w = 3 with cost = 1', cost1D(3) === 1 && grad1D(3) === 0);
check('Hiker gradient at w = -4 points uphill (-14)', grad1D(-4) === -14);

// ----------------------------------------------------------------------------
// 8. Footer Verbatim Verification
// ----------------------------------------------------------------------------
import fs from 'fs';
const footerSrc = fs.readFileSync('src/components/ui/Footer.jsx', 'utf-8');
const obsSrc = fs.readFileSync('src/pages/Observations.jsx', 'utf-8');
const readmeSrc = fs.readFileSync('README.md', 'utf-8');

check('Footer component includes required student credits',
  footerSrc.includes('Nikunj Patil (D7C/40)') &&
  footerSrc.includes('Ayush Palde (D7C/33)') &&
  footerSrc.includes('Om Patil (D7C/41)')
);
check('Observations copied summary includes exact verbatim 4 lines',
  obsSrc.includes('ML CA\\nby Nikunj Patil (D7C/40)\\nAyush Palde (D7C/33)\\nOm Patil (D7C/41)') ||
  obsSrc.includes("'ML CA\\n' +\n      'by Nikunj Patil (D7C/40)\\n' +\n      'Ayush Palde (D7C/33)\\n' +\n      'Om Patil (D7C/41)'")
);
check('README.md ends with exact verbatim 4 lines',
  readmeSrc.trim().endsWith('ML CA\nby Nikunj Patil (D7C/40)\nAyush Palde (D7C/33)\nOm Patil (D7C/41)')
);

// Final summary
console.log('\n====================================================');
if (allPassed) {
  console.log('🎉 OVERALL STATUS: ALL TESTS PASSED!');
  process.exit(0);
} else {
  console.error('❌ OVERALL STATUS: SOME TESTS FAILED.');
  process.exit(1);
}
