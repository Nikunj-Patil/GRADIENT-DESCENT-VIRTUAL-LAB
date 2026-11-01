// src/pages/DatasetExplorer.jsx
// Step 4: Interactive dataset tour supporting both Concrete Compressive Strength
// and Energy Efficiency datasets with dynamic target selection.

import React, { useMemo } from 'react';
import Card from '../components/ui/Card.jsx';
import Callout from '../components/ui/Callout.jsx';
import Button from '../components/ui/Button.jsx';
import Chip from '../components/ui/Chip.jsx';
import {
  DATASETS,
  getDataset,
  getXY,
  correlations,
  getDatasetStats
} from '../data/dataset.js';
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
  const {
    datasetKey = 'concrete',
    targetKey = 'strength',
    setDataset,
    setTarget,
    feature,
    setFeature
  } = useLab();

  // Active dataset descriptor
  const activeDatasetKey = datasetKey || 'concrete';
  const activeDs = getDataset(activeDatasetKey);

  // Active target descriptor
  const activeTargetKey = targetKey || activeDs.DEFAULT_TARGET;
  const activeTargetObj =
    activeDs.TARGETS.find((t) => t.key === activeTargetKey) || activeDs.TARGETS[0];

  // Active feature descriptor
  const activeFeatureObj =
    activeDs.FEATURES.find((f) => f.key === feature) || activeDs.FEATURES[0];

  // Dynamic statistics calculated directly from actual JSON records
  const datasetStats = useMemo(() => {
    return getDatasetStats(activeDatasetKey);
  }, [activeDatasetKey]);

  // Dynamic Pearson correlations with the active target, sorted by |r|
  const sortedCorrelations = useMemo(() => {
    const rawCorrs = correlations(activeDatasetKey, activeTargetKey);
    return rawCorrs
      .map((item) => {
        const feat = activeDs.FEATURES.find((f) => f.key === item.key);
        return {
          key: item.key,
          label: feat ? feat.label : item.key,
          unit: feat ? feat.unit : '',
          r: item.r,
          absR: Math.abs(item.r)
        };
      })
      .sort((a, b) => b.absR - a.absR);
  }, [activeDatasetKey, activeTargetKey, activeDs.FEATURES]);

  // First 8 rows of active dataset for inspection
  const previewRows = useMemo(() => activeDs.DATA.slice(0, 8), [activeDs.DATA]);

  // Data for active feature vs active target scatter plot
  const scatterData = useMemo(() => {
    return getXY(activeDatasetKey, activeFeatureObj.key, activeTargetKey);
  }, [activeDatasetKey, activeFeatureObj.key, activeTargetKey]);

  const activeCorrelation = sortedCorrelations.find((c) => c.key === activeFeatureObj.key);
  const activeR = activeCorrelation ? activeCorrelation.r : 0;

  // Metadata descriptors for the two selectable dataset cards
  const concreteMeta = DATASETS.concrete;
  const energyMeta = DATASETS.energy;

  return (
    <div className="space-y-6">
      {/* PART 2: DATASET SELECTION */}
      <Card
        title="Choose Your Dataset"
        subtitle="Select an engineering domain to explore, visualize, and optimize"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Pick a dataset below. Gradient descent works identically across any quantitative engineering problem:
            whether predicting how strong a concrete mix cures or how much thermal energy a building consumes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Concrete Compressive Strength */}
            <button
              type="button"
              onClick={() => setDataset('concrete')}
              className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                activeDatasetKey === 'concrete'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-lg">🏗️</span>
                {activeDatasetKey === 'concrete' ? (
                  <Chip color="indigo" className="text-[11px] font-bold">
                    Active Dataset ✓
                  </Chip>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">Click to select</span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900">{concreteMeta.title}</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Predict concrete strength.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                  {concreteMeta.DATA.length} samples
                </span>
                <span>•</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                  {concreteMeta.FEATURES.length} input features
                </span>
                <span>•</span>
                <span className="text-teal-700 font-semibold">1 target (Strength)</span>
              </div>
            </button>

            {/* Card 2: Energy Efficiency */}
            <button
              type="button"
              onClick={() => setDataset('energy')}
              className={`text-left rounded-2xl border p-4 transition-all cursor-pointer ${
                activeDatasetKey === 'energy'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-lg">⚡</span>
                {activeDatasetKey === 'energy' ? (
                  <Chip color="indigo" className="text-[11px] font-bold">
                    Active Dataset ✓
                  </Chip>
                ) : (
                  <span className="text-xs font-semibold text-slate-400">Click to select</span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900">{energyMeta.title}</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                Predict heating or cooling load.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-500">
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                  {energyMeta.DATA.length} samples
                </span>
                <span>•</span>
                <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">
                  {energyMeta.FEATURES.length} input features
                </span>
                <span>•</span>
                <span className="text-teal-700 font-semibold">2 targets (Heating / Cooling)</span>
              </div>
            </button>
          </div>
        </div>
      </Card>

      {/* PART 3: TARGET SELECTION (Only when Energy Efficiency is selected) */}
      {activeDatasetKey === 'energy' && (
        <Card
          title="What would you like to predict?"
          subtitle="Energy Efficiency exposes two distinct thermal target metrics"
        >
          <div className="space-y-3">
            <p className="text-xs text-slate-600">
              Select which building thermal energy requirement you want your regression line to predict:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {energyMeta.TARGETS.map((t) => {
                const isSelected = activeTargetKey === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => setTarget(t.key)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{t.label}</span>
                      {isSelected ? (
                        <Chip color="teal" className="text-[10px] font-bold">
                          Selected Target ✓
                        </Chip>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">Click to select</span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-600 leading-tight">
                      {t.description}
                    </p>
                    <span className="mt-2 inline-block font-mono text-[10px] font-bold text-teal-800">
                      Unit: {t.unit}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* 1. Dataset Introduction */}
      <Card title="What are we looking at?" subtitle={activeDs.title}>
        <p className="text-sm leading-relaxed text-slate-700">
          {activeDatasetKey === 'concrete' ? (
            <>
              Concrete is like a recipe. Civil engineers mix cement, water, blast furnace slag, fly ash, sand,
              and stone, allow the mix to cure over several days, and then crush the hardened cylinder in a
              hydraulic press to measure its compressive strength. Our goal in this lab is to see how individual
              ingredients relate to strength. Dataset sourced from the{' '}
              <strong>{activeDs.source}</strong> ({activeDs.title}).
            </>
          ) : (
            <>
              Energy efficiency measures how building architectural geometry dictates thermal performance.
              Simulated across 768 residential building shapes with varied surface areas, heights, roof
              dimensions, and window glazing, this dataset allows engineers to optimize heating and cooling
              loads before construction. Our goal in this lab is to see how building dimensions relate to energy
              consumption. Dataset sourced from the <strong>{activeDs.source}</strong> ({activeDs.title}).
            </>
          )}
        </p>
      </Card>

      {/* 2. The numbers at a glance */}
      <Card title="The numbers at a glance" subtitle="Dataset dimensions and data health summary">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Sample Count
            </span>
            <span className="font-mono text-2xl font-extrabold text-slate-900 mt-1 block">
              {datasetStats.totalRows}
            </span>
            <span className="text-[11px] text-slate-400">
              {activeDatasetKey === 'concrete' ? 'Total mix tests' : 'Building shapes'}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Input Features
            </span>
            <span className="font-mono text-2xl font-extrabold text-indigo-600 mt-1 block">
              {datasetStats.totalInputs}
            </span>
            <span className="text-[11px] text-slate-400">Numeric parameters</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
              Target Output
            </span>
            <span className="font-mono text-lg font-bold text-teal-700 mt-1.5 block truncate">
              {activeTargetObj.label}
            </span>
            <span className="text-[11px] text-slate-400">Measured in {activeTargetObj.unit}</span>
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

      {/* 3. Meet the columns */}
      <Card
        title="Meet the columns"
        subtitle={`Summary statistics for all ${datasetStats.totalInputs} features plus ${activeTargetObj.label}`}
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

      {/* 4. A peek at the rows */}
      <Card
        title="A peek at the rows"
        subtitle={`First 8 samples in the ${activeDs.title} dataset (horizontally scrollable)`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-2 px-2.5">#</th>
                {activeDs.FEATURES.map((f) => (
                  <th key={f.key} className="py-2 px-2.5 whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="py-2 px-2.5 font-bold text-teal-700 whitespace-nowrap">
                  {activeTargetObj.label}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {previewRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2 px-2.5 text-slate-400 font-sans">{idx + 1}</td>
                  {activeDs.FEATURES.map((f) => (
                    <td key={f.key} className="py-2 px-2.5 whitespace-nowrap">
                      {Number(row[f.key]).toFixed(1)}
                    </td>
                  ))}
                  <td className="py-2 px-2.5 font-bold text-teal-700 whitespace-nowrap">
                    {Number(row[activeTargetKey]).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 5. Correlation & Scatter Plot */}
      <Card
        title={`Which ${activeDatasetKey === 'concrete' ? 'ingredient' : 'feature'} tracks ${activeTargetObj.label.toLowerCase()}?`}
        subtitle={`Pearson correlation ranking and individual feature scatter plot for ${activeTargetObj.label}`}
      >
        <div className="space-y-6">
          <p className="text-xs text-slate-600 leading-relaxed">
            Pearson correlation (r) measures linear association. A value closer to <strong>+1</strong> or <strong>-1</strong> indicates
            a straighter relationship, while a value near <strong>0</strong> indicates no straight-line pattern.
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
                  domain={[-1, 1]}
                  ticks={[-1.0, -0.5, 0.0, 0.5, 1.0]}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  stroke="#64748b"
                  fontSize={11}
                  width={140}
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
                  Pick a feature to inspect:
                </label>
                <select
                  id="feature-select"
                  value={activeFeatureObj.key}
                  onChange={(e) => setFeature(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                >
                  {activeDs.FEATURES.map((f) => (
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

            {/* Scatter Plot: dots with zero animation */}
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
                    name={activeTargetObj.label}
                    stroke="#64748b"
                    fontSize={11}
                    label={{
                      value: `${activeTargetObj.label} (${activeTargetObj.unit})`,
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
                              {activeTargetObj.label}:{' '}
                              <span className="font-semibold text-teal-700">
                                {Number(pt.y).toFixed(1)} {activeTargetObj.unit}
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

      {/* 6. Your pick for the experiment */}
      <Card
        title="Your pick for the experiment"
        subtitle="Carrying your chosen dataset and feature into the workbench"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            You currently have <strong>{activeFeatureObj.label}</strong> selected to predict{' '}
            <strong>{activeTargetObj.label}</strong> ({activeTargetObj.unit}) in the{' '}
            <strong>{activeDs.title}</strong> dataset. When you reach Step 6 (Experiment),
            gradient descent will optimize simple linear regression for this specific pair.
          </p>

          <Callout variant="tip">
            We optimize one input feature at a time so you can clearly visualize the fitted line and watch the gradient descent steps converge downhill.
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
