import React, { useState, useEffect } from 'react';
import { ActiveToolType, UserProfile, MistakeRecord, AppUser } from './types/xstk';
import { CHAPTERS_DATA, INITIAL_MASCOT_ITEMS, INITIAL_BADGES, INITIAL_WEEKLY_ACHIEVEMENTS } from './data/curriculumData';

import { TopNavbar } from './components/TopNavbar';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { BottomPageSwitcher } from './components/BottomPageSwitcher';
import { Mascot } from './components/Mascot';

// Feature Components
import { ChapterLearning } from './components/ChapterLearning';
import { ImagePdfGrading } from './components/ImagePdfGrading';
import { VoiceInteraction } from './components/VoiceInteraction';
import { EssayPractice } from './components/EssayPractice';
import { McqPractice } from './components/McqPractice';
import { TheoreticalViva } from './components/TheoreticalViva';
import { MistakeAnalytics } from './components/MistakeAnalytics';
import { MindmapViewer } from './components/MindmapViewer';
import { ForumSection } from './components/ForumSection';
import { AiProfileMascot } from './components/AiProfileMascot';
import { ChartVisualization } from './components/ChartVisualization';
import { CasioCalculator } from './components/CasioCalculator';
import { MathProcessor } from './components/MathProcessor';
import { WysiwygMathChatEditor } from './components/WysiwygMathChatEditor';

// Modals
import { SettingsModal } from './components/SettingsModal';
import { BugReportModal } from './components/BugReportModal';
import { AuthModal } from './components/AuthModal';
import { DeveloperDatabaseModal } from './components/DeveloperDatabaseModal';
import { PromptHistoryModal } from './components/PromptHistoryModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';

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
  Database,
  FileCode,
  Cloud,
  Sparkles,
} from 'lucide-react';

