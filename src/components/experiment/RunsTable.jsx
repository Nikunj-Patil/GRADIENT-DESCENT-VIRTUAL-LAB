// src/components/experiment/RunsTable.jsx
// Displays a history table of student experiments to compare optimization behaviors.

import React from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Chip from '../ui/Chip.jsx';
import { useLab } from '../../store/labStore.js';
import { FEATURES } from '../../data/dataset.js';

export default function RunsTable() {
  const { runs, clearRuns } = useLab();

  const getFeatureLabel = (key) => {
    const f = FEATURES.find((item) => item.key === key);
    return f ? f.label : key;
  };

  if (!runs || runs.length === 0) {
    return (
      <Card title="Experiment History" subtitle="Your completed runs will be logged here.">
        <div className="py-8 text-center text-sm text-slate-400">
          No runs logged yet. Choose a learning rate above and click &quot;Run Gradient Descent&quot;!
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Experiment History & Comparison"
      subtitle={`${runs.length} run(s) logged in this session`}
      action={
        <Button variant="ghost" size="sm" onClick={clearRuns}>
          Clear History
        </Button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="py-2.5 px-3">Feature</th>
              <th className="py-2.5 px-3">Learning Rate (α)</th>
              <th className="py-2.5 px-3">Iters Used / Max</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Final Loss (MSE)</th>
              <th className="py-2.5 px-3">Analytical Min</th>
              <th className="py-2.5 px-3">Behavior</th>
              <th className="py-2.5 px-3">Compute Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {runs.map((r, idx) => {
              const statusText = r.diverged
                ? 'Diverged'
                : r.converged
                ? 'Converged'
                : 'Max Iters Reached';
              const statusVariant = r.diverged
                ? 'danger'
                : r.converged
                ? 'success'
                : 'warning';

              return (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {getFeatureLabel(r.feature)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">
                    {r.lr}
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {r.itersUsed} / {r.maxIters}
                  </td>
                  <td className="py-2.5 px-3">
                    <Chip variant={statusVariant} size="sm">
                      {statusText}
                    </Chip>
                  </td>
                  <td className="py-2.5 px-3 font-mono">
                    {Number.isFinite(r.finalLoss) ? r.finalLoss.toFixed(6) : 'Exploded (> 1e6)'}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 font-medium">
                    {Number.isFinite(r.closedFormLoss)
                      ? r.closedFormLoss.toFixed(6)
                      : 'N/A'}
                  </td>
                  <td className="py-2.5 px-3">
                    <Chip variant={r.behavior} size="sm">
                      {r.behavior}
                    </Chip>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">
                    {r.timeMs !== undefined ? `${r.timeMs.toFixed(1)} ms` : '< 1 ms'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

