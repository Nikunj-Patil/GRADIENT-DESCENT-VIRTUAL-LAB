// src/components/experiment/PerformanceReportCard.jsx
// Section: 'Performance report'
// Table comparing each run against the exact closed-form baseline with percentage gap,
// plus three 'Try this' challenge chips that pre-fill controls.

import React, { useState } from 'react';
import Card from '../ui/Card.jsx';
import Chip from '../ui/Chip.jsx';
import Button from '../ui/Button.jsx';
import { useLab } from '../../store/labStore.js';
import { getDataset } from '../../data/dataset.js';

export default function PerformanceReportCard({
  feature,
  datasetKey = 'concrete',
  targetKey = 'strength',
  closedFormLoss,
  onSelectChallenge
}) {
  const { runs, clearRuns } = useLab();
  const [selectedChallengeId, setSelectedChallengeId] = useState(null);

  const activeDs = getDataset(datasetKey);
  const targetObj =
    activeDs.TARGETS.find((t) => t.key === targetKey) || activeDs.TARGETS[0];
  const featureObj =
    activeDs.FEATURES.find((f) => f.key === feature) || activeDs.FEATURES[0];

  // Filter runs for the active dataset, target, and feature
  const featureRuns = runs.filter(
    (r) =>
      (r.datasetKey || r.dataset || 'concrete') === datasetKey &&
      (r.targetKey || r.target || 'strength') === targetKey &&
      r.feature === feature
  );

  // Sort runs by learning rate for clean presentation
  const sortedRuns = [...featureRuns].sort((a, b) => a.lr - b.lr);

  // Map behavior strings to Chip color prop
  const getBehaviorColor = (beh) => {
    switch (beh) {
      case 'Smooth descent':
        return 'emerald';
      case 'Slow crawl':
        return 'amber';
      case 'Overshooting':
        return 'indigo';
      case 'Diverged':
        return 'rose';
      default:
        return 'slate';
    }
  };

  // Three 'Try this' interactive challenge presets
  const challenges = [
    {
      id: 'max_converge',
      label: 'Find the largest learning rate that still converges',
      lr: 0.98,
      maxIters: 200,
      description: 'Sets α = 0.98. Bounces wildly between valley slopes right below the stability limit 1.0, but still reaches the bottom.'
    },
    {
      id: 'under_30',
      label: 'Find a learning rate that converges in fewer than 30 iterations',
      lr: 0.4,
      maxIters: 50,
      description: 'Sets α = 0.40. Drops steeply into the valley bottom and reaches convergence in ~10 iterations.'
    },
    {
      id: 'slow_crawl',
      label: 'Observe extreme slow crawling',
      lr: 0.002,
      maxIters: 300,
      description: 'Sets α = 0.002. Takes minuscule baby steps and remains far above the valley floor after 300 iterations.'
    }
  ];

  const handleChallengeClick = (ch) => {
    setSelectedChallengeId(ch.id);
    if (onSelectChallenge) {
      onSelectChallenge(ch);
    }
  };

  return (
    <Card
      title="Performance report"
      subtitle={`Quantitative metrics and gap comparison for ${featureObj.label} → ${targetObj.label} (${activeDs.title})`}
      action={
        sortedRuns.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearRuns} className="text-xs py-1 px-2.5">
            Clear Runs
          </Button>
        )
      }
    >
      <div className="space-y-6">
        {/* Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-3.5">Learning Rate (α)</th>
                <th className="py-3 px-3.5">Iterations to Converge</th>
                <th className="py-3 px-3.5">Final Loss (MSE)</th>
                <th className="py-3 px-3.5">Gap from Optimum</th>
                <th className="py-3 px-3.5">Compute Time</th>
                <th className="py-3 px-3.5">Behaviour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Baseline Row: Exact Closed-Form Solution */}
              <tr className="bg-teal-50/50 font-medium border-b border-teal-100">
                <td className="py-2.5 px-3.5 font-bold text-teal-900 flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">★</span>
                  Closed-Form (Analytical)
                </td>
                <td className="py-2.5 px-3.5 font-mono text-teal-800">
                  0 (Exact)
                </td>
                <td className="py-2.5 px-3.5 font-mono font-bold text-teal-900">
                  {closedFormLoss !== undefined ? closedFormLoss.toFixed(6) : '—'}
                </td>
                <td className="py-2.5 px-3.5 font-mono font-bold text-emerald-700">
                  0.00% (Baseline)
                </td>
                <td className="py-2.5 px-3.5 font-mono text-emerald-800 font-semibold">
                  instant
                </td>
                <td className="py-2.5 px-3.5">
                  <Chip color="emerald">Exact baseline</Chip>
                </td>
              </tr>

              {/* Run Rows */}
              {sortedRuns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No runs recorded yet for {featureObj.label} → {targetObj.label}. Run an experiment or race the step sizes above!
                  </td>
                </tr>
              ) : (
                sortedRuns.map((r, idx) => {
                  const isConverged = Boolean(r.converged);
                  const isDiverged = Boolean(r.diverged);

                  // Iterations to converge or 'did not converge'
                  const itersText = isConverged
                    ? `${r.itersUsed} iters`
                    : 'did not converge';

                  // Loss display
                  const lossDisplay = Number.isFinite(r.finalLoss)
                    ? r.finalLoss.toFixed(6)
                    : 'Exploded (> 1e6)';

                  // Percentage difference from closed form
                  let gapText = '—';
                  let gapColor = 'text-slate-600';
                  if (isDiverged || !Number.isFinite(r.finalLoss)) {
                    gapText = '+∞ (Diverged)';
                    gapColor = 'text-rose-600 font-bold';
                  } else if (closedFormLoss && Number.isFinite(r.finalLoss)) {
                    const diffPct = Math.max(
                      0,
                      ((r.finalLoss - closedFormLoss) / closedFormLoss) * 100
                    );
                    if (diffPct <= 0.005) {
                      gapText = '+0.00%';
                      gapColor = 'text-emerald-700 font-bold';
                    } else if (diffPct <= 1.0) {
                      gapText = `+${diffPct.toFixed(2)}%`;
                      gapColor = 'text-teal-700 font-semibold';
                    } else {
                      gapText = `+${diffPct.toFixed(2)}%`;
                      gapColor = 'text-amber-700 font-bold';
                    }
                  }

                  // Compute time
                  const timeText =
                    r.timeMs !== undefined ? `${r.timeMs.toFixed(1)} ms` : '< 1 ms';

                  return (
                    <tr
                      key={`${r.lr}-${r.maxIters}-${idx}`}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-2.5 px-3.5 font-mono font-bold text-indigo-700">
                        α = {r.lr}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-700">
                        <span
                          className={
                            isConverged
                              ? 'text-emerald-700 font-semibold'
                              : 'text-amber-700 font-medium'
                          }
                        >
                          {itersText}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono">{lossDisplay}</td>
                      <td className={`py-2.5 px-3.5 font-mono ${gapColor}`}>{gapText}</td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-500">{timeText}</td>
                      <td className="py-2.5 px-3.5">
                        <Chip color={getBehaviorColor(r.behavior)}>{r.behavior}</Chip>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Section 3: Three 'Try this' challenge chips */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              💡 Try these challenges:
            </span>
            <span className="text-[11px] text-slate-500">
              (Click a chip to pre-fill the controls above)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {challenges.map((ch) => {
              const isSelected = selectedChallengeId === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => handleChallengeClick(ch)}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-200'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900 leading-snug">
                    {ch.label}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] font-mono font-bold text-indigo-600">
                    <span>α = {ch.lr}</span>
                    <span className="text-slate-300">•</span>
                    <span>{ch.maxIters} iters</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                    {ch.description}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedChallengeId && (
            <div className="mt-3 flex items-center justify-between rounded-xl bg-indigo-50 border border-indigo-100 p-2.5 text-xs text-indigo-900">
              <span>
                ✓ Controls pre-filled with{' '}
                <strong>
                  α = {challenges.find((c) => c.id === selectedChallengeId)?.lr}
                </strong>{' '}
                and{' '}
                <strong>
                  {challenges.find((c) => c.id === selectedChallengeId)?.maxIters} max iters
                </strong>
                . Scroll up to test it!
              </span>
              <a
                href="#step-size-card"
                className="font-bold underline text-indigo-700 hover:text-indigo-900 cursor-pointer ml-2"
              >
                Go to Controls ↑
              </a>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

