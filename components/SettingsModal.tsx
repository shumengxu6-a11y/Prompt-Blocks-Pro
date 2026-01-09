import React, { useRef, useState } from 'react';
import { X, Download, Upload, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onClearAll: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onExport, onImport, onClearAll }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await onImport(file);
      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch (err) {
      setImportStatus('error');
      setErrorMessage('文件格式错误或内容损坏');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl p-6 animate-slide-up">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            ⚙️ 数据管理
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          
          {/* Export Section */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <Download className="w-4 h-4 text-indigo-400" />
              导出数据
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              将所有自定义积木和历史记录导出为 JSON 文件进行备份。
            </p>
            <button 
              onClick={onExport}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 transition-colors font-medium"
            >
              下载备份 (.json)
            </button>
          </div>

          {/* Import Section */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              导入数据
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              恢复之前的备份。注意：这将合并现有的自定义积木。
            </p>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={handleFileChange}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-sm text-gray-200 transition-colors font-medium mb-2"
            >
              选择文件...
            </button>
            
            {importStatus === 'success' && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in">
                <CheckCircle className="w-3 h-3" /> 导入成功！
              </p>
            )}
            {importStatus === 'error' && (
              <p className="text-xs text-red-400 flex items-center gap-1 animate-fade-in">
                <AlertTriangle className="w-3 h-3" /> {errorMessage}
              </p>
            )}
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-800 pt-4 mt-2">
             <button 
               onClick={onClearAll}
               className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 py-2 rounded-lg text-sm transition-colors"
             >
               <Trash2 className="w-4 h-4" />
               清空所有本地数据
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;