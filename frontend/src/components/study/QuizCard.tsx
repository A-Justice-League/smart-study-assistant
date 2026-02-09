import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, RotateCcw, Brain, Trophy } from 'lucide-react';
import type { Quiz, QuizState } from '@/types';

interface QuizCardProps {
  quiz: Quiz | null;
  isLoading?: boolean;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const optionVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.1,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
};

const feedbackVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export default function QuizCard({ quiz, isLoading = false }: QuizCardProps) {
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

  if (isLoading) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="min-h-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span>Generating Quiz</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-10 w-24 ml-auto" />
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!quiz) {
    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="min-h-96 flex items-center justify-center border-dashed">
          <CardContent className="text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 rounded-full bg-muted">
                <Brain className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground font-medium">
                  Ready to test your knowledge
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "Generate Quiz" to create questions from your content
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (state.isComplete) {
    const correctCount = state.answers.filter(
      (answer, index) => answer === quiz.questions[index].correct_answer
    ).length;
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);

    return (
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span>Quiz Complete!</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
            >
              <div className="text-6xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                {correctCount}/{quiz.questions.length}
              </div>
              <p className="text-xl text-muted-foreground mt-2">{percentage}% correct</p>
              <div className="mt-4">
                {percentage >= 80 ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Trophy className="w-5 h-5" />
                    <span className="font-medium">Excellent work!</span>
                  </div>
                ) : percentage >= 60 ? (
                  <div className="flex items-center justify-center gap-2 text-yellow-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Good job!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Brain className="w-5 h-5" />
                    <span className="font-medium">Keep practicing!</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {quiz.questions.map((question, index) => {
                const isCorrect = state.answers[index] === question.correct_answer;
                return (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      isCorrect ? 'bg-green-500/10 border-green-200' : 'bg-red-500/10 border-red-200'
                    }`}
                  >
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className="text-sm font-medium">Question {index + 1}</span>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{question.question}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <Button onClick={resetQuiz} className="w-full gap-2">
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const currentQuestion = quiz.questions[state.currentIndex];
  const progress = ((state.currentIndex + 1) / quiz.questions.length) * 100;
  const isCorrect = state.selectedAnswer === currentQuestion.correct_answer;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span>{quiz.title}</span>
            </div>
            <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-1 rounded">
              {state.currentIndex + 1} / {quiz.questions.length}
            </span>
          </CardTitle>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <Progress value={progress} className="mt-2" />
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-lg font-medium">{currentQuestion.question}</p>
          </motion.div>

          <div className="space-y-2">
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((option, index) => (
              <motion.button
                key={index}
                custom={index}
                variants={optionVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ scale: state.showFeedback ? 1 : 1.02 }}
                whileTap={{ scale: state.showFeedback ? 1 : 0.98 }}
                onClick={() => !state.showFeedback && handleSelectAnswer(index)}
                disabled={state.showFeedback}
                className={`w-full p-4 text-left rounded-lg border transition-all duration-200 text-left ${
                  state.showFeedback
                    ? index === currentQuestion.correct_answer
                      ? 'border-green-500 bg-green-500/10'
                      : state.selectedAnswer === index
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-muted bg-muted/50'
                    : state.selectedAnswer === index
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    state.showFeedback
                      ? index === currentQuestion.correct_answer
                        ? 'border-green-500 bg-green-500'
                        : state.selectedAnswer === index
                        ? 'border-red-500 bg-red-500'
                        : 'border-muted'
                      : state.selectedAnswer === index
                      ? 'border-primary bg-primary'
                      : 'border-muted'
                  }`}>
                    {state.selectedAnswer === index && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </motion.button>
            ))}

            {currentQuestion.type === 'true-false' && (
              <div className="flex gap-4">
                {['True', 'False'].map((option, index) => {
                  const value = index === 0;
                  return (
                    <motion.button
                      key={option}
                      custom={index}
                      variants={optionVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ scale: state.showFeedback ? 1 : 1.02 }}
                      whileTap={{ scale: state.showFeedback ? 1 : 0.98 }}
                      onClick={() => !state.showFeedback && handleSelectAnswer(value)}
                      disabled={state.showFeedback}
                      className={`flex-1 p-4 text-center rounded-lg border transition-all duration-200 ${
                        state.showFeedback
                          ? value === currentQuestion.correct_answer
                            ? 'border-green-500 bg-green-500/10'
                            : state.selectedAnswer === value
                            ? 'border-red-500 bg-red-500/10'
                            : 'border-muted bg-muted/50'
                          : state.selectedAnswer === value
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          state.showFeedback
                            ? value === currentQuestion.correct_answer
                              ? 'border-green-500 bg-green-500'
                              : state.selectedAnswer === value
                              ? 'border-red-500 bg-red-500'
                              : 'border-muted'
                            : state.selectedAnswer === value
                            ? 'border-primary bg-primary'
                            : 'border-muted'
                        }`}>
                          {state.selectedAnswer === value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          <AnimatePresence>
            {state.showFeedback && (
              <motion.div
                variants={feedbackVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.8 }}
                className={`p-4 rounded-lg border ${
                  isCorrect 
                    ? 'bg-green-500/10 text-green-700 border-green-200' 
                    : 'bg-red-500/10 text-red-700 border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span>Incorrect</span>
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm">{currentQuestion.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="flex justify-end"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {!state.showFeedback ? (
              <Button 
                onClick={handleSubmitAnswer} 
                disabled={state.selectedAnswer === null}
                className="gap-2"
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion}
                className="gap-2"
              >
                {state.currentIndex + 1 >= quiz.questions.length ? 'See Results' : 'Next Question'}
              </Button>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
