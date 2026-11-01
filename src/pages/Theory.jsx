// src/pages/Theory.jsx
// Step 3: Five-card conceptual theory stepper explaining gradient descent fundamentals.

import React, { useState } from 'react';
import Card from '../components/ui/Card.jsx';
import Callout from '../components/ui/Callout.jsx';
import Button from '../components/ui/Button.jsx';
import Chip from '../components/ui/Chip.jsx';

export default function Theory({ onNext }) {
  const [activeCard, setActiveCard] = useState(0);

  const cards = [
    // Card 1: The model and the error
    {
      title: '1. The Model and the Error',
      chip: 'Model & Loss',
      text: 'We fit a straight line y = w · x + b through our data. For every sample, the vertical gap between the prediction and the true value is the error. Mean Squared Error (MSE) squares every gap and averages them across all samples to produce a single cost score.',
      whyItMatters:
        'Squaring guarantees errors never cancel out and penalises larger misses more heavily, creating a smooth mathematical surface to minimise.',
      illustration: (
        <svg viewBox="0 0 240 120" className="w-full max-w-[260px] h-auto select-none mx-auto">
          {/* Axes */}
          <line x1="25" y1="105" x2="225" y2="105" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="25" y1="15" x2="25" y2="105" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* Fitted Line */}
          <line x1="35" y1="85" x2="215" y2="25" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
          {/* Data Points and Error Dashed Lines */}
          {[
            { x: 60, y: 55, lineY: 77 },
            { x: 105, y: 75, lineY: 62 },
            { x: 150, y: 35, lineY: 47 },
            { x: 195, y: 40, lineY: 32 }
          ].map((pt, i) => (
            <g key={i}>
              <line
                x1={pt.x}
                y1={pt.y}
                x2={pt.x}
                y2={pt.lineY}
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
              <circle cx={pt.x} cy={pt.y} r="3.5" fill="#0d9488" />
            </g>
          ))}
          <text x="140" y="98" fill="#64748b" fontSize="9" fontFamily="sans-serif">
            Input Feature (x)
          </text>
        </svg>
      )
    },

    // Card 2: The cost bowl
    {
      title: '2. The Cost Bowl',
      chip: 'Error Surface',
      text: 'When we plot MSE cost against the slope parameter w, we get a smooth, symmetrical quadratic bowl. The lowest point at the bottom of the valley represents the optimal weight, where the model\'s prediction error is as small as mathematically possible.',
      whyItMatters:
        'Because the cost bowl has exactly one global bottom with no deceptive local traps, walking downhill always leads directly to the best-fitting line.',
      illustration: (
        <svg viewBox="0 0 240 120" className="w-full max-w-[260px] h-auto select-none mx-auto">
          {/* Bowl Parabola */}
          <path
            d="M 30 25 Q 120 125 210 25"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Valley Floor Minimum Star/Dot */}
          <circle cx="120" cy="75" r="5" fill="#0d9488" />
          <line x1="120" y1="75" x2="120" y2="105" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
          <text x="120" y="115" textAnchor="middle" fill="#0d9488" fontSize="9" fontWeight="bold">
            Valley Bottom (Minimum Cost)
          </text>
          <text x="35" y="18" fill="#64748b" fontSize="8">
            High Cost
          </text>
          <text x="205" y="18" fill="#64748b" fontSize="8" textAnchor="end">
            High Cost
          </text>
        </svg>
      )
    },

    // Card 3: The gradient is a slope compass
    {
      title: '3. The Gradient is a Slope Compass',
      chip: 'Gradient Compass',
      text: 'The gradient measures the steepness and direction of the slope under your boots. A positive slope tilts upward to the right, telling you to step left. A negative slope tilts downward to the right, telling you to step right. It is your downhill compass.',
      whyItMatters:
        'The gradient mathematically points uphill towards steepest ascent. Stepping in the negative gradient direction guarantees you always walk downhill toward lower cost.',
      illustration: (
        <svg viewBox="0 0 240 120" className="w-full max-w-[260px] h-auto select-none mx-auto">
          {/* Curve */}
          <path d="M 30 30 Q 120 120 210 30" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 3" />
          {/* Left slope: negative slope, step right */}
          <circle cx="65" cy="58" r="4" fill="#f59e0b" />
          <line x1="50" y1="75" x2="80" y2="40" stroke="#f43f5e" strokeWidth="2" />
          <path d="M 70 65 L 95 65 M 90 61 L 96 65 L 90 69" fill="none" stroke="#0d9488" strokeWidth="2" />
          <text x="75" y="80" fill="#0d9488" fontSize="8" fontWeight="bold">Step Right →</text>
          {/* Right slope: positive slope, step left */}
          <circle cx="175" cy="58" r="4" fill="#f59e0b" />
          <line x1="160" y1="40" x2="190" y2="75" stroke="#f43f5e" strokeWidth="2" />
          <path d="M 170 65 L 145 65 M 150 61 L 144 65 L 150 69" fill="none" stroke="#0d9488" strokeWidth="2" />
          <text x="165" y="80" fill="#0d9488" fontSize="8" fontWeight="bold">← Step Left</text>
        </svg>
      )
    },

    // Card 4: The update rule
    {
      title: '4. The Update Rule',
      chip: 'Parameter Update',
      text: 'At each iteration, we update parameters: w = w - lr · dJ/dw and b = b - lr · dJ/db. The derivative dJ/dw gives the uphill direction, lr sets your step size, and the minus sign steps downhill. The hiker moves until the slope is zero.',
      whyItMatters:
        'This simple recursive equation powers modern artificial intelligence. By repeating small downhill adjustments, the algorithm continuously learns without needing complex matrix inverses.',
      illustration: (
        <div className="space-y-2 py-1 max-w-[280px] mx-auto text-xs font-mono">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-2 text-center text-indigo-900 font-bold">
            w = w - lr · (dJ / dw)
          </div>
          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-2 text-center text-teal-900 font-bold">
            b = b - lr · (dJ / db)
          </div>
        </div>
      )
    },

    // Card 5: Learning rate and convergence preview
    {
      title: '5. Learning Rate & Convergence',
      chip: 'Step Sizes',
      text: 'Convergence means the loss stops changing because you have reached the bottom (|loss change| < tol). Your learning rate controls how you arrive: too small crawls endlessly, just right lands smoothly, and too big overshoots or explodes.',
      whyItMatters:
        'Choosing the right step size is the most critical decision in gradient descent: it separates fast, stable convergence from endless crawling or mathematical explosion.',
      illustration: (
        <div className="grid grid-cols-3 gap-2 py-1 text-center text-[10px]">
          {/* Too small */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-1.5 flex flex-col items-center">
            <svg viewBox="0 0 70 45" className="w-14 h-9">
              <path d="M 5 10 Q 35 40 65 10" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="15" cy="18" r="2" fill="#d97706" />
              <circle cx="18" cy="20" r="2" fill="#d97706" />
              <circle cx="21" cy="22" r="2" fill="#d97706" />
            </svg>
            <span className="font-bold text-amber-800">Too Small</span>
            <span className="text-slate-500 text-[9px]">Slow crawl</span>
          </div>

          {/* Just right */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-1.5 flex flex-col items-center">
            <svg viewBox="0 0 70 45" className="w-14 h-9">
              <path d="M 5 10 Q 35 40 65 10" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M 12 15 Q 24 35 35 30" fill="none" stroke="#0d9488" strokeWidth="1.5" />
              <circle cx="35" cy="30" r="3" fill="#0d9488" />
            </svg>
            <span className="font-bold text-teal-800">Just Right</span>
            <span className="text-slate-500 text-[9px]">Smooth descent</span>
          </div>

          {/* Too big */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-1.5 flex flex-col items-center">
            <svg viewBox="0 0 70 45" className="w-14 h-9">
              <path d="M 5 10 Q 35 40 65 10" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
              <path d="M 12 15 L 58 15 L 8 20" fill="none" stroke="#e11d48" strokeWidth="1.5" />
            </svg>
            <span className="font-bold text-rose-800">Too Big</span>
            <span className="text-slate-500 text-[9px]">Overshooting</span>
          </div>
        </div>
      )
    }
  ];

  const current = cards[activeCard];
  const isFirst = activeCard === 0;
  const isLast = activeCard === cards.length - 1;

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Core Theory</h2>
          <p className="text-xs text-slate-500">
            Card {activeCard + 1} of {cards.length}: {current.chip}
          </p>
        </div>

        {/* Card Indicator Dots */}
        <div className="flex items-center gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveCard(i)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                i === activeCard
                  ? 'w-7 bg-indigo-600'
                  : 'w-2.5 bg-slate-200 hover:bg-slate-300'
              }`}
              title={`Go to Card ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Stepper Card */}
      <Card
        title={current.title}
        action={<Chip color="indigo">{current.chip}</Chip>}
      >
        <div className="space-y-4">
          {/* Card Text (< 60 words) */}
          <p className="text-sm text-slate-700 leading-relaxed">
            {current.text}
          </p>

          {/* Inline SVG Illustration */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            {current.illustration}
          </div>

          {/* 'Why it matters' Callout */}
          <Callout variant="tip" title="Why it matters">
            {current.whyItMatters}
          </Callout>
        </div>

        {/* Stepper Navigation */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <Button
            variant="ghost"
            onClick={() => setActiveCard((prev) => Math.max(0, prev - 1))}
            disabled={isFirst}
          >
            ← Previous Card
          </Button>

          <span className="text-xs text-slate-400">
            {activeCard + 1} / {cards.length}
          </span>

          {!isLast ? (
            <Button
              variant="primary"
              onClick={() => setActiveCard((prev) => Math.min(cards.length - 1, prev + 1))}
            >
              Next Card →
            </Button>
          ) : (
            onNext && (
              <Button variant="primary" onClick={onNext}>
                Proceed to Dataset Tour (Step 4) →
              </Button>
            )
          )}
        </div>
      </Card>
    </div>
  );
}
