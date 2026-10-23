import React, { useState, useMemo } from 'react';
import { UserMistake, QuestionItem, ExamConfig, QuizResult } from '../types/quiz';
import { 
  AlertTriangle, 
  Bookmark, 
  RotateCcw, 
  Trash2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  BookmarkCheck,
  BookOpen,
  Award,
  Clock,
  Calendar,
  Layers,
  Play,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface MistakeBankViewProps {
  quizHistory?: QuizResult[];
  mistakes: Record<string, UserMistake>;
  bookmarks: string[];
  allLoadedQuestions: QuestionItem[];
  onStartQuizWithConfig: (config: ExamConfig) => void;
  onClearMistakes: () => void;
  onRemoveMistake: (questionId: string) => void;
  onToggleBookmark: (questionId: string) => void;
  onOpenReader: () => void;
  onClearQuizHistory?: () => void;
}

export const MistakeBankView: React.FC<MistakeBankViewProps> = ({
  quizHistory = [],
  mistakes,
  bookmarks,
  allLoadedQuestions,
  onStartQuizWithConfig,
  onClearMistakes,
  onRemoveMistake,
  onToggleBookmark,
  onClearQuizHistory,
}) => {
  // Default to results if history exists, otherwise mistakes
  const [activeTab, setActiveTab] = useState<'results' | 'mistakes' | 'bookmarks'>(() => {
    return quizHistory.length > 0 ? 'results' : 'mistakes';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');

  // Detailed quiz question review accordion state
  const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
  const [resultQuestionFilter, setResultQuestionFilter] = useState<'all' | 'incorrect' | 'correct'>('incorrect');

  const mistakeList = useMemo(() => {
    return Object.values(mistakes).sort((a, b) => (b.errorCount || 1) - (a.errorCount || 1));
  }, [mistakes]);

  const bookmarkedQuestions = useMemo(() => {
    return allLoadedQuestions.filter((q) => bookmarks.includes(q.id));
  }, [allLoadedQuestions, bookmarks]);

  const filteredQuizHistory = useMemo(() => {
    return quizHistory.filter((h) => {
      if (selectedWeek !== 'all' && !h.weeksIncluded.includes(selectedWeek)) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          h.examTitle.toLowerCase().includes(query) ||
          h.mode.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [quizHistory, selectedWeek, searchQuery]);

  const filteredMistakes = useMemo(() => {
    return mistakeList.filter((m) => {
      if (selectedWeek !== 'all' && m.weekNumber !== selectedWeek) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          m.questionText.toLowerCase().includes(query) ||
          m.explanation.toLowerCase().includes(query) ||
          m.topicTag.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [mistakeList, selectedWeek, searchQuery]);

  const filteredBookmarks = useMemo(() => {
    return bookmarkedQuestions.filter((q) => {
      const qWeek = q.week ?? q.weekNumber;
      if (selectedWeek !== 'all' && qWeek !== selectedWeek) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          q.questionText.toLowerCase().includes(query) ||
          q.explanation.toLowerCase().includes(query) ||
          q.topicTag.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [bookmarkedQuestions, selectedWeek, searchQuery]);

  const handleRetestMistakes = () => {
    if (mistakeList.length === 0) return;
    const weekNumbers = Array.from(new Set(mistakeList.map((m) => m.weekNumber)));

    onStartQuizWithConfig({
      title: `Spaced Repetition Drill (${mistakeList.length} Mistakes)`,
      selectedWeeks: weekNumbers,
      questionCount: mistakeList.length,
      shuffleQuestions: true,
      shuffleOptions: true,
      mode: 'feedback',
      isRetestMistakes: true,
    });
  };

  const handleRetestBookmarks = () => {
    if (bookmarkedQuestions.length === 0) return;
    const weekNumbers = Array.from(new Set(bookmarkedQuestions.map((b) => b.week ?? b.weekNumber)));

    onStartQuizWithConfig({
      title: `Bookmarked Items Drill (${bookmarkedQuestions.length} Items)`,
      selectedWeeks: weekNumbers,
      questionCount: bookmarkedQuestions.length,
      shuffleQuestions: false,
      shuffleOptions: false,
      mode: 'feedback',
    });
  };

  const handleRetestHistoryExam = (h: QuizResult) => {
    onStartQuizWithConfig({
      title: `Retest: ${h.examTitle}`,
      selectedWeeks: h.weeksIncluded,
      questionCount: h.totalQuestions,
      shuffleQuestions: true,
      shuffleOptions: true,
      mode: h.mode,
    });
  };

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const formatDate = (dateIso: string) => {
    try {
      const d = new Date(dateIso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateIso;
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-fade-in max-w-2xl mx-auto">
      
      {/* Top Banner */}
      <div 
        className="p-6 rounded-3xl border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Results & Mistake Bank
            </h2>
            <div className="flex items-center gap-1.5">
              <span 
                className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--accent-soft-bg)',
                  color: 'var(--accent-color)',
                }}
              >
                <Award className="w-3 h-3" />
                {quizHistory.length} Marks Saved
              </span>
              {mistakeList.length > 0 && (
                <span 
                  className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full font-bold"
                  style={{
                    backgroundColor: 'var(--incorrect-badge-bg)',
                    color: 'var(--incorrect-text)',
                  }}
                >
                  {mistakeList.length} Mistakes
                </span>
              )}
            </div>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            All your quiz marks obtained, performance history, and missed questions are saved here for focused review.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activeTab === 'results' && (
            <>
              <button
                type="button"
                onClick={() => onStartQuizWithConfig({
                  title: 'All 120 Questions Comprehensive Exam',
                  selectedWeeks: Array.from({ length: 12 }, (_, i) => i + 1),
                  questionCount: 120,
                  shuffleQuestions: true,
                  shuffleOptions: true,
                  mode: 'feedback',
                })}
                className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>New Quiz</span>
              </button>

              {quizHistory.length > 0 && onClearQuizHistory && (
                <button
                  type="button"
                  onClick={onClearQuizHistory}
                  className="p-2.5 rounded-xl border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)',
                  }}
                  title="Clear all recorded quiz results"
                >
                  <Trash2 className="w-4 h-4 hover:text-red-500 transition-colors" />
                </button>
              )}
            </>
          )}

          {activeTab === 'mistakes' && (
            <>
              <button
                type="button"
                onClick={handleRetestMistakes}
                disabled={mistakeList.length === 0}
                className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--incorrect-border)' }}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Launch Drill ({mistakeList.length})</span>
              </button>

              {mistakeList.length > 0 && (
                <button
                  type="button"
                  onClick={onClearMistakes}
                  className="p-2.5 rounded-xl border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-muted)',
                  }}
                  title="Clear all recorded mistakes"
                >
                  <Trash2 className="w-4 h-4 hover:text-red-500 transition-colors" />
                </button>
              )}
            </>
          )}

          {activeTab === 'bookmarks' && (
            <button
              type="button"
              onClick={handleRetestBookmarks}
              disabled={bookmarkedQuestions.length === 0}
              className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--bookmark-color)' }}
            >
              <Bookmark className="w-4 h-4 fill-current" />
              <span>Drill Bookmarks ({bookmarkedQuestions.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div 
        className="p-4 rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        {/* Segmented Control with 3 Tabs */}
        <div 
          className="flex items-center p-0.5 rounded-xl border text-xs font-semibold overflow-x-auto scrollbar-thin"
          style={{
            backgroundColor: 'var(--app-bg)',
            borderColor: 'var(--border-color)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'results' ? 'shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeTab === 'results' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'results' ? 'var(--accent-color)' : 'var(--text-secondary)',
            }}
          >
            <Award className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
            <span>Quiz Results ({quizHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mistakes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'mistakes' ? 'shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeTab === 'mistakes' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'mistakes' ? 'var(--incorrect-text)' : 'var(--text-secondary)',
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: 'var(--incorrect-border)' }} />
            <span>Mistakes ({mistakeList.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'bookmarks' ? 'shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: activeTab === 'bookmarks' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'bookmarks' ? 'var(--bookmark-color)' : 'var(--text-secondary)',
            }}
          >
            <Bookmark className="w-3.5 h-3.5" style={{ color: 'var(--bookmark-color)' }} />
            <span>Bookmarks ({bookmarkedQuestions.length})</span>
          </button>
        </div>

        {/* Filter by Module & Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border focus:outline-none"
              style={{
                backgroundColor: 'var(--app-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-lg px-2.5 py-1.5 text-xs border cursor-pointer focus:outline-none shrink-0"
            style={{
              backgroundColor: 'var(--app-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All Modules</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>Week {w}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="space-y-4">
        
        {/* TAB 1: SAVED QUIZ RESULTS & MARKS OBTAINED */}
        {activeTab === 'results' && (
          filteredQuizHistory.length === 0 ? (
            <div 
              className="p-10 text-center rounded-2xl border space-y-3"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
                style={{ backgroundColor: 'var(--accent-soft-bg)', color: 'var(--accent-color)' }}
              >
                <Award className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No Quiz Results Saved Yet</p>
              <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
                Whenever you complete an exam or module quiz, your score, marks obtained, and time taken are automatically saved and displayed here.
              </p>
              <button
                type="button"
                onClick={() => onStartQuizWithConfig({
                  title: 'All 120 Questions Comprehensive Exam',
                  selectedWeeks: Array.from({ length: 12 }, (_, i) => i + 1),
                  questionCount: 120,
                  shuffleQuestions: true,
                  shuffleOptions: true,
                  mode: 'feedback',
                })}
                className="px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Take a Quiz Now</span>
              </button>
            </div>
          ) : (
            filteredQuizHistory.map((h) => {
              const score = h.scorePercentage;
              const isPassing = score >= 80;
              const isAverage = score >= 60 && score < 80;
              const badgeColor = isPassing ? 'var(--correct-text)' : isAverage ? 'var(--bookmark-color)' : 'var(--incorrect-text)';
              const badgeBg = isPassing ? 'var(--correct-bg)' : isAverage ? 'var(--bookmark-bg)' : 'var(--incorrect-bg)';
              const badgeBorder = isPassing ? 'var(--correct-border)' : isAverage ? 'var(--bookmark-color)' : 'var(--incorrect-border)';

              return (
                <div
                  key={h.id}
                  className="p-5 rounded-2xl border space-y-4 shadow-2xs transition-all"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(h.timestamp)}</span>
                        </span>
                        <span>·</span>
                        <span className="capitalize">{h.mode} Mode</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums">{h.weeksIncluded.length === 12 ? 'All 12 Modules' : `W${h.weeksIncluded.join(', ')}`}</span>
                      </div>

                      <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                        {h.examTitle}
                      </h4>
                    </div>

                    {/* Mark Obtained Badge */}
                    <div 
                      className="px-3.5 py-1.5 rounded-xl border text-center shrink-0"
                      style={{
                        backgroundColor: badgeBg,
                        borderColor: badgeBorder,
                        color: badgeColor,
                      }}
                    >
                      <div className="text-xl font-extrabold font-mono tabular-nums leading-none">
                        {h.scorePercentage}%
                      </div>
                      <div className="text-[10px] font-semibold uppercase mt-0.5">
                        {h.correctCount}/{h.totalQuestions} Mark
                      </div>
                    </div>
                  </div>

                  {/* Metrics Strip */}
                  <div 
                    className="grid grid-cols-3 gap-2 p-3 rounded-xl border text-xs"
                    style={{
                      backgroundColor: 'var(--app-bg)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Correct</div>
                      <div className="font-mono font-bold text-sm mt-0.5" style={{ color: 'var(--correct-text)' }}>
                        {h.correctCount} Qs
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Missed</div>
                      <div className="font-mono font-bold text-sm mt-0.5" style={{ color: 'var(--incorrect-text)' }}>
                        {h.totalQuestions - h.correctCount} Qs
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Time Spent</div>
                      <div className="font-mono font-bold text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>
                        {formatTime(h.timeTakenSeconds)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (expandedResultId === h.id) {
                          setExpandedResultId(null);
                        } else {
                          setExpandedResultId(h.id);
                          setResultQuestionFilter('incorrect');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      style={{
                        backgroundColor: expandedResultId === h.id ? 'var(--accent-color)' : 'var(--app-bg)',
                        borderColor: expandedResultId === h.id ? 'var(--accent-color)' : 'var(--border-color)',
                        color: expandedResultId === h.id ? '#ffffff' : 'var(--text-primary)',
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{expandedResultId === h.id ? 'Hide Question Breakdown' : 'Review Questions & Options'}</span>
                      {expandedResultId === h.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRetestHistoryExam(h)}
                      className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                      style={{
                        backgroundColor: 'var(--app-bg)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--accent-color)',
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retest Exam</span>
                    </button>
                  </div>

                  {/* Expanded Detailed Question & Options Breakdown */}
                  {expandedResultId === h.id && (() => {
                    const answerList = Object.values(h.answers || {});
                    const missedCount = answerList.filter(a => !a.isCorrect).length;
                    const correctCount = answerList.filter(a => a.isCorrect).length;

                    const displayedAnswers = answerList.filter((a) => {
                      if (resultQuestionFilter === 'incorrect') return !a.isCorrect;
                      if (resultQuestionFilter === 'correct') return a.isCorrect;
                      return true;
                    });

                    return (
                      <div 
                        className="space-y-4 pt-4 border-t animate-fade-in"
                        style={{ borderColor: 'var(--border-color)' }}
                      >
                        {/* Question Breakdown Filter Pills */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Question Breakdown ({answerList.length} Total):
                          </span>

                          <div 
                            className="flex items-center p-0.5 rounded-lg border text-xs font-semibold"
                            style={{
                              backgroundColor: 'var(--app-bg)',
                              borderColor: 'var(--border-color)',
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => setResultQuestionFilter('incorrect')}
                              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                                resultQuestionFilter === 'incorrect' ? 'shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{
                                backgroundColor: resultQuestionFilter === 'incorrect' ? 'var(--incorrect-badge-bg)' : 'transparent',
                                color: resultQuestionFilter === 'incorrect' ? 'var(--incorrect-text)' : 'var(--text-secondary)',
                              }}
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Wrong Only ({missedCount})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setResultQuestionFilter('all')}
                              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                                resultQuestionFilter === 'all' ? 'shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{
                                backgroundColor: resultQuestionFilter === 'all' ? 'var(--card-bg)' : 'transparent',
                                color: resultQuestionFilter === 'all' ? 'var(--accent-color)' : 'var(--text-secondary)',
                              }}
                            >
                              <span>All ({answerList.length})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setResultQuestionFilter('correct')}
                              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                                resultQuestionFilter === 'correct' ? 'shadow-xs font-bold' : 'opacity-70 hover:opacity-100'
                              }`}
                              style={{
                                backgroundColor: resultQuestionFilter === 'correct' ? 'var(--correct-bg)' : 'transparent',
                                color: resultQuestionFilter === 'correct' ? 'var(--correct-text)' : 'var(--text-secondary)',
                              }}
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Correct ({correctCount})</span>
                            </button>
                          </div>
                        </div>

                        {/* Questions List */}
                        {displayedAnswers.length === 0 ? (
                          <div 
                            className="p-6 text-center rounded-xl border text-xs"
                            style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--border-color)' }}
                          >
                            {resultQuestionFilter === 'incorrect' ? (
                              <div className="space-y-1">
                                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500" />
                                <p className="font-bold" style={{ color: 'var(--correct-text)' }}>Zero Wrong Answers!</p>
                                <p style={{ color: 'var(--text-muted)' }}>You answered all questions correctly in this quiz attempt.</p>
                              </div>
                            ) : (
                              <p style={{ color: 'var(--text-muted)' }}>No questions match this filter.</p>
                            )}
                          </div>
                        ) : (
                          displayedAnswers.map((ans, idx) => {
                            const qItem = allLoadedQuestions.find(q => q.id === ans.questionId);
                            const qText = ans.questionText || qItem?.questionText || 'Question';
                            const qOptions = ans.options || qItem?.options || [];
                            const qExplanation = ans.explanation || qItem?.explanation || '';
                            const qTopic = ans.topicTag || qItem?.topicTag || '';
                            const qWeek = ans.weekNumber || (qItem?.week ?? qItem?.weekNumber) || '';
                            const qNum = ans.questionNumber || qItem?.number || (idx + 1);
                            const isSavedBookmark = bookmarks.includes(ans.questionId);

                            return (
                              <div
                                key={ans.questionId}
                                className="p-4 rounded-xl border space-y-3 transition-colors"
                                style={{
                                  backgroundColor: 'var(--app-bg)',
                                  borderColor: ans.isCorrect ? 'var(--border-color)' : 'var(--incorrect-border)',
                                }}
                              >
                                {/* Question Header */}
                                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                                      W{qWeek}
                                    </span>
                                    <span>·</span>
                                    <span className="font-mono tabular-nums font-semibold">Q{qNum}</span>
                                    {qTopic && (
                                      <>
                                        <span>·</span>
                                        <span style={{ color: 'var(--text-secondary)' }}>{qTopic}</span>
                                      </>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {ans.isCorrect ? (
                                      <span className="flex items-center gap-1 font-bold text-xs" style={{ color: 'var(--correct-text)' }}>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Correct
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 font-bold text-xs" style={{ color: 'var(--incorrect-text)' }}>
                                        <XCircle className="w-3.5 h-3.5" />
                                        Missed / Wrong
                                      </span>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() => onToggleBookmark(ans.questionId)}
                                      className="p-1 rounded cursor-pointer transition-colors"
                                      style={{ color: isSavedBookmark ? 'var(--bookmark-color)' : 'var(--text-muted)' }}
                                      title={isSavedBookmark ? 'Remove bookmark' : 'Bookmark this question'}
                                    >
                                      {isSavedBookmark ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </div>

                                {/* Question Stem */}
                                <p className="text-sm font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                                  {qText}
                                </p>

                                {/* Options Breakdown */}
                                <div className="space-y-2 text-xs">
                                  {qOptions.map((opt) => {
                                    const isRightKey = ans.correctText 
                                      ? opt.text === ans.correctText 
                                      : opt.label === ans.correctOption;
                                    const isUserChoice = ans.selectedText 
                                      ? opt.text === ans.selectedText 
                                      : opt.label === ans.selectedOption;

                                    let optBg = 'var(--card-bg)';
                                    let optBorder = 'var(--border-color)';
                                    let optColor = 'var(--text-secondary)';
                                    let badgeBg = 'var(--hover-bg)';
                                    let badgeColor = 'var(--text-secondary)';

                                    if (isRightKey) {
                                      optBg = 'var(--correct-bg)';
                                      optBorder = 'var(--correct-border)';
                                      optColor = 'var(--correct-text)';
                                      badgeBg = 'var(--correct-border)';
                                      badgeColor = '#ffffff';
                                    } else if (isUserChoice && !isRightKey) {
                                      optBg = 'var(--incorrect-bg)';
                                      optBorder = 'var(--incorrect-border)';
                                      optColor = 'var(--incorrect-text)';
                                      badgeBg = 'var(--incorrect-border)';
                                      badgeColor = '#ffffff';
                                    }

                                    return (
                                      <div
                                        key={opt.label}
                                        className="p-2.5 sm:p-3 rounded-xl border flex items-center justify-between gap-2 transition-colors"
                                        style={{
                                          backgroundColor: optBg,
                                          borderColor: optBorder,
                                          color: optColor,
                                        }}
                                      >
                                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                          <span 
                                            className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] uppercase shrink-0 font-mono"
                                            style={{
                                              backgroundColor: badgeBg,
                                              color: badgeColor,
                                            }}
                                          >
                                            {opt.label}
                                          </span>
                                          <span className="font-medium">{opt.text}</span>
                                        </div>

                                        {/* Status Tags */}
                                        <div className="shrink-0 flex items-center gap-1 font-mono text-[10px] font-bold uppercase">
                                          {isRightKey && (
                                            <span 
                                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-white" 
                                              style={{ backgroundColor: 'var(--correct-border)' }}
                                            >
                                              <CheckCircle2 className="w-3 h-3" />
                                              Solution Key
                                            </span>
                                          )}
                                          {isUserChoice && !isRightKey && (
                                            <span 
                                              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-white" 
                                              style={{ backgroundColor: 'var(--incorrect-border)' }}
                                            >
                                              <XCircle className="w-3 h-3" />
                                              Your Pick
                                            </span>
                                          )}
                                          {isUserChoice && isRightKey && (
                                            <span 
                                              className="px-1.5 py-0.5 rounded hidden sm:inline" 
                                              style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--correct-text)' }}
                                            >
                                              (Your Pick)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Explanation */}
                                {qExplanation && (
                                  <div 
                                    className="p-3 rounded-xl border text-xs leading-relaxed"
                                    style={{
                                      backgroundColor: 'var(--card-bg)',
                                      borderColor: 'var(--border-color)',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                    <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Rationale: </span>
                                    {qExplanation}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })
          )
        )}

        {/* TAB 2: RECORDED MISTAKES */}
        {activeTab === 'mistakes' && (
          filteredMistakes.length === 0 ? (
            <div 
              className="p-10 text-center rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
              }}
            >
              <CheckCircle2 className="w-8 h-8 mx-auto" style={{ color: 'var(--correct-border)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No Recorded Mistakes</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Great job! You have answered all questions correctly or haven't attempted an exam yet.
              </p>
            </div>
          ) : (
            filteredMistakes.map((m) => (
              <div
                key={m.questionId}
                className="p-5 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                      W{m.weekNumber}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums font-semibold">Q{m.questionNumber}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{m.topicTag}</span>
                    <span 
                      className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: 'var(--incorrect-badge-bg)',
                        color: 'var(--incorrect-text)',
                      }}
                    >
                      {m.errorCount}x error
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveMistake(m.questionId)}
                    className="p-1 rounded hover:opacity-80 transition-colors cursor-pointer"
                    title="Remove mistake"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <Trash2 className="w-3.5 h-3.5 hover:text-red-500" />
                  </button>
                </div>

                <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {m.questionText}
                </p>

                <div className="space-y-2 text-xs">
                  {m.options.map((opt) => {
                    const isRightKey = opt.label === m.correctOption;
                    const isUserChoice = opt.label === m.selectedOption;

                    let bg = 'var(--app-bg)';
                    let border = 'var(--border-color)';
                    let color = 'var(--text-secondary)';

                    if (isRightKey) {
                      bg = 'var(--correct-bg)';
                      border = 'var(--correct-border)';
                      color = 'var(--correct-text)';
                    } else if (isUserChoice) {
                      bg = 'var(--incorrect-bg)';
                      border = 'var(--incorrect-border)';
                      color = 'var(--incorrect-text)';
                    }

                    return (
                      <div
                        key={opt.label}
                        className="p-3 rounded-xl border flex items-center justify-between gap-2"
                        style={{ backgroundColor: bg, borderColor: border, color }}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <span 
                            className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] uppercase font-mono"
                            style={{
                              backgroundColor: isRightKey ? 'var(--correct-border)' : 'var(--hover-bg)',
                              color: isRightKey ? '#ffffff' : 'var(--text-secondary)',
                            }}
                          >
                            {opt.label}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isRightKey && <span className="text-[10px] font-bold uppercase font-mono">Solution Key</span>}
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
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Explanation: </span>
                  {m.explanation}
                </div>
              </div>
            ))
          )
        )}

        {/* TAB 3: BOOKMARKS */}
        {activeTab === 'bookmarks' && (
          filteredBookmarks.length === 0 ? (
            <div 
              className="p-10 text-center rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
              }}
            >
              <Bookmark className="w-8 h-8 mx-auto" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No Bookmarks Saved</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Bookmark questions during study or quizzes to quickly revisit them here.
              </p>
            </div>
          ) : (
            filteredBookmarks.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl border space-y-3"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                }}
              >
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                      W{q.week ?? q.weekNumber}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums font-semibold">Q{q.number}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{q.topicTag}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleBookmark(q.id)}
                    className="p-1 rounded cursor-pointer"
                    style={{ color: 'var(--bookmark-color)' }}
                  >
                    <BookmarkCheck className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                  {q.questionText}
                </p>

                <div className="space-y-1.5 text-xs">
                  {q.options.map((opt) => {
                    const isKey = opt.label === q.correctOption;
                    return (
                      <div
                        key={opt.label}
                        className="p-2.5 rounded-lg border flex items-center justify-between"
                        style={{
                          backgroundColor: isKey ? 'var(--correct-bg)' : 'var(--app-bg)',
                          borderColor: isKey ? 'var(--correct-border)' : 'var(--border-color)',
                          color: isKey ? 'var(--correct-text)' : 'var(--text-secondary)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] uppercase font-mono"
                            style={{
                              backgroundColor: isKey ? 'var(--correct-border)' : 'var(--hover-bg)',
                              color: isKey ? '#ffffff' : 'var(--text-secondary)',
                            }}
                          >
                            {opt.label}
                          </span>
                          <span>{opt.text}</span>
                        </div>
                        {isKey && <span className="text-[10px] font-bold uppercase font-mono">Key</span>}
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
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Explanation: </span>
                  {q.explanation}
                </div>
              </div>
            ))
          )
        )}

      </div>

    </div>
  );
};
