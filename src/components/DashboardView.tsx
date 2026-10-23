import React, { useState } from 'react';
import { 
  WeekAssignment, 
  ExamConfig, 
  QuizResult, 
  UserMistake, 
  AppView 
} from '../types/quiz';
import { 
  CheckCircle2, 
  Play, 
  BookOpen, 
  UploadCloud, 
  Sparkles, 
  Award, 
  Flame, 
  Sliders, 
  Target, 
  AlertTriangle, 
  Check, 
  ChevronRight, 
  Shuffle, 
  Layers,
  Zap
} from 'lucide-react';

interface DashboardViewProps {
  weeks: Record<number, WeekAssignment>;
  mistakes: Record<string, UserMistake>;
  bookmarks: string[];
  quizHistory: QuizResult[];
  onStartQuizWithConfig: (config: ExamConfig) => void;
  onOpenReaderForWeek: (weekNum: number) => void;
  onLoadSingleWeek: (weekNum: number) => void;
  onQuickLoadAll: () => void;
  onOpenUploadModal: () => void;
  onNavigateView: (view: AppView) => void;
  onOpenQuickDrill?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  weeks,
  mistakes,
  bookmarks,
  quizHistory,
  onStartQuizWithConfig,
  onOpenReaderForWeek,
  onNavigateView,
  onOpenQuickDrill,
}) => {
  // Default to selecting all 12 weeks
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>(
    Array.from({ length: 12 }, (_, i) => i + 1)
  );
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [examMode, setExamMode] = useState<'feedback' | 'timed'>('feedback');
  const [questionCount, setQuestionCount] = useState<number>(120);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(30);

  const totalLoadedQuestions = Object.values(weeks).reduce(
    (acc, w) => acc + (w.isLoaded ? w.questions.length : 0),
    0
  );
  const totalPossibleQuestions = 120;

  const totalAttempts = quizHistory.length;
  const avgAccuracy =
    totalAttempts > 0
      ? Math.round(
          quizHistory.reduce((acc, h) => acc + h.scorePercentage, 0) / totalAttempts
        )
      : 0;

  const masteredQuestionsCount = Object.values(weeks).reduce((acc, w) => {
    if (!w.isLoaded) return acc;
    return (
      acc +
      w.questions.filter((q) => {
        const isMissed = !!mistakes[q.id];
        const isAttempted = (w.attemptsCount || 0) > 0;
        return isAttempted && !isMissed;
      }).length
    );
  }, 0);

  const mistakesCount = Object.keys(mistakes).length;

  const handleToggleWeek = (w: number) => {
    setSelectedWeeks((prev) =>
      prev.includes(w) ? prev.filter((item) => item !== w) : [...prev, w]
    );
  };

  const handleSelectAllWeeks = () => {
    setSelectedWeeks(Array.from({ length: 12 }, (_, i) => i + 1));
  };

  const handleClearWeeks = () => {
    setSelectedWeeks([]);
  };

  const handleLaunchFullMockExam = () => {
    const allWeeks = Array.from({ length: 12 }, (_, i) => i + 1);
    onStartQuizWithConfig({
      title: 'Full 120-Question Randomized Exam',
      selectedWeeks: allWeeks,
      questionCount: 120,
      shuffleQuestions: true,
      shuffleOptions: true,
      mode: 'timed',
      timeLimitMinutes: 45,
    });
  };

  const handleLaunchCustomExam = () => {
    if (selectedWeeks.length === 0) return;
    const title =
      selectedWeeks.length === 12
        ? 'Complete 12-Week Assessment'
        : selectedWeeks.length === 1
        ? `Week ${selectedWeeks[0]} Practice Exam`
        : `Custom Exam (${selectedWeeks.length} Modules)`;

    onStartQuizWithConfig({
      title,
      selectedWeeks,
      questionCount,
      shuffleQuestions,
      shuffleOptions,
      mode: examMode,
      timeLimitMinutes: examMode === 'timed' ? timeLimitMinutes : undefined,
    });
  };

  const handleStartWeekQuiz = (weekNum: number) => {
    onStartQuizWithConfig({
      title: `Week ${weekNum} Assignment Quiz`,
      selectedWeeks: [weekNum],
      questionCount: 10,
      shuffleQuestions: false,
      shuffleOptions: false,
      mode: 'feedback',
    });
  };

  return (
    <div className="space-y-8 pb-24 md:pb-8 animate-fade-in max-w-6xl mx-auto">
      
      {/* Eye-Comfort Hero Card */}
      <div 
        className="p-6 md:p-8 rounded-3xl border shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="space-y-2 max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--accent-color)' }}>
            NPTEL Conservation Geography · Exam Mastery
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Academic Preparation & Quiz Suite
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            All 120 multiple choice questions across all 12 course assignments. Study with eye-comfort reading, drill with the high-yield cheat sheet and 5-Q blitz, or simulate a randomized examination.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onOpenQuickDrill && (
            <button
              onClick={onOpenQuickDrill}
              className="px-4 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-500"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>5-Q Quick Blitz</span>
            </button>
          )}

          <button
            onClick={() => onNavigateView('cheatsheet')}
            className="px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs hover:opacity-90"
            style={{
              backgroundColor: 'var(--app-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>High-Yield Cheat Sheet</span>
          </button>

          <button
            onClick={handleLaunchFullMockExam}
            className="px-5 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: 'var(--accent-color)' }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Take All 120 Questions (Randomized)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div 
          className="p-5 rounded-2xl border shadow-xs"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium">Total Questions</span>
            <Target className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {totalLoadedQuestions} <span className="text-xs font-sans font-normal" style={{ color: 'var(--text-muted)' }}>/ {totalPossibleQuestions}</span>
          </div>
          <div className="mt-1 text-[11px] font-semibold" style={{ color: 'var(--accent-color)' }}>
            12 of 12 assignments active
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border shadow-xs"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium">Average Accuracy</span>
            <Award className="w-4 h-4" style={{ color: 'var(--correct-border)' }} />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {avgAccuracy}%
          </div>
          <div className="mt-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Across {totalAttempts} test sessions
          </div>
        </div>

        <div 
          className="p-5 rounded-2xl border shadow-xs"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium">Mastered Items</span>
            <Flame className="w-4 h-4" style={{ color: 'var(--bookmark-color)' }} />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {masteredQuestionsCount}
          </div>
          <div className="mt-1 text-[11px]" style={{ color: 'var(--bookmark-color)' }}>
            Consistent verified solutions
          </div>
        </div>

        <div 
          onClick={() => onNavigateView('mistakes')}
          className="p-5 rounded-2xl border shadow-xs cursor-pointer transition-all hover:scale-[1.01] group"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-medium">Results & Mistakes</span>
            <Award className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums" style={{ color: 'var(--text-primary)' }}>
            {quizHistory.length} <span className="text-xs font-sans font-normal" style={{ color: 'var(--text-muted)' }}>saved ({mistakesCount} mistakes)</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--accent-color)' }}>
            <span>View marks & review mistakes</span>
            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>

      {/* Custom Exam Builder & Randomizer Suite */}
      <section 
        className="rounded-3xl border p-6 shadow-sm space-y-6"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Header */}
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
              style={{ backgroundColor: 'var(--accent-soft-bg)', color: 'var(--accent-color)' }}
            >
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Exam Builder & Randomizer Suite
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Customize module selection, randomize questions or choices, and drill under exam conditions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllWeeks}
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--accent-soft-bg)',
                borderColor: 'var(--accent-color)',
                color: 'var(--accent-color)',
              }}
            >
              Select All 12 Weeks
            </button>
            <button
              onClick={handleClearWeeks}
              className="px-2.5 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--app-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-muted)',
              }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* 1. Module Selectors */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Modules Included ({selectedWeeks.length} of 12 Selected)
            </span>
            <span className="font-mono tabular-nums font-bold" style={{ color: 'var(--accent-color)' }}>
              {selectedWeeks.length * 10} Questions Selected
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((wNum) => {
              const isSelected = selectedWeeks.includes(wNum);
              return (
                <button
                  key={wNum}
                  type="button"
                  onClick={() => handleToggleWeek(wNum)}
                  className="py-2 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-between border cursor-pointer"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-color)' : 'var(--app-bg)',
                    borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                >
                  <span>Week {wNum}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Configuration & Randomizers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Question Limit</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full border rounded-xl px-3 py-2 text-xs font-medium cursor-pointer focus:outline-none"
              style={{
                backgroundColor: 'var(--app-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              <option value={120}>All 120 Questions (Complete Pool)</option>
              <option value={50}>50 Questions (Comprehensive Mock)</option>
              <option value={20}>20 Questions (Standard Drill)</option>
              <option value={10}>10 Questions (Quick Quiz)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Exam Mode</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setExamMode('feedback')}
                className="py-2 px-2 rounded-xl text-xs font-semibold transition-colors border cursor-pointer"
                style={{
                  backgroundColor: examMode === 'feedback' ? 'var(--accent-soft-bg)' : 'var(--app-bg)',
                  borderColor: examMode === 'feedback' ? 'var(--accent-color)' : 'var(--border-color)',
                  color: examMode === 'feedback' ? 'var(--accent-color)' : 'var(--text-secondary)',
                }}
              >
                Instant Feedback
              </button>
              <button
                type="button"
                onClick={() => setExamMode('timed')}
                className="py-2 px-2 rounded-xl text-xs font-semibold transition-colors border cursor-pointer"
                style={{
                  backgroundColor: examMode === 'timed' ? 'var(--accent-soft-bg)' : 'var(--app-bg)',
                  borderColor: examMode === 'timed' ? 'var(--accent-color)' : 'var(--border-color)',
                  color: examMode === 'timed' ? 'var(--accent-color)' : 'var(--text-secondary)',
                }}
              >
                Timed Exam
              </button>
            </div>
          </div>

          {/* Randomizers */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Randomization</label>
            <div className="flex items-center gap-3 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="rounded"
                />
                <span>Shuffle Questions</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="rounded"
                />
                <span>Shuffle Choices</span>
              </label>
            </div>
          </div>

          {/* Launch CTA */}
          <div className="flex items-end">
            <button
              onClick={handleLaunchCustomExam}
              disabled={selectedWeeks.length === 0}
              className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent-color)' }}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Quiz ({Math.min(questionCount, selectedWeeks.length * 10)} Qs)</span>
            </button>
          </div>

        </div>

      </section>

      {/* 12 Weekly Modules Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
          <h3 className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            12 Course Assignments
          </h3>
          <span>Click any assignment to read solutions or take a quiz</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((weekNum) => {
            const week = weeks[weekNum];
            const hasAttempts = (week?.attemptsCount || 0) > 0;

            return (
              <div
                key={weekNum}
                className="rounded-2xl p-5 border shadow-xs transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--accent-color)' }}>
                      Week {weekNum}
                    </span>
                    <span className="font-mono tabular-nums text-[11px]">10 MCQs</span>
                  </div>

                  <h4 className="mt-2 text-sm font-bold line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                    {week?.title || `Week ${weekNum} Assignment`}
                  </h4>

                  <p className="mt-1 text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {week?.summary || 'Conservation Geography weekly assignment solutions.'}
                  </p>

                  {hasAttempts && (
                    <div 
                      className="mt-3 pt-3 border-t flex items-center justify-between text-[11px]"
                      style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
                    >
                      <span className="font-bold font-mono" style={{ color: 'var(--bookmark-color)' }}>
                        Best: {week.bestScore}%
                      </span>
                      <span>{week.attemptsCount} attempt{week.attemptsCount === 1 ? '' : 's'}</span>
                    </div>
                  )}
                </div>

                <div 
                  className="flex items-center gap-2 pt-2 border-t"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <button
                    onClick={() => onOpenReaderForWeek(weekNum)}
                    className="flex-1 py-1.5 px-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--app-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    <span>Solutions</span>
                  </button>
                  <button
                    onClick={() => handleStartWeekQuiz(weekNum)}
                    className="flex-1 py-1.5 px-2 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-95 cursor-pointer"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Quiz</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
