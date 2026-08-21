import axios from "axios";
import type {
  AuthToken,
  AuthUser,
  DashboardStats,
  Document,
  FlashcardDeck,
  FlashcardDeckSummary,
  Quiz,
  QuizResult,
  RecentAttempt,
} from "@/types";
import { clearToken, getToken } from "@/lib/auth";

// Axios instance - proxy qua Next.js rewrites đến FastAPI
const api = axios.create({
  baseURL: "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  }
);

// ====== Auth APIs ======

export async function register(payload: {
  email: string;
  full_name: string;
  password: string;
}): Promise<AuthUser> {
  const { data } = await api.post<AuthUser>("/auth/register", payload);
  return data;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthToken> {
  const { data } = await api.post<AuthToken>("/auth/login", payload);
  return data;
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get<DashboardStats>("/auth/me/dashboard");
  return data;
}

/** Lịch sử bài làm đầy đủ */
export async function getMyAttempts(): Promise<RecentAttempt[]> {
  const { data } = await api.get<RecentAttempt[]>("/auth/me/attempts");
  return data;
}

// ====== Document APIs ======

/** Upload tài liệu (PDF/PPTX) */
export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<Document>("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

/** Lấy danh sách tài liệu */
export async function getDocuments(): Promise<Document[]> {
  const { data } = await api.get<Document[]>("/documents");
  return data;
}

/** Lấy chi tiết 1 tài liệu */
export async function getDocument(id: string): Promise<Document> {
  const { data } = await api.get<Document>(`/documents/${id}`);
  return data;
}

/** Xóa tài liệu */
export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${id}`);
}

// ====== Quiz APIs ======

/** Tạo quiz từ tài liệu */
export async function generateQuiz(
  documentId: string,
  numQuestions: number = 10
): Promise<Quiz> {
  const { data } = await api.post<Quiz>("/quizzes/generate", {
    document_id: documentId,
    num_questions: numQuestions,
  });
  return data;
}

/** Lấy quiz (để làm bài - không có đáp án) */
export async function getQuiz(quizId: string): Promise<Quiz> {
  const { data } = await api.get<Quiz>(`/quizzes/${quizId}`);
  return data;
}

/** Nộp bài và chấm điểm */
export async function submitQuiz(
  quizId: string,
  answers: Record<string, string>
): Promise<QuizResult> {
  const { data } = await api.post<QuizResult>(`/quizzes/${quizId}/submit`, {
    answers,
  });
  return data;
}

/** Lấy kết quả bài thi */
export async function getQuizResults(quizId: string): Promise<QuizResult> {
  const { data } = await api.get<QuizResult>(`/quizzes/${quizId}/results`);
  return data;
}

// ====== Flashcard APIs ======

/** Tạo bộ flashcard từ vựng từ một tài liệu */
export async function generateFlashcardDeck(
  documentId: string,
  numCards: number = 15
): Promise<FlashcardDeck> {
  const { data } = await api.post<FlashcardDeck>("/flashcards/generate", {
    document_id: documentId,
    num_cards: numCards,
  });
  return data;
}

/** Lấy danh sách bộ flashcard */
export async function getFlashcardDecks(): Promise<FlashcardDeckSummary[]> {
  const { data } = await api.get<FlashcardDeckSummary[]>("/flashcards");
  return data;
}

/** Lấy chi tiết 1 bộ flashcard (kèm các card) */
export async function getFlashcardDeck(deckId: string): Promise<FlashcardDeck> {
  const { data } = await api.get<FlashcardDeck>(`/flashcards/${deckId}`);
  return data;
}

/** Xóa bộ flashcard */
export async function deleteFlashcardDeck(deckId: string): Promise<void> {
  await api.delete(`/flashcards/${deckId}`);
}

export default api;
