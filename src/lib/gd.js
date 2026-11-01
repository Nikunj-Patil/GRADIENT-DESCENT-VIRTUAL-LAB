// src/lib/gd.js
// Pure mathematical functions for Batch Gradient Descent in Simple Linear Regression.
// No React hooks or UI dependencies.

/**
 * Validated learning rate presets tested across all 8 features.
 * - small: 0.005 -> 'Slow crawl' (takes tiny steps, does not converge by 200 iters)
 * - good: 0.3 -> 'Smooth descent' (converges smoothly and rapidly to minimum)
 * - large: 0.95 -> 'Overshooting' (oscillates and bounces back and forth across minimum)
 * - diverge: 1.05 -> 'Diverged' (steps expand exponentially until loss exceeds 1e6)
 */
export const SUGGESTED_LRS = {
  small: 0.005,
  good: 0.3,
  large: 0.95,
  diverge: 1.05
};

/**
 * Computes population statistics (mean, variance, and standard deviation dividing by n).
 */
function getStats(data) {
  const n = data.length;
  if (n === 0) {
    return { meanX: 0, stdX: 1, meanY: 0, stdY: 1, n: 0 };
  }

  let sumX = 0;
  let sumY = 0;
  for (let i = 0; i < n; i++) {
    sumX += data[i].x;
    sumY += data[i].y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let varX = 0;
  let varY = 0;
  for (let i = 0; i < n; i++) {
    varX += (data[i].x - meanX) ** 2;
    varY += (data[i].y - meanY) ** 2;
  }

  const stdX = Math.sqrt(varX / n) || 1;
  const stdY = Math.sqrt(varY / n) || 1;

  return { meanX, stdX, meanY, stdY, n };
}

/**
 * Computes Mean Squared Error (MSE) loss in standardised space:
 * J = (1 / n) * sum((w * x + b - y)^2)
 */
function computeMSE(stdX, stdY, w, b) {
  const n = stdX.length;
  let sumSqErr = 0;
  for (let i = 0; i < n; i++) {
    const pred = w * stdX[i] + b;
    const err = pred - stdY[i];
    sumSqErr += err * err;
  }
  return sumSqErr / n;
}

/**
 * Executes Batch Gradient Descent for Simple Linear Regression.
 * Both x and y are standardised internally (mean 0, variance 1) using population std.
 * Parameters w and b start at 0.
 *
 * @param {Array<{x: number, y: number}>} data - Raw {x, y} pairs
 * @param {Object} options - Configuration options
 * @param {number} options.lr - Learning rate
 * @param {number} [options.maxIters=200] - Maximum iterations to execute
 * @param {number} [options.tol=1e-6] - Convergence threshold (|loss change| < tol)
 * @returns {{
 *   history: Array<{iter: number, w: number, b: number, loss: number}>,
 *   final: {w: number, b: number, loss: number, iters: number, converged: boolean, diverged: boolean},
 *   timeMs: number
 * }}
 */
export function runGD(data, { lr, maxIters = 200, tol = 1e-6 }) {
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const { meanX, stdX, meanY, stdY, n } = getStats(data);

  if (n === 0) {
    return {
      history: [{ iter: 0, w: 0, b: 0, loss: 0 }],
      final: { w: 0, b: 0, loss: 0, iters: 0, converged: true, diverged: false },
      timeMs: 0
    };
  }

  // Pre-standardise x and y (divide by population standard deviation)
  const stdXArr = new Float64Array(n);
  const stdYArr = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    stdXArr[i] = (data[i].x - meanX) / stdX;
    stdYArr[i] = (data[i].y - meanY) / stdY;
  }

  let w = 0.0;
  let b = 0.0;
  const initialLoss = computeMSE(stdXArr, stdYArr, w, b);

  const history = [{ iter: 0, w, b, loss: initialLoss }];
  let converged = false;
  let diverged = false;

  for (let iter = 1; iter <= maxIters; iter++) {
    // Gradients:
    // dw = (2 / n) * sum(e * x)
    // db = (2 / n) * sum(e)
    let dw = 0.0;
    let db = 0.0;

    for (let i = 0; i < n; i++) {
      const pred = w * stdXArr[i] + b;
      const err = pred - stdYArr[i];
      dw += err * stdXArr[i];
      db += err;
    }

    dw = (2 / n) * dw;
    db = (2 / n) * db;

    // Gradient descent parameter update
    w -= lr * dw;
    b -= lr * db;

    const loss = computeMSE(stdXArr, stdYArr, w, b);

    // Stop early if diverged (NaN, Infinity, or exceeds 1e6 x initial loss)
    if (!Number.isFinite(loss) || loss > 1e6 * initialLoss) {
      diverged = true;
      history.push({ iter, w, b, loss });
      break;
    }

    const prevLoss = history[history.length - 1].loss;
    history.push({ iter, w, b, loss });

    // Stop if converged (|loss change| < tol) before maxIters
    if (Math.abs(loss - prevLoss) < tol) {
      converged = true;
      break;
    }
  }

  const finalLoss = history[history.length - 1].loss;
  const iters = history.length - 1;
  const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

  return {
    history,
    final: {
      w,
      b,
      loss: finalLoss,
      iters,
      converged,
      diverged
    },
    timeMs: endTime - startTime
  };
}

