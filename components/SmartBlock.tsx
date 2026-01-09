import React, { useEffect, useRef, useState } from 'react';
import { BlockInstance, BlockTemplate, Category } from '../types';
import { parseTemplate, parseSlot } from '../utils/promptUtils';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface SmartBlockProps {
  instance: BlockInstance;
  template: BlockTemplate;
  category?: Category;
  onUpdateValue: (instanceId: string, key: string, value: string) => void;
  onRemove: (instanceId: string) => void;
  onMove: (instanceId: string, direction: 'up' | 'down') => void;
  
  // Drag & Drop Props
  index: number;
  onDragStart: (index: number, id: string) => void;
  onDragEnter: (index: number) => void;
  onDragEnd: () => void;
  isDragging?: boolean;

  isNew?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const SmartBlock: React.FC<SmartBlockProps> = ({
  instance,
  template,
  category,
  onUpdateValue,
  onRemove,
  onMove,
  index,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  isNew,
  isFirst,
  isLast
}) => {
  const segments = parseTemplate(template.content);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus logic for new blocks
  useEffect(() => {
    if (isNew && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [isNew]);

  // Helper to determine if a segment is a variable
  const isVariable = (segment: string) => segment.startsWith('{{') && segment.endsWith('}}');
  
  // Track inputs to assign ref to the first one found
  let inputCount = 0;

  return (
    <div 
      draggable={true}
      onDragStart={(e) => {
        onDragStart(index, instance.instanceId);
        e.dataTransfer.effectAllowed = "move";
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        onDragEnter(index);
      }}
      onDragOver={(e) => e.preventDefault()} // Necessary to allow dropping
      onDragEnd={onDragEnd}
      className={`relative group animate-slide-up rounded-xl border bg-gray-800/60 shadow-lg backdrop-blur-sm overflow-hidden transition-all duration-200 
        ${isDragging 
            ? 'opacity-30 border-dashed border-indigo-500/50 scale-[0.98]' 
            : 'border-gray-700 hover:border-gray-600 hover:shadow-xl'
        }
      `}
    >
      {/* Header Line */}
      <div className={`h-1 w-full ${category?.color || 'bg-gray-600'} cursor-grab active:cursor-grabbing`} />
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-200 select-none cursor-grab active:cursor-grabbing">
              {template.label}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
             {/* Manual Reorder Buttons (Keep for Accessibility) */}
             <div className="flex flex-col mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => onMove(instance.instanceId, 'up')}
                  disabled={isFirst}
                  className="p-0.5 hover:text-indigo-400 text-gray-500 disabled:opacity-20 disabled:hover:text-gray-500 transition-colors"
                  title="上移"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onMove(instance.instanceId, 'down')}
                  disabled={isLast}
                  className="p-0.5 hover:text-indigo-400 text-gray-500 disabled:opacity-20 disabled:hover:text-gray-500 transition-colors"
                  title="下移"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
             </div>

            <button 
              onClick={() => onRemove(instance.instanceId)}
              className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-900/20"
              title="移除积木"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Flow */}
        <div className="text-gray-300 text-sm leading-relaxed font-mono whitespace-pre-wrap pl-1">
          {segments.map((segment, idx) => {
            if (isVariable(segment)) {
              const { key, options } = parseSlot(segment);
              const isFirst = inputCount === 0;
              inputCount++;
              
              const listId = `list-${instance.instanceId}-${key}-${idx}`;
              const currentValue = instance.values[key] || '';
              const valueLength = currentValue.length;
              const hasOptions = options.length > 0;
              
              // Improved width calculation and spacing
              const widthClass = valueLength > 25 ? 'w-full block my-1' : 'w-auto inline-block mx-1 align-middle';

              return (
                <span key={listId} className={widthClass}>
                  <input
                    ref={isFirst ? firstInputRef : null}
                    type="text"
                    list={hasOptions ? listId : undefined}
                    value={currentValue}
                    onChange={(e) => onUpdateValue(instance.instanceId, key, e.target.value)}
                    placeholder={hasOptions ? `选择或输入 ${key}` : key}
                    className={`
                      bg-gray-900/80 border rounded px-2 py-1 text-indigo-300 
                      placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 
                      transition-all min-w-[120px] shadow-sm
                      ${hasOptions ? 'border-indigo-500/50' : 'border-indigo-500/30 focus:border-transparent'}
                      ${valueLength > 50 ? 'w-full' : ''}
                    `}
                  />
                  {hasOptions && (
                    <datalist id={listId}>
                      {options.map((opt) => (
                        <option key={opt} value={opt} />
                      ))}
                    </datalist>
                  )}
                </span>
              );
            }
            // Render static text
            return <span key={idx} className="opacity-90">{segment}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

export default SmartBlock;