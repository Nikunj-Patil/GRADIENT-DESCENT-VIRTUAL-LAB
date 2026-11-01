// src/components/experiment/WhatHappenedCard.jsx
// Section 4: 'What just happened?' - Stat chips and auto-written plain-English explanation of the optimization behavior.

import React from 'react';
import Card from '../ui/Card.jsx';
import Chip from '../ui/Chip.jsx';

export default function WhatHappenedCard({
  runResult,
  behavior,
  closedFormLoss
}) {
  if (!runResult) return null;

  const final = runResult.final;
  const isDiverged = final.diverged;
  const finalLossText = isDiverged
    ? 'Exploded (> 1e6)'
    : Number.isFinite(final.loss)
    ? final.loss.toFixed(6)
    : 'N/A';

  const timeText =
    runResult.timeMs !== undefined
      ? `${runResult.timeMs.toFixed(1)} ms`
      : '< 1 ms';

  // Chip color based on behavior
  const behaviorColors = {
    'Smooth descent': 'teal',
    'Slow crawl': 'amber',
    'Overshooting': 'indigo',
    'Diverged': 'rose'
  };

  // Plain-English auto-written explanation (one short paragraph per label)
  const explanations = {
    'Smooth descent':
      'Your learning rate was well-tuned. The model made steady, direct progress downhill on every iteration without zig-zagging or bouncing. It converged smoothly to the valley floor and reached the exact optimal regression line.',
    'Slow crawl':
      'Your learning rate was too small. The model took baby steps and ran out of iterations before reaching the minimum. While it is mathematically stable and moves downhill, it is computationally wasteful and requires many more iterations.',
    'Overshooting':
      'Your learning rate was relatively large. The parameters jumped across the valley floor on each step, bouncing back and forth between opposite hillsides. Because the rate remained within the stability boundary, the bounces gradually decayed until the model settled near the minimum.',
    'Diverged':
      'Your learning rate was too extreme and exceeded the mathematical stability threshold. Each step leaped so aggressively past the valley that errors grew exponentially larger with every bounce until the algorithm exploded.'
  };

  const explanationText =
    explanations[behavior] ||
    'The run completed. Review the stat chips and loss curve above to analyze how step size influenced convergence.';

  return (
    <Card title="What just happened?" subtitle="Post-run analysis and behavioral explanation">
      <div className="space-y-4">
        {/* Stat Chips Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="font-sans text-slate-500 block text-[11px] mb-1">
              Behavior:
            </span>
            <Chip color={behaviorColors[behavior] || 'indigo'} className="font-bold">
              {behavior}
            </Chip>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="font-sans text-slate-500 block text-[11px] mb-1">
              Final Loss (MSE):
            </span>
            <span className="font-bold text-slate-900 text-sm">{finalLossText}</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="font-sans text-slate-500 block text-[11px] mb-1">
              Iterations Used:
            </span>
            <span className="font-bold text-indigo-700 text-sm">
              {final.iters} steps
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <span className="font-sans text-slate-500 block text-[11px] mb-1">
              Compute Time:
            </span>
            <span className="font-bold text-slate-800 text-sm">{timeText}</span>
          </div>
        </div>

        {/* Auto-Written Plain-English Explanation */}
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <h4 className="font-bold text-slate-900 text-sm mb-1">
            Understanding the Result:
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            {explanationText}
          </p>
        </div>
      </div>
    </Card>
  );
}

