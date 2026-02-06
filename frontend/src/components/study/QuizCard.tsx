import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import type { Quiz, QuizState } from '@/types';

interface QuizCardProps {
  quiz: Quiz | null;
}

export default function QuizCard({ quiz }: QuizCardProps) {
  const [state, setState] = useState<QuizState>({
    currentIndex: 0,
    selectedAnswer: null,
    showFeedback: false,
    answers: [],
    isComplete: false,
  });

  const resetQuiz = useCallback(() => {
    setState({
      currentIndex: 0,
      selectedAnswer: null,
      showFeedback: false,
      answers: [],
      isComplete: false,
    });
  }, []);

  const handleSelectAnswer = useCallback((answer: number | boolean) => {
    setState((prev) => ({ ...prev, selectedAnswer: answer }));
  }, []);

  const handleSubmitAnswer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showFeedback: true,
      answers: [...prev.answers, prev.selectedAnswer],
    }));
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (!quiz) return;

    const nextIndex = state.currentIndex + 1;
    if (nextIndex >= quiz.questions.length) {
      setState((prev) => ({ ...prev, isComplete: true }));
    } else {
      setState((prev) => ({
        ...prev,
        currentIndex: nextIndex,
        selectedAnswer: null,
        showFeedback: false,
      }));
    }
  }, [quiz, state.currentIndex]);

  if (!quiz) {
    return (
      <Card className="min-h-[300px] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground text-center">
            Click "Generate Quiz" to create a quiz from your content
          </p>
        </CardContent>
      </Card>
    );
  }

  if (state.isComplete) {
    const correctCount = state.answers.filter(
      (answer, index) => answer === quiz.questions[index].correct_answer
    ).length;
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="text-5xl font-bold text-primary">
              {correctCount}/{quiz.questions.length}
            </div>
            <p className="text-xl text-muted-foreground mt-2">{percentage}% correct</p>
          </div>

          <div className="space-y-2">
            {quiz.questions.map((question, index) => {
              const isCorrect = state.answers[index] === question.correct_answer;
              return (
                <div
                  key={question.id}
                  className={`flex items-center gap-2 p-2 rounded ${
                    isCorrect ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-sm">Question {index + 1}</span>
                </div>
              );
            })}
          </div>

          <Button onClick={resetQuiz} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[state.currentIndex];
  const progress = ((state.currentIndex + 1) / quiz.questions.length) * 100;
  const isCorrect = state.selectedAnswer === currentQuestion.correct_answer;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{quiz.title}</span>
          <span className="text-sm font-normal text-muted-foreground">
            {state.currentIndex + 1} / {quiz.questions.length}
          </span>
        </CardTitle>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-lg font-medium">{currentQuestion.question}</p>
        </div>

        <div className="space-y-2">
          {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((option, index) => (
            <button
              key={index}
              onClick={() => !state.showFeedback && handleSelectAnswer(index)}
              disabled={state.showFeedback}
              className={`w-full p-3 text-left rounded-lg border transition-colors ${
                state.showFeedback
                  ? index === currentQuestion.correct_answer
                    ? 'border-green-500 bg-green-500/10'
                    : state.selectedAnswer === index
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-muted'
                  : state.selectedAnswer === index
                  ? 'border-primary bg-primary/10'
                  : 'border-muted hover:border-primary/50'
              }`}
            >
              {option}
            </button>
          ))}

          {currentQuestion.type === 'true-false' && (
            <div className="flex gap-4">
              {['True', 'False'].map((option, index) => {
                const value = index === 0;
                return (
                  <button
                    key={option}
                    onClick={() => !state.showFeedback && handleSelectAnswer(value)}
                    disabled={state.showFeedback}
                    className={`flex-1 p-3 text-center rounded-lg border transition-colors ${
                      state.showFeedback
                        ? value === currentQuestion.correct_answer
                          ? 'border-green-500 bg-green-500/10'
                          : state.selectedAnswer === value
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-muted'
                        : state.selectedAnswer === value
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {state.showFeedback && (
          <div
            className={`p-4 rounded-lg ${
              isCorrect ? 'bg-green-500/10 text-green-700' : 'bg-red-500/10 text-red-700'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Correct!
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5" />
                  Incorrect
                </>
              )}
            </div>
            <p className="mt-2 text-sm">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-end">
          {!state.showFeedback ? (
            <Button onClick={handleSubmitAnswer} disabled={state.selectedAnswer === null}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {state.currentIndex + 1 >= quiz.questions.length ? 'See Results' : 'Next Question'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
