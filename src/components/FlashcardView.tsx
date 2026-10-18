import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { QuestionItem, FlashcardConfidence } from '../types/quiz';
import { 
  RotateCw, 
  ArrowLeft, 
  ArrowRight, 
  Shuffle, 
  Bookmark, 
  BookmarkCheck, 
  CheckCircle2, 
  Sparkles,
  Zap
} from 'lucide-react';
import { enhanceQuestion } from '../data/conceptClusters';

interface FlashcardViewProps {
  questions: QuestionItem[];
  bookmarks: string[];
  onToggleBookmark: (questionId: string) => void;
  onRecordConfidence?: (questionId: string, confidence: FlashcardConfidence) => void;
  initialWeek?: number | 'all';
}

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  questions,
  bookmarks,
  onToggleBookmark,
  onRecordConfidence,
  initialWeek = 'all',
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number | 'all'>(initialWeek);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, FlashcardConfidence>>({});

  const filteredQuestions = useMemo(() => {
    let list = selectedWeek === 'all' 
      ? [...questions] 
      : questions.filter((q) => (q.week ?? q.weekNumber) === selectedWeek);

    if (isShuffled) {
      list = [...list].sort(() => Math.random() - 0.5);
    }
    return list;
  }, [questions, selectedWeek, isShuffled]);

  const currentQ = filteredQuestions[currentIndex];
  const totalCards = filteredQuestions.length;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalCards]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(totalCards - 1);
    }
  }, [currentIndex, totalCards]);

  const handleRate = (confidence: FlashcardConfidence) => {
    if (!currentQ) return;
    setConfidenceRatings((prev) => ({
      ...prev,
      [currentQ.id]: confidence,
    }));
    if (onRecordConfidence) {
      onRecordConfidence(currentQ.id, confidence);
    }
    setTimeout(() => {
      handleNext();
    }, 200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleRate('again');
      } else if (e.key === '2') {
        e.preventDefault();
        handleRate('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        handleRate('good');
      } else if (e.key === '4') {
        e.preventDefault();
        handleRate('easy');
      } else if (e.key.toUpperCase() === 'B' && currentQ) {
        e.preventDefault();
        onToggleBookmark(currentQ.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, currentQ, onToggleBookmark]);

  if (!currentQ || totalCards === 0) {
    return (
      <div 
        className="p-12 text-center rounded-2xl border max-w-2xl mx-auto space-y-3"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <Sparkles className="w-8 h-8 mx-auto" style={{ color: 'var(--accent-color)' }} />
        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>No Flashcards Available</h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Assignments are syncing...
        </p>
      </div>
    );
  }

  const isBookmarked = bookmarks.includes(currentQ.id);
  const currentConfidence = confidenceRatings[currentQ.id];
  const enhanced = currentQ ? enhanceQuestion(currentQ) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 md:pb-8 animate-fade-in">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Active Recall Flashcards
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Tap card or press <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono tabular-nums" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>Space</kbd> to flip.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedWeek}
            onChange={(e) => {
              setSelectedWeek(e.target.value === 'all' ? 'all' : Number(e.target.value));
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="border rounded-xl px-3 py-1.5 text-xs font-medium cursor-pointer focus:outline-none"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
            }}
          >
            <option value="all">All 12 Modules ({questions.length} Cards)</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Week {w}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setIsShuffled(!isShuffled);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: isShuffled ? 'var(--accent-soft-bg)' : 'var(--card-bg)',
              borderColor: isShuffled ? 'var(--accent-color)' : 'var(--border-color)',
              color: isShuffled ? 'var(--accent-color)' : 'var(--text-muted)',
            }}
            title="Shuffle Deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress & Rating State */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums font-semibold" style={{ color: 'var(--text-primary)' }}>
            Card {currentIndex + 1} of {totalCards}
          </span>
          {enhanced?.clusterTag && (
            <>
              <span>·</span>
              <span className="text-emerald-400 font-medium">{enhanced.clusterTag}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {currentConfidence && (
            <span 
              className="text-[11px] font-bold uppercase font-mono px-2 py-0.5 rounded"
              style={{
                backgroundColor: currentConfidence === 'easy' ? 'var(--correct-badge-bg)' : 'var(--hover-bg)',
                color: currentConfidence === 'easy' ? 'var(--correct-text)' : 'var(--text-primary)',
              }}
            >
              Rated: {currentConfidence}
            </span>
          )}
        </div>
      </div>

      {/* 3D Flip Flashcard: Constrained to max-w-2xl */}
      <div 
        className="perspective-1000 min-h-[380px] sm:min-h-[420px] cursor-pointer select-none"
        onClick={handleFlip}
      >
        <div 
          className={`relative w-full h-full min-h-[380px] sm:min-h-[420px] transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          
          {/* CARD FRONT */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl border p-6 sm:p-8 flex flex-col justify-between shadow-sm backface-hidden"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div>
              <div 
                className="flex items-center justify-between text-xs pb-4 border-b"
                style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--accent-color)' }}>
                    Week {currentQ.week ?? currentQ.weekNumber}
                  </span>
                  <span>·</span>
                  <span className="font-mono tabular-nums font-semibold">Question {currentQ.number}</span>
                  <span>·</span>
                  <span>{currentQ.topicTag}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleBookmark(currentQ.id);
                  }}
                  className="p-1.5 rounded-lg border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isBookmarked ? 'var(--bookmark-bg)' : 'var(--app-bg)',
                    borderColor: isBookmarked ? 'var(--bookmark-color)' : 'var(--border-color)',
                    color: isBookmarked ? 'var(--bookmark-color)' : 'var(--text-muted)',
                  }}
                  title="Bookmark"
                >
                  {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>
              </div>

              <h3 
                className="text-lg md:text-xl font-semibold leading-relaxed tracking-tight mt-5"
                style={{ color: 'var(--text-primary)' }}
              >
                {currentQ.questionText}
              </h3>

              <div className="mt-5 space-y-2">
                {currentQ.options.map((opt) => (
                  <div
                    key={opt.label}
                    className="p-3 rounded-xl border text-sm flex items-start gap-3"
                    style={{
                      backgroundColor: 'var(--app-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <span 
                      className="w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs uppercase shrink-0 font-mono"
                      style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-secondary)' }}
                    >
                      {opt.label}
                    </span>
                    <span className="pt-0.5">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div 
              className="pt-4 border-t flex items-center justify-between text-[11px]"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
            >
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: 'var(--accent-color)' }}>
                <RotateCw className="w-3.5 h-3.5" />
                <span>Tap or Spacebar to reveal answer & explanation</span>
              </span>
              <span className="font-mono">GeoMastery</span>
            </div>
          </div>

          {/* CARD BACK */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl border p-6 sm:p-8 flex flex-col justify-between shadow-sm backface-hidden rotate-y-180"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--accent-color)',
            }}
          >
            <div>
              <div 
                className="flex items-center justify-between text-xs pb-4 border-b"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--correct-text)' }}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Solution: Option ({currentQ.correctOption.toUpperCase()})</span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {currentQ.topicTag}
                </span>
              </div>

              <div 
                className="mt-5 p-4 rounded-xl border"
                style={{
                  backgroundColor: 'var(--correct-bg)',
                  borderColor: 'var(--correct-border)',
                }}
              >
                <div className="text-[11px] font-bold uppercase tracking-wider font-mono" style={{ color: 'var(--correct-text)' }}>
                  Correct Answer
                </div>
                <div className="text-base font-bold mt-1" style={{ color: 'var(--correct-text)' }}>
                  ({currentQ.correctOption.toUpperCase()}) {currentQ.options.find((o) => o.label === currentQ.correctOption)?.text}
                </div>
              </div>

              {enhanced?.keywordHook && (
                <div 
                  className="mt-3 p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold"
                  style={{
                    backgroundColor: 'var(--hover-bg)',
                    borderColor: 'var(--accent-color)',
                    color: 'var(--accent-color)',
                  }}
                >
                  <Zap className="w-4 h-4 shrink-0 fill-current" />
                  <span>Memory Hook: {enhanced.keywordHook}</span>
                </div>
              )}

              <div 
                className="mt-3 p-4 rounded-xl border text-sm leading-relaxed"
                style={{
                  backgroundColor: 'var(--app-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Scientific Rationale: </span>
                {currentQ.explanation}
              </div>
            </div>

            <div 
              className="pt-4 border-t"
              style={{ borderColor: 'var(--border-color)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[11px] font-medium mb-2 text-center" style={{ color: 'var(--text-muted)' }}>
                Rate your recall difficulty
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRate('again')}
                  className="py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--incorrect-badge-bg)',
                    borderColor: 'var(--incorrect-border)',
                    color: 'var(--incorrect-text)',
                  }}
                >
                  <span>[1] Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('hard')}
                  className="py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bookmark-bg)',
                    borderColor: 'var(--bookmark-color)',
                    color: 'var(--bookmark-color)',
                  }}
                >
                  <span>[2] Hard</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('good')}
                  className="py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent-soft-bg)',
                    borderColor: 'var(--accent-color)',
                    color: 'var(--accent-color)',
                  }}
                >
                  <span>[3] Good</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRate('easy')}
                  className="py-2 px-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--correct-badge-bg)',
                    borderColor: 'var(--correct-border)',
                    color: 'var(--correct-text)',
                  }}
                >
                  <span>[4] Easy</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleFlip}
          className="px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
          }}
        >
          {isFlipped ? 'Show Front' : 'Show Answer'}
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-xs font-bold shadow-xs transition-colors active:scale-95 cursor-pointer"
          style={{ backgroundColor: 'var(--accent-color)' }}
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
