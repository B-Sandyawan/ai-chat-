"use client";

import { Message } from "@/lib/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, User, Sparkles, RefreshCw, Brain, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  isDark: boolean;
  onRetry?: () => void;
  isLast?: boolean;
  isStreaming?: boolean;
}

export function ChatMessage({
  message,
  isDark,
  onRetry,
  isLast,
  isStreaming,
}: ChatMessageProps) {
  const [copiedFull, setCopiedFull] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);

  const isUser = message.role === "user";

  const copyFullMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  return (
    <div
      className={cn(
        "group w-full animate-fade-in",
        isUser ? "flex justify-end" : "flex flex-col items-start"
      )}
    >
      <div
        className={cn(
          "flex gap-4 max-w-full",
          isUser
            ? "flex-row-reverse items-start"
            : "flex-row items-start w-full"
        )}
      >
        {/* Avatar */}
        <div
          className={cn(
            "flex-shrink-0 rounded-lg flex items-center justify-center",
            isUser
              ? "w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 text-white"
              : "w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 text-white"
          )}
        >
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </div>

        {/* Message body */}
        <div
          className={cn(
            "flex flex-col",
            isUser ? "items-end max-w-[85%]" : "items-start w-full min-w-0"
          )}
        >
          {isUser ? (
            <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-tr-md">
              <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                {message.content}
              </p>
            </div>
          ) : (
            <div className="w-full min-w-0">
              {/* Reasoning content collapsible */}
              {message.reasoningContent && (
                <div className="mb-3 border border-border rounded-lg overflow-hidden bg-muted/40">
                  <button
                    onClick={() => setReasoningOpen(!reasoningOpen)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/60 transition-colors"
                  >
                    <Brain className="w-3.5 h-3.5" />
                    {reasoningOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                    <span>Reasoning</span>
                  </button>
                  {reasoningOpen && (
                    <div className="px-3 py-2 text-xs text-muted-foreground whitespace-pre-wrap border-t border-border font-mono">
                      {message.reasoningContent}
                    </div>
                  )}
                </div>
              )}

              {/* Markdown content */}
              <div className="prose-custom text-foreground max-w-none">
                {message.content ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const lang = match ? match[1] : "";
                        const codeString = String(children).replace(/\n$/, "");

                        if (inline) {
                          return (
                            <code
                              className="bg-code-bg px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-border"
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }

                        return (
                          <CodeBlock
                            code={codeString}
                            language={lang}
                            isDark={isDark}
                          />
                        );
                      },
                      p({ children }) {
                        return (
                          <p className="my-3 leading-relaxed text-[15px]">
                            {children}
                          </p>
                        );
                      },
                      h1({ children }) {
                        return (
                          <h1 className="text-2xl font-semibold mt-6 mb-3">
                            {children}
                          </h1>
                        );
                      },
                      h2({ children }) {
                        return (
                          <h2 className="text-xl font-semibold mt-5 mb-2">
                            {children}
                          </h2>
                        );
                      },
                      h3({ children }) {
                        return (
                          <h3 className="text-lg font-semibold mt-4 mb-2">
                            {children}
                          </h3>
                        );
                      },
                      ul({ children }) {
                        return (
                          <ul className="my-3 ml-6 list-disc space-y-1 text-[15px]">
                            {children}
                          </ul>
                        );
                      },
                      ol({ children }) {
                        return (
                          <ol className="my-3 ml-6 list-decimal space-y-1 text-[15px]">
                            {children}
                          </ol>
                        );
                      },
                      li({ children }) {
                        return <li className="leading-relaxed">{children}</li>;
                      },
                      a({ children, href }) {
                        return (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {children}
                          </a>
                        );
                      },
                      blockquote({ children }) {
                        return (
                          <blockquote className="border-l-4 border-primary/40 pl-4 my-3 italic text-muted-foreground">
                            {children}
                          </blockquote>
                        );
                      },
                      table({ children }) {
                        return (
                          <div className="my-4 overflow-x-auto">
                            <table className="min-w-full border border-border rounded-lg text-sm">
                              {children}
                            </table>
                          </div>
                        );
                      },
                      thead({ children }) {
                        return (
                          <thead className="bg-muted/50">{children}</thead>
                        );
                      },
                      th({ children }) {
                        return (
                          <th className="border border-border px-3 py-2 text-left font-semibold">
                            {children}
                          </th>
                        );
                      },
                      td({ children }) {
                        return (
                          <td className="border border-border px-3 py-2">
                            {children}
                          </td>
                        );
                      },
                      hr() {
                        return <hr className="my-6 border-border" />;
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  isStreaming && <TypingDots />
                )}
              </div>

              {/* Actions bar */}
              {message.content && (
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={copyFullMessage}
                    className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    title="Salin pesan"
                  >
                    {copiedFull ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  {isLast && onRetry && (
                    <button
                      onClick={onRetry}
                      className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                      title="Coba lagi"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CodeBlock({
  code,
  language,
  isDark,
}: {
  code: string;
  language: string;
  isDark: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-border bg-code-bg">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">
          {language || "plain"}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Disalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Salin</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          fontSize: "13.5px",
          lineHeight: "1.6",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              "JetBrains Mono, SF Mono, Fira Code, ui-monospace, monospace",
          },
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <div
        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse-dot"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse-dot"
        style={{ animationDelay: "0.2s" }}
      />
      <div
        className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-pulse-dot"
        style={{ animationDelay: "0.4s" }}
      />
    </div>
  );
}
