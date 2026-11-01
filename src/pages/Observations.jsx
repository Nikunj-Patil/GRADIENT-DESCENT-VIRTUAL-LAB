// src/pages/Observations.jsx
// Step 8: Lab Observations, Auto-Generated Findings, Reflections, and Final Report.

import React, { useState, useMemo, useEffect } from 'react';
import Card from '../components/ui/Card.jsx';
import Callout from '../components/ui/Callout.jsx';
import Button from '../components/ui/Button.jsx';
import Chip from '../components/ui/Chip.jsx';
import { useLab } from '../store/labStore.js';
import { getDataset } from '../data/dataset.js';

export default function Observations({ onRestart, onGoToExperiment }) {
  const { runs, quiz } = useLab();

  // Local state for copy feedback
  const [copied, setCopied] = useState(false);

  // Student reflection inputs
  const [reflections, setReflections] = useState({
    convergence: '',
    lrEffect: '',
    performance: ''
  });

  const handleReflectionChange = (key, val) => {
    setReflections((prev) => ({ ...prev, [key]: val }));
  };

  // Helper to resolve dataset title
  const getRunDatasetName = (r) => {
    if (r.datasetName) return r.datasetName;
    try {
      const ds = getDataset(r.datasetKey || r.dataset || 'concrete');
      return ds.title;
    } catch {
      return r.datasetKey || 'Concrete';
    }
  };

  // Helper to resolve target label
  const getRunTargetLabel = (r) => {
    if (r.targetLabel) return r.targetLabel;
    try {
      const ds = getDataset(r.datasetKey || r.dataset || 'concrete');
      const tgt = ds.TARGETS.find((t) => t.key === (r.targetKey || r.target));
      return tgt ? tgt.label : r.targetKey || 'Target';
    } catch {
      return r.targetKey || 'Target';
    }
  };

  // Helper to resolve feature label
  const getRunFeatureLabel = (r) => {
    if (r.featureLabel) return r.featureLabel;
    try {
      const ds = getDataset(r.datasetKey || r.dataset || 'concrete');
      const f = ds.FEATURES.find((item) => item.key === r.feature);
      return f ? f.label : r.feature;
    } catch {
      return r.feature;
    }
  };

  // Helper to map behavior string to Chip color
  const getBehaviorColor = (beh) => {
    switch (beh) {
      case 'Smooth descent':
        return 'emerald';
      case 'Slow crawl':
        return 'amber';
      case 'Overshooting':
        return 'indigo';
      case 'Diverged':
        return 'rose';
      default:
        return 'slate';
    }
  };

  // Auto-generate three plain-English findings from the logged runs
  const findings = useMemo(() => {
    if (!runs || runs.length === 0) {
      return {
        fastest: '',
        behaviors: '',
        accuracy: ''
      };
    }

    // 1. Which learning rate converged fastest
    const convergedRuns = runs.filter((r) => r.converged && Number.isFinite(r.finalLoss));
    let fastestText = '';
    if (convergedRuns.length > 0) {
      const fastest = [...convergedRuns].sort((a, b) => a.itersUsed - b.itersUsed)[0];
      const dsTitle = getRunDatasetName(fastest);
      const featName = getRunFeatureLabel(fastest);
      const tgtName = getRunTargetLabel(fastest);
      fastestText = `Learning rate α = ${fastest.lr} converged fastest, reaching the minimum error in just ${fastest.itersUsed} iteration${fastest.itersUsed === 1 ? '' : 's'} on ${featName} predicting ${tgtName} (${dsTitle}).`;
    } else {
      fastestText =
        'None of the tested learning rates reached the convergence tolerance before reaching their iteration limit.';
    }

    // 2. Which behaviours appeared
    const uniqueBehaviors = [...new Set(runs.map((r) => r.behavior || r.behaviour))].filter(Boolean);
    let behaviorsText = '';
    if (uniqueBehaviors.length > 0) {
      behaviorsText = `Across your experimental runs, the following optimization behaviors were observed: ${uniqueBehaviors.join(', ')}.`;
    } else {
      behaviorsText = 'Standard descent dynamics were observed during testing.';
    }

    // 3. How close the best run got to the exact solution
    const validRuns = runs.filter(
      (r) => Number.isFinite(r.finalLoss) && Number.isFinite(r.closedFormLoss)
    );
    let accuracyText = '';
    if (validRuns.length > 0) {
      const bestRun = [...validRuns].sort((a, b) => {
        const gapA = Math.abs(a.finalLoss - a.closedFormLoss);
        const gapB = Math.abs(b.finalLoss - b.closedFormLoss);
        return gapA - gapB;
      })[0];

      const gapPct = Math.max(
        0,
        ((bestRun.finalLoss - bestRun.closedFormLoss) / bestRun.closedFormLoss) * 100
      );
      const gapDisplay = gapPct <= 0.005 ? '0.00%' : `${gapPct.toFixed(2)}%`;
      const dsTitle = getRunDatasetName(bestRun);
      const featName = getRunFeatureLabel(bestRun);
      const tgtName = getRunTargetLabel(bestRun);

      accuracyText = `The closest run (α = ${bestRun.lr} on ${featName} → ${tgtName} in ${dsTitle}) reached an MSE loss of ${bestRun.finalLoss.toFixed(6)}, which matches the analytical closed-form baseline of ${bestRun.closedFormLoss.toFixed(6)} within ${gapDisplay}.`;
    } else {
      accuracyText =
        'The best performing gradient descent runs iteratively approached the least-squares regression line.';
    }

    return {
      fastest: fastestText,
      behaviors: behaviorsText,
      accuracy: accuracyText
    };
  }, [runs]);

  // Default pre-filled conclusion based on findings and datasets tested
  const defaultConclusion = useMemo(() => {
    if (!findings.fastest) return '';
    const uniqueDatasets = [...new Set(runs.map((r) => getRunDatasetName(r)))].join(' and ');
    return `In this laboratory session, we implemented Batch Gradient Descent for Simple Linear Regression on the UCI ${uniqueDatasets} dataset. ${findings.fastest} ${findings.behaviors} Furthermore, ${findings.accuracy.charAt(0).toLowerCase() + findings.accuracy.slice(1)} These results verify that gradient descent successfully minimizes the Mean Squared Error cost surface to recover the exact least-squares best-fit parameters across quantitative engineering domains.`;
  }, [findings, runs]);

  // Editable conclusion paragraph state
  const [conclusion, setConclusion] = useState('');

  useEffect(() => {
    if (!conclusion && defaultConclusion) {
      setConclusion(defaultConclusion);
    }
  }, [defaultConclusion]);

  // Quiz scores badges data
  const quizBadges = useMemo(() => {
    const list = [];
    if (quiz.pre) {
      list.push({ key: 'pre', name: 'Warm-up Quiz', score: quiz.pre.score, total: quiz.pre.total });
    }
    if (quiz.mid1) {
      list.push({ key: 'mid1', name: 'Hiker Quiz', score: quiz.mid1.score, total: quiz.mid1.total });
    }
    if (quiz.mid2) {
      list.push({ key: 'mid2', name: 'Experiment Quiz', score: quiz.mid2.score, total: quiz.mid2.total });
    }
    if (quiz.final) {
      list.push({ key: 'final', name: 'Final Quiz', score: quiz.final.score, total: quiz.final.total });
    }
    return list;
  }, [quiz]);

  // Copy full summary to clipboard
  const handleCopySummary = async () => {
    const aimSection =
      'LAB AIM:\n' +
      'Implement the Gradient Descent algorithm on a given dataset and analyze convergence behavior, learning rate effects, and optimization performance.\n';

    // Quiz scores text
    let quizSection = 'QUIZ EVALUATION:\n';
    if (quizBadges.length > 0) {
      quizSection += quizBadges.map((q) => `- ${q.name}: ${q.score} / ${q.total}`).join('\n') + '\n\n';
    } else {
      quizSection += '- No quizzes recorded in session\n\n';
    }

    // Observation Table text
    let tableSection = 'OBSERVATION TABLE:\n';
    tableSection +=
      'Dataset | Target | Feature | Learning Rate (α) | Iterations | Final Loss (MSE) | Behaviour | Gap from Closed-Form\n';
    tableSection +=
      '---------------------------------------------------------------------------------------------------------------------------------\n';
    runs.forEach((r) => {
      const ds = getRunDatasetName(r);
      const tgt = getRunTargetLabel(r);
      const feat = getRunFeatureLabel(r);
      const iters = `${r.itersUsed} / ${r.maxIters}`;
      const loss = Number.isFinite(r.finalLoss) ? r.finalLoss.toFixed(6) : 'Exploded (> 1e6)';
      const gap =
        r.diverged || !Number.isFinite(r.finalLoss)
          ? '+∞ (Diverged)'
          : Number.isFinite(r.closedFormLoss)
          ? Math.max(0, ((r.finalLoss - r.closedFormLoss) / r.closedFormLoss) * 100) <= 0.005
            ? '+0.00%'
            : `+${(((r.finalLoss - r.closedFormLoss) / r.closedFormLoss) * 100).toFixed(2)}%`
          : '—';
      tableSection += `${ds} | ${tgt} | ${feat} | α = ${r.lr} | ${iters} | ${loss} | ${r.behavior || r.behaviour} | ${gap}\n`;
    });
    tableSection += '\n';

    // Auto findings text
    let findingsSection = 'KEY FINDINGS:\n';
    findingsSection += `1. Fastest Convergence: ${findings.fastest}\n`;
    findingsSection += `2. Observed Dynamics: ${findings.behaviors}\n`;
    findingsSection += `3. Closed-Form Accuracy: ${findings.accuracy}\n\n`;

    // Student reflections text
    let reflectionsSection = 'STUDENT REFLECTIONS:\n';
    reflectionsSection += `1. Convergence Criteria:\n${reflections.convergence || '(No response entered)'}\n\n`;
    reflectionsSection += `2. Learning Rate Dynamics:\n${reflections.lrEffect || '(No response entered)'}\n\n`;
    reflectionsSection += `3. Optimization Performance:\n${reflections.performance || '(No response entered)'}\n\n`;

    // Conclusion text
    let conclusionSection = `CONCLUSION:\n${conclusion || defaultConclusion || '(No conclusion entered)'}\n\n`;

    // Mandatory Footer Text (Exact verbatim lines as specified)
    const footerText =
      'ML CA\n' +
      'by Nikunj Patil (D7C/40)\n' +
      'Ayush Palde (D7C/33)\n' +
      'Om Patil (D7C/41)';

    const fullReportText =
      '=======================================================\n' +
      'GRADIENT DESCENT VIRTUAL LAB - REPORT SUMMARY\n' +
      '=======================================================\n\n' +
      aimSection +
      '\n' +
      quizSection +
      tableSection +
      findingsSection +
      reflectionsSection +
      conclusionSection +
      footerText;

    try {
      await navigator.clipboard.writeText(fullReportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy summary to clipboard', err);
    }
  };

  // 1. Empty state when there are no runs
  if (!runs || runs.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">
              Lab Observations & Report
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Step 8 of 8: Synthesis of experimental findings, quiz results, and conclusions.
            </p>
          </div>
        </div>

        <Card title="No Observations Yet" subtitle="Experimental data required">
          <div className="py-14 text-center max-w-md mx-auto space-y-4">
            <div className="text-4xl">🧪</div>
            <h3 className="text-base font-bold text-slate-800">
              No experimental runs recorded yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              To generate your observation table, auto-derived findings, and lab report, you must
              first run gradient descent in the Experiment workbench.
            </p>
            <div className="pt-2">
              <Button variant="primary" onClick={onGoToExperiment}>
                ← Go to Experiment (Step 6)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">
            Lab Observations & Report
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Analysis of convergence dynamics, learning rate effects, and optimization performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            variant="primary"
            onClick={handleCopySummary}
            className="text-xs py-2 px-3.5"
          >
            {copied ? '✓ Copied Summary!' : '📋 Copy Summary'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.print()}
            className="text-xs py-2 px-3.5"
          >
            🖨️ Print
          </Button>
          {onRestart && (
            <Button
              variant="ghost"
              onClick={onRestart}
              className="text-xs py-2 px-3.5"
            >
              ↺ Restart Lab
            </Button>
          )}
        </div>
      </div>

      {/* Quiz Scores Badges (if present) */}
      {quizBadges.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5 mr-1">
            <span>🎓</span> Quiz Scores:
          </span>
          {quizBadges.map((q) => {
            const isPerfect = q.score === q.total;
            return (
              <Chip
                key={q.key}
                color={isPerfect ? 'emerald' : 'indigo'}
                className="text-xs font-medium"
              >
                {q.name}: {q.score} / {q.total}
              </Chip>
            );
          })}
        </div>
      )}

      {/* Observation Table */}
      <Card
        title="Observation Table"
        subtitle={`Summary of ${runs.length} experimental run(s) logged in this session`}
      >
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-3.5">Dataset</th>
                <th className="py-3 px-3.5">Target</th>
                <th className="py-3 px-3.5">Feature</th>
                <th className="py-3 px-3.5">Learning Rate (α)</th>
                <th className="py-3 px-3.5">Iterations Used</th>
                <th className="py-3 px-3.5">Final Loss (MSE)</th>
                <th className="py-3 px-3.5">Behaviour</th>
                <th className="py-3 px-3.5">Gap to Closed-Form</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map((r, idx) => {
                const isDiverged = Boolean(r.diverged);
                const lossDisplay = Number.isFinite(r.finalLoss)
                  ? r.finalLoss.toFixed(6)
                  : 'Exploded (> 1e6)';

                let gapText = '—';
                let gapColor = 'text-slate-600';

                if (isDiverged || !Number.isFinite(r.finalLoss)) {
                  gapText = '+∞ (Diverged)';
                  gapColor = 'text-rose-600 font-bold';
                } else if (Number.isFinite(r.closedFormLoss) && Number.isFinite(r.finalLoss)) {
                  const diffPct = Math.max(
                    0,
                    ((r.finalLoss - r.closedFormLoss) / r.closedFormLoss) * 100
                  );
                  if (diffPct <= 0.005) {
                    gapText = '+0.00%';
                    gapColor = 'text-emerald-700 font-bold';
                  } else if (diffPct <= 1.0) {
                    gapText = `+${diffPct.toFixed(2)}%`;
                    gapColor = 'text-teal-700 font-semibold';
                  } else {
                    gapText = `+${diffPct.toFixed(2)}%`;
                    gapColor = 'text-amber-700 font-bold';
                  }
                }

                const dsTitle = getRunDatasetName(r);
                const tgtLabel = getRunTargetLabel(r);
                const featLabel = getRunFeatureLabel(r);

                return (
                  <tr
                    key={`${r.datasetKey || 'concrete'}-${r.targetKey || 'strength'}-${r.feature}-${r.lr}-${r.maxIters}-${idx}`}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-2.5 px-3.5 font-medium text-slate-800 whitespace-nowrap">
                      {dsTitle}
                    </td>
                    <td className="py-2.5 px-3.5 text-teal-700 font-semibold whitespace-nowrap">
                      {tgtLabel}
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-slate-900 whitespace-nowrap">
                      {featLabel}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono font-bold text-indigo-700">
                      α = {r.lr}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-slate-700">
                      {r.itersUsed} / {r.maxIters}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono">{lossDisplay}</td>
                    <td className="py-2.5 px-3.5">
                      <Chip color={getBehaviorColor(r.behavior || r.behaviour)}>
                        {r.behavior || r.behaviour}
                      </Chip>
                    </td>
                    <td className={`py-2.5 px-3.5 font-mono ${gapColor}`}>{gapText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Auto-Generated Plain-English Findings */}
      <Card
        title="Key Findings (Auto-Generated from Data)"
        subtitle="Analytical synthesis of your session results"
      >
        <div className="space-y-3.5 text-xs text-slate-700">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white mt-0.5">
              1
            </span>
            <div>
              <span className="font-bold text-emerald-950 block mb-0.5">
                Fastest Convergence:
              </span>
              <p className="text-slate-700 leading-relaxed">{findings.fastest}</p>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white mt-0.5">
              2
            </span>
            <div>
              <span className="font-bold text-indigo-950 block mb-0.5">
                Observed Optimization Behaviors:
              </span>
              <p className="text-slate-700 leading-relaxed">{findings.behaviors}</p>
            </div>
          </div>

          <div className="rounded-xl border border-teal-100 bg-teal-50/50 p-3.5 flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white mt-0.5">
              3
            </span>
            <div>
              <span className="font-bold text-teal-950 block mb-0.5">
                Accuracy vs. Closed-Form Analytical Solution:
              </span>
              <p className="text-slate-700 leading-relaxed">{findings.accuracy}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Student Reflections */}
      <Card
        title="Student Reflections"
        subtitle="Write brief answers to consolidate your intuitive and mathematical understanding"
      >
        <div className="space-y-4">
          {/* Prompt 1: Convergence */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              1. Convergence: What signs in the loss curve tell you the model has converged?
            </label>
            <textarea
              rows={2}
              value={reflections.convergence}
              onChange={(e) => handleReflectionChange('convergence', e.target.value)}
              placeholder="e.g., The loss curve flattens out horizontally, successive iteration loss changes fall below the tolerance threshold (1e-6), and the regression line stops moving..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Prompt 2: Learning-rate effect */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              2. Learning Rate Effect: How did changing α from too small to too large affect your results?
            </label>
            <textarea
              rows={2}
              value={reflections.lrEffect}
              onChange={(e) => handleReflectionChange('lrEffect', e.target.value)}
              placeholder="e.g., When α was tiny (0.005), the steps were minuscule and crawled; when α was moderate (0.3), it descended smoothly; when α exceeded 1.0, it overshot the valley floor and exploded toward infinity..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          {/* Prompt 3: Performance */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              3. Optimization Performance: Why does gradient descent reach the same result as the closed-form equation?
            </label>
            <textarea
              rows={2}
              value={reflections.performance}
              onChange={(e) => handleReflectionChange('performance', e.target.value)}
              placeholder="e.g., Because simple linear regression MSE is a strictly convex bowl with a single global minimum, taking steps opposite to the gradient is mathematically guaranteed to reach the exact least-squares solution..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </Card>

      {/* Editable Conclusion Paragraph */}
      <Card
        title="Conclusion"
        subtitle="Pre-filled from your experimental findings — feel free to edit and personalize"
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConclusion(defaultConclusion)}
            className="text-xs py-1 px-2.5"
          >
            Reset to Generated
          </Button>
        }
      >
        <div className="space-y-3">
          <textarea
            rows={4}
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 leading-relaxed focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
          />
          <p className="text-[11px] text-slate-500">
            This conclusion will be included when you click <strong>&quot;Copy Summary&quot;</strong> or print your lab report.
          </p>
        </div>
      </Card>

      {/* Bottom Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 print:hidden">
        <Button
          variant="primary"
          onClick={handleCopySummary}
          className="text-xs py-2 px-4 shadow-sm shadow-indigo-100"
        >
          {copied ? '✓ Copied Summary to Clipboard!' : '📋 Copy Summary'}
        </Button>

        {onRestart && (
          <Button variant="ghost" onClick={onRestart} className="text-xs py-2 px-4">
            ↺ Back to Start (Aim)
          </Button>
        )}
      </div>
    </div>
  );
}
