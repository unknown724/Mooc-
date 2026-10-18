import React, { useState, useMemo } from 'react';
import { UserMistake, QuestionItem, ExamConfig } from '../types/quiz';
import { 
  AlertTriangle, 
  Bookmark, 
  RotateCcw, 
  Trash2, 
  Search, 
  CheckCircle2, 
  XCircle, 
  BookmarkCheck,
  BookOpen
} from 'lucide-react';

interface MistakeBankViewProps {
  mistakes: Record<string, UserMistake>;
  bookmarks: string[];
  allLoadedQuestions: QuestionItem[];
  onStartQuizWithConfig: (config: ExamConfig) => void;
  onClearMistakes: () => void;
  onRemoveMistake: (questionId: string) => void;
  onToggleBookmark: (questionId: string) => void;
  onOpenReader: () => void;
}

export const MistakeBankView: React.FC<MistakeBankViewProps> = ({
  mistakes,
  bookmarks,
  allLoadedQuestions,
  onStartQuizWithConfig,
  onClearMistakes,
  onRemoveMistake,
  onToggleBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'mistakes' | 'bookmarks'>('mistakes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>('all');

  const mistakeList = useMemo(() => {
    return Object.values(mistakes).sort((a, b) => (b.errorCount || 1) - (a.errorCount || 1));
  }, [mistakes]);

  const bookmarkedQuestions = useMemo(() => {
    return allLoadedQuestions.filter((q) => bookmarks.includes(q.id));
  }, [allLoadedQuestions, bookmarks]);

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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Mistake Bank & Bookmarks
            </h2>
            <span 
              className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full font-bold"
              style={{
                backgroundColor: 'var(--incorrect-badge-bg)',
                color: 'var(--incorrect-text)',
              }}
            >
              {mistakeList.length} Items
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Target weak concepts. All questions missed during mock exams are stored here for focused spaced-repetition drills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {activeTab === 'mistakes' ? (
            <button
              onClick={handleRetestMistakes}
              disabled={mistakeList.length === 0}
              className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--incorrect-border)' }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Launch Drill ({mistakeList.length})</span>
            </button>
          ) : (
            <button
              onClick={handleRetestBookmarks}
              disabled={bookmarkedQuestions.length === 0}
              className="px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--bookmark-color)' }}
            >
              <Bookmark className="w-4 h-4 fill-current" />
              <span>Drill Bookmarks ({bookmarkedQuestions.length})</span>
            </button>
          )}

          {activeTab === 'mistakes' && mistakeList.length > 0 && (
            <button
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
        {/* Segmented Control */}
        <div 
          className="flex items-center p-0.5 rounded-xl border text-xs font-semibold"
          style={{
            backgroundColor: 'var(--app-bg)',
            borderColor: 'var(--border-color)',
          }}
        >
          <button
            onClick={() => setActiveTab('mistakes')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'mistakes' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
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
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'bookmarks' ? 'shadow-xs' : 'opacity-70 hover:opacity-100'
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

        {/* Filter by Module */}
        <div className="flex items-center gap-2">
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-lg px-2.5 py-1.5 text-xs border cursor-pointer focus:outline-none"
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

      {/* Main List */}
      <div className="space-y-4">
        {activeTab === 'mistakes' ? (
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
        ) : (
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
