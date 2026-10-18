import React, { useState, useMemo } from 'react';
import { WeekAssignment, QuestionItem, ConceptCluster, EnhancedQuestion, OptionItem } from '../types/quiz';
import { CONCEPT_CLUSTERS, enhanceAllQuestions } from '../data/conceptClusters';
import { Search, Zap, Printer, Sparkles, CheckCircle2, ChevronRight, X, Compass, Mountain, ShieldCheck, Satellite, Dna, Scale, Filter } from 'lucide-react';

interface CheatSheetViewProps {
  weeks: Record<number, WeekAssignment>;
  onStartQuizWithQuestion?: (question: QuestionItem) => void;
  onLaunchQuickDrill?: (cluster?: ConceptCluster) => void;
}

export const CheatSheetView: React.FC<CheatSheetViewProps> = ({
  weeks,
  onLaunchQuickDrill,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWeekFilter, setSelectedWeekFilter] = useState<string>('all');
  const [testModalQuestion, setTestModalQuestion] = useState<EnhancedQuestion | null>(null);
  const [testSelectedOption, setTestSelectedOption] = useState<string | null>(null);

  // Compile all questions and enhance them
  const allEnhancedQuestions = useMemo(() => {
    const list: QuestionItem[] = [];
    Object.values(weeks).forEach(w => {
      if (w.questions && w.questions.length > 0) {
        list.push(...w.questions);
      }
    });
    return enhanceAllQuestions(list);
  }, [weeks]);

  // Filtered list
  const filteredQuestions = useMemo(() => {
    return allEnhancedQuestions.filter(q => {
      // Cluster filter
      if (selectedCluster !== 'all' && q.clusterTag !== selectedCluster) {
        return false;
      }
      // Week filter
      if (selectedWeekFilter !== 'all' && q.weekNumber !== Number(selectedWeekFilter)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const qText = (q.questionText || '').toLowerCase();
        const hookText = (q.keywordHook || '').toLowerCase();
        const conceptText = (q.coreConcept || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return qText.includes(query) || hookText.includes(query) || conceptText.includes(query);
      }
      return true;
    });
  }, [allEnhancedQuestions, selectedCluster, selectedWeekFilter, searchQuery]);

  // Cluster counts
  const clusterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allEnhancedQuestions.length };
    CONCEPT_CLUSTERS.forEach(c => {
      counts[c.id] = allEnhancedQuestions.filter(q => q.clusterTag === c.id).length;
    });
    return counts;
  }, [allEnhancedQuestions]);

  const handlePrint = () => {
    window.print();
  };

  const getClusterIcon = (clusterId: string) => {
    switch (clusterId) {
      case 'Geomorphology & Hydrology':
        return <Mountain className="w-3.5 h-3.5" />;
      case 'Biogeography & Island Theory':
        return <Compass className="w-3.5 h-3.5" />;
      case 'Protected Areas & IUCN':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Remote Sensing & GIS':
        return <Satellite className="w-3.5 h-3.5" />;
      case 'Biodiversity Metrics & Ecology':
        return <Dna className="w-3.5 h-3.5" />;
      case 'Conservation Policy & Red List':
        return <Scale className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div 
        className="rounded-3xl p-6 sm:p-8 border shadow-xs transition-colors"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div 
              className="flex items-center gap-2 text-xs font-bold tracking-wider uppercase font-mono"
              style={{ color: 'var(--accent-color)' }}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Cognitive Recall · Concept Cheat Sheet</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              High-Yield Concept Cheat Sheet
            </h1>
            <p className="text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Skip exhausting sequential reading. Connect each question prompt directly to its <strong className="font-semibold" style={{ color: 'var(--accent-color)' }}>Keyword Trigger</strong> and one-sentence deduction to memorize all 120 questions in half the time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onLaunchQuickDrill && (
              <button
                onClick={() => onLaunchQuickDrill(selectedCluster !== 'all' ? selectedCluster as ConceptCluster : undefined)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-all active:scale-95 cursor-pointer"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Launch 5-Q Blitz</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-xs border transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--app-bg)',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-color)',
              }}
              title="Print or export cheat sheet to PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div 
          className="mt-6 pt-6 border-t flex flex-col sm:flex-row gap-3 items-stretch sm:items-center"
          style={{ borderColor: 'var(--border-color)' }}
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search keyword trigger, concept, or term (e.g. oxbow, NDVI, Humboldt)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition-colors"
              style={{
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--app-bg)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs px-2 shrink-0" style={{ color: 'var(--text-muted)' }}>
              <Filter className="w-3.5 h-3.5" />
              <span>Week:</span>
            </div>
            <select
              value={selectedWeekFilter}
              onChange={(e) => setSelectedWeekFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border focus:outline-none cursor-pointer"
              style={{
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)',
                backgroundColor: 'var(--app-bg)',
              }}
            >
              <option value="all">All 12 Weeks</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(w => (
                <option key={w} value={w}>Week {w}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Concept Cluster Filter Tabs */}
        <div className="mt-4 flex flex-wrap gap-1.5 pt-2">
          <button
            onClick={() => setSelectedCluster('all')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer"
            style={{
              backgroundColor: selectedCluster === 'all' ? 'var(--accent-soft-bg)' : 'var(--app-bg)',
              color: selectedCluster === 'all' ? 'var(--accent-color)' : 'var(--text-secondary)',
              borderColor: selectedCluster === 'all' ? 'var(--accent-color)' : 'var(--border-color)',
            }}
          >
            All Clusters ({clusterCounts['all'] || 0})
          </button>
          {CONCEPT_CLUSTERS.map(cluster => {
            const isSelected = selectedCluster === cluster.id;
            return (
              <button
                key={cluster.id}
                onClick={() => setSelectedCluster(cluster.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer"
                style={{
                  backgroundColor: isSelected ? 'var(--accent-soft-bg)' : 'var(--app-bg)',
                  color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                  borderColor: isSelected ? 'var(--accent-color)' : 'var(--border-color)',
                }}
              >
                {getClusterIcon(cluster.id)}
                <span>{cluster.shortName}</span>
                <span className="opacity-70 text-[10px]">({clusterCounts[cluster.id] || 0})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions Matrix / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--text-muted)' }}>
          <span>Showing {filteredQuestions.length} high-yield triggers</span>
          <span>Click any card to self-test recall</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredQuestions.map((q) => {
            const correctOpt = q.options.find(o => o.label.toLowerCase() === q.correctOption.toLowerCase());
            return (
              <div
                key={q.id}
                onClick={() => {
                  setTestModalQuestion(q);
                  setTestSelectedOption(null);
                }}
                className="group relative rounded-2xl p-5 border transition-all cursor-pointer shadow-xs hover:shadow-md"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {/* Meta header (clean unboxed typography) */}
                <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold uppercase tracking-wider" style={{ color: 'var(--accent-color)' }}>
                      Week {q.weekNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums font-semibold">Q{q.number}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate max-w-[170px]" style={{ color: 'var(--text-secondary)' }}>
                      {q.clusterTag}
                    </span>
                  </div>
                  <span 
                    className="text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    <span>Test Recall</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                {/* Keyword Hook Box: Beautiful, high-contrast, theme-adaptive */}
                <div 
                  className="mb-3 p-3.5 rounded-xl border transition-colors"
                  style={{
                    backgroundColor: 'var(--accent-soft-bg)',
                    borderColor: 'var(--accent-color)',
                  }}
                >
                  <div 
                    className="text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Keyword Trigger</span>
                  </div>
                  <div 
                    className="text-sm font-bold tracking-tight leading-snug"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {q.keywordHook}
                  </div>
                </div>

                {/* Question Stem */}
                <div 
                  className="text-xs sm:text-sm line-clamp-2 mb-3 leading-relaxed font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {q.questionText}
                </div>

                {/* Verified Answer & Deduction */}
                <div 
                  className="pt-3 border-t flex flex-col gap-2"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Correct Key:
                    </span>
                    <span 
                      className="text-xs font-bold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: 'var(--correct-badge-bg)',
                        color: 'var(--correct-text)',
                      }}
                    >
                      [{q.correctOption.toUpperCase()}] {correctOpt?.text}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {q.coreConcept}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <div 
            className="rounded-3xl p-12 text-center border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
            }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              No concept triggers found matching your filters.
            </p>
            <button
              onClick={() => {
                setSelectedCluster('all');
                setSelectedWeekFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-semibold hover:underline cursor-pointer"
              style={{ color: 'var(--accent-color)' }}
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Quick Self-Test Modal */}
      {testModalQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-lg rounded-3xl p-6 sm:p-7 border shadow-2xl space-y-4 animate-scale-up"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="font-bold" style={{ color: 'var(--accent-color)' }}>
                  Week {testModalQuestion.weekNumber} · Q{testModalQuestion.number}
                </span>
                <span aria-hidden="true">·</span>
                <span>{testModalQuestion.clusterTag}</span>
              </div>
              <button
                onClick={() => setTestModalQuestion(null)}
                className="p-1.5 rounded-lg hover:opacity-80 transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {testModalQuestion.questionText}
            </h3>

            {/* Options */}
            <div className="space-y-2">
              {testModalQuestion.options.map((opt: OptionItem) => {
                const isSelected = testSelectedOption === opt.label;
                const isCorrect = opt.label.toLowerCase() === testModalQuestion.correctOption.toLowerCase();
                const showFeedback = testSelectedOption !== null;

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
                    onClick={() => setTestSelectedOption(opt.label)}
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
                    <span className="flex-1 text-xs sm:text-sm">{opt.text}</span>
                    {showFeedback && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--correct-border)' }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback / Keyword Explanation */}
            {testSelectedOption && (
              <div 
                className="pt-3 border-t space-y-3 animate-fade-in"
                style={{ borderColor: 'var(--border-color)' }}
              >
                <div 
                  className="p-3.5 rounded-xl border space-y-1.5"
                  style={{
                    backgroundColor: 'var(--accent-soft-bg)',
                    borderColor: 'var(--accent-color)',
                  }}
                >
                  <div 
                    className="text-xs font-bold flex items-center gap-1.5"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Memory Trigger: {testModalQuestion.keywordHook}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                    {testModalQuestion.explanation || testModalQuestion.coreConcept}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setTestModalQuestion(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-xs cursor-pointer"
                    style={{ backgroundColor: 'var(--accent-color)' }}
                  >
                    Close & Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
