// src/components/experiment/RaceStepSizesCard.jsx
// Section: 'Race the step sizes'
// Runs the four SUGGESTED_LRS values (small, good, large, diverge) at current iteration limit,
// overlays loss curves in Recharts with legend, log-scale toggle, and capped diverged curves.

import React, { useState, useMemo } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Chip from '../ui/Chip.jsx';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';

export default function RaceStepSizesCard({
  feature,
  maxIters,
  onRace,
  isRacing,
  raceResults,
  closedFormLoss
}) {
  const [isLogScale, setIsLogScale] = useState(false);

  // Ceil cap for diverged loss to prevent squashing the chart
  const LOSS_CAP = 2.5;

  // Prepare overlaid multi-line chart data from race runs
  const { chartData, minY, maxY } = useMemo(() => {
    if (!raceResults) {
      return { chartData: [], minY: 0.6, maxY: LOSS_CAP };
    }

    const { small, good, large, diverge } = raceResults;
    if (!small || !good || !large || !diverge) {
      return { chartData: [], minY: 0.6, maxY: LOSS_CAP };
    }

    // Determine max iteration length across all 4 runs
    const maxLen = Math.max(
      small.history.length,
      good.history.length,
      large.history.length,
      diverge.history.length
    );

    const data = [];
    let divergeStopped = false;
    let minObservedLoss = closedFormLoss || 0.7;

    for (let i = 0; i < maxLen; i++) {
      const entry = { iter: i };

      // 1. Small (α = 0.005)
      if (i < small.history.length) {
        const val = small.history[i].loss;
        entry.small = Number(val.toFixed(5));
        if (val < minObservedLoss) minObservedLoss = val;
      }

      // 2. Good (α = 0.3) - stays flat at converged loss once reached
      if (i < good.history.length) {
        const val = good.history[i].loss;
        entry.good = Number(val.toFixed(5));
        if (val < minObservedLoss) minObservedLoss = val;
      } else if (good.final.converged) {
        entry.good = Number(good.final.loss.toFixed(5));
      }

      // 3. Large (α = 0.95) - stays flat at converged loss once reached
      if (i < large.history.length) {
        const val = large.history[i].loss;
        entry.large = Number(val.toFixed(5));
        if (val < minObservedLoss) minObservedLoss = val;
      } else if (large.final.converged) {
        entry.large = Number(large.final.loss.toFixed(5));
      }

      // 4. Diverge (α = 1.05) - Capped so it doesn't squash chart, then stopped
      if (!divergeStopped && i < diverge.history.length) {
        const val = diverge.history[i].loss;
        if (!Number.isFinite(val) || val >= LOSS_CAP) {
          entry.diverge = LOSS_CAP;
          divergeStopped = true; // Stop plotting further points once capped
        } else {
          entry.diverge = Number(val.toFixed(5));
        }
      }

      data.push(entry);
    }

    const calculatedMin = Math.max(0.5, Math.floor(minObservedLoss * 10) / 10);
    return {
      chartData: data,
      minY: calculatedMin,
      maxY: LOSS_CAP + 0.1
    };
  }, [raceResults, closedFormLoss]);

  return (
    <Card
      title="Race the step sizes"
      subtitle={`Compare all 4 learning rates simultaneously at ${maxIters} max iterations`}
      action={
        <div className="flex flex-wrap items-center gap-2">
          {/* Log-scale Toggle */}
          <button
            type="button"
            onClick={() => setIsLogScale((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isLogScale
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {isLogScale ? '📊 Log Scale (Y-Axis)' : '📈 Linear Scale (Y-Axis)'}
          </button>

          {/* Race Button */}
          <Button
            variant="primary"
            onClick={onRace}
            disabled={isRacing}
            className="text-xs py-1.5 px-3.5"
          >
            {isRacing ? '⏳ Racing...' : '🏁 Race the 4 Step Sizes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Race Description */}
        <p className="text-xs text-slate-600 leading-relaxed">
          Click <strong>&quot;Race the 4 Step Sizes&quot;</strong> to simulate Tiny (α = 0.005),
          Good (α = 0.3), Large (α = 0.95), and Extreme (α = 1.05) side-by-side. Notice how step size
          dramatically changes both convergence speed and stability.
        </p>

        {!raceResults ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
            <span className="text-3xl block mb-2">🏁</span>
            <p className="text-sm font-semibold text-slate-700">Ready to race!</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Click the button above to pit all four learning rates against each other and overlay
              their trajectories on a single chart.
            </p>
            <div className="mt-4">
              <Button variant="primary" onClick={onRace} disabled={isRacing}>
                {isRacing ? 'Running simulations...' : 'Start Race'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Legend & Summary Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-2.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  Tiny (α = 0.005)
                </div>
                <div className="mt-1 text-[11px] text-amber-700">
                  {raceResults.small.final.converged
                    ? `Converged in ${raceResults.small.final.iters} iters`
                    : 'Crawling slowly (not converged)'}
                </div>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  Good (α = 0.30)
                </div>
                <div className="mt-1 text-[11px] text-emerald-700">
                  {raceResults.good.final.converged
                    ? `Converged in ${raceResults.good.final.iters} iters!`
                    : 'Descending smoothly'}
                </div>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-2.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600"></span>
                  Large (α = 0.95)
                </div>
                <div className="mt-1 text-[11px] text-indigo-700">
                  {raceResults.large.final.converged
                    ? `Converged in ${raceResults.large.final.iters} iters (oscillated)`
                    : 'Overshooting valley'}
                </div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-2.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                  Extreme (α = 1.05)
                </div>
                <div className="mt-1 text-[11px] text-rose-700 font-medium">
                  Diverged! Capped at {LOSS_CAP.toFixed(1)}
                </div>
              </div>
            </div>

            {/* Overlaid Recharts Line Chart */}
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 12, right: 24, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="iter"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    label={{
                      value: 'Iteration (Steps)',
                      position: 'insideBottom',
                      offset: -12,
                      fontSize: 12,
                      fill: '#64748b'
                    }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    scale={isLogScale ? 'log' : 'auto'}
                    domain={isLogScale ? [minY, maxY] : ['auto', 'auto']}
                    tick={{ fontSize: 11 }}
                    tickFormatter={(val) => Number(val).toFixed(2)}
                    label={{
                      value: isLogScale ? 'Loss (Log Scale)' : 'MSE Loss',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 0,
                      fontSize: 12,
                      fill: '#64748b'
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '0.75rem',
                      border: '1px solid #cbd5e1',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(val, name) => {
                      if (name.includes('Extreme') && val >= LOSS_CAP) {
                        return [`${val.toFixed(4)} (Capped - Diverged)`, name];
                      }
                      return [val.toFixed(5), name];
                    }}
                    labelFormatter={(iter) => `Iteration ${iter}`}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '12px', paddingBottom: '8px' }}
                  />

                  {/* Reference line for the loss cap ceiling */}
                  <ReferenceLine
                    y={LOSS_CAP}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Loss Cap (${LOSS_CAP.toFixed(1)})`,
                      fill: '#ef4444',
                      fontSize: 10,
                      position: 'insideTopRight'
                    }}
                  />

                  {/* Reference line for the analytical optimal minimum */}
                  {closedFormLoss && (
                    <ReferenceLine
                      y={closedFormLoss}
                      stroke="#059669"
                      strokeDasharray="2 2"
                      strokeWidth={1.5}
                      label={{
                        value: `Analytical Min (${closedFormLoss.toFixed(4)})`,
                        fill: '#059669',
                        fontSize: 10,
                        position: 'insideBottomRight'
                      }}
                    />
                  )}

                  {/* 1. Small (Amber) */}
                  <Line
                    type="monotone"
                    dataKey="small"
                    name="Tiny (α = 0.005)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />

                  {/* 2. Good (Emerald) */}
                  <Line
                    type="monotone"
                    dataKey="good"
                    name="Good (α = 0.30)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                    isAnimationActive={false}
                  />

                  {/* 3. Large (Indigo) */}
                  <Line
                    type="monotone"
                    dataKey="large"
                    name="Large (α = 0.95)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />

                  {/* 4. Diverge (Rose dashed, capped) */}
                  <Line
                    type="monotone"
                    dataKey="diverge"
                    name="Extreme (α = 1.05) [Diverged]"
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-600 space-y-1">
              <p>
                <strong>💡 Note on Divergence:</strong> The red dashed curve (α = 1.05) exploded
                exponentially beyond millions. We capped it at <strong>{LOSS_CAP.toFixed(1)}</strong> to keep the
                chart proportioned so you can see the successful descents clearly.
              </p>
              {isLogScale && (
                <p>
                  <strong>📊 Log Scale Active:</strong> On the logarithmic axis, exponential
                  divergence forms a straight upward line, while geometric convergence forms a
                  straight downward slope.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

