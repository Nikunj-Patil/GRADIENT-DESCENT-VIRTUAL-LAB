// src/pages/Experiment.jsx
// Step 6: Virtual Experiment Workbench for Batch Gradient Descent.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SetupCard from '../components/experiment/SetupCard.jsx';
import StepSizeCard from '../components/experiment/StepSizeCard.jsx';
import WatchItLearnCard from '../components/experiment/WatchItLearnCard.jsx';
import WhatHappenedCard from '../components/experiment/WhatHappenedCard.jsx';
import RaceStepSizesCard from '../components/experiment/RaceStepSizesCard.jsx';
import PerformanceReportCard from '../components/experiment/PerformanceReportCard.jsx';
import Button from '../components/ui/Button.jsx';
import { useLab } from '../store/labStore.js';
import { getXY, getDataset } from '../data/dataset.js';
import {
  runGD,
  closedForm,
  classifyRun,
  SUGGESTED_LRS
} from '../lib/gd.js';

export default function Experiment({ onNext }) {
  const {
    datasetKey = 'concrete',
    targetKey = 'strength',
    feature,
    setFeature,
    addRun
  } = useLab();

  // Active dataset and target descriptors
  const activeDatasetKey = datasetKey || 'concrete';
  const activeDs = getDataset(activeDatasetKey);
  const activeTargetKey = targetKey || activeDs.DEFAULT_TARGET;
  const targetObj =
    activeDs.TARGETS.find((t) => t.key === activeTargetKey) || activeDs.TARGETS[0];
  const activeFeatureKey = feature || activeDs.DEFAULT_FEATURE;
  const featureObj =
    activeDs.FEATURES.find((f) => f.key === activeFeatureKey) || activeDs.FEATURES[0];

  // Hyperparameter state (default starts with SUGGESTED_LRS.good)
  const [lr, setLr] = useState(SUGGESTED_LRS.good);
  const [maxIters, setMaxIters] = useState(200);
  const [isRunning, setIsRunning] = useState(false);

  // Run execution result and behavior
  const [runResult, setRunResult] = useState(null);
  const [behavior, setBehavior] = useState(null);

  // Race simulations state
  const [raceResults, setRaceResults] = useState(null);
  const [isRacing, setIsRacing] = useState(false);

  // Raw XY data for currently selected dataset, feature and target
  const rawXY = useMemo(() => {
    return getXY(activeDatasetKey, activeFeatureKey, activeTargetKey);
  }, [activeDatasetKey, activeFeatureKey, activeTargetKey]);

  // Analytical closed-form baseline in standardized space
  const cfBaseline = useMemo(() => closedForm(rawXY), [rawXY]);

  // Execute gradient descent and record run
  const executeRun = useCallback(() => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runGD(rawXY, { lr, maxIters, tol: 1e-6 });
      const classifiedBehavior = classifyRun(res.history, res.final);

      setRunResult(res);
      setBehavior(classifiedBehavior);
      setIsRunning(false);

      // Save completed run with extended multi-dataset metadata
      addRun({
        datasetKey: activeDatasetKey,
        datasetName: activeDs.title,
        targetKey: activeTargetKey,
        targetLabel: targetObj.label,
        targetUnit: targetObj.unit,
        feature: activeFeatureKey,
        featureLabel: featureObj.label,
        featureUnit: featureObj.unit,
        lr,
        learningRate: lr,
        maxIters,
        itersUsed: res.final.iters,
        iterations: res.final.iters,
        converged: res.final.converged,
        diverged: res.final.diverged,
        finalLoss: res.final.loss,
        closedFormLoss: cfBaseline.loss,
        timeMs: res.timeMs,
        executionTime: res.timeMs,
        behavior: classifiedBehavior,
        behaviour: classifiedBehavior
      });
    }, 20);
  }, [rawXY, lr, maxIters, activeDatasetKey, activeTargetKey, activeFeatureKey, activeDs.title, targetObj, featureObj, addRun, cfBaseline]);

  // Race the 4 step sizes and save each through addRun
  const handleRace = useCallback(() => {
    setIsRacing(true);
    setTimeout(() => {
      const keys = ['small', 'good', 'large', 'diverge'];
      const results = {};

      keys.forEach((key) => {
        const raceLr = SUGGESTED_LRS[key];
        const res = runGD(rawXY, { lr: raceLr, maxIters, tol: 1e-6 });
        const beh = classifyRun(res.history, res.final);
        results[key] = res;

        // Every race run is saved through addRun
        addRun({
          datasetKey: activeDatasetKey,
          datasetName: activeDs.title,
          targetKey: activeTargetKey,
          targetLabel: targetObj.label,
          targetUnit: targetObj.unit,
          feature: activeFeatureKey,
          featureLabel: featureObj.label,
          featureUnit: featureObj.unit,
          lr: raceLr,
          learningRate: raceLr,
          maxIters,
          itersUsed: res.final.iters,
          iterations: res.final.iters,
          converged: res.final.converged,
          diverged: res.final.diverged,
          finalLoss: res.final.loss,
          closedFormLoss: cfBaseline.loss,
          timeMs: res.timeMs,
          executionTime: res.timeMs,
          behavior: beh,
          behaviour: beh
        });
      });

      setRaceResults(results);
      setIsRacing(false);
    }, 20);
  }, [rawXY, maxIters, activeDatasetKey, activeTargetKey, activeFeatureKey, activeDs.title, targetObj, featureObj, addRun, cfBaseline]);

  // Pre-fill controls when a challenge chip is clicked
  const handleSelectChallenge = (ch) => {
    setLr(ch.lr);
    setMaxIters(ch.maxIters);
    const el = document.getElementById('step-size-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Reset to default hyperparameters and clear latest result
  const handleReset = () => {
    setLr(SUGGESTED_LRS.good);
    setMaxIters(200);
    setRunResult(null);
    setBehavior(null);
  };

  // Run automatically on first mount or when dataset, target, or feature changes
  useEffect(() => {
    executeRun();
    setRaceResults(null);
  }, [activeDatasetKey, activeTargetKey, activeFeatureKey]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
              {activeDs.title}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
              Predicting {targetObj.label} {targetObj.unit ? `(${targetObj.unit})` : ''}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Experiment Workbench
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Tune the learning rate, watch the regression line fit the data, and observe optimization dynamics.
          </p>
        </div>

        {onNext && (
          <Button variant="primary" onClick={onNext}>
            Proceed to Final Quiz (Step 7) →
          </Button>
        )}
      </div>

      {/* Section 1: 'Your setup' */}
      <SetupCard
        datasetKey={activeDatasetKey}
        targetKey={activeTargetKey}
        feature={activeFeatureKey}
        onFeatureChange={setFeature}
        rawXY={rawXY}
      />

      {/* Section 2: 'Set your step size' */}
      <StepSizeCard
        lr={lr}
        onLrChange={setLr}
        maxIters={maxIters}
        onMaxItersChange={setMaxIters}
        onRun={executeRun}
        onReset={handleReset}
        isRunning={isRunning}
      />

      {/* Section 3: 'Watch it learn' */}
      <WatchItLearnCard
        rawXY={rawXY}
        feature={activeFeatureKey}
        datasetKey={activeDatasetKey}
        targetKey={activeTargetKey}
        runResult={runResult}
        closedFormLoss={cfBaseline.loss}
      />

      {/* Section 4: 'What just happened?' */}
      <WhatHappenedCard
        runResult={runResult}
        behavior={behavior}
        closedFormLoss={cfBaseline.loss}
      />

      {/* Section 5: 'Race the step sizes' */}
      <RaceStepSizesCard
        feature={activeFeatureKey}
        datasetKey={activeDatasetKey}
        targetKey={activeTargetKey}
        maxIters={maxIters}
        onRace={handleRace}
        isRacing={isRacing}
        raceResults={raceResults}
        closedFormLoss={cfBaseline.loss}
      />

      {/* Section 6: 'Performance report' */}
      <PerformanceReportCard
        feature={activeFeatureKey}
        datasetKey={activeDatasetKey}
        targetKey={activeTargetKey}
        closedFormLoss={cfBaseline.loss}
        onSelectChallenge={handleSelectChallenge}
      />
    </div>
  );
}
