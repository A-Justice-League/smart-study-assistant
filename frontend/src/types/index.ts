// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Summary types
export interface Summary {
  summary: string;
  key_points: string[];
  topics: string[];
  word_count: number;
}

export type SummaryStyle = 'brief' | 'detailed' | 'bullet-points';

// Quiz types
export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false';
  question: string;
  options?: string[];
  correct_answer: number | boolean;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
  total_questions: number;
}

export type QuizDifficulty = 'easy' | 'medium' | 'hard';

// Diagram types
export interface Diagram {
  title: string;
  image_url: string;
  explanation: string;
}

export type DiagramType = 'flowchart' | 'mindmap' | 'concept-map';

// Upload types
export interface UploadResult {
  text: string;
  page_count: number;
  word_count: number;
}

// Study page state
export interface StudyState {
  inputType: 'text' | 'pdf';
  content: string;
  file: File | null;
  summary: Summary | null;
  quiz: Quiz | null;
  diagram: Diagram | null;
  activeOutputTab: 'summary' | 'quiz' | 'diagram';
  isLoading: boolean;
  error: string | null;
}

// Quiz interaction state
export interface QuizState {
  currentIndex: number;
  selectedAnswer: number | boolean | null;
  showFeedback: boolean;
  answers: (number | boolean | null)[];
  isComplete: boolean;
}
