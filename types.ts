export interface BlockTemplate {
  id: string;
  categoryId: string;
  label: string;
  content: string; // The raw template with {{slots}}
  description?: string;
  isCustom?: boolean; // Flag to identify user-created blocks
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind class for badge color
  icon: string;
}

// An instance of a block on the canvas
export interface BlockInstance {
  instanceId: string; // Unique ID for this specific placement
  templateId: string;
  values: Record<string, string>; // Map variable key -> user input
}

export interface HistoryItem {
  id: string;
  content: string;
  tokenCount: number;
  cost: number;
  timestamp: number;
  blocksUsed: number;
}

export interface TokenStats {
  charCount: number;
  tokenCount: number;
  estimatedCost: number;
  isOverLimit: boolean;
}