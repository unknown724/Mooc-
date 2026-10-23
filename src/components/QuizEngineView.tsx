import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  QuestionItem, 
  OptionLabel, 
  ExamConfig, 
  QuizResult, 
  QuizAnswerRecord, 
  UserMistake 
} from '../types/quiz';
import { 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  BookmarkCheck, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Award, 
  Eye, 
  Shuffle, 
  Layers, 
  Sliders, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface QuizEngineViewProps {
  config: ExamConfig;
  allQuestions: QuestionItem[];
  bookmarks: string[];
  onToggleBookmark: (questionId: string) => void;
  onSaveQuizResult: (result: QuizResult, newMistakes: Record<string, UserMistake>) => void;
  onRetestMissed: (missedQuestions: QuestionItem[]) => void;
  onExitQuiz: () => void;
  onViewResults?: () => void;
}

export const QuizEngineView: React.FC<QuizEngineViewProps> = ({
  config,
  allQuestions,
  bookmarks,
  onToggleBookmark,
  onSaveQuizResult,
  onRetestMissed,
  onExitQuiz,
  onViewResults,
}) => {
  // Selected weeks: defaults to all 12 weeks or config
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>(() => {
    if (config.selectedWeeks && config.selectedWeeks.length > 0) {
      return config.selectedWeeks;
    }
    return Array.from({ length: 12 }, (_, i) => i + 1);
  });

  const [isMultiWeekDrawerOpen, setIsMultiWeekDrawerOpen] = useState(false);
  const [randomSeed, setRandomSeed] = useState<number>(0);
  const [shuffleQuestionsActive, setShuffleQuestionsActive] = useState<boolean>(true);
  const [shuffleOptionsActive, setShuffleOptionsActive] = useState<boolean>(true);
  const [examMode, setExamMode] = useState<'feedback' | 'timed'>(config.mode || 'feedback');

  // Compute active question pool based on selected weeks
  const activeQuestionsPool = useMemo(() => {
    if (selectedWeeks.length === 12) {
      return allQuestions;
    }
    const weekSet = new Set(selectedWeeks);
    return allQuestions.filter((q) => {
      const qWeek = q.week ?? q.weekNumber;
      return weekSet.has(qWeek);
    });
  }, [allQuestions, selectedWeeks]);

  // Prepared questions with randomization
  const preparedQuestions = useMemo(() => {
    let pool = [...activeQuestionsPool];
    
    if (shuffleQuestionsActive) {
      pool = [...pool].sort(() => Math.random() - 0.5);
    }

    if (shuffleOptionsActive) {
      return pool.map((q) => {
        const correctText = q.options.find((o) => o.label === q.correctOption)?.text;
        const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
        const labels: OptionLabel[] = ['a', 'b', 'c', 'd'];
        const newOptions = shuffledOpts.map((opt, i) => ({
          label: labels[i],
          text: opt.text,
        }));
        const newCorrectOption = newOptions.find((o) => o.text === correctText)?.label || q.correctOption;

        return {
          ...q,
          options: newOptions,
          correctOption: newCorrectOption,
        };
      });
    }

    return pool;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestionsPool, randomSeed, shuffleQuestionsActive, shuffleOptionsActive]);

  // Reset user answers when questions change (fixes scoring bug on re-shuffle)
  useEffect(() => {
    setUserAnswers({});
    setCurrentIndex(0);
    setIsCompleted(false);
  }, [preparedQuestions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    examMode === 'timed' && config.timeLimitMinutes
      ? config.timeLimitMinutes * 60
      : 30 * 60
  );
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [reviewMode, setReviewMode] = useState(false);

  const currentQ = preparedQuestions[currentIndex];
  const totalQuestions = preparedQuestions.length;

  // Helper to accurately validate question status regardless of option shuffling
  const checkAnswer = useCallback((q: QuestionItem, ansText: string | undefined) => {
    if (!ansText) return { isAnswered: false, isCorrect: false, selectedLabel: null as OptionLabel | null };
    const selectedOpt = q.options.find((o) => o.text === ansText);
    const selectedLabel = selectedOpt ? selectedOpt.label : null;
    const isCorrect = selectedLabel === q.correctOption;
    return { isAnswered: true, isCorrect, selectedLabel };
  }, []);

  const resetQuizProgress = () => {
    setCurrentIndex(0);
    setUserAnswers({});
    setIsCompleted(false);
    setReviewMode(false);
    setSecondsElapsed(0);
  };

  const handleToggleWeek = (wNum: number) => {
    setSelectedWeeks((prev) => {
      let next: number[];
      if (prev.includes(wNum)) {
        next = prev.filter((w) => w !== wNum);
      } else {
        next = [...prev, wNum].sort((a, b) => a - b);
      }
      return next.length > 0 ? next : [wNum];
    });
    resetQuizProgress();
  };

  const handleSelectAllWeeks = () => {
    setSelectedWeeks(Array.from({ length: 12 }, (_, i) => i + 1));
    resetQuizProgress();
  };

  const handleSelectSingleWeek = (wNum: number) => {
    setSelectedWeeks([wNum]);
    resetQuizProgress();
  };

  const handleRandomizeNow = () => {
    setRandomSeed((prev) => prev + 1);
    resetQuizProgress();
  };

  // Timer
  useEffect(() => {
    if (isCompleted) return;

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
      if (examMode === 'timed') {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isCompleted, examMode]);

  const handleSelectOption = useCallback(
    (label: OptionLabel) => {
      if (!currentQ) return;
      if (examMode === 'feedback' && userAnswers[currentQ.id]) {
        return; // locked after initial choice in feedback mode
      }
      const opt = currentQ.options.find(o => o.label === label);
      if (!opt) return;
      setUserAnswers((prev) => ({
        ...prev,
        [currentQ.id]: opt.text,
      }));
    },
    [currentQ, examMode, userAnswers]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinishExam();
    }
  }, [currentIndex, totalQuestions]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleFinishExam = useCallback(() => {
    setIsCompleted(true);

    let correctCount = 0;
    const answerRecords: Record<string, QuizAnswerRecord> = {};
    const newMistakes: Record<string, UserMistake> = {};

    preparedQuestions.forEach((q) => {
      const selectedText = userAnswers[q.id] || null;
      const selectedOption = q.options.find(o => o.text === selectedText);
      const selectedLabel = selectedOption ? selectedOption.label : null;
      const isCorrect = selectedLabel === q.correctOption;
      if (isCorrect) correctCount++;

      const correctOpt = q.options.find(o => o.label === q.correctOption);

      answerRecords[q.id] = {
        questionId: q.id,
        selectedOption: selectedLabel,
        correctOption: q.correctOption,
        isCorrect,
        timeSpentSeconds: 0,
        questionText: q.questionText,
        selectedText,
        correctText: correctOpt?.text,
        options: q.options,
        explanation: q.explanation,
        topicTag: q.topicTag,
        weekNumber: q.week ?? q.weekNumber,
        questionNumber: q.number,
      };

      if (!isCorrect && selectedText !== null) {
        newMistakes[q.id] = {
          questionId: q.id,
          weekNumber: q.week ?? q.weekNumber,
          questionNumber: q.number,
          questionText: q.questionText,
          options: q.options,
          selectedOption: selectedLabel as any,
          correctOption: q.correctOption,
          explanation: q.explanation,
          topicTag: q.topicTag,
          timestamp: new Date().toISOString(),
          errorCount: 1,
        };
      }
    });

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const title = selectedWeeks.length === 12 
      ? 'All 120 Questions Comprehensive Exam' 
      : selectedWeeks.length === 1 
      ? `Week ${selectedWeeks[0]} Module Quiz`
      : `Custom Quiz (${selectedWeeks.length} Weeks, ${totalQuestions} Qs)`;

    const result: QuizResult = {
      id: `quiz_${Date.now()}`,
      timestamp: new Date().toISOString(),
      examTitle: title,
      mode: examMode,
      weeksIncluded: selectedWeeks,
      totalQuestions,
      correctCount,
      scorePercentage,
      timeTakenSeconds: secondsElapsed,
      answers: answerRecords,
    };

    onSaveQuizResult(result, newMistakes);
  }, [preparedQuestions, userAnswers, totalQuestions, examMode, selectedWeeks, secondsElapsed, onSaveQuizResult]);

  // Full Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key.toUpperCase();

      if (key === '1' || key === 'A') {
        e.preventDefault();
        handleSelectOption('a');
      } else if (key === '2' || (key === 'B' && !e.shiftKey && !e.metaKey && !e.ctrlKey)) {
        e.preventDefault();
        handleSelectOption('b');
      } else if (key === '3' || key === 'C') {
        e.preventDefault();
        handleSelectOption('c');
      } else if (key === '4' || key === 'D') {
        e.preventDefault();
        handleSelectOption('d');
      } else if (key === 'ARROWLEFT') {
        e.preventDefault();
        handlePrevious();
      } else if (key === 'ARROWRIGHT' || key === 'ENTER' || e.code === 'Space') {
        e.preventDefault();
        handleNext();
      } else if ((key === 'M' || key === 'K' || (e.shiftKey && key === 'B')) && currentQ) {
        e.preventDefault();
        onToggleBookmark(currentQ.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSelectOption, handleNext, handlePrevious, currentQ, onToggleBookmark]);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentQ || preparedQuestions.length === 0) {
    return (
      <div 
        className="max-w-2xl mx-auto p-8 text-center rounded-2xl border space-y-4"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        <h3 className="text-base font-semibold">No Questions in Selected Scope</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Please select another module or load all 120 questions.
        </p>
        <button
          onClick={handleSelectAllWeeks}
          className="px-4 py-2 rounded-xl text-white text-xs font-semibold cursor-pointer shadow-xs"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          Load All 120 Questions
        </button>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (isCompleted && !reviewMode) {
    const correctCount = preparedQuestions.filter((q) => checkAnswer(q, userAnswers[q.id]).isCorrect).length;
    const scorePct = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const missedQuestions = preparedQuestions.filter((q) => {
      const status = checkAnswer(q, userAnswers[q.id]);
      return status.isAnswered && !status.isCorrect;
    });

    return (
      <div 
        className="max-w-2xl mx-auto rounded-2xl border p-4 sm:p-6 sm:rounded-3xl shadow-sm text-center space-y-4 sm:space-y-6 animate-fade-in pb-24 md:pb-8"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        <div 
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto shadow-xs"
          style={{ backgroundColor: 'var(--accent-soft-bg)', color: 'var(--accent-color)' }}
        >
          <Award className="w-7 h-7 sm:w-8 sm:h-8" />
        </div>

        <div>
          <div className="text-[11px] sm:text-xs font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {selectedWeeks.length === 12 ? 'All 120 Questions' : `Weeks: ${selectedWeeks.join(', ')}`} Assessment
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
            Quiz Completed
          </h2>
          <div 
            className="text-4xl sm:text-5xl font-extrabold font-mono tabular-nums mt-2"
            style={{ color: 'var(--accent-color)' }}
          >
            {scorePct}%
          </div>
          <div className="text-[11px] sm:text-xs font-semibold mt-1" style={{ color: 'var(--correct-text)' }}>
            {correctCount} of {totalQuestions} answered correctly
          </div>
        </div>

        <div 
          className="grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border text-[11px] sm:text-xs"
          style={{
            backgroundColor: 'var(--app-bg)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div>
            <div style={{ color: 'var(--text-muted)' }}>Time Elapsed</div>
            <div className="text-sm sm:text-base font-mono tabular-nums font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
              {formatTime(secondsElapsed)}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)' }}>Missed Items</div>
            <div className="text-sm sm:text-base font-mono tabular-nums font-bold mt-0.5" style={{ color: 'var(--incorrect-text)' }}>
              {missedQuestions.length}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => setReviewMode(true)}
            className="w-full h-12 px-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--app-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <Eye className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <span>Review Full Solutions & Explanations</span>
          </button>

          {missedQuestions.length > 0 && (
            <button
              type="button"
              onClick={() => onRetestMissed(missedQuestions)}
              className="w-full h-12 px-4 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
              style={{ backgroundColor: 'var(--incorrect-border)' }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retest {missedQuestions.length} Mistake{missedQuestions.length === 1 ? '' : 's'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleRandomizeNow}
            className="w-full h-12 px-4 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <Shuffle className="w-4 h-4" />
            <span>Retry Assessment (New Random Order)</span>
          </button>

          {onViewResults && (
            <button
              type="button"
              onClick={onViewResults}
              className="w-full h-12 px-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--accent-soft-bg)',
                borderColor: 'var(--accent-color)',
                color: 'var(--accent-color)',
              }}
            >
              <Award className="w-4 h-4" />
              <span>View Saved in Results & Mistakes Center</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- REVIEW MODE ---
  if (isCompleted && reviewMode) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-24 md:pb-8 animate-fade-in">
        <div 
          className="flex items-center justify-between p-4 rounded-2xl border"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <h3 className="text-sm font-semibold">Complete Solution Review</h3>
          <button
            onClick={() => setReviewMode(false)}
            className="px-3.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--app-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            Back to Score
          </button>
        </div>

        <div className="space-y-4">
          {preparedQuestions.map((q, i) => {
            const userPickText = userAnswers[q.id];
            const status = checkAnswer(q, userPickText);
            const isCorrect = status.isCorrect;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Q{i + 1}</span>
                    <span>·</span>
                    <span>Week {q.week ?? q.weekNumber}</span>
                    <span>·</span>
                    <span>{q.topicTag}</span>
                  </div>
                  <div>
                    {isCorrect ? (
                      <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--correct-text)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="font-semibold flex items-center gap-1" style={{ color: 'var(--incorrect-text)' }}>
                        <XCircle className="w-3.5 h-3.5" /> Missed
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {q.questionText}
                </p>

                <div className="space-y-2 text-xs">
                  {q.options.map((opt) => {
                    const isRightKey = opt.label === q.correctOption;
                    const isUserChoice = opt.text === userPickText;

                    let bg = 'var(--app-bg)';
                    let border = 'var(--border-color)';
                    let textColor = 'var(--text-secondary)';

                    if (isRightKey) {
                      bg = 'var(--correct-bg)';
                      border = 'var(--correct-border)';
                      textColor = 'var(--correct-text)';
                    } else if (isUserChoice && !isRightKey) {
                      bg = 'var(--incorrect-bg)';
                      border = 'var(--incorrect-border)';
                      textColor = 'var(--incorrect-text)';
                    }

                    return (
                      <div 
                        key={opt.label} 
                        className="p-3 rounded-xl border flex items-center justify-between gap-2"
                        style={{ backgroundColor: bg, borderColor: border, color: textColor }}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span 
                            className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] uppercase shrink-0 font-mono"
                            style={{
                              backgroundColor: isRightKey ? 'var(--correct-border)' : 'var(--hover-bg)',
                              color: isRightKey ? '#ffffff' : 'var(--text-secondary)',
                            }}
                          >
                            {opt.label}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isRightKey && <span className="text-[10px] font-bold uppercase font-mono">Key</span>}
                        {isUserChoice && !isRightKey && <span className="text-[10px] font-bold uppercase font-mono">Your Pick</span>}
                      </div>
                    );
                  })}
                </div>

                <div 
                  className="p-3 rounded-xl border text-xs leading-relaxed"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Rationale: </span>
                  {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- ACTIVE QUIZ VIEW: Constrained to max-w-2xl (~65ch) for eye comfort ---
  const currentAnswerText = userAnswers[currentQ.id];
  const isAnswered = !!currentAnswerText;
  const selectedOption = currentQ.options.find(o => o.text === currentAnswerText);
  const selectedLabel = selectedOption ? selectedOption.label : null;
  const isCurrentCorrect = selectedLabel === currentQ.correctOption;
  const isBookmarked = bookmarks.includes(currentQ.id);

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24 md:pb-8 animate-fade-in">
      
      {/* 1. Scope & Week Selector Panel */}
      <div 
        className="p-4 rounded-2xl border shadow-xs space-y-3"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <span className="font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              <Layers className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
              <span>Exam Scope:</span>
            </span>
            <span className="font-mono tabular-nums font-bold" style={{ color: 'var(--accent-color)' }}>
              {totalQuestions} Questions Active
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMultiWeekDrawerOpen(!isMultiWeekDrawerOpen)}
            className="text-[11px] flex items-center gap-1 transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            <Sliders className="w-3 h-3" style={{ color: 'var(--accent-color)' }} />
            <span>{isMultiWeekDrawerOpen ? 'Hide Week Filter' : 'Custom Week Filter'}</span>
            {isMultiWeekDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Quick Scope Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin text-xs">
          {/* All 120 Questions Button */}
          <button
            type="button"
            onClick={handleSelectAllWeeks}
            className="px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
            style={{
              backgroundColor: selectedWeeks.length === 12 ? 'var(--accent-color)' : 'var(--app-bg)',
              color: selectedWeeks.length === 12 ? '#ffffff' : 'var(--text-secondary)',
              border: selectedWeeks.length === 12 ? '1px solid transparent' : '1px solid var(--border-color)',
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>All 120 Questions</span>
          </button>

          {/* Quick single-week direct pills */}
          {Array.from({ length: 12 }, (_, i) => i + 1).map((wNum) => {
            const isSolelySelected = selectedWeeks.length === 1 && selectedWeeks[0] === wNum;
            const isIncluded = selectedWeeks.includes(wNum);

            return (
              <button
                key={wNum}
                type="button"
                onClick={() => handleSelectSingleWeek(wNum)}
                className="px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer"
                style={{
                  backgroundColor: isSolelySelected 
                    ? 'var(--accent-color)' 
                    : isIncluded && selectedWeeks.length < 12 
                    ? 'var(--hover-bg)' 
                    : 'var(--app-bg)',
                  color: isSolelySelected ? '#ffffff' : 'var(--text-secondary)',
                  border: isSolelySelected ? '1px solid transparent' : '1px solid var(--border-color)',
                }}
                title={`Drill Week ${wNum} (10 questions)`}
              >
                <span>Week {wNum}</span>
              </button>
            );
          })}
        </div>

        {/* Multi-Week Multi-Select Drawer */}
        {isMultiWeekDrawerOpen && (
          <div 
            className="p-3.5 rounded-xl border space-y-3 animate-fade-in text-xs"
            style={{
              backgroundColor: 'var(--app-bg)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between" style={{ color: 'var(--text-muted)' }}>
              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Select Any Combination of Modules:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAllWeeks}
                  className="text-[11px] font-semibold hover:underline cursor-pointer"
                  style={{ color: 'var(--accent-color)' }}
                >
                  Select All 12
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => handleSelectSingleWeek(1)}
                  className="text-[11px] hover:underline cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Reset to Week 1
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((wNum) => {
                const isSelected = selectedWeeks.includes(wNum);
                return (
                  <button
                    key={wNum}
                    type="button"
                    onClick={() => handleToggleWeek(wNum)}
                    className="py-2 px-2.5 rounded-lg border text-center transition-all flex items-center justify-between gap-1 cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-soft-bg)' : 'var(--card-bg)',
                      borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                      color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span>Week {wNum}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Header with Randomizer, Timer & Actions */}
      <div 
        className="p-4 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: 'var(--accent-color)' }}>
            {selectedWeeks.length === 12
              ? 'All 120 Questions (12 Weeks)'
              : `Selected: ${selectedWeeks.length} Week(s) · ${totalQuestions} Qs`}
          </span>
          <span style={{ color: 'var(--border-color)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {examMode === 'feedback' ? 'Instant Feedback' : 'Timed Mode'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Randomizer Button */}
          <button
            onClick={handleRandomizeNow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs"
            style={{
              backgroundColor: 'var(--app-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--accent-color)',
            }}
            title="Randomize question sequence"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Randomize Order</span>
          </button>

          {/* Option Shuffle Toggle */}
          <button
            onClick={() => setShuffleOptionsActive(!shuffleOptionsActive)}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer"
            style={{
              backgroundColor: shuffleOptionsActive ? 'var(--accent-soft-bg)' : 'var(--app-bg)',
              borderColor: shuffleOptionsActive ? 'var(--accent-color)' : 'var(--border-color)',
              color: shuffleOptionsActive ? 'var(--accent-color)' : 'var(--text-muted)',
            }}
            title="Randomize A/B/C/D option positions"
          >
            Shuffle Choices: {shuffleOptionsActive ? 'ON' : 'OFF'}
          </button>

          {/* Timer */}
          <div 
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs font-mono tabular-nums"
            style={{
              backgroundColor: 'var(--app-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-secondary)',
            }}
          >
            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            {examMode === 'timed' ? (
              <span style={{ color: secondsRemaining < 120 ? 'var(--incorrect-text)' : 'var(--text-primary)' }}>
                {formatTime(secondsRemaining)}
              </span>
            ) : (
              <span>{formatTime(secondsElapsed)}</span>
            )}
          </div>

          {/* Bookmark */}
          <button
            onClick={() => onToggleBookmark(currentQ.id)}
            className="p-1.5 rounded-lg border transition-colors cursor-pointer"
            style={{
              backgroundColor: isBookmarked ? 'var(--bookmark-bg)' : 'var(--app-bg)',
              borderColor: isBookmarked ? 'var(--bookmark-color)' : 'var(--border-color)',
              color: isBookmarked ? 'var(--bookmark-color)' : 'var(--text-muted)',
            }}
            title="Bookmark this question"
          >
            {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>

          {/* Exit */}
          <button
            onClick={onExitQuiz}
            className="text-xs px-2 py-1 transition-colors cursor-pointer hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            Exit
          </button>
        </div>
      </div>

      {/* 3. Question Navigator Strip */}
      <div 
        className="p-3 rounded-2xl border"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between text-xs mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="font-mono tabular-nums text-[11px]">
            {Object.keys(userAnswers).length} answered
          </span>
        </div>

        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 scrollbar-thin">
          {preparedQuestions.map((q, idx) => {
            const hasAnswer = !!userAnswers[q.id];
            const isCurrent = idx === currentIndex;
            const isMarked = bookmarks.includes(q.id);

            let bg = 'var(--app-bg)';
            let color = 'var(--text-muted)';
            let border = 'var(--border-color)';

            if (examMode === 'feedback' && hasAnswer) {
              const right = checkAnswer(q, userAnswers[q.id]).isCorrect;
              bg = right ? 'var(--correct-bg)' : 'var(--incorrect-bg)';
              color = right ? 'var(--correct-text)' : 'var(--incorrect-text)';
              border = right ? 'var(--correct-border)' : 'var(--incorrect-border)';
            } else if (hasAnswer) {
              bg = 'var(--accent-soft-bg)';
              color = 'var(--accent-color)';
              border = 'var(--accent-color)';
            }

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-7 h-7 rounded-lg text-xs font-mono tabular-nums font-semibold transition-all flex items-center justify-center cursor-pointer border ${
                  isCurrent ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: bg,
                  color,
                  borderColor: border,
                  // @ts-ignore
                  '--tw-ring-color': 'var(--accent-color)',
                }}
              >
                <span>{idx + 1}</span>
                {isMarked && (
                  <span 
                    className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--bookmark-color)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Active Question Card: Stems text-lg md:text-xl font-semibold, Options text-base */}
      <div 
        className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        
        {/* Metadata Header */}
        <div 
          className="flex items-center justify-between text-xs pb-3 border-b"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
              Week {currentQ.week ?? currentQ.weekNumber}
            </span>
            <span>·</span>
            <span className="font-mono tabular-nums font-semibold">Question {currentQ.number}</span>
            <span>·</span>
            <span style={{ color: 'var(--text-secondary)' }}>{currentQ.topicTag}</span>
          </div>

          <div className="text-[11px] hidden sm:flex items-center gap-1.5 font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
            <span>Keys:</span>
            <kbd className="px-1.5 py-0.5 rounded border text-[10px]" style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--border-color)' }}>A-D / 1-4</kbd>
            <kbd className="px-1.5 py-0.5 rounded border text-[10px]" style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--border-color)' }}>Space / ↵</kbd>
            <kbd className="px-1.5 py-0.5 rounded border text-[10px]" style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--border-color)' }}>M: Bookmark</kbd>
          </div>
        </div>

        {/* Question Stem: text-lg md:text-xl font-semibold leading-relaxed tracking-tight */}
        <h3 
          className="text-lg md:text-xl font-semibold leading-relaxed tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          {currentQ.questionText}
        </h3>

        {/* Option Cards: text-base leading-normal py-3.5 px-4 rounded-2xl border */}
        <div className="space-y-2.5 pt-1">
          {currentQ.options.map((opt) => {
            const isSelected = currentAnswerText === opt.text;
            const isKey = opt.label === currentQ.correctOption;

            let bg = 'var(--app-bg)';
            let border = 'var(--border-color)';
            let color = 'var(--text-secondary)';
            let badgeBg = 'var(--hover-bg)';
            let badgeColor = 'var(--text-secondary)';

            if (examMode === 'feedback' && isAnswered) {
              if (isKey) {
                bg = 'var(--correct-bg)';
                border = 'var(--correct-border)';
                color = 'var(--correct-text)';
                badgeBg = 'var(--correct-border)';
                badgeColor = '#ffffff';
              } else if (isSelected && !isKey) {
                bg = 'var(--incorrect-bg)';
                border = 'var(--incorrect-border)';
                color = 'var(--incorrect-text)';
                badgeBg = 'var(--incorrect-border)';
                badgeColor = '#ffffff';
              } else {
                color = 'var(--text-muted)';
              }
            } else if (isSelected) {
              bg = 'var(--accent-soft-bg)';
              border = 'var(--accent-color)';
              color = 'var(--text-primary)';
              badgeBg = 'var(--accent-color)';
              badgeColor = '#ffffff';
            }

            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => handleSelectOption(opt.label)}
                disabled={examMode === 'feedback' && isAnswered}
                className="w-full min-h-[52px] text-base leading-normal py-3 px-4 rounded-2xl border transition-all duration-150 flex items-center justify-between gap-3 cursor-pointer select-none text-left shadow-2xs active:scale-[0.99] disabled:active:scale-100"
                style={{
                  backgroundColor: bg,
                  borderColor: border,
                  color,
                }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 font-mono transition-colors"
                    style={{
                      backgroundColor: badgeBg,
                      color: badgeColor,
                    }}
                  >
                    {opt.label}
                  </div>
                  <div className="flex-1 font-medium">
                    {opt.text}
                  </div>
                </div>

                {examMode === 'feedback' && isAnswered && isKey && (
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: 'var(--correct-border)' }} />
                )}
                {examMode === 'feedback' && isAnswered && isSelected && !isKey && (
                  <XCircle className="w-5 h-5 shrink-0" style={{ color: 'var(--incorrect-border)' }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Navigation Action Buttons: Balanced, Equal Height, Touch-Optimized */}
        <div 
          className="flex items-center gap-2 sm:gap-3 pt-5 border-t"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1 h-12 px-3 sm:px-5 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{
              backgroundColor: 'var(--app-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Previous</span>
          </button>

          {/* Quick Bookmark Toggle right in the thumb zone */}
          <button
            type="button"
            onClick={() => onToggleBookmark(currentQ.id)}
            className="h-12 w-12 rounded-2xl border flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs active:scale-95"
            style={{
              backgroundColor: isBookmarked ? 'var(--bookmark-bg)' : 'var(--app-bg)',
              borderColor: isBookmarked ? 'var(--bookmark-color)' : 'var(--border-color)',
              color: isBookmarked ? 'var(--bookmark-color)' : 'var(--text-muted)',
            }}
            title={isBookmarked ? 'Bookmarked (Tap to remove)' : 'Bookmark this question'}
          >
            {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex-[1.4] sm:flex-1 h-12 px-4 sm:px-6 rounded-2xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] cursor-pointer"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <span>
              {currentIndex === totalQuestions - 1
                ? 'Finish Assessment'
                : 'Next Question'}
            </span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>

      </div>

    </div>
  );
};
