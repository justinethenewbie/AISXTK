import React from 'react';
import { ActiveToolType } from '../types/xstk';
import { Layers, Plus, X, Calculator, Image, Mic, FileText, CheckSquare, HelpCircle, BarChart3, Map, MessageSquare, User, Bug, Settings, Database } from 'lucide-react';

interface MultitaskingBarProps {
  activeTools: ActiveToolType[];
  focusedTool: ActiveToolType;
  onSelectTool: (tool: ActiveToolType) => void;
  onAddTool: (tool: ActiveToolType) => void;
  onRemoveTool: (tool: ActiveToolType) => void;
  onOpenSettings: () => void;
  onOpenBugReport: () => void;
}

export const MultitaskingBar: React.FC<MultitaskingBarProps> = ({
  activeTools,
  focusedTool,
  onSelectTool,
  onAddTool,
  onRemoveTool,
  onOpenSettings,
  onOpenBugReport,
}) => {
  const TOOL_CONFIG: Record<ActiveToolType, { name: string; icon: React.ReactNode }> = {
    learning: { name: '📖 Lý thuyết 5 bước', icon: <FileText className="w-3.5 h-3.5" /> },
    image_grading: { name: '📝 Chấm Bảng iPad', icon: <Image className="w-3.5 h-3.5" /> },
    voice_chat: { name: '🗣️ Giọng nói AI', icon: <Mic className="w-3.5 h-3.5" /> },
    essay_generator: { name: '✍️ Tạo Tự luận', icon: <FileText className="w-3.5 h-3.5" /> },
    mcq_generator: { name: '✅ Tạo Trắc nghiệm', icon: <CheckSquare className="w-3.5 h-3.5" /> },
    viva_exam: { name: '✍️ Giải Bài Tập (Pólya)', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    mistake_stats: { name: '📊 Thống kê Lỗi sai', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    mindmap: { name: '🗺️ Bản đồ tư duy', icon: <Map className="w-3.5 h-3.5" /> },
    forum: { name: '💬 Diễn đàn XSTK', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    profile: { name: '👤 Hồ sơ & Linh vật', icon: <User className="w-3.5 h-3.5" /> },
    charts: { name: '📈 Mô hình Biểu đồ', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    casio_calc: { name: '🧮 Máy tính Casio', icon: <Calculator className="w-3.5 h-3.5" /> },
    math_processor: { name: '⚡ Bộ Vi Xử Lý Tích Phân', icon: <Calculator className="w-3.5 h-3.5" /> },
    wysiwyg_math: { name: '📐 Soạn Thảo Word & Equation', icon: <FileText className="w-3.5 h-3.5 text-cyan-400" /> },
    developer_db: { name: '💾 Kho Dữ Liệu Dev', icon: <Database className="w-3.5 h-3.5 text-purple-400" /> },
  };

  const ALL_ADDABLE_TOOLS: ActiveToolType[] = [
    'learning',
    'image_grading',
    'voice_chat',
    'essay_generator',
    'mcq_generator',
    'viva_exam',
    'mistake_stats',
    'mindmap',
    'forum',
    'charts',
    'casio_calc',
    'math_processor',
    'developer_db',
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[92vw] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-300 dark:border-slate-700 rounded-2xl p-2 shadow-2xl flex items-center justify-between gap-2">
      {/* Active Multitasking Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 px-2 flex items-center gap-1 shrink-0">
          <Layers className="w-3.5 h-3.5" />
          <span>Multitask ({activeTools.length}/3):</span>
        </span>

        {activeTools.map((tool) => {
          const config = TOOL_CONFIG[tool];
          const isFocused = tool === focusedTool;

          return (
            <div
              key={tool}
              onClick={() => onSelectTool(tool)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl cursor-pointer text-xs font-semibold whitespace-nowrap transition-all ${
                isFocused
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              <span>{config?.name || tool}</span>
              {activeTools.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveTool(tool);
                  }}
                  className="hover:bg-black/20 p-0.5 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Add Tool Quick Selector if under 3 */}
        {activeTools.length < 3 && (
          <div className="relative group">
            <button className="p-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs flex items-center gap-1 font-medium transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mở thêm AI</span>
            </button>

            {/* Dropdown Menu */}
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 hidden group-hover:block z-50 text-xs space-y-0.5 max-h-56 overflow-y-auto">
              {ALL_ADDABLE_TOOLS.filter((t) => !activeTools.includes(t)).map((t) => (
                <button
                  key={t}
                  onClick={() => onAddTool(t)}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center gap-2"
                >
                  {TOOL_CONFIG[t]?.icon}
                  <span>{TOOL_CONFIG[t]?.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Settings & Bug Report Actions */}
      <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-slate-200 dark:border-slate-700">
        <button
          onClick={onOpenBugReport}
          className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-xs flex items-center gap-1"
          title="Báo lỗi & Góp ý nhà phát hành"
        >
          <Bug className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-xl transition-colors"
          title="Cài đặt Âm lượng & Giao diện"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
