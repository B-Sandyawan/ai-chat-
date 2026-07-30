"use client";

import { useEffect, useRef, useState } from "react";
import {
  Share2,
  Copy,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { buildShareUrl, encodeShareData } from "@/lib/share";
import type { Conversation } from "@/lib/types";

interface ShareButtonProps {
  conversation: Conversation | null;
}

export function ShareButton({ conversation }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>("");
  const [size, setSize] = useState(0);
  const [tooLarge, setTooLarge] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const hasContent =
    conversation && conversation.messages.some((m) => m.content.trim());

  useEffect(() => {
    if (!open || !conversation) return;
    const { encoded, size: s, tooLarge: tl } = encodeShareData(conversation);
    setShareUrl(buildShareUrl(encoded));
    setSize(s);
    setTooLarge(tl);
    setCopied(false);
  }, [open, conversation]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.getElementById(
        "share-url-input"
      ) as HTMLInputElement | null;
      if (input) {
        input.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const kb = (size / 1024).toFixed(1);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={!hasContent}
        className="p-2 rounded-lg hover:bg-sidebar-hover transition disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Share conversation"
        title={hasContent ? "Share chat" : "Chat kosong, tidak bisa di-share"}
      >
        <Share2 className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div
            ref={modalRef}
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-base">Share percakapan</h2>
                  <p className="text-xs text-muted-foreground">
                    Link publik, read-only
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-sidebar-hover transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {tooLarge ? (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">
                      Percakapan terlalu panjang untuk di-share via URL
                    </p>
                    <p className="text-yellow-600/80 dark:text-yellow-400/80 mt-1">
                      Ukuran: {kb} KB (batas ~32 KB). Coba share sebagian
                      conversation dengan clear beberapa message dulu, atau
                      export sebagai text.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Siapa pun yang punya link ini bisa membaca percakapan
                    (read-only). Data ter-encode langsung di URL — no server
                    storage.
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border overflow-hidden">
                      <input
                        id="share-url-input"
                        readOnly
                        value={shareUrl}
                        onFocus={(e) => e.currentTarget.select()}
                        className="flex-1 bg-transparent text-xs outline-none font-mono truncate"
                      />
                    </div>
                    <button
                      onClick={handleCopy}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 shrink-0 ${
                        copied
                          ? "bg-green-500 text-white"
                          : "bg-primary text-white hover:opacity-90"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {conversation?.messages.length ?? 0} pesan · {kb} KB
                    </span>
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-foreground transition"
                    >
                      Preview
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </>
              )}
            </div>

            <div className="px-5 py-3 bg-muted/50 border-t border-border text-xs text-muted-foreground">
              💡 Tip: Link ini permanen selama tidak di-decode ulang. Kalau
              butuh update, generate share link baru.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