const INITIAL_PROFILE: UserProfile = {
  isOnboarded: false,
  fullName: 'Sinh viên XSTK',
  classGroup: '2026-DHKT01',
  major: 'Khoa học Dữ liệu & AI',
  studentId: '26110293',
  avatarUrl: '👨‍🎓',
  level: 3,
  exp: 240,
  nextLevelExp: 500,
  gpa: 3.82,
  studyHours: 14.5,
  streakDays: 7,
  lastActiveDate: new Date().toISOString().split('T')[0],
  unlockedLootboxes: 2,
  inventory: INITIAL_MASCOT_ITEMS,
  equippedMascot: {
    hat: 'hat_grad',
    outfit: 'robe_gold',
    accessory: 'glasses_smart',
  },
  badges: INITIAL_BADGES,
  equippedBadges: ['badge_bayes', 'badge_casio', 'badge_gpa_star'],
  weeklyAchievements: INITIAL_WEEKLY_ACHIEVEMENTS,
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [activeTool, setActiveTool] = useState<ActiveToolType>('image_grading');

  const [currentChapterId, setCurrentChapterId] = useState(1);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([
    {
      id: 'mistake_demo_1',
      chapterId: 1,
      chapterTitle: 'Bài 1: Xác suất cơ bản & Bayes',
      sourceType: 'mcq',
      questionSummary: 'Cho $P(A) = 0.4, P(B) = 0.5$. Biết $A, B$ xung khắc. Tính $P(A + B)$.',
      studentAnswer: '$P(A+B) = P(A) + P(B) - P(AB) = 0.4 + 0.5 - 0.2 = 0.7$',
      correctConcept: '$A, B$ xung khắc thì $A \\cap B = \\emptyset \\implies P(AB) = 0 \\implies P(A+B) = 0.4 + 0.5 = 0.9$',
      rootCauseError: 'Nhầm lẫn giữa biến cố xung khắc (P(AB) = 0) và biến cố độc lập (P(AB) = P(A)P(B))',
      remediationAdvice: 'Khi đề cho "xung khắc", lập tức gạch bỏ số hạng P(AB) = 0 trong công thức cộng xác suất!',
      timestamp: '14:20',
      resolved: false,
    },
    {
      id: 'mistake_demo_2',
      chapterId: 3,
      chapterTitle: 'Bài 3: Phân phối Chuẩn & Casio 580',
      sourceType: 'essay',
      questionSummary: 'Biến ngẫu nhiên $X \\sim N(50, 4)$. Tính xác suất $P(X \\ge 54)$.',
      studentAnswer: 'Nhập máy tính $\\sigma = 4, \\mu = 50$',
      correctConcept: 'Đề bài cho $N(50, 4)$ nghĩa là phương sai $\\sigma^2 = 4 \\implies$ Độ lệch chuẩn $\\sigma = 2$. Do đó $P(X \\ge 54) = 1 - \\Phi(\\frac{54-50}{2}) = 1 - \\Phi(2) = 0.0228$',
      rootCauseError: 'Nhầm lẫn giữa phương sai sigma^2 và độ lệch chuẩn sigma khi nhập tham số vào Casio Menu 7 Normal CD',
      remediationAdvice: 'Ký hiệu chuẩn $N(\\mu, \\sigma^2)$ luôn có số thứ 2 là bình phương phương sai; hãy luôn căn bậc hai trước khi nhập máy!',
      timestamp: '15:10',
      resolved: false,
    },
  ]);

  // Auth & Developer Database State
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    try {
      const saved = localStorage.getItem('edt_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDevDbOpen, setIsDevDbOpen] = useState(false);
  const [isPromptHistoryOpen, setIsPromptHistoryOpen] = useState(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Synchronize profile with currentUser if available
  useEffect(() => {
    if (currentUser) {
      setProfile((prev) => ({
        ...prev,
        fullName: currentUser.fullName,
        studentId: currentUser.studentId,
        classGroup: currentUser.classGroup,
        gpa: currentUser.gpa,
        level: currentUser.level,
        exp: currentUser.exp,
        streakDays: currentUser.streakDays,
        studyHours: currentUser.studyHours,
      }));
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('edt_current_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('edt_current_user');
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleAddExp = (amount: number, activityDetail?: string, exercisesCount = 1, gpaValue?: number) => {
    setProfile((prev) => {
      let newExp = prev.exp + amount;
      let newLevel = prev.level;
      let newNextExp = prev.nextLevelExp;

      if (newExp >= newNextExp) {
        newLevel += 1;
        newExp = newExp - newNextExp;
        newNextExp = Math.round(newNextExp * 1.5);
      }

      const updated = {
        ...prev,
        exp: newExp,
        level: newLevel,
        nextLevelExp: newNextExp,
        studyHours: parseFloat((prev.studyHours + 0.2).toFixed(1)),
        ...(gpaValue ? { gpa: gpaValue } : {}),
      };

      // Sync progress to persistent users_database.json if logged in
      if (currentUser) {
        fetch('/api/auth/save-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            expGained: amount,
            studyHours: 0.2,
            exercisesCount: exercisesCount || 1,
            gpa: gpaValue || currentUser.gpa,
            activityDetail: activityDetail || `Hoàn thành bài tập & nhận +${amount} EXP`,
          }),
        })
          .then((r) => r.json())
          .then((res) => {
            if (res.success && res.user) {
              setCurrentUser(res.user);
              localStorage.setItem('edt_current_user', JSON.stringify(res.user));
            }
          })
          .catch(() => {});
      }

      return updated;
    });
  };

  const handleRecordMistake = (newMistake: MistakeRecord) => {
    setMistakes((prev) => [newMistake, ...prev]);
  };

  const handleResolveMistake = (id: string) => {
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, resolved: true } : m))
    );
  };

  const renderToolView = (tool: ActiveToolType) => {
    switch (tool) {
      case 'wysiwyg_math':
        return <WysiwygMathChatEditor />;
      case 'learning':
        return (
          <ChapterLearning
            chapters={CHAPTERS_DATA}
            currentChapterId={currentChapterId}
            onSelectChapter={setCurrentChapterId}
            onAddExp={handleAddExp}
            onRecordMistake={handleRecordMistake}
          />
        );
      case 'casio_calc':
        return <CasioCalculator />;
      case 'image_grading':
      case 'math_processor':
      case 'viva_exam':
      case 'voice_chat':
        return <ImagePdfGrading onAddExp={handleAddExp} onRecordMistake={handleRecordMistake} />;
      case 'mcq_generator':
        return <McqPractice onAddExp={handleAddExp} onRecordMistake={handleRecordMistake} />;
      case 'essay_generator':
        return <EssayPractice onAddExp={handleAddExp} onRecordMistake={handleRecordMistake} />;
      case 'mistake_stats':
        return (
          <MistakeAnalytics
            mistakes={mistakes}
            onClearMistakes={() => setMistakes([])}
            onResolveMistake={handleResolveMistake}
            onAddExp={handleAddExp}
          />
        );
      case 'mindmap':
        return <MindmapViewer />;
      case 'forum':
        return <ForumSection onAddExp={handleAddExp} />;
      case 'profile':
        return (
          <AiProfileMascot
            userProfile={profile}
            onUpdateProfile={handleUpdateProfile}
            onAddExp={handleAddExp}
          />
        );
      case 'charts':
        return <ChartVisualization />;
      case 'developer_db':
        return (
          <div className="space-y-4">
            <div className="p-6 bg-slate-900 border-2 border-purple-500/50 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.3)] space-y-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/40 font-black">
                    <Database className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">Kho Dữ Liệu Người Dùng (Developer Vault)</h2>
                    <p className="text-xs text-slate-300">
                      Bấm nút bên dưới để mở toàn màn hình giao diện quản trị cơ sở dữ liệu người dùng EDT.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDevDbOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-black rounded-xl text-xs shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                >
                  MỞ TOÀN MÀN HÌNH CSDL
                </button>
              </div>
            </div>
            <DeveloperDatabaseModal isOpen={true} onClose={() => setActiveTool('learning')} currentUser={currentUser} />
          </div>
        );
      default:
        return (
          <ChapterLearning
            chapters={CHAPTERS_DATA}
            currentChapterId={currentChapterId}
            onSelectChapter={setCurrentChapterId}
            onAddExp={handleAddExp}
            onRecordMistake={handleRecordMistake}
          />
        );
    }
  };

  const ALL_NAVIGATION_ITEMS: Array<{ id: ActiveToolType; name: string; icon: React.ReactNode; isNeon?: boolean }> = [
    { id: 'learning', name: '📖 Lý thuyết 5 bước', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
    { id: 'image_grading', name: '⚡ Gia Sư AI 1-1 & Giải Toán Toàn Diện', icon: <Sparkles className="w-4 h-4 text-cyan-300" />, isNeon: true },
    { id: 'casio_calc', name: '🧮 Máy tính Casio XSTK', icon: <Calculator className="w-4 h-4 text-cyan-300" /> },
    { id: 'mcq_generator', name: '✅ Đề Trắc Nghiệm (Word/PDF)', icon: <CheckSquare className="w-4 h-4 text-teal-400" /> },
    { id: 'essay_generator', name: '✍️ Đề Tự Luận (Word/PDF)', icon: <FileText className="w-4 h-4 text-blue-400" /> },
    { id: 'mindmap', name: '🗺️ Bản Đồ Tư Duy 7 Chương', icon: <Map className="w-4 h-4 text-cyan-400" /> },
    { id: 'mistake_stats', name: '📊 Thống Kê & Phân Tích Lỗi', icon: <BarChart3 className="w-4 h-4 text-rose-400" /> },
    { id: 'charts', name: '📈 Mô Hình Phân Phối Chuẩn', icon: <BarChart3 className="w-4 h-4 text-emerald-300" /> },
    { id: 'forum', name: '💬 Diễn Đàn Học Tập EDT', icon: <MessageSquare className="w-4 h-4 text-cyan-400" /> },
    { id: 'profile', name: '👤 Hồ Sơ & Linh Vật Cú', icon: <User className="w-4 h-4 text-cyan-300" /> },
    ...(currentUser?.role === 'nha_phat_trien'
      ? [{ id: 'developer_db' as ActiveToolType, name: '💾 Kho Dữ Liệu Dev (Vault)', icon: <Database className="w-4 h-4 text-purple-400" />, isNeon: true }]
      : []),
  ];


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col pb-24 overflow-x-hidden w-full selection:bg-cyan-500 selection:text-slate-950">
      {/* Mandatory Login Wall (Facebook-style Auth Gate) */}
      {!currentUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border-2 border-cyan-500/50 p-8 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-emerald-400 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <span className="text-3xl">🦉</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-wide">EDT - AI Tutor Xác Suất Thống Kê</h1>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Vui lòng <strong className="text-cyan-300">Đăng nhập hoặc Đăng ký tài khoản</strong> để hệ thống lưu trữ tiến độ học tập, điểm EXP, GPA và lịch sử bài làm cá nhân của bạn lên cơ sở dữ liệu!
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => setIsAuthOpen(true)}
                className="w-full py-4 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-2xl text-base shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🔐 Đăng Nhập / Đăng Ký Tài Khoản Ngay</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Nhà phát hành (Developer Portal) vui lòng đăng nhập bằng mã PIN bảo mật.
            </p>
          </div>
        </div>
      )}

      {/* Onboarding Overlay Flow */}
      {!profile.isOnboarded && (
        <OnboardingOverlay
          userProfile={profile}
          onComplete={(updated) => handleUpdateProfile(updated)}
        />
      )}

      {/* Top Navbar */}
      <TopNavbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        userProfile={profile}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenDevDatabase={() => setIsDevDbOpen(true)}
        onOpenPromptHistory={() => setIsPromptHistoryOpen(true)}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
        onLogout={handleLogout}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBugReport={() => setIsBugReportOpen(true)}
        activeWindowCount={1}
      />

      {/* Main Content Layout - Expansive widescreen layout that fully utilizes the right side */}
      <div className="max-w-[1720px] w-full mx-auto px-3 sm:px-6 py-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        {/* Left Sidebar Menu */}
        <aside className="lg:col-span-3 xl:col-span-3 2xl:col-span-2 space-y-4 min-w-0">
          <div className="bg-slate-900/90 border border-cyan-500/20 p-4 rounded-3xl shadow-[0_4px_25px_rgba(0,0,0,0.5)] space-y-2">
            <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-800">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse"></span>
                <span>CÔNG CỤ EDT AI</span>
              </h3>
              <span className="text-[11px] text-cyan-400 font-mono font-bold">v2.5 PRO</span>
            </div>

            <nav className="space-y-1.5 pt-1.5">
              {ALL_NAVIGATION_ITEMS.map((item) => {
                const isActive = activeTool === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTool(item.id)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className={`p-1.5 rounded-lg ${isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400'}`}>
                        {item.icon}
                      </div>
                      <span className="truncate">{item.name}</span>
                    </div>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] shrink-0"></span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Prompt Blueprint Modal Trigger */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => setIsPromptHistoryOpen(true)}
                className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-between bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 hover:text-white hover:bg-cyan-900 shadow-[0_0_12px_rgba(6,182,212,0.25)] group cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">📑 Tổng Hợp Prompt (PDF)</span>
                </div>
                <span className="text-xs bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-black">A4</span>
              </button>

              <button
                onClick={() => setIsGoogleDriveOpen(true)}
                className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-between bg-blue-950/80 border border-blue-500/40 text-blue-200 hover:text-white hover:bg-blue-900 shadow-[0_0_12px_rgba(59,130,246,0.25)] group cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Cloud className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">📁 Google Drive Cloud Hub</span>
                </div>
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded font-black">SYNC</span>
              </button>
            </div>
          </div>

          {/* Sidebar Mascot Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 text-white p-4 rounded-3xl shadow-[0_0_20px_rgba(6,182,212,0.15)] text-center space-y-2 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
            <Mascot size="sm" equipped={profile.equippedMascot} speechText="Học XSTK mỗi ngày cùng Cú EDT nhé!" />
            <div className="text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 py-1 px-3 rounded-full inline-block">
              Chuỗi học: {currentUser ? currentUser.streakDays : profile.streakDays} ngày liên tục 🔥
            </div>
          </div>
        </aside>

        {/* Center Primary Work Area (Displays Single Full Page) */}
        <main className="lg:col-span-9 xl:col-span-9 2xl:col-span-10 space-y-6 min-w-0 w-full">
          {renderToolView(activeTool)}
        </main>
      </div>

      {/* Bottom Page Switcher Bar */}
      <BottomPageSwitcher
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBugReport={() => setIsBugReportOpen(true)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Bug Report Modal */}
      <BugReportModal
        isOpen={isBugReportOpen}
        onClose={() => setIsBugReportOpen(false)}
        userProfile={profile}
      />

      {/* Auth Modal (Login / Register / Quick Demo) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onOpenDevDatabase={() => setIsDevDbOpen(true)}
      />

      {/* Developer Database Modal (User Hub for Developers) */}
      <DeveloperDatabaseModal
        isOpen={isDevDbOpen}
        onClose={() => setIsDevDbOpen(false)}
        currentUser={currentUser}
      />

      {/* Prompt Blueprint & PDF Export Modal */}
      <PromptHistoryModal
        isOpen={isPromptHistoryOpen}
        onClose={() => setIsPromptHistoryOpen(false)}
      />

      {/* Google Workspace Drive Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
      />
    </div>
  );
}
