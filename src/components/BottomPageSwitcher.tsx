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
  Sparkles,
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
    { id: 'learning', label: 'Lý Thuyết 5 Bước', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
    { id: 'image_grading', label: '⚡ Gia Sư AI 1-1', icon: <Sparkles className="w-4 h-4 text-cyan-300" /> },
    { id: 'charts', label: '📊 Phân Tích Dữ Liệu', icon: <BarChart3 className="w-4 h-4 text-emerald-400" /> },
    { id: 'casio_calc', label: 'Máy Tính Casio', icon: <Calculator className="w-4 h-4 text-cyan-300" /> },
    { id: 'mcq_generator', label: 'Đề Thi Trắc Nghiệm', icon: <CheckSquare className="w-4 h-4 text-teal-400" /> },
    { id: 'essay_generator', label: 'Đề Thi Tự Luận', icon: <FileText className="w-4 h-4 text-blue-400" /> },
    { id: 'mindmap', label: 'Bản Đồ Tư Duy', icon: <Map className="w-4 h-4 text-cyan-400" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-cyan-500/20 py-2.5 px-4 shadow-[0_-4px_25px_rgba(0,0,0,0.6)] w-full max-w-full overflow-x-hidden box-border">
      <div className="max-w-[1720px] w-full mx-auto flex items-center justify-between gap-2">
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
