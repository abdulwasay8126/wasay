export type ChatRole = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  timestamp: string; // ISO string
}

export interface ChatRequestBody {
  message: string;
  timestamp: string; // ISO string
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatApiResponse {
  ok: boolean;
  reply?: string;
  error?: string;
}

