// src/data/quizzes.js
// Quiz question definitions for the 4 lab assessment stages.
// Each question contains: prompt, options (4), correctIndex, hint, explanation.

export const QUIZZES = {
  // Step 2: Warm-up Quiz (3 questions)
  pre: {
    id: 'pre',
    title: 'Warm-up Quiz',
    questions: [
      {
        prompt: 'What does a cost function (such as Mean Squared Error) measure in linear regression?',
        options: [
          "How far the model's predictions are from the actual target values on average",
          'The number of parameters inside the regression equation',
          'How fast the computer executes each step of the algorithm',
          'The physical units of the input features'
        ],
        correctIndex: 0,
        hint: 'Think of cost as a penalty or score for errors — a higher score means bigger mistakes.',
        explanation: 'A cost function measures the overall error of our model. Our goal is to minimize this value so the line fits the data as closely as possible.'
      },
      {
        prompt: 'What does the gradient of the cost function tell you at any current point?',
        options: [
          'The direction and steepness of the fastest uphill increase in cost',
          'The exact location of the valley bottom',
          'The total number of samples in the dataset',
          'The percentage of correct predictions made so far'
        ],
        correctIndex: 0,
        hint: 'Like feeling the ground on a hill, the gradient points toward the steepest climb uphill.',
        explanation: 'The gradient is a vector of partial derivatives pointing in the direction of steepest ascent (greatest increase). By going the opposite way, we head downhill.'
      },
      {
        prompt: 'To reduce cost and move toward the bottom of the valley, in which direction should we update our parameters?',
        options: [
          'In the opposite direction of the gradient (negative gradient)',
          'In the exact direction of the gradient',
          'Perpendicular to the slope along the contour lines',
          'In a random direction until the cost decreases'
        ],
        correctIndex: 0,
        hint: 'If the gradient points uphill, where do you walk to find the valley bottom?',
        explanation: 'Because the gradient points uphill toward higher error, taking steps in the negative gradient direction moves downhill toward minimum cost.'
      }
    ]
  },

  // Step 5: Mini-Quiz 1 (2 questions)
  mid1: {
    id: 'mid1',
    title: 'Mini-Quiz 1: Hiker Analogy',
    questions: [
      {
        prompt: 'When stepping down the foggy hillside, what happens if your step size (learning rate) is set too large?',
        options: [
          'You will overshoot the valley bottom and bounce back and forth between opposite slopes',
          'The algorithm stops immediately because the gradient becomes zero',
          'The cost function automatically flattens out into a horizontal plane',
          'You take microscopic baby steps that never leave the starting point'
        ],
        correctIndex: 0,
        hint: 'Imagine taking giant strides across a narrow creek — you might land high on the opposite bank.',
        explanation: 'An oversized learning rate makes you take steps larger than the valley width. You leap over the minimum, bouncing from wall to wall or even diverging.'
      },
      {
        prompt: 'During the simulation, what does it mean when the slope (gradient) under your boots becomes nearly zero?',
        options: [
          'You have reached or are very close to the valley bottom (minimum cost)',
          'The model has lost connection with the dataset',
          'You are at the steepest point on the mountain',
          'The learning rate has automatically dropped to zero'
        ],
        correctIndex: 0,
        hint: 'Where on a bowl or mountain valley is the terrain completely flat?',
        explanation: 'At the bottom of a smooth convex bowl, the slope is horizontal (zero gradient). Near-zero slope means your model has reached the optimal parameters.'
      }
    ]
  },

  // Step 6: Mini-Quiz 2 (3 questions)
  // Conceptual only, never quote numbers from specific runs.
  mid2: {
    id: 'mid2',
    title: 'Mini-Quiz 2: Experimental Behaviors',
    questions: [
      {
        prompt: 'When you observe a loss curve that levels off and flattens horizontally across iterations, what does that indicate?',
        options: [
          'The model is nearing convergence because updates are producing negligible changes in loss',
          'The dataset ran out of samples to evaluate',
          'The learning rate has inverted and is walking uphill',
          'The model parameters are oscillating violently between positive and negative infinity'
        ],
        correctIndex: 0,
        hint: 'When consecutive steps yield almost identical error values, the descent has settled.',
        explanation: 'A flattening loss curve shows that improvements between iterations have become tiny, indicating that the parameters have settled into the minimum.'
      },
      {
        prompt: 'Why is setting an extremely small learning rate problematic in practical machine learning?',
        options: [
          'It causes a slow crawl that wastes compute time and may stop before reaching the minimum',
          'It causes the loss to immediately explode toward infinity',
          'It forces the regression line to have a negative slope',
          'It changes the mathematical shape of the cost bowl'
        ],
        correctIndex: 0,
        hint: 'Taking millimeter steps down a mountain will eventually get you there, but how long will it take?',
        explanation: 'With a tiny step size, each update makes minuscule progress. The run may exhaust its maximum iteration limit long before getting near the optimal line.'
      },
      {
        prompt: 'If the loss curve shoots rapidly upward toward extremely large numbers, what does this tell you?',
        options: [
          'The learning rate is too large, causing unstable steps that magnify error on each iteration',
          'The model found a perfect line with zero error',
          'The dataset needs more rows to be solved',
          'The tolerance value was set too low'
        ],
        correctIndex: 0,
        hint: 'When every bounce lands higher up the mountain than the previous one, the algorithm is unstable.',
        explanation: 'Divergence happens when steps are so aggressive that the model leaps past the valley and lands higher on the opposite slope, compounding error exponentially.'
      }
    ]
  },

  // Step 7: Final Quiz (6 questions)
  final: {
    id: 'final',
    title: 'Final Mastery Quiz',
    questions: [
      {
        prompt: 'In the parameter update rule w = w - lr * gradient, what role does each component play?',
        options: [
          'The gradient gives the slope direction, lr scales the step size, and the minus sign ensures downhill motion',
          'w is the learning rate, lr is the weight, and the gradient is the final loss',
          'The minus sign increases the loss, while lr converts the result into physical units',
          'The gradient counts iterations, and lr normalizes the dataset'
        ],
        correctIndex: 0,
        hint: 'Break down the formula: what tells you which way is up? What scales how far you step? Why subtract?',
        explanation: 'The gradient provides the direction and steepness of ascent; multiplying by lr controls your step length; subtracting moves you in the opposite direction (steepest descent).'
      },
      {
        prompt: 'How does a well-tuned learning rate compare to one that is too small or too large?',
        options: [
          'It converges steadily in few iterations without the slow crawl of tiny rates or the bouncing of large rates',
          'It guarantees zero loss on the very first iteration',
          'It eliminates the need for computing gradients altogether',
          'It only updates the bias while leaving the weight fixed'
        ],
        correctIndex: 0,
        hint: 'Think of balance: not too sluggish, not too wild, but steady and direct.',
        explanation: 'A well-tuned learning rate strikes the ideal balance: fast progress toward the minimum while maintaining stability and avoiding oscillations.'
      },
      {
        prompt: 'In our virtual lab, how does the algorithm determine that gradient descent has converged?',
        options: [
          'When the absolute change in loss between consecutive iterations falls below a small tolerance',
          'When the loss reaches exactly zero',
          'When the timer reaches exactly ten seconds',
          'When the weight and bias become equal to each other'
        ],
        correctIndex: 0,
        hint: 'Because gradient descent asymptotically approaches the minimum, we stop when steps produce virtually no difference.',
        explanation: 'Since the slope shrinks smoothly as we reach the bottom, we declare convergence when |loss_new - loss_prev| is smaller than our tolerance threshold (tol).'
      },
      {
        prompt: 'What is the primary purpose of setting a maximum iteration limit (maxIters)?',
        options: [
          'To prevent infinite loops if the algorithm is crawling too slowly or oscillating',
          'To artificially increase the accuracy of the model',
          'To make sure the dataset is loaded multiple times',
          'To divide the loss by the number of steps taken'
        ],
        correctIndex: 0,
        hint: 'What happens if a run with an extremely small learning rate never meets tolerance?',
        explanation: 'The iteration limit acts as a computational safety guardrail, guaranteeing the algorithm terminates within a reasonable timeframe even if convergence is slow.'
      },
      {
        prompt: 'Why is it valuable to compare gradient descent results against the exact closed-form analytical solution?',
        options: [
          'It provides a known mathematical benchmark to verify that gradient descent reached the true optimum',
          'Closed-form solutions are required to calculate the gradients during each step',
          'Gradient descent only works if the closed-form line is plotted first',
          'It proves that iterative methods are always less accurate than analytical equations'
        ],
        correctIndex: 0,
        hint: 'When building and verifying an iterative optimization solver, how do you know your answer is correct?',
        explanation: 'For simple linear regression, the closed-form normal equation gives the exact global minimum. Comparing against it confirms our gradient descent implementation correctly converged.'
      },
      {
        prompt: 'A student tests three learning rates: Rate A takes 500 steps and is still slowly drifting downward; Rate B converges smoothly in 15 steps; Rate C bounces wildly from wall to wall. Which rate should they choose?',
        options: [
          'Rate B, because it reaches the minimum efficiently with stable, steady descent',
          'Rate A, because more iterations always mean better machine learning results',
          'Rate C, because bouncing explores more of the parameter space',
          'None of them, because learning rates cannot be compared'
        ],
        correctIndex: 0,
        hint: 'Which behavior reaches the valley floor quickly without erratic oscillation?',
        explanation: 'Rate B demonstrates ideal smooth convergence. Rate A is a slow crawl that wastes iterations, and Rate C is overshooting with unstable oscillations.'
      }
    ]
  }
};
