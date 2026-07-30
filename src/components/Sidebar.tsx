"use client";

import { Conversation } from "@/lib/types";
import {
  MessageSquarePlus,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { groupConversationsByDate } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  activeConvId: string | null;
  onNewConversation: () => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  conversations,
  activeConvId,
  onNewConversation,
  onSwitch,
  onDelete,
  onRename,
  isOpen,
  onToggle,
}: SidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const groups = groupConversationsByDate(conversations);

  const startEdit = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          "fixed lg:relative z-50 h-full bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ease-out overflow-hidden",
          isOpen ? "w-72" : "w-0 lg:w-0"
        )}
      >
        <div className={cn("w-72 flex flex-col h-full", !isOpen && "invisible")}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">Aman AI Chat</span>
                <span className="text-[10px] text-sidebar-foreground/50">
                  Powered by AmanAI
                </span>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 hover:bg-sidebar-hover rounded-md transition-colors lg:block"
              title="Tutup sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New chat button */}
          <div className="p-3">
            <button
              onClick={onNewConversation}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium shadow-sm"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Chat Baru</span>
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-2 pb-3">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                <MessageSquare className="w-10 h-10 text-sidebar-foreground/20 mb-2" />
                <p className="text-xs text-sidebar-foreground/50">
                  Belum ada percakapan
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.label} className="mb-3">
                  <div className="px-2 py-1 text-[11px] font-semibold text-sidebar-foreground/50 uppercase tracking-wide">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map((conv) => {
                      const isActive = conv.id === activeConvId;
                      const isEditing = editingId === conv.id;
                      const isConfirmingDelete = confirmDelete === conv.id;

                      return (
                        <div
                          key={conv.id}
                          onClick={() => !isEditing && onSwitch(conv.id)}
                          className={cn(
                            "group relative flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                            isActive
                              ? "bg-sidebar-active"
                              : "hover:bg-sidebar-hover"
                          )}
                        >
                          {isEditing ? (
                            <>
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEdit();
                                  if (e.key === "Escape") cancelEdit();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                                className="flex-1 bg-transparent outline-none border-b border-primary text-sm py-0.5"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveEdit();
                                }}
                                className="p-1 hover:bg-sidebar-hover rounded"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEdit();
                                }}
                                className="p-1 hover:bg-sidebar-hover rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : isConfirmingDelete ? (
                            <>
                              <span className="flex-1 text-xs text-red-400 truncate">
                                Hapus?
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(conv.id);
                                  setConfirmDelete(null);
                                }}
                                className="p-1 hover:bg-red-500/20 rounded text-red-400"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDelete(null);
                                }}
                                className="p-1 hover:bg-sidebar-hover rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="flex-1 truncate">
                                {conv.title}
                              </span>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => startEdit(conv, e)}
                                  className="p-1 hover:bg-sidebar-hover rounded"
                                  title="Rename"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDelete(conv.id);
                                  }}
                                  className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-sidebar-border">
            <div className="text-[11px] text-sidebar-foreground/40 text-center">
              {conversations.length} percakapan tersimpan
            </div>
          </div>
        </div>
      </aside>

      {/* Show open button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed top-3 left-3 z-30 p-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors shadow-sm"
          title="Buka sidebar"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      )}
    </>
  );
}
