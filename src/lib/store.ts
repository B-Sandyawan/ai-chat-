import { Conversation, Message, AIModel } from "./types";
import { generateId } from "./api";

// Local storage keys
const STORAGE_KEY = "ai-chat-conversations";
const MODEL_KEY = "ai-chat-selected-model";
const THEME_KEY = "ai-chat-theme";

// Load conversations from localStorage
export function loadConversations(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Save conversations to localStorage
export function saveConversations(conversations: Conversation[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch {
    // Storage full or unavailable
  }
}

// Load selected model
export function loadSelectedModel(): string {
  if (typeof window === "undefined") return "amanai/claude-opus-4.8";
  return localStorage.getItem(MODEL_KEY) || "amanai/claude-opus-4.8";
}

// Save selected model
export function saveSelectedModel(model: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(MODEL_KEY, model);
}

// Load theme preference
export function loadTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Save theme preference
export function saveTheme(theme: "light" | "dark"): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, theme);
}

// Create new conversation
export function createConversation(model: string): Conversation {
  const now = Date.now();
  return {
    id: `conv_${now}_${Math.random().toString(36).substring(2, 9)}`,
    title: "Percakapan Baru",
    messages: [],
    model,
    createdAt: now,
    updatedAt: now,
  };
}

// Auto-generate title from first message
export function generateTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "Percakapan Baru";
  const text = first.content.trim();
  // Truncate to first line or 60 chars
  const title = text.split("\n")[0];
  return title.length > 60 ? title.substring(0, 57) + "..." : title;
}
