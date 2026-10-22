import React from 'react';
import { ActiveToolType } from '../types/xstk';
import {
  BookOpen,
  Image as ImageIcon,
  Mic,
  FileText,
  CheckSquare,
  HelpCircle,
  BarChart3,
  Map,
  MessageSquare,
  User,
  Calculator,
  Bug,
  Settings,
  PenTool,
} from 'lucide-react';

interface BottomPageSwitcherProps {
  activeTool: ActiveToolType;
  onSelectTool: (tool: ActiveToolType) => void;
  onOpenSettings: () => void;
  onOpenBugReport: () => void;
}

export const BottomPageSwitcher: React.FC<BottomPageSwitcherProps> = ({
  activeTool,
  onSelectTool,
  onOpenSettings,
  onOpenBugReport,
}) => {
  const PRIMARY_TOOLS: Array<{ id: ActiveToolType; label: string; icon: React.ReactNode }> = [
    { id: 'essay_generator', label: 'Đề Tự Luận (Soạn Thảo Word)', icon: <FileText className="w-4 h-4 text-cyan-400" /> },
    { id: 'learning', label: 'Lý Thuyết 5 Bước', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
    { id: 'casio_calc', label: 'Máy Tính Casio', icon: <Calculator className="w-4 h-4 text-cyan-300" /> },
    { id: 'math_processor', label: 'Vi Xử Lý Tích Phân', icon: <Calculator className="w-4 h-4 text-emerald-400" /> },
    { id: 'mcq_generator', label: 'Đề Trắc Nghiệm', icon: <CheckSquare className="w-4 h-4 text-teal-400" /> },
    { id: 'viva_exam', label: 'Giải Bài Tập & Vấn Đáp', icon: <HelpCircle className="w-4 h-4 text-purple-400" /> },
    { id: 'image_grading', label: 'Chấm iPad/Ảnh', icon: <ImageIcon className="w-4 h-4 text-pink-400" /> },
    { id: 'mindmap', label: 'Sơ Đồ Tư Duy', icon: <Map className="w-4 h-4 text-cyan-400" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-md border-t border-cyan-500/20 py-2 px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.6)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar flex-1 justify-center">
          {PRIMARY_TOOLS.map((item) => {
            const isActive = activeTool === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTool(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)] scale-105 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                {item.icon}
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Settings & Bug Report */}
        <div className="flex items-center gap-1 shrink-0 pl-2 border-l border-slate-800">
          <button
            onClick={onOpenBugReport}
            className="p-2 text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
            title="Báo lỗi & Góp ý nhà phát hành"
          >
            <Bug className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors"
            title="Cài đặt Âm thanh & Giao diện"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
