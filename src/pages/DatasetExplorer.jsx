// src/pages/DatasetExplorer.jsx
// Step 4: Interactive dataset tour. All statistics and metrics are computed dynamically from DATA at runtime.

import React, { useMemo } from 'react';
import Card from '../components/ui/Card.jsx';
import Callout from '../components/ui/Callout.jsx';
import Button from '../components/ui/Button.jsx';
import Chip from '../components/ui/Chip.jsx';
import { DATA, META, FEATURES, correlations, getXY } from '../data/dataset.js';
import { useLab } from '../store/labStore.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

export default function DatasetExplorer({ onNext }) {
  const { feature, setFeature } = useLab();

  // 1. Compute dataset statistics dynamically at runtime (Hard-code none)
  const datasetStats = useMemo(() => {
    const totalRows = DATA.length;
    const totalInputs = FEATURES.length;

    // Count missing / null / undefined / NaN cells across all rows
    let missingCount = 0;
    const allKeys = [...FEATURES.map((f) => f.key), META.targetKey];

    DATA.forEach((row) => {
      allKeys.forEach((k) => {
        const val = row[k];
        if (val === null || val === undefined || Number.isNaN(val) || val === '') {
          missingCount++;
        }
      });
    });

    // Compute min, average, and max for each column
    const computeColSummary = (key) => {
      if (totalRows === 0) return { min: 0, avg: 0, max: 0 };
      let minVal = DATA[0][key];
      let maxVal = DATA[0][key];
      let sum = 0;

      for (let i = 0; i < totalRows; i++) {
        const v = Number(DATA[i][key]);
        if (v < minVal) minVal = v;
        if (v > maxVal) maxVal = v;
        sum += v;
      }

      return {
        min: minVal,
        avg: sum / totalRows,
        max: maxVal
      };
    };

    // Columns summary list (8 features + target strength)
    const columnsSummary = [
      ...FEATURES.map((f) => ({
        key: f.key,
        label: f.label,
        blurb: f.blurb,
        unit: f.unit,
        isTarget: false,
        ...computeColSummary(f.key)
      })),
      {
        key: META.targetKey,
        label: META.targetLabel,
        blurb: 'Ultimate compressive strength measured by crushing the test cylinder.',
        unit: META.targetUnit,
        isTarget: true,
        ...computeColSummary(META.targetKey)
      }
    ];

    return {
      totalRows,
      totalInputs,
      missingCount,
      columnsSummary
    };
  }, []);

  // 2. Compute Pearson correlations sorted by absolute value
  const sortedCorrelations = useMemo(() => {
    const rawCorrs = correlations();
    return rawCorrs
      .map((item) => {
        const feat = FEATURES.find((f) => f.key === item.key);
        return {
          key: item.key,
          label: feat ? feat.label : item.key,
          unit: feat ? feat.unit : '',
          r: item.r,
          absR: Math.abs(item.r)
        };
      })
      .sort((a, b) => b.absR - a.absR);
  }, []);

  // 3. First 8 rows for inspection
  const previewRows = useMemo(() => DATA.slice(0, 8), []);

  // 4. Data for selected feature scatter plot
  const scatterData = useMemo(() => {
    return getXY(feature).map((pt) => ({
      x: Number(pt.x),
      y: Number(pt.y)
    }));
  }, [feature]);

  const activeFeatureObj =
    FEATURES.find((f) => f.key === feature) || FEATURES[0];

  const activeCorrelation = sortedCorrelations.find((c) => c.key === feature);
  const activeR = activeCorrelation ? activeCorrelation.r : 0;

  return (
    <div className="space-y-6">
      {/* 1. 'What are we looking at?' */}
      <Card title="What are we looking at?" subtitle="Concrete is an engineering recipe">
        <p className="text-sm leading-relaxed text-slate-700">
          Concrete is like a recipe. Civil engineers mix cement, water, blast furnace slag, fly ash, sand, and stone, allow the mix to cure over several days, and then crush the hardened cylinder in a hydraulic press to measure its compressive strength. Our goal in this lab is to see how individual ingredients relate to strength. Dataset sourced from the <strong>{META.source}</strong> ({META.title}).
        </p>
      </Card>

      {/* 2. 'The numbers at a glance' */}
      <Card title="The numbers at a glance" subtitle="Dataset dimensions and data health summary">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Sample Count
            </span>
            <span className="font-mono text-2xl font-extrabold text-slate-900 mt-1 block">
              {datasetStats.totalRows}
            </span>
            <span className="text-[11px] text-slate-400">Total mix tests</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Input Features
            </span>
            <span className="font-mono text-2xl font-extrabold text-indigo-600 mt-1 block">
              {datasetStats.totalInputs}
            </span>
            <span className="text-[11px] text-slate-400">Numeric ingredients</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Target Output
            </span>
            <span className="font-mono text-lg font-bold text-teal-700 mt-1.5 block truncate">
              {META.targetLabel}
            </span>
            <span className="text-[11px] text-slate-400">Measured in {META.targetUnit}</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Missing Values
            </span>
            <span className="font-mono text-2xl font-extrabold text-emerald-600 mt-1 block">
              {datasetStats.missingCount}
            </span>
            <span className="text-[11px] text-slate-400">100% complete data</span>
          </div>
        </div>
      </Card>

      {/* 3. 'Meet the columns' */}
      <Card
        title="Meet the columns"
        subtitle="Summary statistics for all 8 ingredient features plus compressive strength"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Plain-English Meaning</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3 text-right">Min</th>
                <th className="py-2.5 px-3 text-right">Average</th>
                <th className="py-2.5 px-3 text-right">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {datasetStats.columnsSummary.map((col) => (
                <tr
                  key={col.key}
                  className={`hover:bg-slate-50/50 transition-colors ${
                    col.isTarget ? 'bg-teal-50/30 font-semibold' : ''
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-900 block">{col.label}</span>
                    <span className="font-mono text-[10px] text-slate-400">{col.key}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs">{col.blurb}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{col.unit}</td>
                  <td className="py-2.5 px-3 font-mono text-right">{col.min.toFixed(1)}</td>
                  <td className="py-2.5 px-3 font-mono text-right text-indigo-700 font-medium">
                    {col.avg.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-right">{col.max.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 4. 'A peek at the rows' */}
      <Card
        title="A peek at the rows"
        subtitle="First 8 concrete mix batches in the dataset (horizontally scrollable)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2 px-2.5">#</th>
                <th className="py-2 px-2.5">Cement</th>
                <th className="py-2 px-2.5">Slag</th>
                <th className="py-2 px-2.5">Fly Ash</th>
                <th className="py-2 px-2.5">Water</th>
                <th className="py-2 px-2.5">Superplast.</th>
                <th className="py-2 px-2.5">Coarse Agg.</th>
                <th className="py-2 px-2.5">Fine Agg.</th>
                <th className="py-2 px-2.5">Age</th>
                <th className="py-2 px-2.5 font-bold text-teal-700">Strength</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {previewRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2 px-2.5 text-slate-400 font-sans">{idx + 1}</td>
                  <td className="py-2 px-2.5">{Number(row.cement).toFixed(1)}</td>
                  <td className="py-2 px-2.5">{Number(row.slag).toFixed(1)}</td>
                  <td className="py-2 px-2.5">{Number(row.flyAsh).toFixed(1)}</td>
                  <td className="py-2 px-2.5">{Number(row.water).toFixed(1)}</td>
                  <td className="py-2 px-2.5">{Number(row.superplasticizer).toFixed(1)}</td>
                  <td className="py-2 px-2.5">{Number(row.coarseAgg).toFixed(1)}</td>
                  <td className="py-2 px-2.5">{Number(row.fineAgg).toFixed(1)}</td>
                  <td className="py-2 px-2.5 font-bold text-slate-700">{row.age}</td>
                  <td className="py-2 px-2.5 font-bold text-teal-700">
                    {Number(row.strength).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. 'Which ingredient tracks strength?' */}
      <Card
        title="Which ingredient tracks strength?"
        subtitle="Pearson correlation ranking and individual ingredient scatter plot"
      >
        <div className="space-y-6">
          <p className="text-xs text-slate-600 leading-relaxed">
            Pearson correlation (r) measures linear association. A value closer to <strong>+1</strong> or <strong>-1</strong> indicates a straighter relationship, while a value near <strong>0</strong> indicates no straight-line pattern.
          </p>

          {/* Bar Chart of Correlations sorted by |r| */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedCorrelations}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  domain={[-0.4, 0.6]}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={11}
                  width={125}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-md text-xs">
                          <p className="font-bold text-slate-900">{d.label}</p>
                          <p
                            className={`font-mono font-semibold ${
                              d.r >= 0 ? 'text-teal-600' : 'text-rose-600'
                            }`}
                          >
                            Pearson r: {d.r > 0 ? `+${d.r.toFixed(4)}` : d.r.toFixed(4)}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            |r| magnitude: {d.absR.toFixed(4)}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="r" name="Correlation (r)" radius={[0, 4, 4, 0]}>
                  {sortedCorrelations.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.r >= 0 ? '#0d9488' : '#e11d48'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dropdown and Scatter Plot */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="feature-select"
                  className="text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Pick an ingredient to inspect:
                </label>
                <select
                  id="feature-select"
                  value={feature}
                  onChange={(e) => setFeature(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                >
                  {FEATURES.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.label} ({f.unit})
                    </option>
                  ))}
                </select>
              </div>

              <Chip
                color={activeR > 0 ? 'teal' : 'rose'}
                className="font-mono text-xs font-bold"
              >
                r = {activeR > 0 ? `+${activeR.toFixed(4)}` : activeR.toFixed(4)}
              </Chip>
            </div>

            {/* Scatter Plot: 1030 semi-transparent dots, no animation */}
            <div className="h-72 w-full rounded-2xl border border-slate-100 bg-slate-50/40 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={activeFeatureObj.label}
                    stroke="#64748b"
                    fontSize={11}
                    label={{
                      value: `${activeFeatureObj.label} (${activeFeatureObj.unit})`,
                      position: 'insideBottom',
                      offset: -12,
                      fontSize: 11,
                      fill: '#64748b'
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Strength"
                    stroke="#64748b"
                    fontSize={11}
                    label={{
                      value: `Strength (${META.targetUnit})`,
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
                              {activeFeatureObj.label}:{' '}
                              <span className="font-semibold text-slate-800">
                                {Number(pt.x).toFixed(1)} {activeFeatureObj.unit}
                              </span>
                            </p>
                            <p className="text-slate-600">
                              Strength:{' '}
                              <span className="font-semibold text-teal-700">
                                {Number(pt.y).toFixed(1)} {META.targetUnit}
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
                    data={scatterData}
                    fill="#4f46e5"
                    fillOpacity={0.35}
                    isAnimationActive={false}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* 6. 'Your pick for the experiment' */}
      <Card
        title="Your pick for the experiment"
        subtitle="Carrying your chosen ingredient into the workbench"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            You currently have <strong>{activeFeatureObj.label}</strong> selected. When you reach Step 6 (Experiment), gradient descent will optimize simple linear regression for this specific ingredient.
          </p>

          <Callout variant="tip">
            We use one ingredient at a time so you can actually see the line and the learning happen.
          </Callout>

          {onNext && (
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={onNext}>
                Proceed to Hiker Simulation (Step 5) →
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
