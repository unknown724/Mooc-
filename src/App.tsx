/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  AppView, 
  WeekAssignment, 
  UserMistake, 
  QuizResult, 
  ExamConfig, 
  QuestionItem, 
  AppTheme, 
  FontSizeSetting, 
  UserQuestionStats 
} from './types/quiz';
import { 
  loadSavedWeeks, 
  saveWeeks, 
  loadBookmarks, 
  saveBookmarks, 
  loadMistakes, 
  saveMistakes, 
  loadQuizHistory, 
  saveQuizHistory,
  loadAllBuiltInWeeks,
  loadSingleBuiltInWeek,
  exportAppStateToJson,
  parseImportJson,
  loadTheme,
  saveTheme,
  loadFontSize,
  saveFontSize,
  loadQuestionStats,
  saveQuestionStats
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StudyReaderView } from './components/StudyReaderView';
import { FlashcardView } from './components/FlashcardView';
import { QuizEngineView } from './components/QuizEngineView';
import { MistakeBankView } from './components/MistakeBankView';
import { UploadPdfModal } from './components/UploadPdfModal';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [weeks, setWeeks] = useState<Record<number, WeekAssignment>>(() => loadSavedWeeks());
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());
  const [mistakes, setMistakes] = useState<Record<string, UserMistake>>(() => loadMistakes());
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>(() => loadQuizHistory());
  
  // Eye-comfort theme & typography settings
  const [theme, setTheme] = useState<AppTheme>(() => loadTheme());
  const [fontSize, setFontSize] = useState<FontSizeSetting>(() => loadFontSize());
  const [questionStats, setQuestionStats] = useState<Record<string, UserQuestionStats>>(() => loadQuestionStats());

  // Flatten all loaded questions
  const allLoadedQuestions = useMemo(() => {
    const list: QuestionItem[] = [];
    Object.values(weeks).forEach((w) => {
      if (w.isLoaded && w.questions) {
        list.push(...w.questions);
      }
    });
    return list;
  }, [weeks]);

  // Active quiz config: defaults to all 120 questions with randomizer active
  const [activeExamConfig, setActiveExamConfig] = useState<ExamConfig>(() => ({
    title: 'All 120 Questions Mock Exam',
    selectedWeeks: Array.from({ length: 12 }, (_, i) => i + 1),
    questionCount: 120,
    shuffleQuestions: true,
    shuffleOptions: true,
    mode: 'feedback',
  }));
  
  const [quizQuestionsPool, setQuizQuestionsPool] = useState<QuestionItem[]>([]);
  
  // Filters
  const [readerWeekFilter, setReaderWeekFilter] = useState<number | 'all'>('all');
  const [flashcardWeekFilter, setFlashcardWeekFilter] = useState<number | 'all'>('all');
  
  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Sync state to storage
  useEffect(() => {
    saveWeeks(weeks);
  }, [weeks]);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  useEffect(() => {
    saveMistakes(mistakes);
  }, [mistakes]);

  useEffect(() => {
    saveQuizHistory(quizHistory);
  }, [quizHistory]);

  useEffect(() => {
    saveTheme(theme);
    // Apply theme class to document element for global CSS variables
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  useEffect(() => {
    saveFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    saveQuestionStats(questionStats);
  }, [questionStats]);

  const totalQuestionsLoaded = allLoadedQuestions.length;
  const totalAvailableQuestions = 120;
  
  const masteryPercentage = useMemo(() => {
    if (totalQuestionsLoaded === 0) return 0;
    const totalAttempted = Object.values(weeks).reduce(
      (acc, w) => acc + (w.attemptsCount ? w.questions.length : 0),
      0
    );
    if (totalAttempted === 0) return Math.min(30, Math.round((totalQuestionsLoaded / totalAvailableQuestions) * 25));

    const mistakeCount = Object.keys(mistakes).length;
    const estimatedMastered = Math.max(0, totalQuestionsLoaded - mistakeCount);
    return Math.min(100, Math.round((estimatedMastered / totalAvailableQuestions) * 100));
  }, [weeks, mistakes, totalQuestionsLoaded]);

  // Handlers
  const handleToggleBookmark = useCallback((questionId: string) => {
    setBookmarks((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  }, []);

  const handleSaveNote = useCallback((questionId: string, note: string) => {
    setQuestionStats((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || { attempts: 0, correctCount: 0, bookmarked: false }),
        userNote: note,
      },
    }));
    showToast('Personal study note saved.', 'success');
  }, []);

  const handleStartQuizWithConfig = useCallback((config: ExamConfig) => {
    let pool: QuestionItem[] = [];

    if (config.isRetestMistakes) {
      pool = Object.values(mistakes).map((m) => ({
        id: m.questionId,
        week: m.weekNumber,
        weekNumber: m.weekNumber,
        number: m.questionNumber,
        questionText: m.questionText,
        options: m.options,
        correctOption: m.correctOption,
        explanation: m.explanation,
        topicTag: m.topicTag,
      }));
    } else {
      config.selectedWeeks.forEach((wNum) => {
        const w = weeks[wNum];
        if (w?.isLoaded && w.questions) {
          pool.push(...w.questions);
        }
      });
    }

    if (pool.length === 0) {
      config.selectedWeeks.forEach((wNum) => {
        const full = loadSingleBuiltInWeek(wNum, weeks);
        if (full[wNum]?.questions) {
          pool.push(...full[wNum].questions);
        }
      });
    }

    setActiveExamConfig(config);
    setQuizQuestionsPool(pool);
    setCurrentView('quiz');
  }, [weeks, mistakes]);

  const handleOpenReaderForWeek = useCallback((weekNum: number) => {
    setReaderWeekFilter(weekNum);
    setCurrentView('reader');
  }, []);

  const handleOpenFlashcards = useCallback((weekNum: number | 'all') => {
    setFlashcardWeekFilter(weekNum);
    setCurrentView('flashcards');
  }, []);

  const handleLoadSingleWeek = useCallback((weekNum: number) => {
    const updated = loadSingleBuiltInWeek(weekNum, weeks);
    setWeeks(updated);
  }, [weeks]);

  const handleQuickLoadAll = useCallback(() => {
    const updated = loadAllBuiltInWeeks(weeks);
    setWeeks(updated);
    showToast('All 120 questions across 12 modules synced!', 'success');
  }, [weeks]);

  const handleSaveQuizResult = useCallback((result: QuizResult, newMistakes: Record<string, UserMistake>) => {
    setQuizHistory((prev) => [result, ...prev]);

    setMistakes((prev) => {
      const merged = { ...prev };
      Object.entries(newMistakes).forEach(([qid, mist]) => {
        if (merged[qid]) {
          merged[qid] = {
            ...mist,
            errorCount: (merged[qid].errorCount || 1) + 1,
          };
        } else {
          merged[qid] = mist;
        }
      });

      Object.values(result.answers).forEach((ans) => {
        if (ans.isCorrect && merged[ans.questionId]) {
          delete merged[ans.questionId];
        }
      });
      return merged;
    });

    setWeeks((prev) => {
      const copy = { ...prev };
      result.weeksIncluded.forEach((wNum) => {
        if (copy[wNum]) {
          const prevScore = copy[wNum].bestScore || 0;
          const currentAttempts = copy[wNum].attemptsCount || 0;
          copy[wNum] = {
            ...copy[wNum],
            bestScore: Math.max(prevScore, result.scorePercentage),
            attemptsCount: currentAttempts + 1,
            lastAttemptDate: result.timestamp,
          };
        }
      });
      return copy;
    });
  }, []);

  const handleRetestMissedQuestions = useCallback((missedQuestions: QuestionItem[]) => {
    const weekNumbers = Array.from(new Set(missedQuestions.map((q) => q.week ?? q.weekNumber)));
    setActiveExamConfig({
      title: `Retest Missed Questions (${missedQuestions.length} Items)`,
      selectedWeeks: weekNumbers,
      questionCount: missedQuestions.length,
      shuffleQuestions: true,
      shuffleOptions: true,
      mode: 'feedback',
    });
    setQuizQuestionsPool(missedQuestions);
    setCurrentView('quiz');
  }, []);

  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const handleSelectView = useCallback((view: AppView) => {
    if (view === 'quiz') {
      // Ensure the full pool of all 120 questions is ready and selected
      setQuizQuestionsPool([]);
      setActiveExamConfig({
        title: 'All 120 Questions Comprehensive Exam',
        selectedWeeks: Array.from({ length: 12 }, (_, i) => i + 1),
        questionCount: 120,
        shuffleQuestions: true,
        shuffleOptions: true,
        mode: 'feedback',
      });
    }
    setCurrentView(view);
  }, []);

  const handleExportData = () => {
    exportAppStateToJson(weeks, bookmarks, mistakes, quizHistory);
    showToast('JSON backup exported successfully.', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = parseImportJson(text);
        if (imported.weeks) setWeeks(imported.weeks);
        if (imported.bookmarks) setBookmarks(imported.bookmarks);
        if (imported.mistakes) setMistakes(imported.mistakes);
        if (imported.quizHistory) setQuizHistory(imported.quizHistory);
        showToast('Data successfully imported and restored!', 'success');
      } catch {
        showToast('Failed to parse the uploaded JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleClearMistakes = () => {
    setMistakes({});
    showToast('Mistake bank cleared.', 'info');
  };

  const handleRemoveMistake = (questionId: string) => {
    setMistakes((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
    showToast('Mistake removed from bank.', 'info');
  };

  const fontScaleClass = 
    fontSize === 'small' ? 'font-scale-sm' : fontSize === 'large' ? 'font-scale-lg' : 'font-scale-md';

  return (
    <div 
      className={`min-h-screen theme-${theme} ${fontScaleClass} flex flex-col transition-colors duration-200`}
      style={{
        backgroundColor: 'var(--app-bg)',
        color: 'var(--text-primary)',
      }}
    >
      
      {/* Non-blocking Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-fade-in">
          <div 
            className="px-4 py-2.5 rounded-2xl border text-xs font-semibold shadow-xl flex items-center gap-2 backdrop-blur-md"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <span 
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: toast.type === 'success' 
                  ? 'var(--correct-border)' 
                  : toast.type === 'error' 
                  ? 'var(--incorrect-border)' 
                  : 'var(--accent-color)'
              }} 
            />
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Top Bar with Eye-Comfort Theme Switcher & Font Controls */}
      <Navbar
        currentView={currentView}
        onSelectView={handleSelectView}
        totalQuestionsLoaded={totalQuestionsLoaded}
        totalAvailableQuestions={totalAvailableQuestions}
        masteryPercentage={masteryPercentage}
        mistakesCount={Object.keys(mistakes).length}
        bookmarksCount={bookmarks.length}
        theme={theme}
        onSelectTheme={setTheme}
        fontSize={fontSize}
        onSelectFontSize={setFontSize}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onQuickLoadAll={handleQuickLoadAll}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'dashboard' && (
          <DashboardView
            weeks={weeks}
            mistakes={mistakes}
            bookmarks={bookmarks}
            quizHistory={quizHistory}
            onStartQuizWithConfig={handleStartQuizWithConfig}
            onOpenReaderForWeek={handleOpenReaderForWeek}
            onLoadSingleWeek={handleLoadSingleWeek}
            onQuickLoadAll={handleQuickLoadAll}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onNavigateView={setCurrentView}
          />
        )}

        {currentView === 'reader' && (
          <StudyReaderView
            weeks={weeks}
            bookmarks={bookmarks}
            questionStats={questionStats}
            onToggleBookmark={handleToggleBookmark}
            onSaveNote={handleSaveNote}
            onOpenFlashcards={handleOpenFlashcards}
            initialWeekFilter={readerWeekFilter}
          />
        )}

        {currentView === 'flashcards' && (
          <FlashcardView
            questions={allLoadedQuestions}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            initialWeek={flashcardWeekFilter}
          />
        )}

        {currentView === 'quiz' && (
          <QuizEngineView
            config={activeExamConfig}
            allQuestions={
              quizQuestionsPool.length > 0 && activeExamConfig.isRetestMistakes
                ? quizQuestionsPool
                : allLoadedQuestions
            }
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onSaveQuizResult={handleSaveQuizResult}
            onRetestMissed={handleRetestMissedQuestions}
            onExitQuiz={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'mistakes' && (
          <MistakeBankView
            mistakes={mistakes}
            bookmarks={bookmarks}
            allLoadedQuestions={allLoadedQuestions}
            onStartQuizWithConfig={handleStartQuizWithConfig}
            onClearMistakes={handleClearMistakes}
            onRemoveMistake={handleRemoveMistake}
            onToggleBookmark={handleToggleBookmark}
            onOpenReader={() => setCurrentView('reader')}
          />
        )}
      </main>

      {/* Upload PDFs Modal */}
      <UploadPdfModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onWeeksUpdated={setWeeks}
        currentWeeks={weeks}
        onQuickLoadAll={handleQuickLoadAll}
      />

      {/* Ergonomic Footer */}
      <footer 
        className="border-t py-4 text-center text-xs transition-colors"
        style={{
          borderColor: 'var(--border-color)',
          color: 'var(--text-muted)',
          backgroundColor: 'var(--card-bg)',
        }}
      >
        <p>GeoMastery · NPTEL Conservation Geography (120 Questions · 12 Modules)</p>
      </footer>

    </div>
  );
}
