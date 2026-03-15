import { api } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface ChatSession {
  session_id: string;
  title: string | null;
  last_message: string | null;
  updated_at: string;
  message_count: number;
}

export const chatService = {
  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    const res = await api.get<ChatMessage[]>(`/api/chat/history/${sessionId}`);
    return res.data;
  },

  async getRecentSessions(): Promise<ChatSession[]> {
    const res = await api.get<ChatSession[]>('/api/chat/recent');
    return res.data;
  },

  async uploadFile(sessionId: string, file: File): Promise<{ file_id: string; file_name: string; file_path: string }> {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post(`/upload/session/${sessionId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as { file_id: string; file_name: string; file_path: string };
  },
};
