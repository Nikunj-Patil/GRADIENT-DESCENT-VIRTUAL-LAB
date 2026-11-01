// src/pages/HikerSim.jsx
// Step 5: Interactive 1D gradient descent playground. Self-contained (no imports from gd.js).

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Card from '../components/ui/Card.jsx';
import Callout from '../components/ui/Callout.jsx';
import Button from '../components/ui/Button.jsx';
import Chip from '../components/ui/Chip.jsx';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

export default function HikerSim({ onNext }) {
  // Cost function J(w) = (w - 3)^2 + 1
  const costFn = (w) => (w - 3) ** 2 + 1;
  // Gradient dJ/dw = 2(w - 3)
  const gradFn = (w) => 2 * (w - 3);

  const initialW = -4;
  const initialCost = costFn(initialW); // 50

  // Playground state
  const [w, setW] = useState(initialW);
  const [lr, setLr] = useState(0.3); // Default "Just right"
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [history, setHistory] = useState([
    {
      step: 0,
      w: initialW,
      cost: initialCost,
      slope: gradFn(initialW)
    }
  ]);
  const [stopMessage, setStopMessage] = useState(null);

  const timerRef = useRef(null);

  // Derived mathematical telemetry
  const currentCost = costFn(w);
  const currentSlope = gradFn(w);
  const nextStepSize = lr * currentSlope;
  const proposedNextW = w - nextStepSize;

  // Derive dynamic status from numbers (not hardcoded per preset)
  const dynamicStatus = useMemo(() => {
    if (history.length === 0) return { label: 'Ready', color: 'indigo' };

    const last = history[history.length - 1];
    const distToMin = Math.abs(w - 3);

    // Check divergence: cost exploded or distance from 3 expanded significantly
    if (!Number.isFinite(currentCost) || currentCost > 1500 || distToMin > 35) {
      return { label: 'Diverging!', color: 'rose' };
    }

    if (history.length >= 2) {
      const prev = history[history.length - 2];
      const prevDist = Math.abs(prev.w - 3);
      if (distToMin > prevDist + 0.1) {
        return { label: 'Diverging!', color: 'rose' };
      }

      // Check if parameter alternated across the minimum (w=3)
      const crossedValley = (w - 3) * (prev.w - 3) < -1e-6;
      if (crossedValley) {
        return { label: 'Zig-zagging but getting there', color: 'amber' };
      }
    }

    // Check if crawling slowly
    if (distToMin > 0.8) {
      const stepMagnitude = Math.abs(nextStepSize);
      if (stepMagnitude < 0.25 || lr < 0.1) {
        return { label: 'Crawling slowly', color: 'amber' };
      }
    }

    return { label: 'Smooth descent', color: 'teal' };
  }, [w, currentCost, nextStepSize, lr, history]);

  // Execute a single gradient descent update
  const takeStep = () => {
    if (stopMessage) return;

    const slope = gradFn(w);
    const stepTaken = -lr * slope;
    const nextW = w + stepTaken;
    const nextCost = costFn(nextW);
    const newStepCount = stepCount + 1;

    const newEntry = {
      step: newStepCount,
      w: nextW,
      cost: nextCost,
      slope: gradFn(nextW)
    };

    setW(nextW);
    setStepCount(newStepCount);
    setHistory((prev) => [...prev, newEntry]);

    // Check convergence (|w - 3| is tiny or cost difference is tiny)
    if (Math.abs(nextW - 3) < 0.05 || Math.abs(nextCost - currentCost) < 1e-4) {
      setIsRunning(false);
      setStopMessage(
        newStepCount <= 10
          ? `🏆 Challenge Complete! Reached the bottom in ${newStepCount} steps.`
          : `🎉 Converged! Reached the valley bottom in ${newStepCount} steps.`
      );
      return;
    }

    // Check divergence
    if (!Number.isFinite(nextCost) || nextCost > 2000 || Math.abs(nextW - 3) > 40) {
      setIsRunning(false);
      setStopMessage('⚠️ Diverged! The steps were so large the ball flew off the mountain.');
    }
  };

  // Run auto-animation (about 400ms apart)
  useEffect(() => {
    if (isRunning && !stopMessage) {
      timerRef.current = setTimeout(() => {
        takeStep();
      }, 400);
    } else {
      clearTimeout(timerRef.current);
    }

    return () => clearTimeout(timerRef.current);
  });

  // Reset simulation back to initial state
  const handleReset = () => {
    setIsRunning(false);
    clearTimeout(timerRef.current);
    setW(initialW);
    setStepCount(0);
    setStopMessage(null);
    setHistory([
      {
        step: 0,
        w: initialW,
        cost: initialCost,
        slope: gradFn(initialW)
      }
    ]);
  };

  // Set learning rate preset and reset
  const handleSelectPreset = (newLr) => {
    setLr(newLr);
    handleReset();
  };

  // SVG Parabola Geometry Mapping
  // Domain: w in [-6, 12], Cost in [0, 65]
  const svgWidth = 600;
  const svgHeight = 240;
  const padX = 40;
  const padY = 25;

  const wMin = -6;
  const wMax = 12;
  const costMin = 0;
  const costMax = 65;

  const toSvgX = (valW) =>
    padX + ((valW - wMin) / (wMax - wMin)) * (svgWidth - 2 * padX);

  const toSvgY = (valCost) =>
    svgHeight - padY - ((valCost - costMin) / (costMax - costMin)) * (svgHeight - 2 * padY);

  // Generate smooth SVG curve path for J(w) = (w - 3)^2 + 1
  const curvePoints = [];
  const resolution = 70;
  for (let i = 0; i <= resolution; i++) {
    const ptW = wMin + (i / resolution) * (wMax - wMin);
    const ptCost = costFn(ptW);
    curvePoints.push(
      `${i === 0 ? 'M' : 'L'} ${toSvgX(ptW).toFixed(1)} ${toSvgY(ptCost).toFixed(1)}`
    );
  }
  const curvePath = curvePoints.join(' ');

  // Clamped coordinates for ball and tangent line
  const clampedW = Math.max(wMin - 0.5, Math.min(wMax + 0.5, w));
  const ballX = toSvgX(clampedW);
  const ballY = toSvgY(Math.min(costMax, Math.max(0, currentCost)));

  // Tangent line geometry
  // Slope in SVG coordinates
  const tangentSpan = 1.6;
  const tanW1 = clampedW - tangentSpan;
  const tanW2 = clampedW + tangentSpan;
  const tanC1 = currentCost + currentSlope * (tanW1 - clampedW);
  const tanC2 = currentCost + currentSlope * (tanW2 - clampedW);

  // Proposed next step arrow
  const nextClampedW = Math.max(wMin - 0.5, Math.min(wMax + 0.5, proposedNextW));
  const nextX = toSvgX(nextClampedW);
  const nextY = toSvgY(Math.min(costMax, Math.max(0, costFn(nextClampedW))));

  // Presets configuration
  const presets = [
    { label: 'Tiny (0.05)', val: 0.05 },
    { label: 'Just right (0.3)', val: 0.3 },
    { label: 'Too big (0.95)', val: 0.95 },
    { label: 'Oops (1.05)', val: 1.05 }
  ];

  return (
    <div className="space-y-6">
      {/* Challenge Callout */}
      <Callout variant="idea" title="Challenge">
        Can you reach the bottom in under 10 steps? Try adjusting the learning rate slider or picking a preset to find the fastest stable path to the valley floor!
      </Callout>

      {/* Main Simulation Card */}
      <Card
        title="Interactive 1D Gradient Descent Playground"
        subtitle="Cost function: J(w) = (w - 3)² + 1 | Minimum at w = 3 where Cost = 1"
        action={
          <Chip color={dynamicStatus.color} className="font-semibold text-xs">
            {dynamicStatus.label}
          </Chip>
        }
      >
        <div className="space-y-5">
          {/* Controls: Presets and Slider */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase text-slate-500 mr-1">
                Presets:
              </span>
              {presets.map((p) => {
                const isSelected = Math.abs(lr - p.val) < 0.001;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSelectPreset(p.val)}
                    className={`rounded-xl px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Slider */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label htmlFor="lr-slider" className="text-xs font-bold uppercase text-slate-500 whitespace-nowrap">
                Learning Rate (α):
              </label>
              <input
                id="lr-slider"
                type="range"
                min="0.01"
                max="1.1"
                step="0.01"
                value={lr}
                onChange={(e) => {
                  setLr(parseFloat(e.target.value));
                  handleReset();
                }}
                className="w-28 sm:w-36 accent-indigo-600 cursor-pointer"
              />
              <span className="font-mono text-xs font-bold text-indigo-700 w-10 text-right">
                {lr.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons: Step, Run, Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                onClick={takeStep}
                disabled={isRunning || !!stopMessage}
              >
                👣 Step (One Update)
              </Button>
              <Button
                variant={isRunning ? 'ghost' : 'primary'}
                onClick={() => setIsRunning(!isRunning)}
                disabled={!!stopMessage}
              >
                {isRunning ? '⏸ Pause' : '▶ Run (Animate)'}
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                ↺ Reset
              </Button>
            </div>

            {stopMessage && (
              <div className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-xl px-3 py-1.5 animate-fade-in">
                {stopMessage}
              </div>
            )}
          </div>

          {/* Interactive SVG Canvas */}
          <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50/50 via-white to-teal-50/30 p-2 overflow-hidden shadow-inner">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-auto select-none max-h-72"
            >
              {/* Grid line at Cost = 1 (Minimum) */}
              <line
                x1={padX}
                y1={toSvgY(1)}
                x2={svgWidth - padX}
                y2={toSvgY(1)}
                stroke="#0d9488"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              {/* Vertical line at target w = 3 */}
              <line
                x1={toSvgX(3)}
                y1={padY}
                x2={toSvgX(3)}
                y2={svgHeight - padY}
                stroke="#0d9488"
                strokeDasharray="4 4"
                strokeWidth="1.5"
              />
              <text
                x={toSvgX(3)}
                y={padY + 12}
                textAnchor="middle"
                fill="#0d9488"
                fontSize="10"
                fontWeight="bold"
              >
                Minimum (w = 3, Cost = 1)
              </text>

              {/* The Parabolic Cost Curve */}
              <path
                d={curvePath}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Valley floor target dot */}
              <circle cx={toSvgX(3)} cy={toSvgY(1)} r="4" fill="#0d9488" />

              {/* Tangent line at the current ball position */}
              {currentCost < 62 && (
                <line
                  x1={toSvgX(tanW1)}
                  y1={toSvgY(Math.min(costMax, Math.max(costMin, tanC1)))}
                  x2={toSvgX(tanW2)}
                  y2={toSvgY(Math.min(costMax, Math.max(costMin, tanC2)))}
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Step Arrow showing direction of the step */}
              {currentCost < 62 && !stopMessage && (
                <g>
                  <line
                    x1={ballX}
                    y1={ballY}
                    x2={nextX}
                    y2={nextY}
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    strokeDasharray="3 2"
                  />
                  <circle cx={nextX} cy={nextY} r="3" fill="#f59e0b" />
                </g>
              )}

              {/* The Ball */}
              {currentCost < 65 ? (
                <g transform={`translate(${ballX}, ${ballY})`}>
                  <circle cx="0" cy="0" r="8" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" shadow="drop-shadow" />
                  <circle cx="0" cy="0" r="3" fill="#ffffff" />
                  <text
                    x="0"
                    y="-12"
                    textAnchor="middle"
                    fill="#1e293b"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    w = {w.toFixed(2)}
                  </text>
                </g>
              ) : (
                <text
                  x={svgWidth / 2}
                  y={svgHeight / 2}
                  textAnchor="middle"
                  fill="#e11d48"
                  fontSize="14"
                  fontWeight="bold"
                >
                  ⚠️ Ball exploded past mountain boundaries!
                </text>
              )}
            </svg>
          </div>

          {/* Live Plain-Language Readout */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 text-xs font-mono">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="font-sans text-slate-500 block text-[11px]">Current w:</span>
              <span className="font-bold text-slate-900 text-sm">{w.toFixed(4)}</span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="font-sans text-slate-500 block text-[11px]">Slope (dJ/dw):</span>
              <span
                className={`font-bold text-sm ${
                  Math.abs(currentSlope) < 0.1 ? 'text-teal-600' : 'text-slate-800'
                }`}
              >
                {currentSlope.toFixed(4)}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="font-sans text-slate-500 block text-[11px]">Step Size (lr × slope):</span>
              <span className="font-bold text-indigo-700 text-sm">
                {nextStepSize >= 0 ? `+${nextStepSize.toFixed(4)}` : nextStepSize.toFixed(4)}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <span className="font-sans text-slate-500 block text-[11px]">Current Cost J(w):</span>
              <span className="font-bold text-slate-900 text-sm">
                {currentCost < 1000 ? currentCost.toFixed(4) : 'Exploded'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3 col-span-2 sm:col-span-1">
              <span className="font-sans text-slate-500 block text-[11px]">Steps Taken:</span>
              <span className="font-bold text-teal-700 text-sm">{stepCount}</span>
            </div>
          </div>

          {/* Mini Cost-vs-Step Convergence Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Convergence Progression: Cost vs. Step
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                {history.length} data point{history.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={history.map((h) => ({
                    step: h.step,
                    cost: Math.min(60, Number(h.cost.toFixed(3))),
                    rawCost: h.cost,
                    w: Number(h.w.toFixed(2))
                  }))}
                  margin={{ top: 5, right: 15, bottom: 5, left: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="step"
                    stroke="#94a3b8"
                    fontSize={10}
                    label={{ value: 'Step', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#94a3b8' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    domain={[0, 'auto']}
                    label={{ value: 'Cost', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fill: '#94a3b8' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-200 bg-white p-2 text-xs shadow-md">
                            <p className="font-bold text-slate-900">Step {pt.step}</p>
                            <p className="text-indigo-600 font-mono">Cost: {pt.rawCost.toFixed(4)}</p>
                            <p className="text-slate-500 font-mono">w: {pt.w}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cost"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#0d9488' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
