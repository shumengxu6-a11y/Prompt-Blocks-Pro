import React, { useState, useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { v4 as uuidv4 } from 'uuid';
import { Copy, Trash2, History, Wand2, Terminal, X, Settings } from 'lucide-react';

import BlockLibrary from './components/BlockLibrary';
import SmartBlock from './components/SmartBlock';
import HistoryChart from './components/HistoryChart';
import CreateBlockModal from './components/CreateBlockModal';
import SettingsModal from './components/SettingsModal';
import { CATEGORIES, INITIAL_BLOCKS } from './constants';
import { BlockInstance, BlockTemplate, HistoryItem } from './types';
import { calculateTokenStats, generateFinalPrompt } from './utils/promptUtils';

// Helper for local storage
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
};

const App: React.FC = () => {
  // State: Canvas Blocks
  const [blocks, setBlocks] = useLocalStorage<BlockInstance[]>('prompt-blocks-v2', []);
  
  // State: History
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('prompt-history', []);
  
  // State: Custom User Templates
  const [customTemplates, setCustomTemplates] = useLocalStorage<BlockTemplate[]>('prompt-custom-templates', []);

  // State: Library Sort Order (Array of Block IDs)
  const [librarySortOrder, setLibrarySortOrder] = useLocalStorage<string[]>('prompt-library-sort-order', []);

  // UI State
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BlockTemplate | null>(null);
  
  // Drag State for Visuals
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Drag Reference (For Logic)
  const dragItem = useRef<number | null>(null);

  // Combine built-in and custom templates AND apply sort order
  const allTemplates = useMemo(() => {
    const combined = [...customTemplates, ...INITIAL_BLOCKS];
    
    // If no custom sort order exists, return default
    if (librarySortOrder.length === 0) return combined;

    // Sort based on the saved ID list
    return combined.sort((a, b) => {
      const indexA = librarySortOrder.indexOf(a.id);
      const indexB = librarySortOrder.indexOf(b.id);
      
      // If both items have a sort order, compare indices
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      
      // If only one has a sort order, prioritize the one that does (or push new items to top/bottom)
      // Here we push unknown items to the end
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      
      return 0;
    });
  }, [customTemplates, librarySortOrder]);

  // Derived state: Final text
  const finalPrompt = useMemo(() => 
    generateFinalPrompt(blocks, allTemplates), 
    [blocks, allTemplates]
  );

  // Derived state: Stats
  const stats = useMemo(() => 
    calculateTokenStats(finalPrompt), 
    [finalPrompt]
  );

  // Add a new block instance
  const handleAddBlock = (templateId: string) => {
    const newInstance: BlockInstance = {
      instanceId: uuidv4(),
      templateId,
      values: {},
    };
    setBlocks((prev) => [...prev, newInstance]);
    setLastAddedId(newInstance.instanceId);
    
    // Tiny haptic feedback vibe
    if (navigator.vibrate) navigator.vibrate(10);
  };

  // Reorder Library Items
  const handleReorderLibrary = (sourceId: string, targetId: string) => {
    setLibrarySortOrder((prevOrder) => {
        // Ensure we have a complete list of IDs to start with if prevOrder is empty or partial
        let currentOrder = prevOrder.length > 0 
          ? [...prevOrder] 
          : [...customTemplates, ...INITIAL_BLOCKS].map(b => b.id);
        
        // Ensure potentially missing IDs (newly created ones) are in the list before moving
        const allIds = [...customTemplates, ...INITIAL_BLOCKS].map(b => b.id);
        allIds.forEach(id => {
            if (!currentOrder.includes(id)) currentOrder.push(id);
        });

        const sourceIndex = currentOrder.indexOf(sourceId);
        const targetIndex = currentOrder.indexOf(targetId);

        if (sourceIndex === -1 || targetIndex === -1) return prevOrder;

        // Move item
        currentOrder.splice(sourceIndex, 1);
        currentOrder.splice(targetIndex, 0, sourceId);

        return currentOrder;
    });
  };

  // Move block up or down (Buttons)
  const handleMoveBlock = (instanceId: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
        const index = prev.findIndex(b => b.instanceId === instanceId);
        if (index === -1) return prev;
        
        // Boundary checks
        if (direction === 'up' && index === 0) return prev;
        if (direction === 'down' && index === prev.length - 1) return prev;

        const newBlocks = [...prev];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        
        // Swap
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        
        return newBlocks;
    });
  };

  // --- Drag and Drop Handlers (Sorting Canvas Blocks) ---
  const handleDragStart = (index: number, id: string) => {
    dragItem.current = index;
    setDraggingId(id);
  };

  const handleDragEnter = (index: number) => {
    if (dragItem.current === null) return;
    if (dragItem.current === index) return;

    // Real-time reorder
    setBlocks((prev) => {
      const newBlocks = [...prev];
      const draggedItemContent = newBlocks[dragItem.current!];
      
      // Remove from old position
      newBlocks.splice(dragItem.current!, 1);
      // Insert at new position
      newBlocks.splice(index, 0, draggedItemContent);
      
      return newBlocks;
    });
    
    // Update ref to track new position
    dragItem.current = index;
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    setDraggingId(null);
  };

  // --- Drop Zone for New Blocks (From Library to Canvas) ---
  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;

    try {
      const payload = JSON.parse(data);
      // Support generalized payload, checking for blockId
      if (payload.blockId) {
        handleAddBlock(payload.blockId);
      }
    } catch (err) {
      console.error('Failed to parse drop data', err);
    }
  };


  // Open Modal for Editing/Forking
  const handleEditBlock = (template: BlockTemplate) => {
    setEditingTemplate(template);
    setIsCreateModalOpen(true);
  };

  // Open Modal for Creating New
  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setIsCreateModalOpen(true);
  };

  // Create or Update Custom Template
  const handleSaveCustomTemplate = (newTemplate: BlockTemplate) => {
    setCustomTemplates(prev => {
      // Check if updating an existing custom template (by ID)
      const exists = prev.some(t => t.id === newTemplate.id);
      if (exists) {
        return prev.map(t => t.id === newTemplate.id ? newTemplate : t);
      }
      return [newTemplate, ...prev];
    });
    setEditingTemplate(null);
  };

  // Delete Custom Template
  const handleDeleteCustomTemplate = (templateId: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    // Also remove instances of this block from canvas to prevent errors
    setBlocks(prev => prev.filter(b => b.templateId !== templateId));
  };

  // Remove a block
  const handleRemoveBlock = (instanceId: string) => {
    setBlocks((prev) => prev.filter((b) => b.instanceId !== instanceId));
  };

  // Update a specific slot value
  const handleUpdateValue = (instanceId: string, key: string, value: string) => {
    setBlocks((prev) => 
      prev.map((b) => {
        if (b.instanceId === instanceId) {
          return { ...b, values: { ...b.values, [key]: value } };
        }
        return b;
      })
    );
  };

  // Handle Copy & Save
  const handleCopy = async () => {
    if (!finalPrompt.trim()) return;

    try {
      await navigator.clipboard.writeText(finalPrompt);
      
      // Vibe: Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899']
      });

      // Save to history
      const newHistoryItem: HistoryItem = {
        id: uuidv4(),
        content: finalPrompt,
        tokenCount: stats.tokenCount,
        cost: stats.estimatedCost,
        timestamp: Date.now(),
        blocksUsed: blocks.length
      };
      
      // Keep last 20 items (LIFO logic in rendering, usually unshift for array)
      setHistory((prev) => [newHistoryItem, ...prev].slice(0, 20));

    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleClearCanvas = () => {
    if (window.confirm('确定清空所有积木吗？')) {
      setBlocks([]);
    }
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    navigator.clipboard.writeText(item.content);
    alert('提示词已复制到剪贴板！');
  };

  // --- Data Management Logic ---

  const handleExportData = () => {
    const data = {
      version: 1,
      timestamp: Date.now(),
      customTemplates,
      history,
      librarySortOrder 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-blocks-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (data.customTemplates && Array.isArray(data.customTemplates)) {
            // Merge custom templates (avoid duplicates by ID)
            setCustomTemplates(prev => {
              const currentIds = new Set(prev.map(t => t.id));
              const newTemplates = data.customTemplates.filter((t: BlockTemplate) => !currentIds.has(t.id));
              return [...newTemplates, ...prev];
            });
          }
          
          if (data.history && Array.isArray(data.history)) {
             setHistory(prev => {
               // Simple merge, keeping most recent
               return [...data.history, ...prev].slice(0, 50); 
             });
          }

          if (data.librarySortOrder && Array.isArray(data.librarySortOrder)) {
             setLibrarySortOrder(data.librarySortOrder);
          }

          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const handleClearAllData = () => {
    if (window.confirm('警告：此操作将永久删除所有自定义积木和历史记录！是否继续？')) {
      setCustomTemplates([]);
      setHistory([]);
      setBlocks([]);
      setLibrarySortOrder([]);
      setIsSettingsOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 text-gray-100 font-sans overflow-hidden">
      
      {/* 1. Sidebar Library */}
      <BlockLibrary 
        blocks={allTemplates} 
        onAddBlock={handleAddBlock} 
        onReorderBlock={handleReorderLibrary}
        onOpenCreateModal={handleOpenCreateModal}
        onEditBlock={handleEditBlock}
        onDeleteCustomBlock={handleDeleteCustomTemplate}
      />

      {/* 2. Main Canvas */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Navbar */}
        <header className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Terminal className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Prompt Blocks <span className="text-indigo-400 font-mono text-sm px-2 py-0.5 bg-indigo-900/30 rounded-full border border-indigo-500/20">PRO</span></h1>
          </div>

          <div className="flex items-center gap-2">
             <button 
              onClick={handleClearCanvas}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors"
              title="清空画布"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded-lg transition-colors"
              title="设置与数据"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors ${showHistory ? 'text-indigo-400 bg-indigo-900/20' : 'text-gray-400 hover:text-indigo-400 hover:bg-gray-800'}`}
              title="历史记录"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Canvas Area (Drop Zone) */}
        <div 
          className="flex-1 overflow-y-auto p-6 scroll-smooth"
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
        >
          <div className="max-w-4xl mx-auto min-h-[500px] pb-32">
            
            {blocks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-600 space-y-4 border-2 border-dashed border-gray-800 rounded-2xl bg-gray-900/30 pointer-events-none">
                <Wand2 className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-lg font-medium">画布为空</p>
                <p className="text-sm">从左侧拖拽或点击积木，或创建自定义积木开始创作。</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((instance, index) => {
                  const template = allTemplates.find((t) => t.id === instance.templateId);
                  const category = CATEGORIES.find((c) => c.id === template?.categoryId);
                  if (!template) return null;

                  return (
                    <SmartBlock
                      key={instance.instanceId}
                      instance={instance}
                      template={template}
                      category={category}
                      onUpdateValue={handleUpdateValue}
                      onRemove={handleRemoveBlock}
                      onMove={handleMoveBlock}
                      
                      // Drag props
                      index={index}
                      onDragStart={handleDragStart}
                      onDragEnter={handleDragEnter}
                      onDragEnd={handleDragEnd}
                      isDragging={draggingId === instance.instanceId}

                      isNew={instance.instanceId === lastAddedId}
                      isFirst={index === 0}
                      isLast={index === blocks.length - 1}
                    />
                  );
                })}
              </div>
            )}
            
          </div>
        </div>

        {/* Bottom Status Bar & Action */}
        <div className="border-t border-gray-800 bg-gray-900/90 backdrop-blur p-4 shrink-0 absolute bottom-0 w-full z-20">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Stats */}
            <div className="flex items-center gap-6 text-sm font-mono">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs uppercase">预估成本</span>
                <span className="text-emerald-400 font-bold">${stats.estimatedCost.toFixed(5)}</span>
              </div>
              <div className="h-8 w-px bg-gray-800" />
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs uppercase">Token数</span>
                <span className={`${stats.isOverLimit ? 'text-red-500 animate-pulse' : 'text-indigo-400'} font-bold`}>
                  {stats.tokenCount}
                </span>
              </div>
              <div className="h-8 w-px bg-gray-800" />
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs uppercase">字符数</span>
                <span className="text-gray-300">{stats.charCount}</span>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleCopy}
              disabled={blocks.length === 0}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Copy className="w-5 h-5" />
              <span>复制到剪贴板</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. History Drawer (Right) */}
      {showHistory && (
        <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full absolute right-0 z-30 shadow-2xl animate-slide-in-right">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="font-bold text-gray-100">历史记录</h2>
            <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <HistoryChart history={history} />
            
            <div className="space-y-3 mt-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">最近提示词</h3>
                {history.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-500 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                            {item.tokenCount} tok
                        </span>
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-3 mb-2 font-mono opacity-80">
                        {item.content}
                    </p>
                    <button 
                        onClick={() => handleRestoreHistory(item)}
                        className="text-xs w-full py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-center transition-colors text-indigo-300"
                    >
                        复制文本
                    </button>
                </div>
                ))}
                {history.length === 0 && (
                    <p className="text-center text-gray-600 text-sm py-4">暂无记录。</p>
                )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Custom Block Modal (Create or Edit) */}
      {isCreateModalOpen && (
        <CreateBlockModal 
          initialData={editingTemplate}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingTemplate(null);
          }} 
          onSave={handleSaveCustomTemplate} 
        />
      )}

      {/* 5. Settings Modal (Import/Export) */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          onExport={handleExportData}
          onImport={handleImportData}
          onClearAll={handleClearAllData}
        />
      )}
    </div>
  );
};

export default App;