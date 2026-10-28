import React, { useState, useEffect } from 'react';
import { ActiveToolType, UserProfile, MistakeRecord, AppUser, MascotSpecies } from './types/xstk';
import { CHAPTERS_DATA, INITIAL_MASCOT_ITEMS, INITIAL_BADGES, INITIAL_WEEKLY_ACHIEVEMENTS } from './data/curriculumData';

import { TopNavbar } from './components/TopNavbar';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { BottomPageSwitcher } from './components/BottomPageSwitcher';
import { Mascot } from './components/Mascot';
import { HubEdtLogo } from './components/HubEdtLogo';
import { PixelAmbientBackground } from './components/PixelAmbientBackground';
import { FloatingPixelMascot } from './components/FloatingPixelMascot';
import { getMascotById } from './data/mascotCatalog';
import { evaluateStreakOnAccess, recordStudyInteraction, getLocalDateString } from './utils/streakManager';

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
import { BigSizeDocumentProcessor } from './components/BigSizeDocumentProcessor';

// Modals
import { SettingsModal } from './components/SettingsModal';
import { BugReportModal } from './components/BugReportModal';
import { AuthModal } from './components/AuthModal';
import { DeveloperDatabaseModal } from './components/DeveloperDatabaseModal';
import { PromptHistoryModal } from './components/PromptHistoryModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { HubExamCheatSheetModal } from './components/HubExamCheatSheetModal';

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
  Layers,
  Flame,
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
  lastActiveDate: (() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return getLocalDateString(y);
  })(),
  lastStudyDate: (() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return getLocalDateString(y);
  })(),
  unlockedLootboxes: 2,
  inventory: INITIAL_MASCOT_ITEMS,
  equippedMascot: {
    species: 'penguin',
    hat: 'hat_grad',
    outfit: 'robe_gold',
    accessory: 'glasses_smart',
  },
  badges: INITIAL_BADGES,
  equippedBadges: ['badge_bayes', 'badge_casio', 'badge_gpa_star'],
  weeklyAchievements: INITIAL_WEEKLY_ACHIEVEMENTS,
};

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('edt_user_profile');
      if (saved) {
        return { ...INITIAL_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_PROFILE;
  });
  const [activeTool, setActiveTool] = useState<ActiveToolType>('image_grading');

  const [currentChapterId, setCurrentChapterId] = useState(1);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => {
    try {
      const saved = localStorage.getItem('edt_mistakes_records');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [
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
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('edt_mistakes_records', JSON.stringify(mistakes));
    } catch (e) {
      console.error(e);
    }
  }, [mistakes]);

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
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [streakToast, setStreakToast] = useState<string | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-dismiss streak celebration toast
  useEffect(() => {
    if (streakToast) {
      const timer = setTimeout(() => setStreakToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [streakToast]);

  // Real-time calculation of today's study status
  const todayStr = getLocalDateString();
  const activeLastStudyDate = currentUser ? currentUser.lastStudyDate : profile.lastStudyDate;
  const hasStudiedToday = Boolean(activeLastStudyDate && activeLastStudyDate === todayStr);

  // Synchronize profile with currentUser and evaluate real-time streak on access (Login does NOT increase streak!)
  useEffect(() => {
    if (currentUser) {
      const streakEval = evaluateStreakOnAccess(currentUser.streakDays, currentUser.lastStudyDate);
      if (streakEval.streakDays !== currentUser.streakDays) {
        setCurrentUser((prev) => (prev ? { ...prev, streakDays: streakEval.streakDays } : null));
      }
      setProfile((prev) => ({
        ...prev,
        fullName: currentUser.fullName,
        studentId: currentUser.studentId,
        classGroup: currentUser.classGroup,
        gpa: currentUser.gpa,
        level: currentUser.level,
        exp: currentUser.exp,
        streakDays: streakEval.streakDays,
        lastStudyDate: currentUser.lastStudyDate,
        studyHours: currentUser.studyHours,
      }));
    } else {
      setProfile((prev) => {
        const streakEval = evaluateStreakOnAccess(prev.streakDays, prev.lastStudyDate);
        return {
          ...prev,
          streakDays: streakEval.streakDays,
        };
      });
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: AppUser) => {
    // Evaluate real-time streak on login (DOES NOT increment streak)
    const streakEval = evaluateStreakOnAccess(user.streakDays, user.lastStudyDate);
    const updatedUser = { ...user, streakDays: streakEval.streakDays };
    setCurrentUser(updatedUser);
    try {
      localStorage.setItem('edt_current_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('edt_current_user');
      localStorage.removeItem('edt_user_profile');
      setProfile({ ...INITIAL_PROFILE, isOnboarded: false });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => {
      const nextProfile = { ...prev, ...updated };
      try {
        localStorage.setItem('edt_user_profile', JSON.stringify(nextProfile));
      } catch (e) {
        console.error(e);
      }
      return nextProfile;
    });
    if (currentUser?.id && updated.equippedMascot) {
      fetch('/api/auth/update-mascot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          equippedMascot: updated.equippedMascot,
        }),
      }).catch(console.error);
    }
  };

  const handleCycleMascot = () => {
    const hubSpecies: MascotSpecies[] = ['penguin', 'crocodile', 'bear', 'fox', 'cat', 'owl', 'panda', 'lion', 'whale', 'dragon'];
    const currentSpecies = profile.equippedMascot?.species || 'penguin';
    const currentIdx = hubSpecies.indexOf(currentSpecies);
    const nextSpecies = hubSpecies[(currentIdx + 1) % hubSpecies.length];

    const updatedMascot = {
      ...profile.equippedMascot,
      species: nextSpecies,
    };
    handleUpdateProfile({ equippedMascot: updatedMascot });
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

      // REAL-TIME STREAK CALCULATION:
      // Tương tác học tập thực tế: gia hạn / tích lũy streak!
      const streakResult = recordStudyInteraction(prev.streakDays, prev.lastStudyDate);
      if (streakResult.isNewIncrement && streakResult.celebrationMessage) {
        setStreakToast(streakResult.celebrationMessage);
      }

      const updated: UserProfile = {
        ...prev,
        exp: newExp,
        level: newLevel,
        nextLevelExp: newNextExp,
        studyHours: parseFloat((prev.studyHours + 0.2).toFixed(1)),
        streakDays: streakResult.streakDays,
        lastStudyDate: streakResult.lastStudyDate,
        lastActiveDate: streakResult.lastStudyDate,
        ...(gpaValue ? { gpa: gpaValue } : {}),
      };

      // Sync progress & real-time streak to persistent users_database.json if logged in
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
            isStudyInteraction: true,
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
        return <ImagePdfGrading onAddExp={handleAddExp} onRecordMistake={handleRecordMistake} />;
      case 'viva_exam':
        return <TheoreticalViva onAddExp={handleAddExp} onRecordMistake={handleRecordMistake} />;
      case 'voice_chat':
        return <VoiceInteraction onAddExp={handleAddExp} />;
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
        return <ForumSection onAddExp={handleAddExp} currentUser={currentUser} />;
      case 'profile':
        return (
          <AiProfileMascot
            userProfile={profile}
            onUpdateProfile={handleUpdateProfile}
            onAddExp={handleAddExp}
          />
        );
      case 'charts':
        return <ChartVisualization onAddExp={handleAddExp} />;
      case 'big_doc_processor':
        return <BigSizeDocumentProcessor onAddExp={handleAddExp} />;
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
                      Bấm nút bên dưới để mở toàn màn hình giao diện quản trị cơ sở dữ liệu người dùng AI Classroom.
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

  const NAVIGATION_GROUPS: Array<{
    groupName: string;
    items: Array<{ id: ActiveToolType; name: string; icon: React.ReactNode; isNeon?: boolean }>;
  }> = [
    {
      groupName: 'Học Tập & Ôn Luyện',
      items: [
        { id: 'learning', name: '📖 Lý Thuyết 4-5 Bước', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
        { id: 'image_grading', name: '⚡ Gia Sư AI 1-1 (iPad/PDF)', icon: <Sparkles className="w-4 h-4 text-cyan-300" />, isNeon: true },
        { id: 'viva_exam', name: '🎙️ Thi Vấn Đáp AI', icon: <HelpCircle className="w-4 h-4 text-amber-400" /> },
        { id: 'voice_chat', name: '🗣️ Tương Tác Giọng Nói', icon: <Mic className="w-4 h-4 text-cyan-400" /> },
        { id: 'mcq_generator', name: '✅ Đề Thi Trắc Nghiệm', icon: <CheckSquare className="w-4 h-4 text-teal-400" /> },
        { id: 'essay_generator', name: '✍️ Đề Thi Tự Luận', icon: <FileText className="w-4 h-4 text-blue-400" /> },
        { id: 'big_doc_processor', name: '🚀 Giải Đề Big Size 100MB', icon: <Layers className="w-4 h-4 text-cyan-300" /> },
        { id: 'mindmap', name: '🗺️ Bản Đồ Tư Duy', icon: <Map className="w-4 h-4 text-cyan-400" /> },
      ],
    },
    {
      groupName: 'Công Cụ & Thống Kê',
      items: [
        { id: 'casio_calc', name: '🧮 Máy Tính Casio', icon: <Calculator className="w-4 h-4 text-cyan-300" /> },
        { id: 'charts', name: '📈 Phân Tích Dữ Liệu', icon: <BarChart3 className="w-4 h-4 text-emerald-300" />, isNeon: true },
        { id: 'mistake_stats', name: '📊 Thống Kê Lỗi Sai', icon: <BarChart3 className="w-4 h-4 text-rose-400" /> },
      ],
    },
    {
      groupName: 'Cộng Đồng & Cá Nhân',
      items: [
        { id: 'forum', name: '💬 Diễn Đàn Học Tập', icon: <MessageSquare className="w-4 h-4 text-cyan-400" /> },
        { id: 'profile', name: '👤 Hồ Sơ & Linh Vật', icon: <User className="w-4 h-4 text-cyan-300" /> },
        ...(currentUser?.role === 'nha_phat_trien'
          ? [{ id: 'developer_db' as ActiveToolType, name: '💾 Kho Dữ Liệu Dev', icon: <Database className="w-4 h-4 text-purple-400" />, isNeon: true }]
          : []),
      ],
    },
  ];


  // BƯỚC 1: Bắt buộc Đăng Nhập / Nhập Mật Khẩu / Đăng Ký Tài Khoản trước tiên
  // Tuyệt đối không hiển thị Navbar, Sidebar hay bất kỳ tính năng nào khi chưa đăng nhập!
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-center items-center relative overflow-hidden">
        <PixelAmbientBackground />
        <AuthModal
          isOpen={true}
          onClose={() => {}}
          currentUser={null}
          onLoginSuccess={handleLoginSuccess}
          onOpenDevDatabase={() => setIsDevDbOpen(true)}
          isMandatory={true}
        />
      </div>
    );
  }

  // BƯỚC 2: Sau khi đăng nhập, nếu tài khoản chưa hoàn tất thông tin cá nhân (Onboarding)
  // Hiển thị màn hình lấy thông tin sinh viên, chọn linh vật mascot và xem hướng dẫn
  if (!profile.isOnboarded) {
    return (
      <div className="fixed inset-0 z-50 min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col justify-center items-center relative overflow-hidden">
        <PixelAmbientBackground />
        <OnboardingOverlay
          userProfile={profile}
          onComplete={(updated) => handleUpdateProfile(updated)}
        />
      </div>
    );
  }

  // BƯỚC 3: Giao diện chính của ứng dụng AI Classroom (Đã đăng nhập & Đã hoàn tất thông tin)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col pb-24 overflow-x-hidden w-full selection:bg-cyan-500 selection:text-slate-950 relative">
      {/* Subtle Ambient Pixel Background Art */}
      <PixelAmbientBackground />

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
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
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
                <span>CÔNG CỤ AI CLASSROOM</span>
              </h3>
              <span className="text-[11px] text-cyan-400 font-mono font-bold">v2.5 PRO</span>
            </div>

            <nav className="space-y-3 pt-1.5">
              {NAVIGATION_GROUPS.map((group, gIdx) => (
                <div key={gIdx} className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-wider text-cyan-400/80 px-2 flex items-center justify-between">
                    <span>{group.groupName}</span>
                  </div>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = activeTool === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTool(item.id)}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-between group cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
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
                  </div>
                </div>
              ))}
            </nav>

            {/* Quick Prompt Blueprint Modal Trigger */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => setIsPromptHistoryOpen(true)}
                className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-between bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 hover:text-white hover:bg-cyan-900 shadow-[0_0_12px_rgba(6,182,212,0.25)] group cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">📑 Thư Viện Prompt</span>
                </div>
                <span className="text-xs bg-cyan-500 text-slate-950 px-2 py-0.5 rounded font-black">A4</span>
              </button>

              <button
                onClick={() => setIsGoogleDriveOpen(true)}
                className="w-full text-left px-3.5 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-between bg-blue-950/80 border border-blue-500/40 text-blue-200 hover:text-white hover:bg-blue-900 shadow-[0_0_12px_rgba(59,130,246,0.25)] group cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Cloud className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">📁 Đồng Bộ Drive</span>
                </div>
                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded font-black">SYNC</span>
              </button>
            </div>
          </div>

          {/* Sidebar Mascot Widget (Nhảy Nhót & Giải Trí) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 text-white p-4 rounded-3xl shadow-[0_0_20px_rgba(6,182,212,0.15)] text-center space-y-2 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>
            
            {/* Live Interactive Dancing Mascot */}
            <div className="flex justify-center">
              <Mascot
                size="sm"
                equipped={profile.equippedMascot}
                speechText={`Cùng ${getMascotById(profile.equippedMascot?.species || 'penguin').name} chinh phục điểm 10 XSTK nhé!`}
                showDanceBadge={true}
              />
            </div>

            {/* Quick Interactive Mascot Actions */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <button
                onClick={handleCycleMascot}
                className="px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-cyan-950 text-cyan-300 hover:text-white border border-cyan-500/40 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Đổi nhanh linh vật Pixel HUB (Rồng Thần, Cánh Cụt, Bác Gấu, Bé Cáo, Bé Mèo...)"
              >
                <span>🔄 Đổi Bé HUB</span>
              </button>
              <button
                onClick={() => setActiveTool('profile')}
                className="px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-amber-950 text-amber-300 hover:text-white border border-amber-500/40 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Mở Kho Linh Vật & Tùy Chỉnh"
              >
                <span>🎒 Kho Linh Vật</span>
              </button>
            </div>
            <div
              className={`text-xs font-bold py-2 px-3 rounded-2xl flex flex-col items-center justify-center gap-1 border transition-all ${
                hasStudiedToday
                  ? 'text-amber-300 bg-gradient-to-r from-amber-950/70 to-orange-950/70 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 bg-slate-900/90 border-slate-800 shadow-none'
              }`}
              title={
                hasStudiedToday
                  ? 'Hôm nay bạn đã hoàn thành bài học! Chuỗi streak đã thắp sáng rực rỡ 🔥'
                  : 'Streak đang ở trạng thái màu xám. Hoàn thành 1 bài tập hoặc hỏi Gia Sư AI để thắp sáng ngọn lửa streak!'
              }
            >
              <div className="flex items-center gap-1.5">
                <Flame
                  className={`w-4 h-4 transition-all ${
                    hasStudiedToday
                      ? 'fill-amber-400 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]'
                      : 'fill-slate-500 text-slate-500 grayscale opacity-75'
                  }`}
                />
                <span className={hasStudiedToday ? 'text-amber-300 font-black' : 'text-slate-400 font-medium'}>
                  Chuỗi học: {currentUser ? currentUser.streakDays : profile.streakDays} ngày
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
                  hasStudiedToday
                    ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/40 font-bold'
                    : 'text-slate-400 bg-slate-800/80 border-slate-700/60 font-medium'
                }`}
              >
                {hasStudiedToday ? '✓ Đã thắp sáng hôm nay' : '⏳ Cần học 1 bài để thắp lửa'}
              </span>
            </div>
          </div>

          {/* HUB Campus Pride Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-cyan-500/30 text-white rounded-3xl shadow-[0_0_20px_rgba(6,182,212,0.15)] overflow-hidden relative group transition-all hover:border-cyan-400">
            <div className="relative h-28 overflow-hidden cursor-pointer" onClick={() => setIsCampusModalOpen(true)}>
              <img
                src="/assets/hub-campus.jpg"
                alt="Trường Đại học Ngân hàng TP.HCM (HUB)"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-3">
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/hub-logo.png"
                    alt="HUB Logo"
                    className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/40 inline-flex items-center gap-1 mb-0.5">
                      <span>I ❤️ HUB 1976</span>
                    </span>
                    <p className="text-xs font-black text-white leading-tight drop-shadow">
                      Đại Học Ngân Hàng TP.HCM
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-2.5 text-[11px] text-slate-300 flex items-center justify-between border-t border-slate-800/80 bg-slate-950/60">
              <span className="text-slate-400 text-[10px]">Cơ sở Thủ Đức & Q.1</span>
              <button
                onClick={() => setIsCampusModalOpen(true)}
                className="text-[10px] font-bold text-cyan-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Xem ảnh</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Center Primary Work Area (Displays Single Full Page) */}
        <main className="lg:col-span-9 xl:col-span-9 2xl:col-span-10 space-y-6 min-w-0 w-full">
          {renderToolView(activeTool)}
        </main>
      </div>

      {/* Real-time Streak Celebration Toast */}
      {streakToast && (
        <div className="fixed top-20 right-6 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border border-amber-300/60">
          <span className="text-2xl animate-bounce">🔥</span>
          <div className="text-xs sm:text-sm text-left">
            <p className="font-extrabold text-white">{streakToast}</p>
            <p className="text-[11px] text-amber-100 font-medium">Hệ thống đã tự động lưu chuỗi vào hồ sơ học tập thời gian thực!</p>
          </div>
          <button
            onClick={() => setStreakToast(null)}
            className="ml-2 text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Floating Pixel Mascot Cheerleader (Encourages user, auto-hides during study) */}
      <FloatingPixelMascot
        activeTool={activeTool}
        equippedMascot={profile.equippedMascot}
      />

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
        userProfile={profile}
        onUpdateProfile={handleUpdateProfile}
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

      {/* Official HUB Exam Formula Sheet Modal (CamScanner) */}
      <HubExamCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />

      {/* HUB Campus Pride Gallery Modal */}
      {isCampusModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
          <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl max-w-3xl w-full overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col max-h-[92vh]">
            <div className="relative h-64 sm:h-84 overflow-hidden shrink-0">
              <img
                src="/assets/hub-campus.jpg"
                alt="Trường Đại học Ngân hàng TP.HCM (HUB)"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/30" />
              <button
                onClick={() => setIsCampusModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
              <div className="absolute bottom-4 left-5 right-5 text-white flex items-center gap-3.5">
                <img
                  src="/assets/hub-logo.png"
                  alt="HUB Crest"
                  className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(6,182,212,0.8)] shrink-0 hidden sm:block"
                />
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-950/90 px-3 py-1 rounded-full border border-cyan-500/50 inline-flex items-center gap-1.5 mb-1.5 backdrop-blur-sm">
                    <img src="/assets/hub-logo.png" alt="HUB" className="w-3.5 h-3.5 object-contain sm:hidden" />
                    <span>TRƯỜNG ĐẠI HỌC NGÂN HÀNG TP. HỒ CHÍ MINH (HUB)</span>
                  </span>
                  <h3 className="text-lg sm:text-2xl font-black drop-shadow">
                    Nơi Khởi Nguồn Ước Mơ & Chinh Phục Điểm 10 Xác Suất Thống Kê
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto text-xs sm:text-sm text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">📍 Cơ Sở 1 (Trung Tâm):</span>
                  <p className="text-slate-300">36 Tôn Thất Đạm, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh</p>
                </div>
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">📍 Cơ Sở 2 (Khuôn Viên Chính):</span>
                  <p className="text-slate-300">56 Hoàng Diệu 2, P. Linh Chiểu, TP. Thủ Đức, TP. Hồ Chí Minh</p>
                </div>
              </div>

              <div className="p-3.5 bg-cyan-950/40 border border-cyan-500/30 rounded-2xl text-xs space-y-1 flex items-start gap-3">
                <img src="/assets/hub-logo.png" alt="HUB" className="w-9 h-9 object-contain shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-cyan-300 block">📚 Khoa Hệ Thống Thông Tin & Bộ Môn Toán Kinh Tế HUB</span>
                  <p className="text-slate-300 leading-relaxed">
                    Ứng dụng AI Classroom được thiết kế bám sát chuẩn chương trình giảng dạy, đề thi và barem điểm Xác Suất Thống Kê của Đại học Ngân hàng TP.HCM (HUB), đồng hành cùng sinh viên HUB học tập và đạt kết quả xuất sắc!
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setIsCampusModalOpen(false)}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black rounded-xl hover:from-cyan-300 hover:to-emerald-300 transition-all cursor-pointer text-xs shadow-md"
                >
                  Đóng & Tiếp Tục Học Tập
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
