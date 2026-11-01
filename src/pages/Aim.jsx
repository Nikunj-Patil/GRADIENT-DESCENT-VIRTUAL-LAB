// src/pages/Aim.jsx
// Step 1: Aim, Scope, and Student Roadmap.

import React from 'react';
import Card from '../components/ui/Card.jsx';
import Callout from '../components/ui/Callout.jsx';
import Button from '../components/ui/Button.jsx';
import Chip from '../components/ui/Chip.jsx';
import { META } from '../data/dataset.js';

export default function Aim({ onStart }) {
  const roadmapItems = [
    {
      num: '1',
      title: 'Learn',
      desc: 'Understand how slopes, errors, and step sizes guide optimization through the foggy hiker analogy.'
    },
    {
      num: '2',
      title: 'Play',
      desc: 'Guide the hiker step-by-step down an interactive 2D cost bowl in a live visual simulation.'
    },
    {
      num: '3',
      title: 'Run on Real Data',
      desc: 'Apply batch gradient descent to real laboratory concrete tests to fit a predictive line.'
    },
    {
      num: '4',
      title: 'Compare Step Sizes',
      desc: 'Witness how varying the learning rate causes slow crawls, smooth descent, overshooting, or divergence.'
    },
    {
      num: '5',
      title: 'Summarise',
      desc: 'Synthesize your experimental runs, review quiz outcomes, and print your complete lab report.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Warm Hero: The Hiker-in-Fog Story (< 80 words) */}
      <Card className="bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/40 border-indigo-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5">
              <Chip color="indigo">Virtual Lab</Chip>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Civil &amp; ML Engineering
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl">
              Walking Downhill in the Fog
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              Imagine you are hiking down a foggy mountain. Thick mist hides the valley floor, so you cannot see your destination. What can you do? You feel the ground slope under your boots and take a careful step downhill. Repeat this simple rule—feel the slope, step downward—and you will safely reach the lowest point of the valley.
            </p>
          </div>
          {onStart && (
            <Button variant="primary" onClick={onStart} className="self-center shadow-md">
              Start Lab →
            </Button>
          )}
        </div>
      </Card>

      {/* Lab Aim */}
      <Card title="Lab Aim" subtitle="What you will accomplish in this experiment">
        <p className="text-sm leading-relaxed text-slate-700">
          Implement the <strong>Batch Gradient Descent</strong> algorithm on a real dataset and analyze how the <strong>learning rate</strong> governs convergence speed, parameter stability, and optimization performance when fitting a simple linear regression model (<span className="font-mono text-indigo-600 font-semibold">y = w · x + b</span>).
        </p>
      </Card>

      {/* What You'll Do Roadmap */}
      <Card title="What You'll Do" subtitle="A 5-stage roadmap for this lab session">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {roadmapItems.map((item) => (
            <div
              key={item.num}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 flex flex-col justify-between"
            >
              <div>
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-xs mb-2">
                  {item.num}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Dataset Introduction */}
      <Card title="The Dataset" subtitle="Real engineering laboratory data">
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            You will work with the <strong>{META.title}</strong>, sourced from the <strong>{META.source}</strong>.
          </p>
          <Callout variant="tip" title="Step 4 Guided Tour">
            In <strong>Step 4 (Dataset exploration)</strong>, you will take an interactive guided tour of all 1,030 concrete mixes. You will explore the 8 physical ingredients—including cement, water, and blast furnace slag—and see how each relates to compressive strength.
          </Callout>
        </div>
      </Card>

      {/* Bottom Action */}
      {onStart && (
        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={onStart}>
            Begin Warm-up Quiz (Step 2) →
          </Button>
        </div>
      )}
    </div>
  );
}
