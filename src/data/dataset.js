// src/data/dataset.js
// Central dataset registry and statistical processing for Gradient Descent Virtual Lab.
// Supports UCI Concrete Compressive Strength and UCI Energy Efficiency datasets.

import concreteJson from './concrete.json' with { type: 'json' };
import energyJson from './energy.json' with { type: 'json' };

/**
 * Central dataset registry exposing metadata, features, targets, and raw records.
 */
export const DATASETS = {
  concrete: {
    id: 'concrete',
    title: 'Concrete Compressive Strength',
    description:
      'Compressive strength of high-performance concrete mixes as a function of age and ingredient proportions including cement, water, slag, fly ash, and aggregates.',
    source: 'UCI Machine Learning Repository',
    DATA: concreteJson,
    DEFAULT_FEATURE: 'cement',
    DEFAULT_TARGET: 'strength',
    TARGETS: [
      {
        key: 'strength',
        label: 'Compressive Strength',
        description: 'Ultimate compressive strength measured by crushing the hardened test cylinder.',
        unit: 'MPa'
      }
    ],
    FEATURES: [
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
    ],
    metadata: {
      title: 'Concrete Compressive Strength',
      source: 'UCI Machine Learning Repository',
      targetKey: 'strength',
      targetLabel: 'Compressive strength',
      targetUnit: 'MPa'
    }
  },

  energy: {
    id: 'energy',
    title: 'Energy Efficiency',
    description:
      'Building heating and cooling thermal energy loads simulated across 768 residential building shapes with varied architectural geometry and glazing properties.',
    source: 'UCI Machine Learning Repository',
    DATA: energyJson,
    DEFAULT_FEATURE: 'relativeCompactness',
    DEFAULT_TARGET: 'heatingLoad',
    TARGETS: [
      {
        key: 'heatingLoad',
        label: 'Heating Load',
        description: 'Annual energy load required to maintain internal comfort temperature in cold conditions.',
        unit: 'kWh/m²'
      },
      {
        key: 'coolingLoad',
        label: 'Cooling Load',
        description: 'Annual energy load required to cool the building and extract excess heat in warm conditions.',
        unit: 'kWh/m²'
      }
    ],
    FEATURES: [
      {
        key: 'relativeCompactness',
        label: 'Relative Compactness',
        unit: 'ratio',
        blurb: 'Volume-to-surface area ratio indicating building compactness; higher values retain thermal energy better.'
      },
      {
        key: 'surfaceArea',
        label: 'Surface Area',
        unit: 'm²',
        blurb: 'Total exterior surface envelope area exposed to outdoor thermal conditions.'
      },
      {
        key: 'wallArea',
        label: 'Wall Area',
        unit: 'm²',
        blurb: 'Total vertical exterior wall area subject to conduction heat transfer.'
      },
      {
        key: 'roofArea',
        label: 'Roof Area',
        unit: 'm²',
        blurb: 'Total horizontal roof area subject to solar exposure and upward heat loss.'
      },
      {
        key: 'overallHeight',
        label: 'Overall Height',
        unit: 'm',
        blurb: 'Total building vertical height in metres (either 3.5 m for single-storey or 7.0 m for two-storey).'
      },
      {
        key: 'orientation',
        label: 'Orientation',
        unit: 'cardinal (2-5)',
        blurb: 'Cardinal facade facing direction (coded 2: North, 3: East, 4: South, 5: West).'
      },
      {
        key: 'glazingArea',
        label: 'Glazing Area',
        unit: '% of floor area',
        blurb: 'Total window glass area as a percentage proportion of the floor area (0%, 10%, 25%, 40%).'
      },
      {
        key: 'glazingAreaDistribution',
        label: 'Glazing Distribution',
        unit: 'code (0-5)',
        blurb: 'Geometric distribution pattern of windows across facades (0: None, 1: Uniform, 2-5: Directional).'
      }
    ],
    metadata: {
      title: 'Energy Efficiency',
      source: 'UCI Machine Learning Repository',
      targetKey: 'heatingLoad',
      targetLabel: 'Heating Load',
      targetUnit: 'kWh/m²'
    }
  }
};

export const DEFAULT_DATASET = 'concrete';
export const DATASET_KEYS = Object.keys(DATASETS);

/**
 * Retrieves a dataset entry safely by key with fallback to Concrete.
 *
 * @param {string} [datasetKey='concrete']
 * @returns {object} Dataset definition object
 */
export function getDataset(datasetKey = 'concrete') {
  if (datasetKey && DATASETS[datasetKey]) {
    return DATASETS[datasetKey];
  }
  return DATASETS.concrete;
}

/**
 * Extracts raw {x, y} coordinate pairs for linear regression from the specified dataset.
 * Supports both multi-dataset signature getXY(datasetKey, featureKey, targetKey)
 * and legacy single-argument signature getXY(featureKey).
 *
 * @param {string} datasetKey - Dataset identifier ('concrete' | 'energy') or featureKey if 1-arg
 * @param {string} [featureKey] - Numerical input feature key
 * @param {string} [targetKey] - Numerical target output key
 * @returns {Array<{x: number, y: number}>} Array of {x, y} points
 */
export function getXY(datasetKey, featureKey, targetKey) {
  // Backwards compatibility: handle legacy getXY(featureKey)
  if (arguments.length === 1 || !DATASETS[datasetKey]) {
    targetKey = 'strength';
    featureKey = datasetKey;
    datasetKey = 'concrete';
  }

  const ds = getDataset(datasetKey);
  const target = targetKey || ds.DEFAULT_TARGET;
  const feature = featureKey || ds.DEFAULT_FEATURE;

  return ds.DATA.map((row) => ({
    x: Number(row[feature]) || 0,
    y: Number(row[target]) || 0
  }));
}

/**
 * Computes Pearson correlation coefficients (r) between every feature in the dataset
 * and the chosen target.
 *
 * @param {string} [datasetKey='concrete'] - Dataset identifier
 * @param {string} [targetKey] - Target output key
 * @returns {Array<{key: string, r: number}>} Array of feature keys with Pearson r
 */
export function correlations(datasetKey = 'concrete', targetKey) {
  const ds = getDataset(datasetKey);
  const target = targetKey || ds.DEFAULT_TARGET;
  const n = ds.DATA.length;
  if (n === 0) return [];

  const yVals = ds.DATA.map((d) => Number(d[target]) || 0);
  const meanY = yVals.reduce((acc, val) => acc + val, 0) / n;

  return ds.FEATURES.map((f) => {
    const xVals = ds.DATA.map((d) => Number(d[f.key]) || 0);
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

/**
 * Computes dynamic dataset statistics (total rows, input count, missing cell count,
 * and column summary min/avg/max) directly from raw JSON records.
 *
 * @param {string} [datasetKey='concrete'] - Dataset identifier
 * @returns {{
 *   totalRows: number,
 *   totalInputs: number,
 *   totalTargets: number,
 *   missingCount: number,
 *   columnsSummary: Array<{
 *     key: string,
 *     label: string,
 *     blurb: string,
 *     unit: string,
 *     isTarget: boolean,
 *     min: number,
 *     avg: number,
 *     max: number
 *   }>
 * }}
 */
export function getDatasetStats(datasetKey = 'concrete') {
  const ds = getDataset(datasetKey);
  const totalRows = ds.DATA.length;
  const totalInputs = ds.FEATURES.length;
  const totalTargets = ds.TARGETS.length;

  // Scan all columns for missing / null / undefined / NaN values
  let missingCount = 0;
  const allKeys = [
    ...ds.FEATURES.map((f) => f.key),
    ...ds.TARGETS.map((t) => t.key)
  ];

  ds.DATA.forEach((row) => {
    allKeys.forEach((k) => {
      const val = row[k];
      if (val === null || val === undefined || Number.isNaN(val) || val === '') {
        missingCount++;
      }
    });
  });

  const computeColSummary = (key) => {
    if (totalRows === 0) return { min: 0, avg: 0, max: 0 };
    let minVal = Number(ds.DATA[0][key]);
    let maxVal = Number(ds.DATA[0][key]);
    let sum = 0;

    for (let i = 0; i < totalRows; i++) {
      const v = Number(ds.DATA[i][key]);
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
      sum += v;
    }

    return {
      min: minVal,
      avg: sum / totalRows,
      max: maxVal
    };
  };

  const columnsSummary = [
    ...ds.FEATURES.map((f) => ({
      key: f.key,
      label: f.label,
      blurb: f.blurb,
      unit: f.unit,
      isTarget: false,
      ...computeColSummary(f.key)
    })),
    ...ds.TARGETS.map((t) => ({
      key: t.key,
      label: t.label,
      blurb: t.description,
      unit: t.unit,
      isTarget: true,
      ...computeColSummary(t.key)
    }))
  ];

  return {
    totalRows,
    totalInputs,
    totalTargets,
    missingCount,
    columnsSummary
  };
}

// ----------------------------------------------------------------------------
// Backwards-Compatible Named Exports (Preserves existing Concrete usage)
// ----------------------------------------------------------------------------
export const META = DATASETS.concrete.metadata;
export const FEATURES = DATASETS.concrete.FEATURES;
export const DATA = DATASETS.concrete.DATA;
export const DEFAULT_FEATURE = DATASETS.concrete.DEFAULT_FEATURE;
