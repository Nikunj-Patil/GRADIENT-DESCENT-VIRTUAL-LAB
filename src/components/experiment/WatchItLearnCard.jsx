// src/components/experiment/WatchItLearnCard.jsx
// Section 3: 'Watch it learn' - Side-by-side scatter + line & loss chart with playback replay slider.

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Chip from '../ui/Chip.jsx';
import { FEATURES, META } from '../../data/dataset.js';
import { toOriginalScale } from '../../lib/gd.js';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot
} from 'recharts';

export default function WatchItLearnCard({
  rawXY,
  feature,
  runResult,
  closedFormLoss
}) {
  const featureObj = FEATURES.find((f) => f.key === feature) || FEATURES[0];

  const history = runResult?.history || [];
  const final = runResult?.final;
  const isDiverged = final?.diverged || false;

  // Playback iteration index (0 to history.length - 1)
  const [playbackIter, setPlaybackIter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  // Initialize playback to final iteration when a new run completes
  useEffect(() => {
    if (history.length > 0) {
      setPlaybackIter(history.length - 1);
      setIsPlaying(false);
    }
  }, [runResult]);

  // Animation player loop (~100ms per step for smooth visual motion)
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setTimeout(() => {
        setPlaybackIter((prev) => {
          if (prev >= history.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100);
    } else {
      clearTimeout(playTimerRef.current);
    }

    return () => clearTimeout(playTimerRef.current);
  }, [isPlaying, playbackIter, history.length]);

  // Compute min/max for regression scatter domain
  const { minX, maxX, minY, maxY } = useMemo(() => {
    if (!rawXY.length) return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    let mx = rawXY[0].x, Mx = rawXY[0].x;
    let my = rawXY[0].y, My = rawXY[0].y;
    for (let i = 1; i < rawXY.length; i++) {
      if (rawXY[i].x < mx) mx = rawXY[i].x;
      if (rawXY[i].x > Mx) Mx = rawXY[i].x;
      if (rawXY[i].y < my) my = rawXY[i].y;
      if (rawXY[i].y > My) My = rawXY[i].y;
    }
    return { minX: mx, maxX: Mx, minY: my, maxY: My };
  }, [rawXY]);

  // Current iteration frame data
  const currentFrame = history[playbackIter] || history[0];

  // Fitted regression line in original physical units at current playback iteration
  const fittedLineCoords = useMemo(() => {
    if (!currentFrame || !Number.isFinite(currentFrame.w) || !Number.isFinite(currentFrame.b)) {
      return [];
    }
    const rawLine = toOriginalScale(rawXY, currentFrame.w, currentFrame.b);
    if (!Number.isFinite(rawLine.w) || !Number.isFinite(rawLine.b)) {
      return [];
    }
    return [
      { x: minX, y: rawLine.w * minX + rawLine.b },
      { x: maxX, y: rawLine.w * maxX + rawLine.b }
    ];
  }, [rawXY, currentFrame, minX, maxX]);

  // Formatted data for loss curve (capped for diverged runs so chart remains clean)
  const lossChartData = useMemo(() => {
    if (!history.length) return [];
    const initialL = history[0].loss || 1;
    const maxAllowedPlot = Math.max(10, initialL * 5);

    return history.map((pt) => {
      const isHuge = !Number.isFinite(pt.loss) || pt.loss > maxAllowedPlot;
      return {
        iter: pt.iter,
        loss: isHuge ? maxAllowedPlot : Number(pt.loss.toFixed(4)),
        rawLoss: pt.loss,
        isCapped: isHuge
      };
    });
  }, [history]);

  if (!runResult) {
    return (
      <Card title="Watch it learn" subtitle="Animated regression line and loss progression">
        <div className="py-12 text-center text-slate-500 font-medium">
          Set your step size above and click &quot;Run Gradient Descent&quot; to watch the model learn!
        </div>
      </Card>
    );
  }

  const currentLossVal = currentFrame?.loss;
  const currentLossDisplay = Number.isFinite(currentLossVal)
    ? currentLossVal.toFixed(6)
    : 'Exploded (Diverged)';

  return (
    <Card
      title="Watch it learn"
      subtitle={`Visualizing optimization at iteration ${playbackIter} of ${history.length - 1}`}
    >
      <div className="space-y-5">
        {/* Playback Controls & Scrubber */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={isPlaying ? 'ghost' : 'primary'}
                onClick={() => {
                  if (playbackIter >= history.length - 1) {
                    setPlaybackIter(0);
                  }
                  setIsPlaying(!isPlaying);
                }}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play Replay'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsPlaying(false);
                  setPlaybackIter(0);
                }}
              >
                ⏮ Start
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsPlaying(false);
                  setPlaybackIter(history.length - 1);
                }}
              >
                ⏭ End
              </Button>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-500 font-sans">Iteration:</span>
              <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {playbackIter} / {history.length - 1}
              </span>
              <span className="text-slate-500 font-sans ml-2">Loss:</span>
              <span className="font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {currentLossDisplay}
              </span>
            </div>
          </div>

          {/* Scrubber slider */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-slate-400">0</span>
            <input
              type="range"
              aria-label="Playback iteration scrubber"
              min="0"
              max={history.length - 1}
              value={playbackIter}
              onChange={(e) => {
                setIsPlaying(false);
                setPlaybackIter(parseInt(e.target.value, 10));
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <span className="text-[11px] font-mono text-slate-400">
              {history.length - 1}
            </span>
          </div>
        </div>

        {/* Divergence Notice */}
        {isDiverged && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 text-xs text-rose-900 leading-relaxed">
            <strong className="block font-bold text-rose-950 mb-0.5">
              ⚠️ Divergence Stopped Early:
            </strong>
            The error grew exponentially larger with each step until it exceeded numerical bounds. We charted only the {history.length - 1} iterations recorded before the run was halted.
          </div>
        )}

        {/* Side-by-Side Visualizations (Stacked on mobile) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Scatter Plot + Moving Fitted Line */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Fitted Line Moving Toward Data
              </h4>
              <Chip color="indigo" className="text-[11px]">
                Iter {playbackIter}
              </Chip>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 15, bottom: 20, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name={featureObj.label}
                    domain={[Math.floor(minX * 0.95), Math.ceil(maxX * 1.05)]}
                    stroke="#64748b"
                    fontSize={11}
                    label={{
                      value: `${featureObj.label} (${featureObj.unit})`,
                      position: 'insideBottom',
                      offset: -10,
                      fontSize: 10,
                      fill: '#64748b'
                    }}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Strength"
                    domain={[0, Math.ceil(maxY * 1.05)]}
                    stroke="#64748b"
                    fontSize={11}
                    label={{
                      value: `Strength (${META.targetUnit})`,
                      angle: -90,
                      position: 'insideLeft',
                      offset: 5,
                      fontSize: 10,
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
                              {featureObj.label}: {Number(pt.x).toFixed(1)} {featureObj.unit}
                            </p>
                            <p className="text-slate-600">
                              Strength: {Number(pt.y).toFixed(1)} {META.targetUnit}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* Data Points */}
                  <Scatter
                    name="Samples"
                    data={rawXY}
                    fill="#6366f1"
                    fillOpacity={0.3}
                    isAnimationActive={false}
                  />
                  {/* Fitted Line at current iteration */}
                  {fittedLineCoords.length === 2 && (
                    <Scatter
                      name="Fitted Line"
                      data={fittedLineCoords}
                      line={{ stroke: '#0d9488', strokeWidth: 3 }}
                      shape={() => null}
                      isAnimationActive={false}
                    />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Loss-vs-Iteration Chart with Marker */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Loss vs. Iteration Curve
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                MSE in standardised units
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={lossChartData}
                  margin={{ top: 10, right: 15, bottom: 20, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="iter"
                    stroke="#64748b"
                    fontSize={11}
                    label={{
                      value: 'Iteration (Step)',
                      position: 'insideBottom',
                      offset: -10,
                      fontSize: 10,
                      fill: '#64748b'
                    }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    domain={['auto', 'auto']}
                    label={{
                      value: 'MSE Loss',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 5,
                      fontSize: 10,
                      fill: '#64748b'
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-md">
                            <p className="font-bold text-slate-900">Step {pt.iter}</p>
                            <p className="text-indigo-600 font-mono">
                              Loss: {Number.isFinite(pt.rawLoss) ? pt.rawLoss.toFixed(6) : 'Exploded'}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {/* The Loss Line */}
                  <Line
                    type="monotone"
                    dataKey="loss"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  {/* Sliding Playback Marker Dot */}
                  {lossChartData[playbackIter] && (
                    <ReferenceDot
                      x={lossChartData[playbackIter].iter}
                      y={lossChartData[playbackIter].loss}
                      r={6}
                      fill="#0d9488"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

