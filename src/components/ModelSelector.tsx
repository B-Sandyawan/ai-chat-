"use client";

import { AIModel } from "@/lib/types";
import { ChevronDown, Check, Eye, Brain, Zap } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  models: AIModel[];
  selected: string;
  onChange: (modelId: string) => void;
}

export function ModelSelector({
  models,
  selected,
  onChange,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedModel = models.find((m) => m.id === selected);
  const displayName = selectedModel?.name || selected.split("/").pop() || "Model";

  const filteredModels = models.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  // Fallback models if API doesn't return anything
  const fallbackModels: AIModel[] = [
    {
      id: "amanai/claude-opus-4.8",
      name: "Claude Opus 4.8",
      description: "Model paling canggih untuk reasoning",
      contextWindow: 200000,
      priority: 1,
      supportsVision: true,
      supportsReasoning: true,
    },
    {
      id: "amanai/claude-opus-5",
      name: "Claude Opus 5",
      description: "Next generation reasoning",
      contextWindow: 200000,
      priority: 2,
      supportsVision: true,
      supportsReasoning: true,
    },
    {
      id: "amanai/claude-sonnet-5",
      name: "Claude Sonnet 5",
      description: "Balance antara kecepatan & kualitas",
      contextWindow: 200000,
      priority: 3,
      supportsVision: true,
      supportsReasoning: true,
    },
    {
      id: "amanai/gpt-5.4-mini",
      name: "GPT 5.4 Mini",
      description: "Cepat dan efisien",
      contextWindow: 128000,
      priority: 4,
      supportsVision: true,
      supportsReasoning: true,
    },
    {
      id: "amanai/grok-4.3-medium",
      name: "Grok 4.3 Medium",
      description: "Reasoning menengah dari xAI",
      contextWindow: 272000,
      priority: 5,
      supportsVision: true,
      supportsReasoning: true,
    },
  ];

  const displayModels = models.length > 0 ? filteredModels : fallbackModels;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm font-medium border border-transparent hover:border-border"
      >
        <Sparkle />
        <span className="truncate max-w-[200px]">{displayName}</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform text-muted-foreground",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-card border border-border rounded-xl shadow-lg z-50 animate-slide-in overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari model..."
              className="w-full px-3 py-1.5 bg-muted rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="max-h-96 overflow-y-auto py-1">
            {displayModels.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Tidak ada model
              </div>
            ) : (
              displayModels.map((model) => {
                const isSelected = model.id === selected;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onChange(model.id);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors",
                      isSelected && "bg-muted"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {model.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {model.supportsVision && (
                            <Eye
                              className="w-3 h-3 text-blue-500"
                              aria-label="Vision support"
                            />
                          )}
                          {model.supportsReasoning && (
                            <Brain
                              className="w-3 h-3 text-purple-500"
                              aria-label="Reasoning"
                            />
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {model.id}
                      </p>
                      {model.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
                          {model.description}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Sparkle() {
  return (
    <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
      <Zap className="w-3 h-3 text-white" />
    </div>
  );
}
