// src/data/dataset.js
// UCI Concrete Compressive Strength dataset loader and statistical processing.

import concreteJson from './concrete.json' with { type: 'json' };

export const META = {
  title: 'Concrete Compressive Strength',
  source: 'UCI Machine Learning Repository',
  targetKey: 'strength',
  targetLabel: 'Compressive strength',
  targetUnit: 'MPa'
};

export const FEATURES = [
  {
    key: 'cement',
    label: 'Cement',
    unit: 'kg/m³',
    blurb: 'Primary binding material that reacts with water to form hardened concrete paste.'
  },
  {
    key: 'slag',
    label: 'Blast Furnace Slag',
    unit: 'kg/m³',
    blurb: 'Industrial byproduct of iron making that acts as an auxiliary cementitious binder.'
  },
  {
    key: 'flyAsh',
    label: 'Fly Ash',
    unit: 'kg/m³',
    blurb: 'Fine coal combustion byproduct that improves workability and long-term durability.'
  },
  {
    key: 'water',
    label: 'Water',
    unit: 'kg/m³',
    blurb: 'Liquid required for chemical hydration; excess water adds porosity and lowers strength.'
  },
  {
    key: 'superplasticizer',
    label: 'Superplasticizer',
    unit: 'kg/m³',
    blurb: 'Chemical admixture that increases workability without requiring additional water.'
  },
  {
    key: 'coarseAgg',
    label: 'Coarse Aggregate',
    unit: 'kg/m³',
    blurb: 'Crushed stone or gravel that provides the primary structural skeletal bulk.'
  },
  {
    key: 'fineAgg',
    label: 'Fine Aggregate',
    unit: 'kg/m³',
    blurb: 'Sand particles that fill the interstitial voids between coarse stones.'
  },
  {
    key: 'age',
    label: 'Age',
    unit: 'days',
    blurb: 'Curing time in days, during which hydration continues to increase concrete strength.'
  }
];

export const DATA = concreteJson;

export const DEFAULT_FEATURE = 'cement';

export function getXY(featureKey) {
  return DATA.map((row) => ({
    x: row[featureKey],
    y: row.strength
  }));
}

export function correlations() {
  const n = DATA.length;
  if (n === 0) return [];

  const yVals = DATA.map((d) => d.strength);
  const meanY = yVals.reduce((acc, val) => acc + val, 0) / n;

  return FEATURES.map((f) => {
    const xVals = DATA.map((d) => d[f.key]);
    const meanX = xVals.reduce((acc, val) => acc + val, 0) / n;

    let cov = 0;
    let varX = 0;
    let varY = 0;

    for (let i = 0; i < n; i++) {
      const dx = xVals[i] - meanX;
      const dy = yVals[i] - meanY;
      cov += dx * dy;
      varX += dx * dx;
      varY += dy * dy;
    }

    const denom = Math.sqrt(varX * varY);
    const r = denom === 0 ? 0 : cov / denom;

    return { key: f.key, r };
  });
}