/**
 * Computes exact least-squares analytical baseline in standardised space.
 * In standardised space, mean(x) = mean(y) = 0 and var(x) = var(y) = 1,
 * so optimal w* = Pearson r, b* = 0, and minimum loss = 1 - r^2.
 *
 * @param {Array<{x: number, y: number}>} data - Raw {x, y} pairs
 * @returns {{ w: number, b: number, loss: number }}
 */
export function closedForm(data) {
  const { meanX, stdX, meanY, stdY, n } = getStats(data);
  if (n === 0) return { w: 0, b: 0, loss: 0 };

  let cov = 0;
  for (let i = 0; i < n; i++) {
    const xStd = (data[i].x - meanX) / stdX;
    const yStd = (data[i].y - meanY) / stdY;
    cov += xStd * yStd;
  }
  const r = cov / n;
  const w = r;
  const b = 0.0;
  const loss = Math.max(0, 1 - r * r);

  return { w, b, loss };
}

/**
 * Converts model parameters from standardised space back to original raw scale
 * so the fitted regression line can be drawn on raw data.
 *
 * @param {Array<{x: number, y: number}>} data - Raw {x, y} pairs
 * @param {number} w - Standardised weight
 * @param {number} b - Standardised bias
 * @returns {{ w: number, b: number }} Parameters in original raw units
 */
export function toOriginalScale(data, w, b) {
  const { meanX, stdX, meanY, stdY } = getStats(data);
  const wRaw = w * (stdY / stdX);
  const bRaw = meanY - wRaw * meanX + b * stdY;
  return { w: wRaw, b: bRaw };
}

/**
 * Classifies optimization run behavior:
 * - 'Diverged': loss exploded or reached Infinity/NaN
 * - 'Overshooting': loss increases at any step or parameter oscillates across minimum, but run ends without divergence
 * - 'Slow crawl': not converged by maxIters
 * - 'Smooth descent': smooth monotonic progress towards minimum
 *
 * @param {Array<{iter: number, w: number, b: number, loss: number}>} history
 * @param {{converged: boolean, diverged: boolean}} final
 * @returns {'Smooth descent' | 'Slow crawl' | 'Overshooting' | 'Diverged'}
 */
export function classifyRun(history, final) {
  if (final.diverged) {
    return 'Diverged';
  }

  // Check if loss increases at any step
  let lossIncreased = false;
  for (let i = 1; i < history.length; i++) {
    if (history[i].loss > history[i - 1].loss + 1e-9) {
      lossIncreased = true;
      break;
    }
  }

  // Check if parameters oscillated / overshot the minimum
  let oscillated = false;
  for (let i = 2; i < history.length; i++) {
    const diff1 = history[i - 1].w - history[i - 2].w;
    const diff2 = history[i].w - history[i - 1].w;
    if (diff1 * diff2 < -1e-12) {
      oscillated = true;
      break;
    }
  }

  if (lossIncreased || oscillated) {
    return 'Overshooting';
  }

  if (!final.converged) {
    return 'Slow crawl';
  }

  return 'Smooth descent';
}
