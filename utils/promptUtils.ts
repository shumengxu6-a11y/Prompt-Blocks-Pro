import { PRICE_PER_1K_TOKENS } from '../constants';
import { BlockTemplate, TokenStats } from '../types';

/**
 * Parses a template string and returns an array of segments.
 * Example: "Hello {{name}}" -> ["Hello ", "{{name}}"]
 */
export const parseTemplate = (template: string): string[] => {
  return template.split(/(\{\{.*?\}\})/g);
};

/**
 * Parses a slot string to extract the Key and potential Options.
 * Syntax: {{key|option1|option2}}
 * Returns: { key: "key", options: ["option1", "option2"] }
 */
export const parseSlot = (slot: string): { key: string; options: string[] } => {
  // Remove {{ and }}
  const content = slot.replace(/\{\{|\}\}/g, '');
  
  // Split by pipe |
  const parts = content.split('|');
  const key = parts[0].trim();
  const options = parts.slice(1).map(o => o.trim()).filter(o => o.length > 0);

  return { key, options };
};

/**
 * Legacy helper for simple extraction
 */
export const extractSlotKey = (slot: string): string => {
  return parseSlot(slot).key;
};

/**
 * Estimates token count based on a heuristic
 */
export const calculateTokenStats = (text: string): TokenStats => {
  const len = text.length;
  if (len === 0) {
    return { charCount: 0, tokenCount: 0, estimatedCost: 0, isOverLimit: false };
  }

  const chineseMatches = text.match(/[\u4e00-\u9fa5]/g);
  const chineseCount = chineseMatches ? chineseMatches.length : 0;
  const otherCount = len - chineseCount;

  const tokenCount = Math.ceil((chineseCount * 1.5) + (otherCount * 0.25)); 
  const estimatedCost = (tokenCount / 1000) * PRICE_PER_1K_TOKENS;

  return {
    charCount: len,
    tokenCount,
    estimatedCost,
    isOverLimit: tokenCount > 4096
  };
};

/**
 * Reconstructs the final prompt string from blocks and their values.
 */
export const generateFinalPrompt = (
  blocks: { templateId: string; values: Record<string, string> }[],
  templates: BlockTemplate[]
): string => {
  return blocks
    .map((block) => {
      const template = templates.find((t) => t.id === block.templateId);
      if (!template) return '';

      const segments = parseTemplate(template.content);
      return segments.map((segment) => {
        if (segment.startsWith('{{') && segment.endsWith('}}')) {
          const { key } = parseSlot(segment);
          return block.values[key] || ''; 
        }
        return segment;
      }).join('');
    })
    .join('\n\n');
};