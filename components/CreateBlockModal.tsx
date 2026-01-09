import React, { useState, useEffect } from 'react';
import { X, Save, HelpCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { BlockTemplate, Category } from '../types';
import { CATEGORIES } from '../constants';

interface CreateBlockModalProps {
  initialData?: BlockTemplate | null;
  onClose: () => void;
  onSave: (template: BlockTemplate) => void;
}

const CreateBlockModal: React.FC<CreateBlockModalProps> = ({ initialData, onClose, onSave }) => {
  const [label, setLabel] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('custom');

  // Pre-fill data if editing (or forking)
  useEffect(() => {
    if (initialData) {
      setLabel(initialData.isCustom ? initialData.label : `${initialData.label} (副本)`);
      setContent(initialData.content);
      // If the original category is 'custom', keep it, otherwise default to 'custom' to separate user blocks
      setCategoryId(initialData.isCustom ? initialData.categoryId : 'custom');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !content.trim()) return;

    const newBlock: BlockTemplate = {
      // Always generate a new ID to avoid conflict with built-ins or overwriting logic complexities
      id: initialData?.isCustom ? initialData.id : `custom_${uuidv4()}`,
      label,
      content,
      categoryId,
      isCustom: true,
      description: '用户自定义积木'
    };

    onSave(newBlock);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg shadow-2xl p-6 animate-slide-up flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {initialData ? '📝 编辑/复制积木' : '✨ 创建自定义积木'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col overflow-y-auto min-h-0">
          
          <div className="shrink-0">
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">积木名称</label>
            <input 
              type="text" 
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例如：Python 专家 / 小红书文案"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="shrink-0">
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase">分类</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    categoryId === cat.id 
                      ? `${cat.color} bg-opacity-20 border-${cat.color.replace('bg-', '')} text-white` 
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-1 shrink-0">
              <label className="block text-xs font-medium text-gray-400 uppercase">模版内容</label>
              <div className="group relative flex items-center gap-1 cursor-help">
                <HelpCircle className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">变量语法说明</span>
                <div className="absolute right-0 bottom-full mb-2 w-72 p-4 bg-gray-800 border border-gray-600 rounded-lg text-xs text-gray-300 shadow-xl hidden group-hover:block z-10 leading-relaxed">
                  <p className="mb-2"><strong className="text-indigo-400">1. 普通输入框：</strong><br/>{`{{变量名}}`} (例如 {`{{语言}}`})</p>
                  <p><strong className="text-emerald-400">2. 带选项的下拉框：</strong><br/>{`{{变量名|选项A|选项B}}`}<br/>(例如 {`{{语气|正式|幽默}}`})</p>
                </div>
              </div>
            </div>
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="例如：请用 {{language|Python|JS}} 编写代码..."
              className="w-full h-full min-h-[150px] bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm leading-relaxed resize-none"
            />
          </div>

          <div className="pt-2 flex gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              disabled={!label || !content}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium shadow-lg shadow-indigo-500/20 transition-all flex justify-center items-center gap-2"
            >
              <Save className="w-4 h-4" />
              保存积木
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateBlockModal;