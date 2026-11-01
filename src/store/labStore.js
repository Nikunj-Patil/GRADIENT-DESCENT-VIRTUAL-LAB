// src/store/labStore.js
// Central state store for Gradient Descent Virtual Lab using Zustand.
// Supports dataset selection, target selection, feature selection, runs, and quiz tracking.

import { create } from 'zustand';
import { DEFAULT_DATASET, getDataset } from '../data/dataset.js';

const initialDs = getDataset(DEFAULT_DATASET);

export const useLab = create((set) => ({
  // Active dataset, target, and feature
  datasetKey: DEFAULT_DATASET, // default 'concrete'
  targetKey: initialDs.DEFAULT_TARGET, // default 'strength'
  dataset: DEFAULT_DATASET,
  target: initialDs.DEFAULT_TARGET,
  feature: initialDs.DEFAULT_FEATURE, // default 'cement'

  // When dataset changes:
  // - Set the new dataset (datasetKey & dataset)
  // - Set its DEFAULT_FEATURE
  // - Set its DEFAULT_TARGET
  // - Preserve previous experiment runs
  setDataset: (key) =>
    set(() => {
      const ds = getDataset(key);
      return {
        datasetKey: ds.id,
        dataset: ds.id,
        targetKey: ds.DEFAULT_TARGET,
        target: ds.DEFAULT_TARGET,
        feature: ds.DEFAULT_FEATURE
      };
    }),

  // When target changes:
  // - Update only targetKey (and target)
  // - Preserve the selected feature and dataset
  setTarget: (key) =>
    set({
      targetKey: key,
      target: key
    }),

  // Update active numerical feature
  setFeature: (featureKey) => set({ feature: featureKey }),

  // Experiment runs history
  runs: [],

  // Replaces an existing run with same dataset, target, feature, lr, and maxIters, or appends
  addRun: (run) =>
    set((state) => {
      const runDataset = run.datasetKey || run.dataset || state.datasetKey || 'concrete';
      const runTarget = run.targetKey || run.target || state.targetKey || 'strength';

      const ds = getDataset(runDataset);
      const tgtObj = ds.TARGETS.find((t) => t.key === runTarget) || ds.TARGETS[0];
      const featObj = ds.FEATURES.find((f) => f.key === run.feature) || ds.FEATURES[0];

      const existingIndex = state.runs.findIndex(
        (r) =>
          (r.datasetKey || r.dataset || 'concrete') === runDataset &&
          (r.targetKey || r.target || 'strength') === runTarget &&
          r.feature === run.feature &&
          r.lr === run.lr &&
          r.maxIters === run.maxIters
      );

      const runWithMeta = {
        ...run,
        datasetKey: runDataset,
        dataset: runDataset,
        datasetName: run.datasetName || ds.title,
        targetKey: runTarget,
        target: runTarget,
        targetLabel: run.targetLabel || (tgtObj ? tgtObj.label : runTarget),
        targetUnit: run.targetUnit || (tgtObj ? tgtObj.unit : ''),
        feature: run.feature,
        featureLabel: run.featureLabel || (featObj ? featObj.label : run.feature),
        featureUnit: run.featureUnit || (featObj ? featObj.unit : ''),
        lr: run.lr !== undefined ? run.lr : run.learningRate,
        learningRate: run.learningRate !== undefined ? run.learningRate : run.lr,
        maxIters: run.maxIters,
        itersUsed: run.itersUsed !== undefined ? run.itersUsed : run.iterations,
        iterations: run.iterations !== undefined ? run.iterations : run.itersUsed,
        finalLoss: run.finalLoss,
        closedFormLoss: run.closedFormLoss,
        converged: Boolean(run.converged),
        diverged: Boolean(run.diverged),
        timeMs: run.timeMs !== undefined ? run.timeMs : run.executionTime,
        executionTime: run.executionTime !== undefined ? run.executionTime : run.timeMs,
        behavior: run.behavior || run.behaviour,
        behaviour: run.behaviour || run.behavior
      };

      if (existingIndex !== -1) {
        const updated = [...state.runs];
        updated[existingIndex] = runWithMeta;
        return { runs: updated };
      }
      return { runs: [...state.runs, runWithMeta] };
    }),

  clearRuns: () => set({ runs: [] }),

  // Quizzes progress
  quiz: {
    pre: null,
    mid1: null,
    mid2: null,
    final: null
  },

  setQuizScore: (id, scoreData) =>
    set((state) => ({
      quiz: {
        ...state.quiz,
        [id]: scoreData // { score, total }
      }
    }))
}));
