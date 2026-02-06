import axios from 'axios';
import type {
  ApiResponse,
  Summary,
  SummaryStyle,
  Quiz,
  QuizDifficulty,
  Diagram,
  DiagramType,
  UploadResult,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function uploadPDF(file: File): Promise<ApiResponse<UploadResult>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiResponse<UploadResult>>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function summarize(
  content: string,
  style: SummaryStyle = 'brief'
): Promise<ApiResponse<Summary>> {
  const response = await api.post<ApiResponse<Summary>>('/ai/summarize', {
    content,
    style,
  });

  return response.data;
}

export async function generateQuiz(
  content: string,
  questionCount: number = 5,
  difficulty: QuizDifficulty = 'medium'
): Promise<ApiResponse<Quiz>> {
  const response = await api.post<ApiResponse<Quiz>>('/ai/quiz', {
    content,
    question_count: questionCount,
    difficulty,
  });

  return response.data;
}

export async function generateDiagram(
  content: string,
  diagramType: DiagramType = 'mindmap'
): Promise<ApiResponse<Diagram>> {
  const response = await api.post<ApiResponse<Diagram>>('/ai/diagram', {
    content,
    diagram_type: diagramType,
  });

  return response.data;
}

export default api;
