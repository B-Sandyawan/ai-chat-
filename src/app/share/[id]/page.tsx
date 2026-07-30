"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, AlertCircle, Sun, Moon } from "lucide-react";
import { decodeShareData, type SharedConversation } from "@/lib/share";
import { ChatMessage } from "@/components/ChatMessage";
import { loadTheme, saveTheme } from "@/lib/store";
import type { Message } from "@/lib/types";

export default function SharePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<SharedConversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = loadTheme();
    const dark = theme === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  useEffect(() => {
    const id = params?.id;
    if (!id || typeof id !== "string") {
      setError("Link share tidak valid");
      return;
    }
    const decoded = decodeShareData(id);
    if (!decoded) {
      setError("Konten share rusak atau format tidak dikenali");
      return;
    }
    setData(decoded);
  }, [params]);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    saveTheme(next ? "dark" : "light");
  };

  const messages: Message[] = useMemo(() => {
    if (!data) return [];
    return data.messages.map((m, i) => ({
      id: `shared_${i}`,
      role: m.role,
      content: m.content,
      createdAt: data.sharedAt,
      reasoningContent: m.reasoningContent,
    }));
  }, [data]);

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold">Tidak bisa membuka share</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white hover:opacity-90 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke chat
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">
          Memuat share...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-sidebar-hover transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Buka Aman AI</span>
          </button>

          <div className="flex-1 min-w-0 text-center">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0" />
              <h1 className="text-sm font-medium truncate">{data.title}</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dibagikan oleh pengguna Aman AI ·{" "}
              {new Date(data.sharedAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-sidebar-hover transition"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto chat-scroll">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Percakapan ini kosong.
            </p>
          ) : (
            messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                message={msg}
                isDark={isDark}
                isLast={i === messages.length - 1}
                isStreaming={false}
              />
            ))
          )}

          <div className="pt-8 pb-4 border-t border-border">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Mau lanjut chat sendiri?
              </p>
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-medium hover:opacity-90 transition shadow-lg shadow-purple-500/20"
              >
                <Sparkles className="w-4 h-4" />
                Buka Aman AI Chat
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
