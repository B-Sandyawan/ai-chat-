import LZString from "lz-string";
import type { Conversation, Message } from "./types";

export interface SharedConversation {
  title: string;
  model: string;
  messages: Array<{
    role: Message["role"];
    content: string;
    reasoningContent?: string;
  }>;
  sharedAt: number;
  version: 1;
}

const MAX_URL_LENGTH = 32000;

export function encodeShareData(conv: Conversation): {
  encoded: string;
  size: number;
  tooLarge: boolean;
} {
  const payload: SharedConversation = {
    title: conv.title,
    model: conv.model,
    messages: conv.messages
      .filter((m) => m.content.trim().length > 0)
      .map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.reasoningContent ? { reasoningContent: m.reasoningContent } : {}),
      })),
    sharedAt: Date.now(),
    version: 1,
  };

  const json = JSON.stringify(payload);
  const encoded = LZString.compressToEncodedURIComponent(json);

  return {
    encoded,
    size: encoded.length,
    tooLarge: encoded.length > MAX_URL_LENGTH,
  };
}

export function decodeShareData(encoded: string): SharedConversation | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json) as SharedConversation;
    if (parsed.version !== 1 || !Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildShareUrl(encoded: string): string {
  if (typeof window === "undefined") return `/share/${encoded}`;
  return `${window.location.origin}/share/${encoded}`;
}
