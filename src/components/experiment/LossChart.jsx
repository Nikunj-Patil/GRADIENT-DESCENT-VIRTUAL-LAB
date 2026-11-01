// src/components/experiment/LossChart.jsx
// Visualizes MSE loss progression over iterations alongside the analytical closed-form baseline.

import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine
} from 'recharts';
import Card from '../ui/Card.jsx';
import Chip from '../ui/Chip.jsx';

export default function LossChart({ history, closedFormLoss, behavior }) {
  if (!history || history.length === 0) {
    return (
      <Card title="Optimization Loss Curve">
        <div className="flex h-64 items-center justify-center text-sm text-slate-400">
          Run gradient descent to visualize the cost curve.
        </div>
      </Card>
    );
  }

  // Format data for Recharts, capping extreme loss values for diverged runs so chart remains readable
  const cappedChartData = history.map((pt) => {
    const isExploded = !Number.isFinite(pt.loss) || pt.loss > 10;
    return {
      iter: pt.iter,
      loss: isExploded ? 10 : Number(pt.loss.toFixed(5)),
      rawLoss: pt.loss,
      w: pt.w !== undefined ? Number(pt.w.toFixed(4)) : null,
      b: pt.b !== undefined ? Number(pt.b.toFixed(4)) : null
    };
  });

  const finalLoss = history[history.length - 1].loss;
  const initialLoss = history[0].loss;

  return (
    <Card
      title="Loss vs. Iterations"
      subtitle="Mean Squared Error (standardised space) plotted at each step"
      badge={
        behavior && (
          <Chip variant={behavior} size="sm">
            {behavior}
          </Chip>
        )
      }
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={cappedChartData}
            margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="iter"
              stroke="#64748b"
              fontSize={12}
              label={{
                value: 'Iteration (Steps)',
                position: 'insideBottom',
                offset: -12,
                fontSize: 12,
                fill: '#64748b'
              }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              domain={['auto', 'auto']}
              label={{
                value: 'MSE Loss',
                angle: -90,
                position: 'insideLeft',
                offset: 2,
                fontSize: 12,
                fill: '#64748b'
              }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg text-xs backdrop-blur">
                      <p className="font-bold text-slate-800">Iteration: {data.iter}</p>
                      <p className="text-indigo-600 font-semibold">
                        Loss: {typeof data.rawLoss === 'number' && Number.isFinite(data.rawLoss)
                          ? data.rawLoss.toFixed(6)
                          : 'Diverged (∞)'}
                      </p>
                      {data.w !== null && <p className="text-slate-600">w: {data.w}</p>}
                      {data.b !== null && <p className="text-slate-600">b: {data.b}</p>}
                    </div>
                  );
                }
                return null;
              }}
            />
            {closedFormLoss !== undefined && (
              <ReferenceLine
                y={closedFormLoss}
                stroke="#10b981"
                strokeDasharray="5 5"
                strokeWidth={2}
                label={{
                  value: `Analytical Min (${closedFormLoss.toFixed(4)})`,
                  position: 'insideTopRight',
                  fill: '#059669',
                  fontSize: 11
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="loss"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={history.length <= 30}
              activeDot={{ r: 5 }}
              name="GD Loss"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div>
          <span>Initial Loss: </span>
          <span className="font-mono font-semibold text-slate-700">
            {initialLoss.toFixed(4)}
          </span>
        </div>
        <div>
          <span>Final Loss: </span>
          <span className="font-mono font-semibold text-slate-700">
            {Number.isFinite(finalLoss) ? finalLoss.toFixed(6) : 'Exploded (> 1e6)'}
          </span>
        </div>
        {closedFormLoss !== undefined && (
          <div>
            <span>Analytical Baseline: </span>
            <span className="font-mono font-semibold text-emerald-600">
              {closedFormLoss.toFixed(6)}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

