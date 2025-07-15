import { Artifact } from '@/components/create-artifact';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { DiffView } from '@/components/diffview';
import {
  ClockRewind,
  CopyIcon,
  MessageIcon,
  RedoIcon,
  UndoIcon,
  RefreshIcon,
} from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface QuizData {
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  }>;
}

interface QuizState {
  currentQuestion: number;
  answers: number[];
  showResults: boolean;
  score: number;
}

interface QuizArtifactMetadata {
  quizState: QuizState;
}

export const quizArtifact = new Artifact<'quiz', QuizArtifactMetadata>({
  kind: 'quiz',
  description: 'Interactive quiz generator for learning and assessment.',
  initialize: async ({ setMetadata }) => {
    setMetadata({
      quizState: {
        currentQuestion: 0,
        answers: [],
        showResults: false,
        score: 0,
      },
    });
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'text-delta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + (streamPart.content as string),
          isVisible:
            draftArtifact.status === 'streaming' &&
            draftArtifact.content.length > 200 &&
            draftArtifact.content.length < 250
              ? true
              : draftArtifact.isVisible,
          status: 'streaming',
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    getDocumentContentById,
    isLoading,
    metadata,
    setMetadata,
  }) => {
    const [quizData, setQuizData] = useState<QuizData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      if (content) {
        try {
          const parsed = JSON.parse(content);
          setQuizData(parsed);
          setError(null);
        } catch (e) {
          setError('Invalid quiz format');
        }
      }
    }, [content]);

    const handleAnswer = (answerIndex: number) => {
      if (!metadata || !quizData) return;

      const newAnswers = [...metadata.quizState.answers];
      newAnswers[metadata.quizState.currentQuestion] = answerIndex;

      const isLastQuestion =
        metadata.quizState.currentQuestion === quizData.questions.length - 1;

      if (isLastQuestion) {
        const score = newAnswers.reduce((total, answer, index) => {
          return total + (answer === quizData.questions[index].correct ? 1 : 0);
        }, 0);

        setMetadata({
          quizState: {
            ...metadata.quizState,
            answers: newAnswers,
            showResults: true,
            score,
          },
        });
      } else {
        setMetadata({
          quizState: {
            ...metadata.quizState,
            answers: newAnswers,
            currentQuestion: metadata.quizState.currentQuestion + 1,
          },
        });
      }
    };

    const resetQuiz = () => {
      setMetadata({
        quizState: {
          currentQuestion: 0,
          answers: [],
          showResults: false,
          score: 0,
        },
      });
    };

    const goToQuestion = (questionIndex: number) => {
      if (!metadata) return;
      setMetadata({
        quizState: {
          ...metadata.quizState,
          currentQuestion: questionIndex,
          showResults: false,
        },
      });
    };

    if (isLoading) {
      return <DocumentSkeleton artifactKind="quiz" />;
    }

    if (mode === 'diff') {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);
      return <DiffView oldContent={oldContent} newContent={newContent} />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <div className="text-sm text-muted-foreground">
            Please regenerate the quiz
          </div>
        </div>
      );
    }

    if (!quizData || !metadata) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Loading quiz...</div>
        </div>
      );
    }

    if (metadata.quizState.showResults) {
      return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Quiz Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {metadata.quizState.score}/{quizData.questions.length}
                </div>
                <div className="text-lg text-muted-foreground mb-4">
                  {Math.round(
                    (metadata.quizState.score / quizData.questions.length) *
                      100,
                  )}
                  % Score
                </div>
                <Progress
                  value={
                    (metadata.quizState.score / quizData.questions.length) * 100
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-4">
                {quizData.questions.map((question, index) => {
                  const userAnswer = metadata.quizState.answers[index];
                  const isCorrect = userAnswer === question.correct;

                  return (
                    <div
                      key={`question-${index}-${question.question.substring(0, 20)}`}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <Badge variant={isCorrect ? 'default' : 'destructive'}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {question.question}
                      </p>
                      <div className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={`option-${index}-${optionIndex}-${option.substring(0, 10)}`}
                            className={`text-sm p-2 rounded ${
                              optionIndex === question.correct
                                ? 'bg-green-100 text-green-800'
                                : optionIndex === userAnswer
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-50'
                            }`}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <strong>Explanation:</strong> {question.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button onClick={resetQuiz} className="w-full">
                <RefreshIcon className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    const currentQuestion =
      quizData.questions[metadata.quizState.currentQuestion];
    const progress =
      ((metadata.quizState.currentQuestion + 1) / quizData.questions.length) *
      100;

    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{quizData.title}</h1>
            <Badge variant="secondary">
              {metadata.quizState.currentQuestion + 1} /{' '}
              {quizData.questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              Question {metadata.quizState.currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">{currentQuestion.question}</p>

            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <Button
                  key={`current-option-${index}-${option.substring(0, 10)}`}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-4"
                  onClick={() => handleAnswer(index)}
                >
                  <span className="font-medium mr-2">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() =>
              goToQuestion(Math.max(0, metadata.quizState.currentQuestion - 1))
            }
            disabled={metadata.quizState.currentQuestion === 0}
          >
            Previous
          </Button>

          <div className="flex space-x-2">
            {quizData.questions.map((question, index) => (
              <Button
                key={`nav-${index}-${question.question.substring(0, 10)}`}
                variant={
                  index === metadata.quizState.currentQuestion
                    ? 'default'
                    : 'outline'
                }
                size="sm"
                onClick={() => goToQuestion(index)}
                className="w-8 h-8 p-0"
              >
                {index + 1}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={() =>
              goToQuestion(
                Math.min(
                  quizData.questions.length - 1,
                  metadata.quizState.currentQuestion + 1,
                ),
              )
            }
            disabled={
              metadata.quizState.currentQuestion ===
              quizData.questions.length - 1
            }
          >
            Next
          </Button>
        </div>
      </div>
    );
  },
  actions: [
    {
      icon: <ClockRewind size={18} />,
      description: 'View changes',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('toggle');
      },
      isDisabled: ({ currentVersionIndex }) => {
        return currentVersionIndex === 0;
      },
    },
    {
      icon: <UndoIcon size={18} />,
      description: 'View Previous version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('prev');
      },
      isDisabled: ({ currentVersionIndex }) => {
        return currentVersionIndex === 0;
      },
    },
    {
      icon: <RedoIcon size={18} />,
      description: 'View Next version',
      onClick: ({ handleVersionChange }) => {
        handleVersionChange('next');
      },
      isDisabled: ({ isCurrentVersion }) => {
        return isCurrentVersion;
      },
    },
    {
      icon: <CopyIcon size={18} />,
      description: 'Copy quiz JSON',
      onClick: ({ content }) => {
        navigator.clipboard.writeText(content);
        toast.success('Quiz JSON copied to clipboard!');
      },
    },
    {
      icon: <RefreshIcon size={18} />,
      description: 'Reset quiz',
      onClick: ({ setMetadata }) => {
        setMetadata((prev) => ({
          ...prev,
          quizState: {
            currentQuestion: 0,
            answers: [],
            showResults: false,
            score: 0,
          },
        }));
        toast.success('Quiz reset!');
      },
    },
  ],
  toolbar: [
    {
      icon: <MessageIcon />,
      description: 'Add more questions',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content:
            'Please add 3 more questions to this quiz with varying difficulty levels.',
        });
      },
    },
    {
      icon: <RefreshIcon />,
      description: 'Regenerate quiz',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content:
            'Please regenerate this quiz with different questions on the same topic.',
        });
      },
    },
  ],
});
