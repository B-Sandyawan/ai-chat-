import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const day = 24 * 60 * 60 * 1000;

  if (diff < day) return "Hari ini";
  if (diff < 2 * day) return "Kemarin";
  if (diff < 7 * day) return `${Math.floor(diff / day)} hari lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function groupConversationsByDate<T extends { updatedAt: number }>(
  conversations: T[]
): { label: string; items: T[] }[] {
  const groups: Record<string, T[]> = {
    "Hari ini": [],
    Kemarin: [],
    "7 hari terakhir": [],
    "30 hari terakhir": [],
    "Lebih lama": [],
  };

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  for (const conv of conversations) {
    const diff = now - conv.updatedAt;
    if (diff < day) groups["Hari ini"].push(conv);
    else if (diff < 2 * day) groups["Kemarin"].push(conv);
    else if (diff < 7 * day) groups["7 hari terakhir"].push(conv);
    else if (diff < 30 * day) groups["30 hari terakhir"].push(conv);
    else groups["Lebih lama"].push(conv);
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}
