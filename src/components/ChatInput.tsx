"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ArrowUp, Square, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

interface Attachment {
  name: string;
  content: string;
  type: string;
}

export function ChatInput({
  onSend,
  onStop,
  isLoading,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    const newHeight = Math.min(ta.scrollHeight, 240);
    ta.style.height = `${newHeight}px`;
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;

    let finalContent = input.trim();
    if (attachments.length > 0) {
      const attachmentText = attachments
        .map(
          (a) =>
            `\n\n[Terlampir: ${a.name}]\n\`\`\`\n${a.content}\n\`\`\``
        )
        .join("");
      finalContent += attachmentText;
    }

    onSend(finalContent);
    setInput("");
    setAttachments([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (file.size > 1024 * 1024) {
        alert(`File ${file.name} terlalu besar (max 1MB untuk sekarang)`);
        continue;
      }
      try {
        const text = await file.text();
        newAttachments.push({
          name: file.name,
          content: text.slice(0, 100000), // limit content
          type: file.type || "text/plain",
        });
      } catch {
        // skip unreadable
      }
    }
    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="relative bg-card border border-border rounded-2xl shadow-sm hover:border-border/80 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5 text-xs"
              >
                <Paperclip className="w-3 h-3" />
                <span className="max-w-[200px] truncate">{att.name}</span>
                <button
                  onClick={() => removeAttachment(i)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanya apapun ke AI..."
          rows={1}
          disabled={disabled}
          className="w-full px-4 py-3.5 pr-24 bg-transparent resize-none outline-none placeholder:text-muted-foreground text-[15px] leading-relaxed disabled:opacity-50"
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".txt,.md,.json,.csv,.py,.js,.ts,.tsx,.jsx,.html,.css,.yaml,.yml,.xml,.log"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isLoading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
            title="Lampirkan file"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {isLoading ? (
            <button
              onClick={onStop}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              title="Stop"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || disabled}
              className={cn(
                "p-2 rounded-lg transition-all",
                input.trim() && !disabled
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              title="Kirim (Enter)"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-2 mb-3">
        AI bisa salah. Verifikasi info penting sendiri.
      </p>
    </div>
  );
}
