// scripts/test-gd.mjs
// Test suite for dataset processing and gradient descent engine.
// Run with: node scripts/test-gd.mjs

import { DATA, FEATURES, DEFAULT_FEATURE, getXY, correlations, META } from '../src/data/dataset.js';
import { runGD, closedForm, toOriginalScale, classifyRun, SUGGESTED_LRS } from '../src/lib/gd.js';

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

// 1. Basic Dataset verification
check('Dataset length is 1030', DATA.length === 1030, `(got ${DATA.length})`);
check('Features length is 8', FEATURES.length === 8, `(got ${FEATURES.length})`);
check('Default feature is cement', DEFAULT_FEATURE === 'cement');
check('Target key is strength', META.targetKey === 'strength');

// 2. Closed-form vs Gradient Descent accuracy for Cement
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

// 3. Behavioral verification across all 8 features with SUGGESTED_LRS
console.log('\n--- Check 2: SUGGESTED_LRS Labels across ALL 8 Features ---');
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

// 4. Comparison with User's Python Results for Cement (200 iterations)
console.log('\n--- Check 3: Python Comparison for Cement (200 iterations) ---');
console.log('Running learning rates 0.01, 0.3, and 0.95 for 200 iterations:\n');

console.log('lr   w        b        loss');
console.log('---------------------------------');
for (const lr of [0.01, 0.3, 0.95]) {
  // tol: 0 runs the full 200 iterations matching Python script loop
  const run200 = runGD(cementXY, { lr, maxIters: 200, tol: 0 });
  const wStr = run200.final.w.toFixed(4);
  const bStr = run200.final.b.toFixed(4);
  const lossStr = run200.final.loss.toFixed(4);
  console.log(`${lr.toString().padEnd(4)} ${wStr.padEnd(8)} ${bStr.padEnd(8)} ${lossStr}`);
}

const rCement = cfCement.w;
console.log(`closed form: w = ${rCement.toFixed(4)} loss = ${(1 - rCement ** 2).toFixed(4)}`);

// Final summary
console.log('\n====================================================');
if (allPassed) {
  console.log('🎉 OVERALL STATUS: ALL TESTS PASSED!');
  process.exit(0);
} else {
  console.error('❌ OVERALL STATUS: SOME TESTS FAILED.');
  process.exit(1);
}
