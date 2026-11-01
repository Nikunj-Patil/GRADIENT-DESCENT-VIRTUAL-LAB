// src/store/labStore.js
import { create } from 'zustand';
import { DEFAULT_FEATURE } from '../data/dataset.js';

export const useLab = create((set) => ({
  // Default feature is 'cement' (from DEFAULT_FEATURE)
  feature: DEFAULT_FEATURE,
  setFeature: (key) => set({ feature: key }),

  // Experiment runs history
  runs: [],

  // Replaces an existing run with same feature, lr, and maxIters, or appends
  addRun: (run) =>
    set((state) => {
      const existingIndex = state.runs.findIndex(
        (r) =>
          r.feature === run.feature &&
          r.lr === run.lr &&
          r.maxIters === run.maxIters
      );

      if (existingIndex !== -1) {
        const updated = [...state.runs];
        updated[existingIndex] = run;
        return { runs: updated };
      }
      return { runs: [...state.runs, run] };
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
