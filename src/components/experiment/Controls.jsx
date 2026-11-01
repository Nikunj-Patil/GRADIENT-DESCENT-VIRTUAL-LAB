// src/components/experiment/Controls.jsx
// Interactive hyperparameter controls for the Gradient Descent workbench.

import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Chip from '../ui/Chip.jsx';
import { FEATURES } from '../../data/dataset.js';
import { SUGGESTED_LRS } from '../../lib/gd.js';

export default function Controls({
  feature,
  onFeatureChange,
  lr,
  onLrChange,
  maxIters,
  onMaxItersChange,
  tol,
  onTolChange,
  onRun,
  isRunning
}) {
  const presets = [
    {
      id: 'small',
      label: 'Small (0.005)',
      value: SUGGESTED_LRS.small,
      behavior: 'Slow crawl',
      variant: 'warning'
    },
    {
      id: 'good',
      label: 'Good (0.15)',
      value: SUGGESTED_LRS.good,
      behavior: 'Smooth descent',
      variant: 'success'
    },
    {
      id: 'large',
      label: 'Large (0.85)',
      value: SUGGESTED_LRS.large,
      behavior: 'Overshooting',
      variant: 'info'
    },
    {
      id: 'diverge',
      label: 'Extreme (1.05)',
      value: SUGGESTED_LRS.diverge,
      behavior: 'Diverged',
      variant: 'danger'
    }
  ];

  return (
    <Card
      title="Experiment Controls"
      subtitle="Tune the learning rate and observe how the optimization behavior transforms."
      className="h-full"
    >
      <div className="space-y-5">
        {/* Feature Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            Input Feature (X)
          </label>
          <select
            value={feature}
            onChange={(e) => onFeatureChange(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {FEATURES.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label} ({f.unit})
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-slate-500">
            Target (Y): Compressive Strength (MPa)
          </p>
        </div>

        {/* Learning Rate Presets */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Learning Rate (α) Presets
            </label>
            <span className="text-xs font-mono font-bold text-indigo-600">
              α = {lr}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {presets.map((preset) => {
              const isSelected = Math.abs(lr - preset.value) < 1e-4;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onLrChange(preset.value)}
                  className={`flex flex-col items-center justify-center rounded-lg border p-2 text-center transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-500 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="text-xs">{preset.label}</span>
                  <Chip
                    variant={preset.variant}
                    size="sm"
                    className="mt-1 text-[10px]"
                  >
                    {preset.behavior}
                  </Chip>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Learning Rate Slider & Input */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Custom Step Size</span>
            <input
              type="number"
              step="0.001"
              min="0.0001"
              max="2.0"
              value={lr}
              onChange={(e) => onLrChange(Math.max(0.0001, parseFloat(e.target.value) || 0))}
              className="w-24 rounded border border-slate-300 px-2 py-0.5 text-right font-mono text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <input
            type="range"
            min="0.001"
            max="1.2"
            step="0.005"
            value={Math.min(lr, 1.2)}
            onChange={(e) => onLrChange(parseFloat(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>0.001 (Micro)</span>
            <span>0.5 (Ideal 1-step)</span>
            <span>1.0 (Stability Edge)</span>
            <span>1.2 (Diverge)</span>
          </div>
        </div>

        {/* Maximum Iterations & Tolerance */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Max Iterations
            </label>
            <input
              type="number"
              min="10"
              max="1000"
              step="10"
              value={maxIters}
              onChange={(e) => onMaxItersChange(parseInt(e.target.value, 10) || 200)}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Tolerance (tol)
            </label>
            <input
              type="text"
              value={tol}
              onChange={(e) => onTolChange(parseFloat(e.target.value) || 1e-6)}
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Run Button */}
        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            onClick={onRun}
            disabled={isRunning}
            className="w-full justify-center shadow-md hover:shadow-lg"
          >
            {isRunning ? 'Computing...' : '⚡ Run Gradient Descent'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

