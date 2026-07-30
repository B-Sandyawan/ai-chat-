"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { Sidebar } from "@/components/Sidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { ModelSelector } from "@/components/ModelSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShareButton } from "@/components/ShareButton";
import { Sparkles, AlertCircle, Trash2, Plus } from "lucide-react";

export default function Home() {
  const {
    conversations,
    activeConversation,
    activeConvId,
    isLoading,
    error,
    selectedModel,
    models,
    newConversation,
    switchConversation,
    deleteConversation,
    renameConversation,
    changeModel,
    sendMessage,
    stopGeneration,
    retryLast,
    clearConversations,
  } = useChat();

  const [isDark, setIsDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize theme
  useEffect(() => {
    const stored = localStorage.getItem("ai-chat-theme");
    const dark =
      stored === "dark" ||
      (!stored &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(dark);
    if (dark) document.documentElement.classList.add("dark");
  }, []);

  // Apply theme change
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("ai-chat-theme", isDark ? "dark" : "light");
  }, [isDark]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [activeConversation?.messages]);

  // Responsive: close sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const handleSend = (content: string) => {
    sendMessage(content);
  };

  const handleNewChat = () => {
    newConversation();
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const messages = activeConversation?.messages || [];
  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConvId={activeConvId}
        onNewConversation={handleNewChat}
        onSwitch={(id) => {
          switchConversation(id);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        onDelete={deleteConversation}
        onRename={renameConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-background/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2">
            {!sidebarOpen && (
              <div className="flex items-center gap-2 ml-12">
                <ModelSelector
                  models={models}
                  selected={selectedModel}
                  onChange={changeModel}
                />
              </div>
            )}
            {sidebarOpen && (
              <ModelSelector
                models={models}
                selected={selectedModel}
                onChange={changeModel}
              />
            )}
          </div>
          <div className="flex items-center gap-1">
            <ShareButton conversation={activeConversation ?? null} />
            {conversations.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Hapus semua percakapan?")) {
                    clearConversations();
                  }
                }}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors"
                title="Hapus semua"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(!isDark)} />
          </div>
        </header>

        {/* Messages or empty state */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          {hasMessages ? (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg, idx) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isDark={isDark}
                  onRetry={idx === messages.length - 1 ? retryLast : undefined}
                  isLast={idx === messages.length - 1}
                  isStreaming={
                    isLoading && idx === messages.length - 1 && msg.role === "assistant"
                  }
                />
              ))}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          ) : (
            <EmptyState onNewChat={handleNewChat} />
          )}
        </div>

        {/* Error display */}
        {error && (
          <div className="max-w-3xl mx-auto w-full px-4">
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg text-sm mb-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="pb-2">
          <ChatInput
            onSend={handleSend}
            onStop={stopGeneration}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onNewChat }: { onNewChat: () => void }) {
  const examples = [
    { icon: "💡", title: "Jelaskan konsep", desc: "Jelaskan quantum computing dengan analogi sederhana" },
    { icon: "💻", title: "Bantu coding", desc: "Tulis function TypeScript untuk validasi email" },
    { icon: "📝", title: "Tulis sesuatu", desc: "Buat email profesional untuk melamar kerja" },
    { icon: "🧠", title: "Analisa ide", desc: "Apa pro & kontra microservices vs monolith?" },
  ];

  return (
    <div className="h-full flex flex-col items-center justify-center px-4 py-8">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-semibold mb-2">Ada yang bisa dibantu?</h1>
      <p className="text-muted-foreground text-sm mb-8 text-center max-w-md">
        Tanya apapun, dari coding sampai ide kreatif. Pilih model AI di atas
        untuk mulai.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        {examples.map((ex, i) => (
          <button
            key={i}
            onClick={onNewChat}
            className="text-left p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/50 transition-all group"
          >
            <div className="text-2xl mb-2">{ex.icon}</div>
            <div className="text-sm font-medium mb-1">{ex.title}</div>
            <div className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">
              {ex.desc}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
