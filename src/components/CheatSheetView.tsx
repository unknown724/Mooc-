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
        className="rounded-2xl p-6 sm:p-8 border transition-all"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-emerald-500">
              <Zap className="w-4 h-4" />
              <span>Cognitive Recall · Zero-Friction Memorization</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              High-Yield Concept Cheat Sheet
            </h1>
            <p className="text-sm max-w-2xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Skip exhausting sequential reading. Connect each question prompt directly to its <strong className="font-semibold text-emerald-400">Keyword Trigger</strong> and one-sentence deduction to memorize all 120 questions in half the time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {onLaunchQuickDrill && (
              <button
                onClick={() => onLaunchQuickDrill(selectedCluster !== 'all' ? selectedCluster as ConceptCluster : undefined)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Launch 5-Q Blitz</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-sm border transition-all hover:bg-white/5"
              style={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-subtle)',
              }}
              title="Print or export cheat sheet to PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row gap-3 items-stretch sm:items-center" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search keyword trigger, concept, or term (e.g. oxbow, NDVI, Humboldt)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              style={{
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--card-surface)',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 px-2 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Week:</span>
            </div>
            <select
              value={selectedWeekFilter}
              onChange={(e) => setSelectedWeekFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500"
              style={{
                color: 'var(--text-primary)',
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--card-surface)',
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedCluster === 'all'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            All Clusters ({clusterCounts['all'] || 0})
          </button>
          {CONCEPT_CLUSTERS.map(cluster => (
            <button
              key={cluster.id}
              onClick={() => setSelectedCluster(cluster.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCluster === cluster.id
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              {getClusterIcon(cluster.id)}
              <span>{cluster.shortName}</span>
              <span className="opacity-60 text-[10px]">({clusterCounts[cluster.id] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Questions Matrix / Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs px-1" style={{ color: 'var(--text-muted)' }}>
          <span>Showing {filteredQuestions.length} high-yield triggers</span>
          <span>Click any card to self-test recall</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredQuestions.map((q) => {
            const correctOpt = q.options.find(o => o.label.toLowerCase() === q.correctOption.toLowerCase());
            return (
              <div
                key={q.id}
                onClick={() => {
                  setTestModalQuestion(q);
                  setTestSelectedOption(null);
                }}
                className="group relative rounded-xl p-4 border transition-all cursor-pointer hover:border-emerald-500/40 hover:shadow-md"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                {/* Meta header (anti-slop clean unboxed typography) */}
                <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-emerald-400">Week {q.weekNumber}</span>
                    <span aria-hidden="true">·</span>
                    <span>Q{q.number}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate max-w-[150px]">{q.clusterTag}</span>
                  </div>
                  <span className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 flex items-center gap-1">
                    <span>Test Recall</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                {/* Keyword Hook (The Core Memorization Anchor) */}
                <div className="mb-2 p-2.5 rounded-lg bg-emerald-950/25 border border-emerald-500/20">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    <span>Keyword Trigger</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-100">
                    {q.keywordHook}
                  </div>
                </div>

                {/* Question Stem */}
                <div className="text-xs line-clamp-2 mb-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {q.questionText}
                </div>

                {/* Verified Answer & Deduction */}
                <div className="pt-2 border-t flex flex-col gap-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] font-medium text-slate-400 shrink-0">Correct Key:</span>
                    <span className="text-xs font-bold text-emerald-400">
                      [{q.correctOption.toUpperCase()}] {correctOpt?.text}
                    </span>
                  </div>
                  <p className="text-[11px] leading-normal line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {q.coreConcept}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {filteredQuestions.length === 0 && (
          <div 
            className="rounded-2xl p-12 text-center border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-subtle)',
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
              className="mt-3 text-xs text-emerald-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Quick Self-Test Modal */}
      {testModalQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full max-w-lg rounded-2xl p-6 border shadow-2xl space-y-4 animate-scale-up"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="font-semibold text-emerald-400">Week {testModalQuestion.weekNumber} · Q{testModalQuestion.number}</span>
                <span aria-hidden="true">·</span>
                <span>{testModalQuestion.clusterTag}</span>
              </div>
              <button
                onClick={() => setTestModalQuestion(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
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

                let optClass = 'border-slate-800 hover:border-slate-700 bg-white/[0.02]';
                if (showFeedback) {
                  if (isCorrect) {
                    optClass = 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300';
                  } else if (isSelected) {
                    optClass = 'border-rose-500/50 bg-rose-500/15 text-rose-300';
                  } else {
                    optClass = 'opacity-40 border-slate-800';
                  }
                }

                return (
                  <button
                    key={opt.label}
                    disabled={showFeedback}
                    onClick={() => setTestSelectedOption(opt.label)}
                    className={`w-full flex items-center gap-3 p-3 text-left rounded-xl border text-sm transition-all ${optClass}`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                      {opt.label}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                    {showFeedback && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback / Keyword Explanation */}
            {testSelectedOption && (
              <div className="pt-3 border-t space-y-2 animate-fade-in" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Memory Trigger: {testModalQuestion.keywordHook}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {testModalQuestion.explanation || testModalQuestion.coreConcept}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setTestModalQuestion(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 transition-colors"
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
