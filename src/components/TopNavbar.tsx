import React, { useState, useRef, useEffect } from 'react';
import { ActiveToolType, UserProfile, AppUser } from '../types/xstk';
import {
  Award,
  Flame,
  Database,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  FileCode,
  Settings,
  Cloud,
  Wrench,
  Sparkles,
  Calculator,
  BookOpen,
  CheckSquare,
  FileText,
  Map,
  BarChart3,
  MessageSquare,
  Bug,
  LayoutGrid,
} from 'lucide-react';
import { HubEdtLogo } from './HubEdtLogo';
import { getLocalDateString } from '../utils/streakManager';

interface TopNavbarProps {
  activeTool: ActiveToolType;
  setActiveTool: (tool: ActiveToolType) => void;
  userProfile: UserProfile;
  currentUser: AppUser | null;
  onOpenAuth: () => void;
  onOpenDevDatabase: () => void;
  onOpenPromptHistory: () => void;
  onOpenGoogleDrive?: () => void;
  onOpenCheatSheet?: () => void;
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
  onOpenCheatSheet,
  onLogout,
  onOpenSettings,
  onOpenBugReport,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isUtilitiesMenuOpen, setIsUtilitiesMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
        setIsToolsMenuOpen(false);
        setIsUtilitiesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      ref={headerRef}
      className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-2 sm:py-2.5 bg-slate-950/95 backdrop-blur-md border-b-2 border-cyan-500/30 sticky top-0 z-40 shadow-[0_4px_25px_rgba(0,0,0,0.7)] text-slate-100 w-full max-w-full overflow-x-clip box-border"
    >
      {/* Zone 1: Đại học Ngân hàng TP.HCM (HUB) Logo - Co giãn thông minh không đè chữ */}
      <div className="shrink-0 min-w-max">
        <HubEdtLogo size="md" onClick={() => setActiveTool('learning')} />
      </div>

      {/* Zone 2: Gọn gàng Tính Năng Trọng Tâm & Dropdown Danh Mục (Vừa vặn trên mọi độ phân giải) */}
      <nav className="hidden lg:flex items-center gap-1.5 2xl:gap-2 text-xs font-bold text-slate-200">
        <button
          onClick={() => {
            setActiveTool('image_grading');
            setIsToolsMenuOpen(false);
          }}
          className={`hidden 2xl:flex px-3 py-1.5 rounded-xl transition-all whitespace-nowrap items-center gap-1.5 cursor-pointer ${
            activeTool === 'image_grading'
              ? 'bg-cyan-500/20 text-cyan-300 font-black border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'hover:text-cyan-300 hover:bg-slate-900 text-slate-300 border border-transparent'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>⚡ Gia Sư AI 1-1</span>
        </button>

        <button
          onClick={() => {
            setActiveTool('casio_calc');
            setIsToolsMenuOpen(false);
          }}
          className={`hidden 2xl:flex px-3 py-1.5 rounded-xl transition-all whitespace-nowrap items-center gap-1.5 cursor-pointer ${
            activeTool === 'casio_calc'
              ? 'bg-cyan-500/20 text-cyan-300 font-black border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'hover:text-cyan-300 hover:bg-slate-900 text-slate-300 border border-transparent'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-cyan-400" />
          <span>🧮 Máy Tính Casio</span>
        </button>

        {/* Feature Dropdown: Luôn hiện trên laptop (lg) và desktop, gom tất cả 9 tính năng */}
        <div className="relative">
          <button
            onClick={() => {
              setIsToolsMenuOpen(!isToolsMenuOpen);
              setIsUtilitiesMenuOpen(false);
              setIsUserMenuOpen(false);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 border cursor-pointer ${
              isToolsMenuOpen || (activeTool !== 'image_grading' && activeTool !== 'casio_calc')
                ? 'bg-slate-900 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                : 'hover:text-white hover:bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tất Cả Tính Năng</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isToolsMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isToolsMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-slate-900/98 border-2 border-cyan-500/40 rounded-2xl shadow-2xl p-2.5 text-xs space-y-2 z-50 animate-fade-in backdrop-blur-xl">
              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2 pb-1 border-b border-slate-800 flex items-center justify-between">
                <span>Học Tập & Ôn Luyện</span>
                <span className="text-[9px] text-slate-500 font-normal">5 tính năng</span>
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveTool('learning');
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    activeTool === 'learning' ? 'bg-cyan-500/20 text-cyan-300 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>📖 Lý Thuyết 5 Bước</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTool('mcq_generator');
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    activeTool === 'mcq_generator' ? 'bg-cyan-500/20 text-cyan-300 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>✅ Đề Thi Trắc Nghiệm</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTool('essay_generator');
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    activeTool === 'essay_generator' ? 'bg-cyan-500/20 text-cyan-300 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>✍️ Đề Thi Tự Luận</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTool('mindmap');
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    activeTool === 'mindmap' ? 'bg-cyan-500/20 text-cyan-300 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Map className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>🗺️ Bản Đồ Tư Duy</span>
                </button>
              </div>

              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400 px-2 pt-1.5 pb-1 border-t border-slate-800 flex items-center justify-between">
                <span>Công Cụ & Dữ Liệu</span>
                <span className="text-[9px] text-slate-500 font-normal">4 tính năng</span>
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setActiveTool('charts');
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    activeTool === 'charts' ? 'bg-emerald-500/20 text-emerald-300 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>📈 Phân Tích Dữ Liệu & BCTC</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTool('mistake_stats');
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    activeTool === 'mistake_stats' ? 'bg-rose-500/20 text-rose-300 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>📊 Thống Kê Lỗi Sai</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTool('forum');
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    activeTool === 'forum' ? 'bg-cyan-500/20 text-cyan-300 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>💬 Diễn Đàn Học Tập</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTool('profile');
                    setIsToolsMenuOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2 font-semibold transition-all cursor-pointer ${
                    activeTool === 'profile' ? 'bg-cyan-500/20 text-cyan-300 font-black' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span>👤 Hồ Sơ & Linh Vật</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Zone 3: Gom nhóm Tiện Ích, Phao Thi HUB & Tài Khoản (Gọn gàng, vừa vặn 100% khung hình) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* 1. Nút Phao Thi HUB (Quick Shortcut - Nổi bật) */}
        {onOpenCheatSheet && (
          <button
            onClick={onOpenCheatSheet}
            className="px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 border border-amber-400/50 hover:border-amber-400 text-amber-300 hover:text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] transition-all cursor-pointer whitespace-nowrap"
            title="Mở tờ công thức được phép mang vào phòng thi HUB (CamScanner 2026)"
          >
            <span>📜</span>
            <span className="hidden sm:inline">Phao Thi HUB</span>
          </button>
        )}

        {/* 2. Menu Tiện Ích Gom Gọn: Chứa Prompt PDF, Google Drive, Cài đặt, Dev Vault, Báo lỗi */}
        <div className="relative">
          <button
            onClick={() => {
              setIsUtilitiesMenuOpen(!isUtilitiesMenuOpen);
              setIsToolsMenuOpen(false);
              setIsUserMenuOpen(false);
            }}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border whitespace-nowrap ${
              isUtilitiesMenuOpen
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-black'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
            title="Mở menu tiện ích, công cụ & cài đặt"
          >
            <Wrench className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Tiện Ích</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isUtilitiesMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isUtilitiesMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900/98 border-2 border-cyan-500/40 rounded-2xl shadow-2xl p-2.5 text-xs space-y-1 z-50 animate-fade-in text-white backdrop-blur-xl">
              <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400 px-2 pb-1 border-b border-slate-800">
                Tiện Ích & Công Cụ Hệ Thống
              </div>

              <button
                onClick={() => {
                  setIsUtilitiesMenuOpen(false);
                  onOpenPromptHistory();
                }}
                className="w-full text-left p-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-bold">Tổng Hợp Prompt (PDF)</div>
                  <div className="text-[10px] text-slate-400">Xem và xuất file PDF prompt chuẩn A4</div>
                </div>
              </button>

              {onOpenGoogleDrive && (
                <button
                  onClick={() => {
                    setIsUtilitiesMenuOpen(false);
                    onOpenGoogleDrive();
                  }}
                  className="w-full text-left p-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  <Cloud className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <div className="font-bold">Đồng Bộ Google Drive</div>
                    <div className="text-[10px] text-slate-400">Lưu trữ tài liệu và đề thi lên đám mây</div>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  setIsUtilitiesMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full text-left p-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-200 hover:text-white font-semibold transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold">Cài Đặt & Cấu Hình AI</div>
                  <div className="text-[10px] text-slate-400">Mô hình Gemini, âm thanh và giao diện</div>
                </div>
              </button>

              {currentUser?.role === 'nha_phat_trien' && (
                <button
                  onClick={() => {
                    setIsUtilitiesMenuOpen(false);
                    onOpenDevDatabase();
                  }}
                  className="w-full text-left p-2 hover:bg-purple-950/60 rounded-xl flex items-center gap-2.5 text-purple-300 hover:text-white font-bold transition-colors cursor-pointer border border-purple-500/30"
                >
                  <Database className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <div className="font-bold">Kho Dữ Liệu Dev</div>
                    <div className="text-[10px] text-purple-400/80">Quản trị toàn bộ CSDL người dùng</div>
                  </div>
                </button>
              )}

              <div className="border-t border-slate-800 pt-1 mt-1">
                <button
                  onClick={() => {
                    setIsUtilitiesMenuOpen(false);
                    onOpenBugReport();
                  }}
                  className="w-full text-left p-2 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Bug className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Báo Lỗi / Đóng Góp Ý Kiến</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Streak & GPA Badges */}
        {(() => {
          const todayStr = getLocalDateString();
          const activeLastStudy = currentUser?.lastStudyDate || userProfile.lastStudyDate;
          const hasStudiedToday = Boolean(activeLastStudy && activeLastStudy === todayStr);
          const streakCount = currentUser ? currentUser.streakDays : userProfile.streakDays;

          return (
            <div
              className={`hidden md:flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-help shrink-0 ${
                hasStudiedToday
                  ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/50 text-white shadow-[0_0_14px_rgba(245,158,11,0.3)]'
                  : 'bg-slate-900/90 border border-slate-700/70 text-slate-400 shadow-none'
              }`}
              title={
                hasStudiedToday
                  ? 'Hôm nay bạn đã thắp sáng chuỗi streak! Đang duy trì liên tục.'
                  : 'Hôm nay bạn chưa học bài (Màu xám). Hoàn thành 1 bài tập hoặc hỏi Gia Sư AI để thắp sáng ngọn lửa streak!'
              }
            >
              <div
                className={`flex items-center gap-1.5 ${
                  hasStudiedToday ? 'text-amber-300 font-extrabold' : 'text-slate-400 font-medium'
                }`}
              >
                <Flame
                  className={`w-4 h-4 transition-all ${
                    hasStudiedToday
                      ? 'fill-amber-400 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                      : 'fill-slate-500 text-slate-500 grayscale opacity-70'
                  }`}
                />
                <span className={hasStudiedToday ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                  {streakCount}d
                </span>
                {hasStudiedToday ? (
                  <span className="text-[10px] text-emerald-400 font-black ml-0.5" title="Đã học hôm nay (Đã thắp sáng)">✓</span>
                ) : (
                  <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700/80 px-1 py-0.2 rounded font-medium ml-0.5" title="Chưa học hôm nay (Cần học 1 bài để thắp sáng)">Xám</span>
                )}
              </div>
              <span className="text-slate-700">|</span>
              <div className="flex items-center gap-1 text-cyan-300">
                <Award className="w-3.5 h-3.5 text-cyan-400" />
                <span>GPA {currentUser ? currentUser.gpa : userProfile.gpa}</span>
              </div>
            </div>
          );
        })()}

        {/* 4. Auth: Logged In vs Log In Button */}
        {currentUser ? (
          <div className="relative shrink-0">
            <button
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsToolsMenuOpen(false);
                setIsUtilitiesMenuOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-2.5 bg-slate-900 hover:bg-slate-800 border-2 border-cyan-400/50 hover:border-cyan-400 rounded-2xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
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
              <div className="flex flex-col text-left hidden xl:block">
                <span className="text-xs font-bold text-white leading-tight block max-w-[90px] truncate">
                  {currentUser.fullName}
                </span>
                <span className="text-[10px] text-cyan-300 font-semibold leading-tight block">
                  {currentUser.role === 'nha_phat_trien'
                    ? '💻 Dev'
                    : currentUser.role === 'giang_vien'
                    ? '👨‍🏫 GV'
                    : '🎓 SV'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Dropdown User Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900/98 border-2 border-cyan-500/40 rounded-2xl shadow-2xl p-2 text-xs space-y-1 z-50 animate-fade-in text-white backdrop-blur-xl">
                <div className="p-2 border-b border-slate-800">
                  <div className="font-bold text-white text-xs">{currentUser.fullName}</div>
                  <div className="text-[11px] text-cyan-300 font-mono truncate">{currentUser.email}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{currentUser.university}</div>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    setActiveTool('profile');
                  }}
                  className="w-full text-left p-2 hover:bg-slate-800 rounded-xl flex items-center gap-2 text-slate-200 hover:text-white font-semibold transition-colors cursor-pointer"
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
                    className="w-full text-left p-2 hover:bg-rose-950/60 rounded-xl flex items-center gap-2 text-rose-400 hover:text-rose-200 font-semibold transition-colors cursor-pointer"
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
            className="px-3.5 py-1.5 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-xl shadow-[0_0_18px_rgba(6,182,212,0.5)] transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:scale-105 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            <span>ĐĂNG NHẬP</span>
          </button>
        )}
      </div>
    </header>
  );
};
