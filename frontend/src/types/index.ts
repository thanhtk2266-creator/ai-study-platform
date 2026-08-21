// Định nghĩa các TypeScript interfaces cho toàn bộ ứng dụng

export interface Document {
  id: string;
  filename: string;
  content_type: string;
  status: "processing" | "ready" | "error";
  chunk_count: number;
  created_at: string;
}

export interface Quiz {
  id: string;
  document_id: string;
  title: string;
  questions: Question[];
  num_questions: number;
  created_at: string;
}

export interface Question {
  id: string;
  question_text: string;
  options: { A: string; B: string; C: string; D: string };
  correct_answer?: string;
  explanation?: string;
  order_index: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  answers: Record<string, string>;
  score: number;
  correct_count: number;
  total_questions: number;
  submitted_at: string;
}

export interface QuizResult {
  attempt: QuizAttempt;
  questions: Question[];
  user_answers: Record<string, string>;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: "bearer";
}

export interface RecentAttempt {
  attempt_id: string;
  quiz_id: string;
  quiz_title: string;
  document_name?: string | null;
  score: number;
  correct_count: number;
  total_questions: number;
  submitted_at: string;
}

export interface DashboardStats {
  total_documents: number;
  ready_documents: number;
  total_attempts: number;
  average_score: number;
  study_streak_days: number;
  recent_attempts: RecentAttempt[];
}
