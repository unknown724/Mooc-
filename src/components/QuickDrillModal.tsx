import React, { useState, useEffect, useMemo } from 'react';
import { WeekAssignment, QuestionItem, ConceptCluster, EnhancedQuestion, OptionItem } from '../types/quiz';
import { CONCEPT_CLUSTERS, enhanceAllQuestions } from '../data/conceptClusters';
import { Zap, X, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Sparkles } from 'lucide-react';

interface QuickDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  weeks: Record<number, WeekAssignment>;
  initialCluster?: ConceptCluster;
  onSaveMistake?: (question: QuestionItem, selectedOption: string) => void;
}

export const QuickDrillModal: React.FC<QuickDrillModalProps> = ({
  isOpen,
  onClose,
  weeks,
  initialCluster,
  onSaveMistake,
}) => {
  const [drillSize, setDrillSize] = useState<number>(5);
  const [selectedCluster, setSelectedCluster] = useState<ConceptCluster | 'all'>(initialCluster || 'all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [drillHistory, setDrillHistory] = useState<{ isCorrect: boolean; question: EnhancedQuestion }[]>([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [drillQuestions, setDrillQuestions] = useState<EnhancedQuestion[]>([]);

  // All enhanced questions
  const allEnhancedQuestions = useMemo(() => {
    const list: QuestionItem[] = [];
    Object.values(weeks).forEach(w => {
      if (w.questions && w.questions.length > 0) {
        list.push(...w.questions);
      }
    });
    return enhanceAllQuestions(list);
  }, [weeks]);

  // Start / Reset a new drill
  const startNewDrill = (size: number = drillSize, cluster: ConceptCluster | 'all' = selectedCluster) => {
    let pool = allEnhancedQuestions;
    if (cluster !== 'all') {
      pool = pool.filter(q => q.clusterTag === cluster);
    }
    if (pool.length === 0) pool = allEnhancedQuestions;

    // Shuffle and pick subset
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, size);
    setDrillQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedOption(null);
    setDrillHistory([]);
    setIsFinished(false);
  };

  useEffect(() => {
    if (isOpen) {
      startNewDrill(drillSize, initialCluster || 'all');
    }
  }, [isOpen, initialCluster]);

  const currentQ = drillQuestions[currentIndex];

  // Handle Option Selection
  const handleSelectOption = (label: string) => {
    if (selectedOption !== null || !currentQ) return;
    setSelectedOption(label);

    const isCorrect = label.toLowerCase() === currentQ.correctOption.toLowerCase();
    setDrillHistory(prev => [...prev, { isCorrect, question: currentQ }]);

    if (!isCorrect && onSaveMistake) {
      onSaveMistake(currentQ, label);
    }
  };

  // Advance to next
  const handleNext = () => {
    if (currentIndex + 1 < drillQuestions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen || isFinished || !currentQ) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedOption === null) {
        if (['a', 'b', 'c', 'd'].includes(e.key.toLowerCase())) {
          handleSelectOption(e.key.toLowerCase());
        } else if (['1', '2', '3', '4'].includes(e.key)) {
          const index = parseInt(e.key, 10) - 1;
          const opt = currentQ.options[index];
          if (opt) handleSelectOption(opt.label);
        }
      } else {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFinished, currentQ, selectedOption]);

  if (!isOpen) return null;

  const correctCount = drillHistory.filter(h => h.isCorrect).length;
  const scorePercent = drillQuestions.length > 0 ? Math.round((correctCount / drillQuestions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Quick Drill Blitz
              </h3>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Active Recall · Rapid Keyword Recognition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Session Size Picker */}
            {!isFinished && (
              <div className="flex items-center rounded-lg border p-0.5" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  onClick={() => {
                    setDrillSize(5);
                    startNewDrill(5, selectedCluster);
                  }}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${drillSize === 5 ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  5-Q
                </button>
                <button
                  onClick={() => {
                    setDrillSize(10);
                    startNewDrill(10, selectedCluster);
                  }}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${drillSize === 10 ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  10-Q
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        {!isFinished && currentQ ? (
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-emerald-400">
                  Question {currentIndex + 1} of {drillQuestions.length}
                </span>
                <span aria-hidden="true">·</span>
                <span>Week {currentQ.weekNumber}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[140px]">{currentQ.clusterTag}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px]">
                <span className="text-emerald-400">{correctCount} correct</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${((currentIndex + (selectedOption ? 1 : 0)) / drillQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question Text */}
            <h4 className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {currentQ.questionText}
            </h4>

            {/* Multiple Choice Options */}
            <div className="space-y-2 pt-2">
              {currentQ.options.map((opt: OptionItem) => {
                const isSelected = selectedOption === opt.label;
                const isCorrect = opt.label.toLowerCase() === currentQ.correctOption.toLowerCase();
                const showFeedback = selectedOption !== null;

                let optBg = 'var(--app-bg)';
                let optBorder = 'var(--border-color)';
                let optColor = 'var(--text-primary)';

                if (showFeedback) {
                  if (isCorrect) {
                    optBg = 'var(--correct-bg)';
                    optBorder = 'var(--correct-border)';
                    optColor = 'var(--correct-text)';
                  } else if (isSelected) {
                    optBg = 'var(--incorrect-bg)';
                    optBorder = 'var(--incorrect-border)';
                    optColor = 'var(--incorrect-text)';
                  } else {
                    optBg = 'var(--app-bg)';
                    optBorder = 'var(--border-color)';
                    optColor = 'var(--text-muted)';
                  }
                }

                return (
                  <button
                    key={opt.label}
                    disabled={showFeedback}
                    onClick={() => handleSelectOption(opt.label)}
                    className="w-full flex items-center gap-3 p-3 text-left rounded-xl border text-sm transition-all cursor-pointer"
                    style={{
                      backgroundColor: optBg,
                      borderColor: optBorder,
                      color: optColor,
                    }}
                  >
                    <span 
                      className="w-6 h-6 rounded-lg border text-xs font-mono font-bold flex items-center justify-center shrink-0 uppercase"
                      style={{
                        backgroundColor: 'var(--hover-bg)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {opt.label}
                    </span>
                    <span className="flex-1 text-xs sm:text-sm leading-normal">{opt.text}</span>
                    {showFeedback && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--correct-border)' }} />
                    )}
                    {showFeedback && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 shrink-0" style={{ color: 'var(--incorrect-border)' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Keyword Hook Bar */}
            {selectedOption !== null && (
              <div className="pt-2 space-y-3 animate-fade-in">
                <div 
                  className="p-3.5 rounded-xl border space-y-1.5"
                  style={{
                    backgroundColor: 'var(--accent-soft-bg)',
                    borderColor: 'var(--accent-color)',
                  }}
                >
                  <div 
                    className="flex items-center gap-1.5 text-xs font-bold"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Trigger Hook: {currentQ.keywordHook}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {currentQ.explanation || currentQ.coreConcept}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
                    Tip: Press <kbd className="px-1.5 py-0.5 rounded border font-mono text-[10px]" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>Space</kbd> to proceed
                  </span>
                  <button
                    onClick={handleNext}
                    className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-xs cursor-pointer"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    <span>{currentIndex + 1 < drillQuestions.length ? 'Next Question' : 'View Results'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Completion Screen */
          <div className="p-8 text-center space-y-6 animate-scale-up">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Drill Complete!
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                You scored <span className="font-bold text-emerald-400">{correctCount} of {drillQuestions.length}</span> ({scorePercent}%)
              </p>
            </div>

            <div className="p-4 rounded-xl border bg-white/[0.02] text-xs leading-relaxed max-w-md mx-auto" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              {scorePercent >= 80 ? (
                <p>Excellent recall! Your keyword recognition for these questions is strong and ready for the exam.</p>
              ) : (
                <p>Good sprint! Missed questions have been recorded in your Mistake Bank for automated spaced repetition.</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => startNewDrill(drillSize, selectedCluster)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Drill Another {drillSize} Questions</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium border text-slate-300 hover:bg-white/5 transition-colors"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
