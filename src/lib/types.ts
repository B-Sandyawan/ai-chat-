export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  reasoningContent?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  contextWindow: number;
  priority: number;
  supportsVision: boolean;
  supportsReasoning: boolean;
}

export interface StreamChunk {
  content: string;
  reasoningContent?: string;
  done: boolean;
}

export interface ChatRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  content: string;
  model: string;
}
