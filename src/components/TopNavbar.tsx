import React, { useState } from 'react';
import { ActiveToolType, UserProfile, AppUser } from '../types/xstk';
import { Award, Flame, Database, LogIn, LogOut, User, ChevronDown, FileCode, Settings, Cloud } from 'lucide-react';

interface TopNavbarProps {
  activeTool: ActiveToolType;
  setActiveTool: (tool: ActiveToolType) => void;
  userProfile: UserProfile;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  onOpenDevDatabase: () => void;
  onOpenPromptHistory: () => void;
  onOpenGoogleDrive?: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenBugReport: () => void;
  activeWindowCount: number;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTool,
  setActiveTool,
  userProfile,
  currentUser,
  onOpenAuth,
  onOpenDevDatabase,
  onOpenPromptHistory,
  onOpenGoogleDrive,
  onLogout,
  onOpenSettings,
  onOpenBugReport,
  activeWindowCount,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="flex items-center justify-between gap-4 px-5 py-3 bg-slate-950/95 backdrop-blur-md border-b-2 border-cyan-500/30 sticky top-0 z-40 shadow-[0_4px_25px_rgba(0,0,0,0.7)] text-slate-100">
      {/* Zone 1: EDT Wordmark & Neon Badge */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setActiveTool('learning');
        }}
        className="text-lg font-black tracking-wider text-white whitespace-nowrap shrink-0 flex items-center gap-2.5 group"
      >
        <span className="p-1.5 px-2.5 bg-gradient-to-br from-cyan-400 via-teal-300 to-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.7)] group-hover:scale-105 transition-transform">
          EDT
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-black tracking-tight text-white drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
            EDT • XÁC SUẤT THỐNG KÊ
          </span>
          <span className="text-[10px] font-extrabold text-cyan-300 tracking-wide">
            Gia Sư & Vi Xử Lý Casio 580
          </span>
        </div>
      </a>

      {/* Zone 2: Navigation Links (High contrast white & cyan glow) */}
      <nav className="hidden xl:flex items-center gap-5 text-xs font-bold text-slate-200">
        <button
          onClick={() => setActiveTool('essay_generator')}
          className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${
            activeTool === 'essay_generator' ? 'text-cyan-300 font-black border-b-2 border-cyan-400 pb-0.5 shadow-[0_4px_12px_rgba(6,182,212,0.5)]' : ''
          }`}
        >
          📝 Đề Tự Luận & Soạn Thảo Word
        </button>

        <button
          onClick={() => setActiveTool('learning')}
          className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${
            activeTool === 'learning' ? 'text-cyan-300 font-black border-b-2 border-cyan-400 pb-0.5 shadow-[0_4px_12px_rgba(6,182,212,0.5)]' : ''
          }`}
        >
          Lý Thuyết 5 Bước
        </button>

        <button
          onClick={() => setActiveTool('casio_calc')}
          className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${
            activeTool === 'casio_calc' ? 'text-cyan-300 font-black border-b-2 border-cyan-400 pb-0.5 shadow-[0_4px_12px_rgba(6,182,212,0.5)]' : ''
          }`}
        >
          🧮 Máy Tính Casio
        </button>

        <button
          onClick={() => setActiveTool('math_processor')}
          className={`hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 ${
            activeTool === 'math_processor' ? 'text-emerald-300 font-black border-b-2 border-emerald-400 pb-0.5 shadow-[0_4px_12px_rgba(16,185,129,0.5)]' : ''
          }`}
        >
          ⚡ Vi Xử Lý Tích Phân
        </button>

        <button
          onClick={() => setActiveTool('mcq_generator')}
          className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${
            activeTool === 'mcq_generator' ? 'text-cyan-300 font-black border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Đề Trắc Nghiệm (Word/PDF)
        </button>

        <button
          onClick={() => setActiveTool('essay_generator')}
          className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${
            activeTool === 'essay_generator' ? 'text-cyan-300 font-black border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Đề Tự Luận
        </button>

        <button
          onClick={() => setActiveTool('viva_exam')}
          className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${
            activeTool === 'viva_exam' ? 'text-cyan-300 font-black border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Giải Bài Tập (4 Bước Pólya)
        </button>

        <button
          onClick={() => setActiveTool('mindmap')}
          className={`hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0 ${
            activeTool === 'mindmap' ? 'text-cyan-300 font-black border-b-2 border-cyan-400 pb-0.5' : ''
          }`}
        >
          Sơ Đồ Tư Duy
        </button>
      </nav>

      {/* Zone 3: Developer Vault & User Auth */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Settings & AI Config Button */}
        <button
          onClick={onOpenSettings}
          className="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300"
          title="Cài đặt hệ thống & Mô hình AI"
        >
          <Settings className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Cài Đặt</span>
        </button>

        {/* Dedicated Developer Database Vault Button - ONLY SHOWN WHEN AUTHENTICATED AS DEVELOPER */}
        {currentUser?.role === 'nha_phat_trien' && (
          <button
            onClick={onOpenDevDatabase}
            className="px-3 py-1.5 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/50 hover:border-purple-400 text-purple-200 hover:text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(168,85,247,0.35)] transition-all cursor-pointer"
            title="Mở kho dữ liệu người dùng (Quyền Nhà Phát Triển)"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Kho Dữ Liệu Dev</span>
          </button>
        )}

        {/* Prompt Blueprint & Export PDF Button */}
        <button
          onClick={onOpenPromptHistory}
          className="px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 hover:text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
          title="Xem toàn bộ prompt hệ thống và xuất file PDF"
        >
          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Tổng Hợp Prompt (PDF)</span>
        </button>

        {/* Google Drive Workspace Sync Button */}
        {onOpenGoogleDrive && (
          <button
            onClick={onOpenGoogleDrive}
            className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/50 hover:border-blue-400 text-blue-200 hover:text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.35)] transition-all cursor-pointer"
            title="Đồng bộ tài liệu và đề thi lên Google Drive"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Google Drive</span>
          </button>
        )}


        {/* Streak & GPA Badges */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-cyan-500/30 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-xs">
          <div className="flex items-center gap-1 text-amber-300">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>{currentUser ? currentUser.streakDays : userProfile.streakDays} ngày</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1 text-cyan-300">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>GPA {currentUser ? currentUser.gpa : userProfile.gpa}</span>
          </div>
        </div>

        {/* Auth: Logged In vs Log In Button */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 bg-slate-900 hover:bg-slate-800 border-2 border-cyan-400/50 hover:border-cyan-400 rounded-2xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              {currentUser.avatarUrl && (currentUser.avatarUrl.startsWith('http') || currentUser.avatarUrl.startsWith('data:')) ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-full object-cover border border-cyan-400"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-sm">
                  {currentUser.avatarUrl || '👨‍🎓'}
                </div>
              )}
              <div className="flex flex-col text-left hidden sm:block">
                <span className="text-xs font-bold text-white leading-tight block">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-cyan-300 font-semibold leading-tight block">
                  {currentUser.role === 'nha_phat_trien'
                    ? '💻 Developer'
                    : currentUser.role === 'giang_vien'
                    ? '👨‍🏫 Giảng Viên'
                    : '🎓 Sinh Viên'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border-2 border-cyan-500/40 rounded-2xl shadow-2xl p-2 text-xs space-y-1 z-50 animate-fade-in text-white">
                <div className="p-2 border-b border-slate-800">
                  <div className="font-bold text-white text-xs">{currentUser.fullName}</div>
                  <div className="text-[11px] text-cyan-300 font-mono truncate">{currentUser.email}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{currentUser.university}</div>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setActiveTool('profile');
                  }}
                  className="w-full text-left p-2 hover:bg-slate-800 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white font-semibold transition-colors"
                >
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Hồ Sơ & Linh Vật</span>
                </button>

                {currentUser?.role === 'nha_phat_trien' && (
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenDevDatabase();
                    }}
                    className="w-full text-left p-2 hover:bg-purple-950/60 rounded-xl flex items-center gap-2 text-purple-300 hover:text-white font-bold transition-colors cursor-pointer"
                  >
                    <Database className="w-4 h-4 text-purple-400" />
                    <span>Kho Dữ Liệu Nhà Phát Triển</span>
                  </button>
                )}


                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left p-2 hover:bg-rose-950/60 rounded-xl flex items-center gap-2 text-rose-400 hover:text-rose-200 font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng Xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-xl shadow-[0_0_18px_rgba(6,182,212,0.5)] transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:scale-105"
          >
            <LogIn className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>ĐĂNG NHẬP</span>
          </button>
        )}
      </div>
    </header>
  );
};
