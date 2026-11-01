// src/components/experiment/RegressionChart.jsx
// Visualizes raw scatter points alongside the gradient descent fitted line and closed-form baseline.

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line
} from 'recharts';
import Card from '../ui/Card.jsx';
import { FEATURES } from '../../data/dataset.js';

export default function RegressionChart({
  data,
  featureKey,
  gdRawLine,
  cfRawLine
}) {
  const featObj = FEATURES.find((f) => f.key === featureKey) || FEATURES[0];

  // Downsample scatter points if needed to ensure smooth 60fps rendering in browser
  const scatterPoints = useMemo(() => {
    if (!data) return [];
    // 1030 points can be rendered directly or sampled evenly
    return data.map((d) => ({
      x: Number(d.x),
      y: Number(d.y)
    }));
  }, [data]);

  // Compute domain bounds for X and Y
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (!scatterPoints.length) return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    let mx = scatterPoints[0].x, Mx = scatterPoints[0].x;
    let my = scatterPoints[0].y, My = scatterPoints[0].y;
    for (let i = 1; i < scatterPoints.length; i++) {
      if (scatterPoints[i].x < mx) mx = scatterPoints[i].x;
      if (scatterPoints[i].x > Mx) Mx = scatterPoints[i].x;
      if (scatterPoints[i].y < my) my = scatterPoints[i].y;
      if (scatterPoints[i].y > My) My = scatterPoints[i].y;
    }
    return { minX: mx, maxX: Mx, minY: my, maxY: My };
  }, [scatterPoints]);

  // Generate coordinates for GD fitted line
  const gdLinePoints = useMemo(() => {
    if (!gdRawLine || !Number.isFinite(gdRawLine.w) || !Number.isFinite(gdRawLine.b)) {
      return [];
    }
    return [
      { x: minX, y: gdRawLine.w * minX + gdRawLine.b },
      { x: maxX, y: gdRawLine.w * maxX + gdRawLine.b }
    ];
  }, [gdRawLine, minX, maxX]);

  // Generate coordinates for Analytical Closed-Form line
  const cfLinePoints = useMemo(() => {
    if (!cfRawLine || !Number.isFinite(cfRawLine.w) || !Number.isFinite(cfRawLine.b)) {
      return [];
    }
    return [
      { x: minX, y: cfRawLine.w * minX + cfRawLine.b },
      { x: maxX, y: cfRawLine.w * maxX + cfRawLine.b }
    ];
  }, [cfRawLine, minX, maxX]);

  return (
    <Card
      title="Fitted Line vs. Raw Concrete Data"
      subtitle={`Scatter plot of ${featObj.label} vs. Compressive Strength (1030 samples)`}
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              dataKey="x"
              name={featObj.label}
              domain={[Math.floor(minX * 0.95), Math.ceil(maxX * 1.05)]}
              stroke="#64748b"
              fontSize={12}
              label={{
                value: `${featObj.label} (${featObj.unit})`,
                position: 'insideBottom',
                offset: -12,
                fontSize: 12,
                fill: '#64748b'
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Strength"
              domain={[0, Math.ceil(maxY * 1.05)]}
              stroke="#64748b"
              fontSize={12}
              label={{
                value: 'Strength (MPa)',
                angle: -90,
                position: 'insideLeft',
                offset: 2,
                fontSize: 12,
                fill: '#64748b'
              }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const pt = payload[0].payload;
                  return (
                    <div className="rounded-lg border border-slate-200 bg-white/95 p-2 shadow-md text-xs backdrop-blur">
                      <p className="text-slate-700">
                        {featObj.label}: <span className="font-semibold">{Number(pt.x).toFixed(1)} {featObj.unit}</span>
                      </p>
                      <p className="text-slate-700">
                        Strength: <span className="font-semibold">{Number(pt.y).toFixed(1)} MPa</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Scatter points */}
            <Scatter
              name="Concrete Samples"
              data={scatterPoints}
              fill="#6366f1"
              fillOpacity={0.35}
              isAnimationActive={false}
            />

            {/* Closed Form Baseline Line */}
            {cfLinePoints.length === 2 && (
              <Scatter
                name="Closed-Form Line"
                data={cfLinePoints}
                line={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                shape={() => null}
                isAnimationActive={false}
              />
            )}

            {/* Gradient Descent Fitted Line */}
            {gdLinePoints.length === 2 && (
              <Scatter
                name="GD Fitted Line"
                data={gdLinePoints}
                line={{ stroke: '#4f46e5', strokeWidth: 3 }}
                shape={() => null}
                isAnimationActive={false}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Equation display */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-5 rounded bg-indigo-600 inline-block" />
          <span className="font-semibold text-slate-700">GD Line:</span>
          <span className="font-mono text-indigo-700">
            {gdRawLine && Number.isFinite(gdRawLine.w)
              ? `y = ${gdRawLine.w.toFixed(4)}x + ${gdRawLine.b.toFixed(2)}`
              : 'Diverged / No fit'}
          </span>
        </div>

        {cfRawLine && Number.isFinite(cfRawLine.w) && (
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-5 border-t-2 border-dashed border-emerald-500 inline-block" />
            <span className="font-semibold text-slate-700">Analytical Best-Fit:</span>
            <span className="font-mono text-emerald-700">
              {`y = ${cfRawLine.w.toFixed(4)}x + ${cfRawLine.b.toFixed(2)}`}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

