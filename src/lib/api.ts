export interface StreamCallbacks {
  onToken: (token: string) => void;
  onReasoning?: (token: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
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

/**
 * Stream chat completion via our Next.js API proxy route.
 * This keeps the AmanAI API key server-side only.
 */
export async function streamChat(
  model: string,
  messages: { role: string; content: string }[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const { onToken, onReasoning, onDone, onError } = callbacks;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        max_tokens: 4096,
      }),
      signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            onError(new Error(parsed.error));
            return;
          }
          const choices = parsed.choices || [];
          for (const choice of choices) {
            const delta = choice.delta || {};
            if (delta.reasoning_content) {
              onReasoning?.(delta.reasoning_content);
            }
            if (delta.content) {
              onToken(delta.content);
            }
          }
        } catch {
          // skip malformed JSON lines
        }
      }
    }

    onDone();
  } catch (error: any) {
    if (error.name === "AbortError") {
      onDone();
      return;
    }
    onError(error);
  }
}

/**
 * Fetch available models via our Next.js API proxy route.
 */
export async function fetchModels(): Promise<AIModel[]> {
  try {
    const response = await fetch("/api/models", { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
