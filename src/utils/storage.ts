import { WeekAssignment, UserMistake, QuizResult, Question, AppTheme, FontSizeSetting, UserQuestionStats, OptionLabel } from '../types/quiz';
import { getInitialWeeksState, ALL_WEEKS_DATA } from '../data/seedData';

const STORAGE_KEYS = {
  WEEKS: 'geoprep_weeks_v1',
  BOOKMARKS: 'geoprep_bookmarks_v1',
  MISTAKES: 'geoprep_mistakes_v1',
  QUIZ_HISTORY: 'geoprep_quiz_history_v1',
  THEME: 'geomastery_theme_v1',
  FONT_SIZE: 'geomastery_fontsize_v1',
  STATS: 'geomastery_question_stats_v1',
};

export function loadTheme(): AppTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME) as AppTheme;
    return (raw === 'warm' || raw === 'daylight' || raw === 'midnight') ? raw : 'warm';
  } catch {
    return 'warm';
  }
}

export function saveTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {}
}

export function loadFontSize(): FontSizeSetting {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FONT_SIZE) as FontSizeSetting;
    return (raw === 'small' || raw === 'medium' || raw === 'large') ? raw : 'medium';
  } catch {
    return 'medium';
  }
}

export function saveFontSize(size: FontSizeSetting): void {
  try {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size);
  } catch {}
}

export function loadQuestionStats(): Record<string, UserQuestionStats> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveQuestionStats(stats: Record<string, UserQuestionStats>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  } catch {}
}


export function loadSavedWeeks(): Record<number, WeekAssignment> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.WEEKS);
    if (!raw) {
      const initial = getInitialWeeksState();
      saveWeeks(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    // Ensure all 12 weeks exist and sync latest canonical question data (e.g. w6_q5 corrections)
    const base = getInitialWeeksState();
    for (let i = 1; i <= 12; i++) {
      if (parsed[i]) {
        const canonicalMap = new Map((base[i]?.questions || []).map((q) => [q.id, q]));
        const syncedQuestions = (parsed[i].questions || base[i]?.questions || []).map((q: Question) => {
          const canonical = canonicalMap.get(q.id);
          if (canonical) {
            return {
              ...q,
              options: canonical.options,
              correctOption: canonical.correctOption,
              explanation: canonical.explanation,
            };
          }
          return q;
        });

        base[i] = {
          ...base[i],
          ...parsed[i],
          questions: syncedQuestions,
        };
      }
    }
    return base;
  } catch (err) {
    console.error('Failed to load weeks from localStorage:', err);
    return getInitialWeeksState();
  }
}

export function saveWeeks(weeks: Record<number, WeekAssignment>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.WEEKS, JSON.stringify(weeks));
  } catch (err) {
    console.error('Failed to save weeks to localStorage:', err);
  }
}

export function loadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(bookmarks: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  } catch (err) {
    console.error('Failed to save bookmarks:', err);
  }
}

export function loadMistakes(): Record<string, UserMistake> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    const mistakes: Record<string, UserMistake> = raw ? JSON.parse(raw) : {};
    
    // Reconcile mistakes against canonical PDF solutions (e.g. w6_q5, w8_q8, w10_q2, w10_q6)
    const corrections: Array<{ id: string; correct: OptionLabel }> = [
      { id: 'w6_q5', correct: 'a' },
      { id: 'w8_q8', correct: 'c' },
      { id: 'w10_q2', correct: 'a' },
      { id: 'w10_q6', correct: 'c' },
    ];

    let changed = false;
    for (const item of corrections) {
      if (mistakes[item.id]) {
        if (mistakes[item.id].selectedOption === item.correct) {
          delete mistakes[item.id];
          changed = true;
        } else if (mistakes[item.id].correctOption !== item.correct) {
          mistakes[item.id].correctOption = item.correct;
          changed = true;
        }
      }
    }
    if (changed) {
      saveMistakes(mistakes);
    }

    return mistakes;
  } catch {
    return {};
  }
}

export function saveMistakes(mistakes: Record<string, UserMistake>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mistakes));
  } catch (err) {
    console.error('Failed to save mistakes:', err);
  }
}

export function loadQuizHistory(): QuizResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQuizHistory(history: QuizResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ_HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Failed to save quiz history:', err);
  }
}

export function loadAllBuiltInWeeks(currentWeeks: Record<number, WeekAssignment>): Record<number, WeekAssignment> {
  const updated: Record<number, WeekAssignment> = { ...currentWeeks };
  for (let w = 1; w <= 12; w++) {
    const full = ALL_WEEKS_DATA[w];
    if (full) {
      updated[w] = {
        ...updated[w],
        weekNumber: w,
        title: full.title,
        summary: full.summary,
        questions: full.questions,
        isLoaded: true,
        uploadedAt: updated[w]?.uploadedAt || new Date().toISOString(),
      };
    }
  }
  saveWeeks(updated);
  return updated;
}

export function loadSingleBuiltInWeek(weekNum: number, currentWeeks: Record<number, WeekAssignment>): Record<number, WeekAssignment> {
  const full = ALL_WEEKS_DATA[weekNum];
  if (!full) return currentWeeks;
  const updated = {
    ...currentWeeks,
    [weekNum]: {
      ...currentWeeks[weekNum],
      weekNumber: weekNum,
      title: full.title,
      summary: full.summary,
      questions: full.questions,
      isLoaded: true,
      uploadedAt: new Date().toISOString(),
    },
  };
  saveWeeks(updated);
  return updated;
}

export function exportAppStateToJson(
  weeks: Record<number, WeekAssignment>,
  bookmarks: string[],
  mistakes: Record<string, UserMistake>,
  history: QuizResult[]
): void {
  const exportPayload = {
    app: 'GeoPrep MOOC Conservation Geography',
    version: '1.0',
    exportDate: new Date().toISOString(),
    weeks,
    bookmarks,
    mistakes,
    quizHistory: history,
  };

  const jsonStr = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `geoprep-conservation-geography-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseImportJson(jsonText: string): {
  weeks?: Record<number, WeekAssignment>;
  bookmarks?: string[];
  mistakes?: Record<string, UserMistake>;
  quizHistory?: QuizResult[];
} {
  const data = JSON.parse(jsonText);
  return {
    weeks: data.weeks,
    bookmarks: data.bookmarks,
    mistakes: data.mistakes,
    quizHistory: data.quizHistory,
  };
}
