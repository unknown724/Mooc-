export type OptionLabel = 'a' | 'b' | 'c' | 'd';

export interface OptionItem {
  label: OptionLabel;
  text: string;
}

export type QuestionOption = OptionItem;

export type ConceptCluster =
  | 'Protected Areas & IUCN'
  | 'Remote Sensing & GIS'
  | 'Geomorphology & Hydrology'
  | 'Biogeography & Island Theory'
  | 'Biodiversity Metrics & Ecology'
  | 'Conservation Policy & Red List';

export interface QuestionItem {
  id: string; // e.g. "w3-q1"
  week?: number; // 1 to 12
  weekNumber: number; // 1 to 12
  number: number; // 1 to 10
  questionText: string;
  options: OptionItem[];
  correctOption: OptionLabel;
  explanation: string;
  topicTag: string; // e.g., "Lithosphere & Rocks", "Weathering", "Mineralogy", "Geomorphology"
  clusterTag?: ConceptCluster;
  keywordHook?: string;
  coreConcept?: string;
  masteryCount?: number;
}

export type Question = QuestionItem;
export type EnhancedQuestion = QuestionItem & {
  clusterTag: ConceptCluster;
  keywordHook: string;
  coreConcept: string;
};

export interface UserQuestionStats {
  attempts: number;
  correctCount: number;
  lastResult?: 'correct' | 'incorrect';
  bookmarked: boolean;
  userNote?: string;
  lastAttemptDate?: string;
}

export interface WeekAssignment {
  weekNumber: number;
  title: string;
  summary: string;
  questions: QuestionItem[];
  isLoaded: boolean;
  uploadedAt?: string;
  bestScore?: number;
  attemptsCount?: number;
  lastAttemptDate?: string;
}

export type QuizMode = 'feedback' | 'timed';

export interface ExamConfig {
  title: string;
  selectedWeeks: number[];
  questionCount: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  mode: QuizMode;
  timeLimitMinutes?: number;
  isRetestMistakes?: boolean;
}

export interface UserMistake {
  questionId: string;
  weekNumber: number;
  questionNumber: number;
  questionText: string;
  options: OptionItem[];
  selectedOption: OptionLabel;
  correctOption: OptionLabel;
  explanation: string;
  topicTag: string;
  timestamp: string;
  errorCount: number;
}

export interface QuizAnswerRecord {
  questionId: string;
  selectedOption: OptionLabel | null;
  correctOption: OptionLabel;
  isCorrect: boolean;
  timeSpentSeconds: number;
}

export interface QuizResult {
  id: string;
  timestamp: string;
  examTitle: string;
  mode: QuizMode;
  weeksIncluded: number[];
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeTakenSeconds: number;
  answers: Record<string, QuizAnswerRecord>;
}

export type AppView = 'dashboard' | 'reader' | 'flashcards' | 'quiz' | 'mistakes' | 'cheatsheet';

export type FlashcardConfidence = 'again' | 'hard' | 'good' | 'easy';

export type AppTheme = 'warm' | 'daylight' | 'midnight';

export type FontSizeSetting = 'small' | 'medium' | 'large';
