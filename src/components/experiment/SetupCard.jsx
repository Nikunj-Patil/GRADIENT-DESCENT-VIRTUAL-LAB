// src/components/experiment/SetupCard.jsx
// Section 1: 'Your setup' - Single-line target summary, feature selector, and raw scatter plot.

import React, { useMemo } from 'react';
import Card from '../ui/Card.jsx';
import { getDataset, getXY } from '../../data/dataset.js';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export default function SetupCard({
  datasetKey = 'concrete',
  targetKey = 'strength',
  feature,
  onFeatureChange,
  rawXY
}) {
  const activeDs = getDataset(datasetKey);
  const targetObj =
    activeDs.TARGETS.find((t) => t.key === targetKey) || activeDs.TARGETS[0];
  const featureObj =
    activeDs.FEATURES.find((f) => f.key === feature) || activeDs.FEATURES[0];

  const rawData = useMemo(() => {
    if (rawXY && rawXY.length > 0) {
      return rawXY.map((pt) => ({
        x: Number(pt.x),
        y: Number(pt.y)
      }));
    }
    return getXY(datasetKey, feature, targetKey).map((pt) => ({
      x: Number(pt.x),
      y: Number(pt.y)
    }));
  }, [rawXY, datasetKey, feature, targetKey]);

  const targetUnitDisplay = targetObj.unit ? `(${targetObj.unit})` : '';
  const featureUnitDisplay = featureObj.unit ? `(${featureObj.unit})` : '';

  return (
    <Card
      title="Your setup"
      subtitle={`${activeDs.title}: ${featureObj.label} vs ${targetObj.label}`}
    >
      <div className="space-y-4">
        {/* Single line description & selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <p className="text-sm font-medium text-slate-700">
            Predicting {targetObj.label} {targetUnitDisplay} from{' '}
            <span className="font-bold text-indigo-700">
              {featureObj.label} {featureUnitDisplay}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <label
              htmlFor="exp-feature-select"
              className="text-xs font-bold uppercase text-slate-500 whitespace-nowrap"
            >
              Change input:
            </label>
            <select
              id="exp-feature-select"
              value={feature}
              onChange={(e) => onFeatureChange(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            >
              {activeDs.FEATURES.map((f) => (
                <option key={f.key} value={f.key}>
                  {f.label} {f.unit ? `(${f.unit})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scatter plot of getXY with small dots and no animation */}
        <div className="h-64 w-full rounded-2xl border border-slate-100 bg-slate-50/40 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                dataKey="x"
                name={featureObj.label}
                stroke="#64748b"
                fontSize={11}
                label={{
                  value: `${featureObj.label} ${featureUnitDisplay}`.trim(),
                  position: 'insideBottom',
                  offset: -12,
                  fontSize: 11,
                  fill: '#64748b'
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                name={targetObj.label}
                stroke="#64748b"
                fontSize={11}
                label={{
                  value: `${targetObj.label} ${targetUnitDisplay}`.trim(),
                  angle: -90,
                  position: 'insideLeft',
                  offset: 2,
                  fontSize: 11,
                  fill: '#64748b'
                }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const pt = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-2 text-xs shadow-md">
                        <p className="text-slate-600">
                          {featureObj.label}:{' '}
                          <span className="font-semibold text-slate-900">
                            {Number(pt.x).toFixed(1)} {featureObj.unit}
                          </span>
                        </p>
                        <p className="text-slate-600">
                          {targetObj.label}:{' '}
                          <span className="font-semibold text-indigo-700">
                            {Number(pt.y).toFixed(1)} {targetObj.unit}
                          </span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter
                name="Samples"
                data={rawData}
                fill="#4f46e5"
                fillOpacity={0.35}
                isAnimationActive={false}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

