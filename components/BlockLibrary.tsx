import React, { useState } from 'react';
import { BlockTemplate } from '../types';
import { CATEGORIES } from '../constants';
import * as Icons from 'lucide-react';
import { Plus, Trash2, Pencil, Search, GripVertical } from 'lucide-react';

interface BlockLibraryProps {
  blocks: BlockTemplate[];
  onAddBlock: (blockId: string) => void;
  onReorderBlock: (sourceId: string, targetId: string) => void;
  onOpenCreateModal: () => void;
  onEditBlock: (block: BlockTemplate) => void;
  onDeleteCustomBlock: (blockId: string) => void;
}

const BlockLibrary: React.FC<BlockLibraryProps> = ({ 
  blocks, 
  onAddBlock,
  onReorderBlock,
  onOpenCreateModal,
  onEditBlock,
  onDeleteCustomBlock
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter blocks based on search term
  const filteredBlocks = blocks.filter(block => 
    block.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, block: BlockTemplate) => {
    // We send a generic object that can be used by both the Canvas (to add) and the Library (to reorder)
    const payload = {
      blockId: block.id,
      categoryId: block.categoryId,
      source: 'LIBRARY_ITEM'
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string, targetCategoryId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Don't trigger canvas drop if we drop inside library
    
    const data = e.dataTransfer.getData('application/json');
    if (!data) return;
    
    try {
      const payload = JSON.parse(data);
      // Reorder logic:
      // 1. Must be a library item
      // 2. Must be different items
      // 3. For UI sanity, we restrict reordering to within the same category (optional, but keeps headers logic clean)
      if (payload.blockId && payload.blockId !== targetId && payload.categoryId === targetCategoryId) {
        onReorderBlock(payload.blockId, targetId);
      }
    } catch (err) {
      console.error('Reorder drop failed', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 border-r border-gray-800 w-full md:w-80 flex-shrink-0">
      <div className="p-4 border-b border-gray-800 space-y-3">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Icons.Library className="w-5 h-5 text-indigo-400" />
          组件库
        </h2>
        
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="搜索积木..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder-gray-600"
          />
        </div>

        <button 
          onClick={onOpenCreateModal}
          className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all active:scale-95 group"
        >
          <Plus className="w-4 h-4 text-indigo-400 group-hover:text-indigo-300" />
          新建自定义积木
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {CATEGORIES.map((category) => {
          // Filter blocks belonging to this category AND matching search
          const categoryBlocks = filteredBlocks.filter((b) => b.categoryId === category.id);
          
          // Hide category if no blocks match (unless it's 'custom' and we aren't searching)
          if (categoryBlocks.length === 0) return null;

          // Dynamic icon component
          const IconComponent = (Icons as any)[category.icon] || Icons.Box;

          return (
            <div key={category.id}>
              <div className="flex items-center gap-2 mb-3 sticky top-0 bg-gray-900 z-10 py-1">
                <span className={`w-2 h-2 rounded-full ${category.color}`}></span>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {category.name}
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {categoryBlocks.map((block) => (
                  <div 
                    key={block.id} 
                    className="relative group flex items-stretch rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-indigo-500/50 transition-all duration-200"
                    draggable
                    onDragStart={(e) => handleDragStart(e, block)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, block.id, category.id)}
                  >
                    {/* Drag Handle */}
                    <div className="flex items-center justify-center px-2 cursor-grab active:cursor-grabbing text-gray-600 hover:text-indigo-400 border-r border-gray-700/50">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <button
                      onClick={() => onAddBlock(block.id)}
                      className="flex-1 flex flex-col items-start p-3 text-left pr-10 outline-none"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <IconComponent className="w-4 h-4 text-gray-400 group-hover:text-indigo-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-200 group-hover:text-white truncate">
                          {block.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 w-full text-left">
                        {block.content.substring(0, 60).replace(/\{\{(.*?)\}\}/g, '[$1]')}...
                      </p>
                    </button>
                    
                    <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {/* Edit (Fork) Button - Available for ALL blocks */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditBlock(block);
                        }}
                        className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-gray-700/80 rounded backdrop-blur-sm"
                        title={block.isCustom ? "编辑积木" : "基于此预设新建积木"}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button - ONLY for custom blocks */}
                      {block.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`确定删除自定义积木 "${block.label}" 吗?`)) {
                              onDeleteCustomBlock(block.id);
                            }
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700/80 rounded backdrop-blur-sm"
                          title="删除自定义积木"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filteredBlocks.length === 0 && searchTerm && (
          <div className="text-center text-gray-500 text-sm mt-10">
            <p>未找到匹配的积木</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockLibrary;