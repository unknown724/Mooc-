import React, { useState, useMemo, useEffect, useRef } from 'react';
import { WeekAssignment, QuestionItem, UserQuestionStats } from '../types/quiz';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  Copy, 
  Check, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Maximize2, 
  Minimize2, 
  Edit3, 
  Save, 
  Sliders,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { enhanceQuestion } from '../data/conceptClusters';

interface StudyReaderViewProps {
  weeks: Record<number, WeekAssignment>;
  bookmarks: string[];
  questionStats?: Record<string, UserQuestionStats>;
  onToggleBookmark: (questionId: string) => void;
  onSaveNote?: (questionId: string, note: string) => void;
  initialWeekFilter?: number | 'all';
}

export const StudyReaderView: React.FC<StudyReaderViewProps> = ({
  weeks,
  bookmarks,
  questionStats = {},
  onToggleBookmark,
  onSaveNote,
  initialWeekFilter = 'all',
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>(initialWeekFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  
  // Visibility toggles
  const [showExplanationsGlobal, setShowExplanationsGlobal] = useState<boolean>(true);
  const [showAnswerKeysGlobal, setShowAnswerKeysGlobal] = useState<boolean>(true);
  const [selfTestMode, setSelfTestMode] = useState<boolean>(false);
  
  // Fullscreen mode (in-app immersion mode)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Per-question toggle overrides for individual cards
  const [collapsedExplanations, setCollapsedExplanations] = useState<Set<string>>(new Set());
  const [revealedSelfTestIds, setRevealedSelfTestIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Notes editing state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Extract all questions
  const allLoadedQuestions = useMemo(() => {
    const list: QuestionItem[] = [];
    Object.values(weeks).forEach((w) => {
      if (w.isLoaded && w.questions) {
        list.push(...w.questions);
      }
    });
    return list;
  }, [weeks]);

  // Distinct topics
  const distinctTopics = useMemo(() => {
    const set = new Set<string>();
    allLoadedQuestions.forEach((q) => {
      if (q.topicTag) set.add(q.topicTag);
    });
    return Array.from(set).sort();
  }, [allLoadedQuestions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return allLoadedQuestions.filter((q) => {
      const qWeek = q.week ?? q.weekNumber;
      if (selectedWeek !== 'all' && qWeek !== selectedWeek) return false;
      if (selectedTopic !== 'all' && q.topicTag !== selectedTopic) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          q.questionText.toLowerCase().includes(query) ||
          q.options.some((o) => o.text.toLowerCase().includes(query)) ||
          q.explanation.toLowerCase().includes(query) ||
          q.topicTag.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allLoadedQuestions, selectedWeek, selectedTopic, searchQuery]);

  // Fullscreen toggle (in-app viewport takeover without OS traps)
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  // Lock document body when full view is active so mobile touch gestures scroll cleanly
  useEffect(() => {
    if (isFullscreen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isFullscreen]);

  // Keyboard shortcut: Esc or F toggles full view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey) {
        setIsFullscreen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const toggleSingleExplanation = (id: string) => {
    setCollapsedExplanations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSingleSelfTest = (id: string) => {
    setRevealedSelfTestIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopy = (q: QuestionItem) => {
    const text = `${q.questionText}\n${q.options.map((o) => `(${o.label}) ${o.text}`).join('\n')}\nAnswer: (${q.correctOption.toUpperCase()})\nExplanation: ${q.explanation}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStartEditNote = (qId: string) => {
    setEditingNoteId(qId);
    setNoteDraft(questionStats[qId]?.userNote || '');
  };

  const handleSaveNoteAction = (qId: string) => {
    if (onSaveNote) {
      onSaveNote(qId, noteDraft.trim());
    }
    setEditingNoteId(null);
  };

  return (
    <div 
      ref={containerRef}
      className={
        isFullscreen 
          ? 'fixed inset-0 z-50 h-[100dvh] w-full overflow-y-auto overscroll-contain flex flex-col' 
          : 'space-y-6 pb-24 md:pb-8 animate-fade-in'
      }
      style={{
        backgroundColor: 'var(--app-bg)',
        color: 'var(--text-primary)',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
      }}
    >
      
      {/* FULL VIEW HEADER (Sticky, Compact & Touch-Friendly) */}
      {isFullscreen ? (
        <header 
          className="sticky top-0 z-30 backdrop-blur-xl border-b shadow-xs transition-colors shrink-0"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="max-w-2xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
            
            {/* Left: Exit Full View Button & Module indicator */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer shrink-0 shadow-xs"
                style={{
                  backgroundColor: 'var(--accent-color)',
                  borderColor: 'var(--accent-color)',
                  color: '#ffffff',
                }}
                title="Exit Full View (Esc)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Full View</span>
              </button>

              <span 
                className="text-[11px] font-mono tabular-nums truncate px-2 py-0.5 rounded-md hidden xs:inline"
                style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-muted)' }}
              >
                {selectedWeek === 'all' ? 'All 120 Qs' : `Week ${selectedWeek}`} · {filteredQuestions.length} Qs
              </span>
            </div>

            {/* Right: Quick Study Toggles & Filter trigger */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Explanations Toggle */}
              <button
                type="button"
                onClick={() => setShowExplanationsGlobal(!showExplanationsGlobal)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors"
                style={{
                  backgroundColor: showExplanationsGlobal ? 'var(--accent-soft-bg)' : 'var(--app-bg)',
                  borderColor: showExplanationsGlobal ? 'var(--accent-color)' : 'var(--border-color)',
                  color: showExplanationsGlobal ? 'var(--accent-color)' : 'var(--text-secondary)',
                }}
                title="Toggle Explanations Visibility"
              >
                <FileText className="w-3.5 h-3.5 inline mr-1" />
                <span className="hidden sm:inline">{showExplanationsGlobal ? 'Expl: On' : 'Expl: Off'}</span>
                <span className="sm:hidden">{showExplanationsGlobal ? 'On' : 'Off'}</span>
              </button>

              {/* Answers Toggle */}
              <button
                type="button"
                onClick={() => setShowAnswerKeysGlobal(!showAnswerKeysGlobal)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors"
                style={{
                  backgroundColor: showAnswerKeysGlobal ? 'var(--hover-bg)' : 'var(--app-bg)',
                  borderColor: showAnswerKeysGlobal ? 'var(--correct-border)' : 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
                title="Toggle Answer Key Highlights"
              >
                <span 
                  className="w-2 h-2 rounded-full inline-block mr-1" 
                  style={{ backgroundColor: showAnswerKeysGlobal ? 'var(--correct-border)' : 'var(--text-muted)' }} 
                />
                <span className="hidden sm:inline">{showAnswerKeysGlobal ? 'Keys: On' : 'Keys: Off'}</span>
                <span className="sm:hidden">Keys</span>
              </button>

              {/* Filters Drawer Toggle */}
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium border cursor-pointer transition-colors"
                style={{
                  backgroundColor: isFilterDrawerOpen ? 'var(--hover-bg)' : 'var(--app-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
                title="Filter by Week or Search"
              >
                <Sliders className="w-3.5 h-3.5 inline sm:mr-1" />
                <span className="hidden sm:inline">Filter</span>
              </button>
            </div>

          </div>

          {/* Expandable Filter Drawer in Full View */}
          {isFilterDrawerOpen && (
            <div 
              className="max-w-2xl mx-auto px-4 py-3 border-t space-y-2.5 animate-fade-in text-xs"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={selectedWeek}
                  onChange={(e) =>
                    setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium border cursor-pointer focus:outline-none"
                  style={{
                    backgroundColor: 'var(--app-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">All 12 Modules (120 Questions)</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      Week {w} {weeks[w]?.title ? `· ${weeks[w].title}` : ''}
                    </option>
                  ))}
                </select>

                <div className="sm:col-span-2 relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search concepts, minerals, weathering..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border focus:outline-none"
                    style={{
                      backgroundColor: 'var(--app-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </header>
      ) : (
        /* NORMAL DASHBOARD HEADER (When Full View is OFF) */
        <div 
          className="max-w-2xl mx-auto p-5 md:p-6 rounded-2xl border shadow-sm space-y-4"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
          }}
        >
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                  Study Reader
                </h2>
                <span className="text-xs font-mono tabular-nums px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-muted)' }}>
                  {filteredQuestions.length} Questions
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Kindle-like eye-comfort reading. Toggle explanations, answer keys, or notes.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">

              {/* Enter Full View Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs"
                style={{
                  backgroundColor: 'var(--app-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
                title="Enter Full View Reading Mode (F)"
              >
                <Maximize2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-color)' }} />
                <span>Full View</span>
              </button>
            </div>
          </div>

          {/* Visibility Controls: Explanations, Answers, Self-Test */}
          <div 
            className="flex flex-wrap items-center gap-2 pt-2 border-t"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-muted)' }}>
              Reading View:
            </span>
            
            {/* Global Toggle: Explanations Shown / Removed */}
            <button
              type="button"
              onClick={() => setShowExplanationsGlobal(!showExplanationsGlobal)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              style={{
                backgroundColor: showExplanationsGlobal ? 'var(--accent-color)' : 'var(--app-bg)',
                color: showExplanationsGlobal ? '#ffffff' : 'var(--text-secondary)',
                border: showExplanationsGlobal ? '1px solid transparent' : '1px solid var(--border-color)',
              }}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showExplanationsGlobal ? 'Explanations: On' : 'Explanations: Off (Clean)'}</span>
            </button>

            {/* Answer Keys Toggle */}
            <button
              type="button"
              onClick={() => setShowAnswerKeysGlobal(!showAnswerKeysGlobal)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: showAnswerKeysGlobal ? 'var(--hover-bg)' : 'var(--app-bg)',
                color: 'var(--text-secondary)',
                border: showAnswerKeysGlobal ? '1px solid var(--correct-border)' : '1px solid var(--border-color)',
              }}
            >
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: showAnswerKeysGlobal ? 'var(--correct-border)' : 'var(--text-muted)' }} 
              />
              <span>{showAnswerKeysGlobal ? 'Answers: Marked' : 'Answers: Hidden'}</span>
            </button>

            {/* Self-Test Blur Toggle */}
            <button
              type="button"
              onClick={() => {
                setSelfTestMode(!selfTestMode);
                setRevealedSelfTestIds(new Set());
              }}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: selfTestMode ? 'var(--bookmark-bg)' : 'var(--app-bg)',
                color: selfTestMode ? 'var(--bookmark-color)' : 'var(--text-secondary)',
                border: selfTestMode ? '1px solid var(--bookmark-color)' : '1px solid var(--border-color)',
              }}
            >
              {selfTestMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{selfTestMode ? 'Self-Test (Blur)' : 'Self-Test Mode'}</span>
            </button>
          </div>

          {/* Filter Controls: Week Selector & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div>
              <select
                value={selectedWeek}
                onChange={(e) =>
                  setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="w-full rounded-xl px-3 py-2 text-xs font-medium border cursor-pointer focus:outline-none"
                style={{
                  backgroundColor: 'var(--app-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="all">All 12 Modules (120 Questions)</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Week {w} {weeks[w]?.title ? `· ${weeks[w].title}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search concepts, minerals, weathering..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border focus:outline-none"
                style={{
                  backgroundColor: 'var(--app-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          {/* Topics Pills */}
          {distinctTopics.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-thin pt-1">
              <button
                onClick={() => setSelectedTopic('all')}
                className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                style={{
                  backgroundColor: selectedTopic === 'all' ? 'var(--text-primary)' : 'var(--app-bg)',
                  color: selectedTopic === 'all' ? 'var(--card-bg)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                }}
              >
                All Topics
              </button>
              {distinctTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  style={{
                    backgroundColor: selectedTopic === topic ? 'var(--text-primary)' : 'var(--app-bg)',
                    color: selectedTopic === topic ? 'var(--card-bg)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Main Reading Sheet: Constrained to max-w-2xl (~65ch) for horizontal eye tracking */}
      <main className={`max-w-2xl mx-auto w-full space-y-5 px-4 sm:px-6 ${isFullscreen ? 'py-6 pb-32' : ''}`}>
        {filteredQuestions.length === 0 ? (
          <div 
            className="p-12 text-center rounded-2xl border space-y-3"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
            }}
          >
            <BookOpen className="w-8 h-8 mx-auto" style={{ color: 'var(--text-muted)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No matching questions found</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Adjust search keywords or select another week.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q) => {
            const isBookmarked = bookmarks.includes(q.id);
            const isSelfTestRevealed = revealedSelfTestIds.has(q.id);
            const isBlurHidden = selfTestMode && !isSelfTestRevealed;
            const userNote = questionStats[q.id]?.userNote;

            const isIndividuallyToggled = collapsedExplanations.has(q.id);
            const isExplanationVisible = showExplanationsGlobal 
              ? !isIndividuallyToggled 
              : isIndividuallyToggled;

            const enhanced = enhanceQuestion(q);

            return (
              <article
                key={q.id}
                className="p-5 sm:p-6 rounded-2xl border transition-all shadow-xs space-y-4"
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
                      W{q.week ?? q.weekNumber}
                    </span>
                    <span>·</span>
                    <span className="font-mono tabular-nums font-semibold">Q{q.number}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{q.topicTag}</span>
                    <span>·</span>
                    <span className="hidden sm:inline text-emerald-400/80">{enhanced.clusterTag}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Copy Question */}
                    <button
                      onClick={() => handleCopy(q)}
                      className="p-1.5 rounded-lg border transition-colors cursor-pointer hover:opacity-80"
                      style={{
                        backgroundColor: 'var(--app-bg)',
                        borderColor: 'var(--border-color)',
                        color: copiedId === q.id ? 'var(--correct-border)' : 'var(--text-muted)',
                      }}
                      title="Copy Question & Solution"
                    >
                      {copiedId === q.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => onToggleBookmark(q.id)}
                      className="p-1.5 rounded-lg border transition-colors cursor-pointer"
                      style={{
                        backgroundColor: isBookmarked ? 'var(--bookmark-bg)' : 'var(--app-bg)',
                        borderColor: isBookmarked ? 'var(--bookmark-color)' : 'var(--border-color)',
                        color: isBookmarked ? 'var(--bookmark-color)' : 'var(--text-muted)',
                      }}
                      title={isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks'}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Cognitive Trigger Hook */}
                {enhanced.keywordHook && (
                  <div 
                    className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border w-fit"
                    style={{
                      backgroundColor: 'var(--accent-soft-bg)',
                      borderColor: 'var(--accent-color)',
                      color: 'var(--accent-color)',
                    }}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current shrink-0" />
                    <span>Memory Trigger: <strong style={{ color: 'var(--text-primary)' }}>{enhanced.keywordHook}</strong></span>
                  </div>
                )}

                {/* Question Stem: text-lg md:text-xl font-semibold leading-relaxed tracking-tight */}
                <h3 
                  className="text-lg md:text-xl font-semibold leading-relaxed tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {q.questionText}
                </h3>

                {/* Option Cards: text-base leading-normal py-3.5 px-4 rounded-xl border */}
                <div className="space-y-2.5 pt-1">
                  {q.options.map((opt) => {
                    const isCorrect = opt.label === q.correctOption;
                    const highlightCorrect = isCorrect && showAnswerKeysGlobal && !isBlurHidden;

                    return (
                      <div
                        key={opt.label}
                        className="text-base leading-normal py-3.5 px-4 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 select-none"
                        style={{
                          backgroundColor: highlightCorrect ? 'var(--correct-bg)' : 'var(--app-bg)',
                          borderColor: highlightCorrect ? 'var(--correct-border)' : 'var(--border-color)',
                          color: highlightCorrect ? 'var(--correct-text)' : 'var(--text-secondary)',
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span
                            className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs uppercase shrink-0 font-mono"
                            style={{
                              backgroundColor: highlightCorrect ? 'var(--correct-border)' : 'var(--hover-bg)',
                              color: highlightCorrect ? '#ffffff' : 'var(--text-secondary)',
                            }}
                          >
                            {opt.label}
                          </span>
                          <span className={highlightCorrect && isBlurHidden ? 'filter blur-sm select-none' : ''}>
                            {opt.text}
                          </span>
                        </div>

                        {highlightCorrect && (
                          <span 
                            className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 font-mono"
                            style={{
                              backgroundColor: 'var(--correct-badge-bg)',
                              color: 'var(--correct-text)',
                            }}
                          >
                            Verified Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Area */}
                <div 
                  className="pt-2 border-t"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  {isBlurHidden ? (
                    <button
                      onClick={() => toggleSingleSelfTest(q.id)}
                      className="w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      style={{
                        backgroundColor: 'var(--app-bg)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--accent-color)',
                      }}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Tap to reveal answer & educational rationale</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--correct-text)' }}>
                          <span>Key: Option ({q.correctOption.toUpperCase()})</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {/* Note Button */}
                          <button
                            type="button"
                            onClick={() => handleStartEditNote(q.id)}
                            className="text-[11px] flex items-center gap-1 transition-colors cursor-pointer px-2 py-0.5 rounded"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{userNote ? 'Edit Note' : 'Add Note'}</span>
                          </button>

                          {/* Per-question toggle button to remove or add explanation */}
                          <button
                            type="button"
                            onClick={() => toggleSingleExplanation(q.id)}
                            className="text-[11px] flex items-center gap-1 transition-colors cursor-pointer px-2 py-0.5 rounded"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            <span>{isExplanationVisible ? 'Remove Explanation' : 'Add Explanation'}</span>
                            {isExplanationVisible ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Explanation Content */}
                      {isExplanationVisible && (
                        <div 
                          className="p-3.5 rounded-xl border text-sm leading-relaxed animate-fade-in"
                          style={{
                            backgroundColor: 'var(--app-bg)',
                            borderColor: 'var(--border-color)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                            Educational Rationale: 
                          </span>{' '}
                          {q.explanation}
                        </div>
                      )}

                      {/* User Study Note Display */}
                      {userNote && editingNoteId !== q.id && (
                        <div 
                          className="p-3 rounded-xl border text-xs leading-relaxed"
                          style={{
                            backgroundColor: 'var(--bookmark-bg)',
                            borderColor: 'var(--bookmark-color)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <span className="font-bold" style={{ color: 'var(--bookmark-color)' }}>
                            Your Study Note:{' '}
                          </span>
                          {userNote}
                        </div>
                      )}

                      {/* Note Editor */}
                      {editingNoteId === q.id && (
                        <div className="p-3 rounded-xl border space-y-2 animate-fade-in" style={{ backgroundColor: 'var(--app-bg)', borderColor: 'var(--border-color)' }}>
                          <textarea
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder="Add your personal study note or mnemonics..."
                            rows={2}
                            className="w-full text-xs p-2 rounded-lg border focus:outline-none"
                            style={{
                              backgroundColor: 'var(--card-bg)',
                              borderColor: 'var(--border-color)',
                              color: 'var(--text-primary)',
                            }}
                          />
                          <div className="flex items-center justify-end gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => setEditingNoteId(null)}
                              className="px-2.5 py-1 rounded-md text-[11px]"
                              style={{ color: 'var(--text-muted)' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveNoteAction(q.id)}
                              className="px-3 py-1 rounded-md text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs"
                              style={{ backgroundColor: 'var(--accent-color)' }}
                            >
                              <Save className="w-3 h-3" />
                              <span>Save Note</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

              </article>
            );
          })
        )}
      </main>

    </div>
  );
};
