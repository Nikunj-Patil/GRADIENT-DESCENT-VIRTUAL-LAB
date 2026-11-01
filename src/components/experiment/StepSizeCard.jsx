// src/components/experiment/StepSizeCard.jsx
// Section 2: 'Set your step size' - Logarithmic LR slider, iterations slider, Run & Reset buttons, and explanation callout.

import React from 'react';
import Card from '../ui/Card.jsx';
import Callout from '../ui/Callout.jsx';
import Button from '../ui/Button.jsx';
import { SUGGESTED_LRS } from '../../lib/gd.js';

export default function StepSizeCard({
  lr,
  onLrChange,
  maxIters,
  onMaxItersChange,
  onRun,
  onReset,
  isRunning
}) {
  // Logarithmic slider mapping for lr in [0.001, 1.5]
  const minLr = 0.001;
  const maxLr = 1.5;
  const logMin = Math.log10(minLr);
  const logMax = Math.log10(maxLr);

  const lrToSlider = (val) => {
    const clamped = Math.max(minLr, Math.min(maxLr, val));
    return Math.round(((Math.log10(clamped) - logMin) / (logMax - logMin)) * 1000);
  };

  const sliderToLr = (sliderVal) => {
    const logVal = logMin + (sliderVal / 1000) * (logMax - logMin);
    const raw = Math.pow(10, logVal);
    if (raw < 0.01) return Math.round(raw * 10000) / 10000;
    if (raw < 0.1) return Math.round(raw * 1000) / 1000;
    return Math.round(raw * 100) / 100;
  };

  const presets = [
    { label: 'Tiny (0.005)', val: SUGGESTED_LRS.small },
    { label: 'Small (0.01)', val: 0.01 },
    { label: 'Good (0.3)', val: SUGGESTED_LRS.good },
    { label: 'Large (0.95)', val: SUGGESTED_LRS.large },
    { label: 'Extreme (1.05)', val: SUGGESTED_LRS.diverge }
  ];

  return (
    <Card id="step-size-card" title="Set your step size" subtitle="Configure the optimization hyperparameters">
      <div className="space-y-5">
        {/* Callout explaining in two sentences what the two controls do */}
        <Callout variant="tip">
          The learning rate sets how large a step your model takes downhill toward the minimum error on each iteration. The iterations slider sets the maximum number of steps allowed before the algorithm terminates.
        </Callout>

        {/* Learning Rate Preset Buttons */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Learning Rate Presets:
            </span>
            <span className="font-mono text-xs font-bold text-indigo-700">
              α = {lr}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => {
              const isSelected = Math.abs(lr - p.val) < 0.001;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => onLrChange(p.val)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
          {/* Learning Rate Slider (Logarithmic Feel) */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="exp-lr-slider" className="text-xs font-bold uppercase text-slate-700">
                Learning Rate (α)
              </label>
              <input
                type="number"
                min="0.001"
                max="1.5"
                step="0.001"
                value={lr}
                onChange={(e) =>
                  onLrChange(Math.max(0.001, Math.min(1.5, parseFloat(e.target.value) || 0.001)))
                }
                className="w-20 rounded-lg border border-slate-300 px-2 py-0.5 text-right font-mono text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <input
              id="exp-lr-slider"
              type="range"
              min="0"
              max="1000"
              step="1"
              value={lrToSlider(lr)}
              onChange={(e) => onLrChange(sliderToLr(parseInt(e.target.value, 10)))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0.001</span>
              <span>0.01</span>
              <span>0.1</span>
              <span>0.3</span>
              <span>1.0</span>
              <span>1.5</span>
            </div>
          </div>

          {/* Iterations Slider (10 to 500, default 200) */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="exp-iters-slider" className="text-xs font-bold uppercase text-slate-700">
                Max Iterations
              </label>
              <span className="font-mono text-xs font-bold text-slate-800">
                {maxIters} steps
              </span>
            </div>
            <input
              id="exp-iters-slider"
              type="range"
              min="10"
              max="500"
              step="10"
              value={maxIters}
              onChange={(e) => onMaxItersChange(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>10</span>
              <span>100</span>
              <span>200</span>
              <span>350</span>
              <span>500</span>
            </div>
          </div>
        </div>

        {/* Run and Reset Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={onRun}
            disabled={isRunning}
            className="px-6 py-2.5 text-sm shadow-md"
          >
            {isRunning ? 'Optimizing...' : '⚡ Run Gradient Descent'}
          </Button>
          <Button variant="ghost" onClick={onReset} disabled={isRunning}>
            ↺ Reset
          </Button>
        </div>
      </div>
    </Card>
  );
}

