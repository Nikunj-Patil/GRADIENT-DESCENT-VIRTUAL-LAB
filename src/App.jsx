// src/App.jsx
import React, { useState } from 'react';
import Footer from './components/ui/Footer.jsx';
import Button from './components/ui/Button.jsx';
import QuizCard from './components/quiz/QuizCard.jsx';
import Aim from './pages/Aim.jsx';
import Theory from './pages/Theory.jsx';
import DatasetExplorer from './pages/DatasetExplorer.jsx';
import HikerSim from './pages/HikerSim.jsx';
import Experiment from './pages/Experiment.jsx';
import Observations from './pages/Observations.jsx';
import { useLab } from './store/labStore.js';

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const { runs, quiz } = useLab();

  // 8 steps in exact specified order:
  // 1 Aim, 2 QuizCard pre, 3 Theory, 4 DatasetExplorer, 5 HikerSim then QuizCard mid1,
  // 6 Experiment then QuizCard mid2, 7 QuizCard final, 8 Observations
  const steps = [
    'Aim',
    'Warm-up quiz',
    'Theory',
    'Dataset exploration',
    'Hiker simulation',
    'Experiment',
    'Final quiz',
    'Observations'
  ];

  // Gentle gating logic for the Next button:
  // - Quiz steps (2 and 7) require finishing the quiz
  // - The Experiment step (6) requires at least one completed run
  // - Show a friendly hint explaining why when disabled
  // - Everything else is free to navigate
  const getNextState = () => {
    // Step 8: Last step
    if (currentStep === steps.length) {
      return { disabled: true, hint: null };
    }

    // Step 2: Warm-up quiz (QuizCard pre)
    if (currentStep === 2 && !quiz.pre) {
      return {
        disabled: true,
        hint: 'Complete the warm-up quiz above to unlock Theory.'
      };
    }

    // Step 6: Experiment step (requires at least one completed run)
    if (currentStep === 6 && (!runs || runs.length === 0)) {
      return {
        disabled: true,
        hint: 'Run at least one gradient descent experiment above before proceeding.'
      };
    }

    // Step 7: Final quiz (QuizCard final)
    if (currentStep === 7 && !quiz.final) {
      return {
        disabled: true,
        hint: 'Complete the final quiz above to unlock Observations & Report.'
      };
    }

    return { disabled: false, hint: null };
  };

  const nextState = getNextState();

  const handleNext = () => {
    const state = getNextState();
    if (!state.disabled && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepNum) => {
    setCurrentStep(stepNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Progress percentage (0 to 100%)
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Aim onStart={handleNext} />;
      case 2:
        return <QuizCard quizId="pre" onDone={handleNext} />;
      case 3:
        return <Theory onNext={handleNext} />;
      case 4:
        return <DatasetExplorer onNext={handleNext} />;
      case 5:
        return (
          <div className="space-y-6">
            <HikerSim onNext={handleNext} />
            {/* Mini-Quiz 1 after step 5 */}
            <QuizCard quizId="mid1" onDone={handleNext} />
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <Experiment />
            {/* Mini-Quiz 2 after step 6 */}
            <QuizCard quizId="mid2" onDone={handleNext} />
          </div>
        );
      case 7:
        return <QuizCard quizId="final" onDone={handleNext} />;
      case 8:
        return (
          <Observations
            onRestart={() => handleStepClick(1)}
            onGoToExperiment={() => handleStepClick(6)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf8] text-slate-800">
      {/* Header & Stepper */}
      <header className="border-b border-slate-200 bg-white/85 backdrop-blur sticky top-0 z-20 shadow-xs">
        <div className="container mx-auto max-w-5xl px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Gradient Descent Virtual Lab
              </h1>
              <p className="text-xs text-slate-500">
                Simple Linear Regression Optimization
              </p>
            </div>
            <div className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2.5 py-1">
              Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
            </div>
          </div>

          {/* Stepper with progress line and clickable step dots */}
          <div className="relative pt-2 pb-1">
            {/* Background track line */}
            <div className="absolute top-5 left-4 right-4 h-1 bg-slate-200 -translate-y-1/2 rounded-full" />
            {/* Active filled progress line */}
            <div
              className="absolute top-5 left-4 h-1 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-300"
              style={{ width: `calc(${progressPercent}% * (1 - 32px / 100%))` }}
            />

            {/* Clickable Step Dots */}
            <div className="relative flex justify-between items-center z-10 w-full">
              {steps.map((name, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < currentStep;
                const isCurrent = stepNum === currentStep;

                let dotClasses =
                  'bg-white border-2 border-slate-300 text-slate-500 hover:border-slate-400';
                if (isCurrent) {
                  dotClasses =
                    'bg-indigo-600 border-2 border-indigo-600 text-white ring-4 ring-indigo-100 font-bold';
                } else if (isCompleted) {
                  dotClasses =
                    'bg-teal-500 border-2 border-teal-500 text-white font-bold';
                }

                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleStepClick(stepNum)}
                    className="flex flex-col items-center group focus:outline-none"
                    title={`Step ${stepNum}: ${name}`}
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-all duration-200 cursor-pointer ${dotClasses}`}
                    >
                      {isCompleted ? '✓' : stepNum}
                    </span>
                    <span
                      className={`hidden sm:block mt-1 text-[11px] font-medium tracking-tight max-w-[80px] text-center truncate ${
                        isCurrent
                          ? 'text-indigo-600 font-bold'
                          : isCompleted
                          ? 'text-teal-700'
                          : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Step Content Container */}
      <main className="container mx-auto max-w-5xl px-3 sm:px-4 py-6 sm:py-8 flex-1 w-full">
        {renderStepContent()}

        {/* Stepper Navigation Buttons with Gating Hint */}
        <div className="mt-8 border-t border-slate-200/80 pt-6 space-y-3">
          {nextState.hint && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center font-medium">
              <span>💡</span>
              <span>{nextState.hint}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="text-xs sm:text-sm px-3.5 py-2"
            >
              ← Back
            </Button>

            <span className="text-xs text-slate-400 font-medium">
              Step {currentStep} of {steps.length}
            </span>

            <Button
              variant="primary"
              onClick={handleNext}
              disabled={nextState.disabled}
              className="text-xs sm:text-sm px-4 py-2"
            >
              Next →
            </Button>
          </div>
        </div>
      </main>

      {/* Footer rendered ONCE below step content on EVERY screen */}
      <Footer />
    </div>
  );
}
