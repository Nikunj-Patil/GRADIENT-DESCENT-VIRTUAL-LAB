// src/components/quiz/QuizCard.jsx
// Data-driven quiz component showing one question at a time with runtime option shuffling, hints, and encouraging feedback.

import React, { useState, useEffect, useMemo } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Chip from '../ui/Chip.jsx';
import { QUIZZES } from '../../data/quizzes.js';
import { useLab } from '../../store/labStore.js';

export default function QuizCard({ quizId, onDone }) {
  const quizData = QUIZZES[quizId];
  const { setQuizScore } = useLab();

  // Function to shuffle options of each question at runtime
  const shuffleQuestions = (rawQuestions) => {
    if (!rawQuestions) return [];
    return rawQuestions.map((q) => {
      const items = q.options.map((optText, originalIndex) => ({
        text: optText,
        isCorrect: originalIndex === q.correctIndex
      }));

      // Fisher-Yates shuffle
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }

      const newCorrectIndex = items.findIndex((item) => item.isCorrect);

      return {
        prompt: q.prompt,
        options: items.map((item) => item.text),
        correctIndex: newCorrectIndex,
        hint: q.hint,
        explanation: q.explanation
      };
    });
  };

  const [questions, setQuestions] = useState(() =>
    shuffleQuestions(quizData?.questions || [])
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isChecked, setIsChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Reset when quizId changes
  useEffect(() => {
    if (quizData) {
      setQuestions(shuffleQuestions(quizData.questions));
      setCurrentIndex(0);
      setSelectedOption(null);
      setIsChecked(false);
      setShowHint(false);
      setScore(0);
      setIsFinished(false);
    }
  }, [quizId]);

  if (!quizData || questions.length === 0) {
    return (
      <Card title="Quiz Unavailable">
        <p className="text-sm text-slate-500 py-4">
          Quiz data for &quot;{quizId}&quot; could not be loaded.
        </p>
      </Card>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // Handle checking the selected answer
  const handleCheck = () => {
    if (selectedOption === null || isChecked) return;
    setIsChecked(true);
    if (selectedOption === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  // Move to next question or complete
  const handleNext = () => {
    if (isLastQuestion) {
      const finalScore =
        selectedOption === currentQ.correctIndex ? score : score; // already counted in handleCheck
      setIsFinished(true);
      setQuizScore(quizId, { score: finalScore, total: totalQuestions });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsChecked(false);
      setShowHint(false);
    }
  };

  // Reset and try again
  const handleTryAgain = () => {
    setQuestions(shuffleQuestions(quizData.questions));
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsChecked(false);
    setShowHint(false);
    setScore(0);
    setIsFinished(false);
  };

  // Completion screen
  if (isFinished) {
    const percentage = Math.round((score / totalQuestions) * 100);
    let encouragement = '';
    let chipColor = 'teal';

    if (score === totalQuestions) {
      encouragement = 'Outstanding! You got every single question right on the first try!';
      chipColor = 'teal';
    } else if (percentage >= 70) {
      encouragement = 'Great job! You have a solid grasp of this concept.';
      chipColor = 'indigo';
    } else {
      encouragement = 'Good effort! Review the explanations and take another run at it.';
      chipColor = 'amber';
    }

    return (
      <Card
        title={quizData.title}
        subtitle="Assessment Completed"
        className="my-4"
      >
        <div className="py-6 text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <Chip color={chipColor} className="text-sm px-4 py-1.5 font-bold">
              Score: {score} of {totalQuestions} ({percentage}%)
            </Chip>
          </div>

          <p className="text-base font-semibold text-slate-800 max-w-md mx-auto">
            {encouragement}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button variant="ghost" onClick={handleTryAgain}>
              ↺ Try again
            </Button>
            {onDone && (
              <Button variant="primary" onClick={onDone}>
                Continue →
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  const isCorrect = selectedOption === currentQ.correctIndex;

  return (
    <Card
      title={quizData.title}
      subtitle={`Question ${currentIndex + 1} of ${totalQuestions}`}
      action={
        <span className="text-xs font-semibold text-slate-400">
          Progress: {Math.round(((currentIndex + 1) / totalQuestions) * 100)}%
        </span>
      }
      className="my-4"
    >
      <div className="space-y-5">
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>

        {/* Question Prompt */}
        <div className="text-base font-bold text-slate-900 leading-snug">
          {currentQ.prompt}
        </div>

        {/* Options Grid */}
        <div className="space-y-2.5">
          {currentQ.options.map((optionText, optIndex) => {
            const isThisSelected = selectedOption === optIndex;
            const isThisCorrect = currentQ.correctIndex === optIndex;

            let cardStyles =
              'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 text-slate-700';

            if (isChecked) {
              if (isThisCorrect) {
                cardStyles =
                  'border-teal-500 bg-teal-50/70 text-teal-950 font-medium ring-1 ring-teal-500';
              } else if (isThisSelected && !isCorrect) {
                cardStyles =
                  'border-amber-400 bg-amber-50/70 text-amber-950 font-medium ring-1 ring-amber-400';
              } else {
                cardStyles = 'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
              }
            } else if (isThisSelected) {
              cardStyles =
                'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold ring-2 ring-indigo-500/20';
            }

            return (
              <button
                key={optIndex}
                type="button"
                disabled={isChecked}
                onClick={() => setSelectedOption(optIndex)}
                className={`w-full flex items-center justify-between rounded-xl border p-3.5 text-left text-sm transition-all duration-150 cursor-pointer ${cardStyles}`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                      isThisSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {String.fromCharCode(65 + optIndex)}
                  </span>
                  <span className="leading-relaxed">{optionText}</span>
                </div>
                {isChecked && isThisCorrect && (
                  <span className="text-teal-600 text-xs font-bold pl-2 flex-shrink-0">
                    ✓ Correct
                  </span>
                )}
                {isChecked && isThisSelected && !isCorrect && (
                  <span className="text-amber-600 text-xs font-bold pl-2 flex-shrink-0">
                    ✗ Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hint Section */}
        {!isChecked && (
          <div>
            {!showHint ? (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                💡 Need a hint?
              </button>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5 text-amber-950">Hint:</span>
                {currentQ.hint}
              </div>
            )}
          </div>
        )}

        {/* Feedback Section (After Check) */}
        {isChecked && (
          <div
            className={`rounded-2xl border-l-4 p-4 text-sm leading-relaxed ${
              isCorrect
                ? 'border-teal-500 bg-teal-50/80 text-teal-900'
                : 'border-amber-400 bg-amber-50/80 text-amber-900'
            }`}
          >
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              {isCorrect ? "Nice, that's right!" : 'Not quite'}
            </h4>
            <p className="text-xs leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          {!isChecked ? (
            <Button
              variant="primary"
              disabled={selectedOption === null}
              onClick={handleCheck}
            >
              Check Answer
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNext}>
              {isLastQuestion ? 'See Results →' : 'Next Question →'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
