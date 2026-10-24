export interface BadgeItem {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  isUnlocked: boolean;
  isEquipped?: boolean;
}

export interface WeeklyAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  badgeReward: BadgeItem;
}

export interface UserProfile {
  isOnboarded: boolean;
  fullName: string;
  classGroup: string; // e.g. "2026-DHKT01"
  major: string; // e.g. "Khoa học Dữ liệu & AI"
  studentId: string; // e.g. "26110293"
  avatarUrl: string;
  level: number;
  exp: number;
  nextLevelExp: number;
  gpa: number; // e.g. 3.82
  studyHours: number;
  streakDays: number;
  lastActiveDate: string;
  lastStudyDate?: string; // YYYY-MM-DD của ngày gần nhất tương tác học tập
  unlockedLootboxes: number;
  inventory: MascotItem[];
  equippedMascot: EquippedMascot;
  equippedBadges?: string[]; // IDs of up to 3 equipped badges
  badges?: BadgeItem[];
  weeklyAchievements?: WeeklyAchievement[];
}

export interface MascotItem {
  id: string;
  name: string;
  type: 'hat' | 'outfit' | 'accessory' | 'streak_protection';
  icon: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isEquipped?: boolean;
}

export type MascotSpecies =
  | 'owl'       // 🦉 Cú thông thái
  | 'panda'     // 🐼 Gấu trúc
  | 'crocodile' // 🐊 Cá sấu
  | 'lion'      // 🦁 Sư tử
  | 'whale'     // 🐋 Cá voi
  | 'bear'      // 🐻 Bác Gấu
  | 'fox'       // 🦊 Cáo
  | 'penguin'   // 🐧 Chim cánh cụt
  | 'dragon'    // 🐲 Rồng thần
  | 'cat';      // 🐱 Mèo thần tài

export interface EquippedMascot {
  species?: MascotSpecies;
  hat?: string;
  outfit?: string;
  accessory?: string;
}

export interface Chapter {
  id: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  iconName: string;
  isCompleted: boolean;
  score?: number;
  feynmanConcept: {
    coreDefinition: string;
    simpleExplanation: string;
    realWorldAnalogy: string;
    diagramType: 'bar' | 'pie' | 'normal_curve' | 'tree' | 'flow';
    diagramData: any;
  };
  keyFormulas: Array<{
    name: string;
    formula: string;
    description: string;
    casioTip?: string;
  }>;
  roadmapSteps: string[];
  feynmanSteps: Array<{
    stepNumber: number;
    title: string;
    content: string;
  }>;
  practiceExamples: Array<{
    id: string;
    title: string;
    problem: string;
    given: string[];
    baremRubric: string;
    defaultStrategyHint: string;
    sampleSolution: string;
  }>;
  homeworkTasks: Array<{
    id: string;
    title: string;
    question: string;
    type: 'essay' | 'mcq';
    options?: string[];
    correctAnswerIndex?: number;
    explanation?: string;
  }>;
}

export interface HomeworkSubmission {
  chapterId: number;
  taskId: string;
  studentAnswer: string;
  canvasDataUrl?: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
}

export interface SimilarExercise {
  id: string;
  title: string;
  question: string;
  type: 'essay' | 'mcq';
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  strategyHint?: string;
  keyFormulas?: string[];
}

export interface VivaSession {
  chapterTitle: string;
  history: Array<{
    question: string;
    studentAnswer?: string;
    score?: number;
    feedback?: string;
  }>;
  currentQuestion?: string;
  totalScore: number;
  isFinished: boolean;
}

export interface MistakeRecord {
  id: string;
  chapterId: number;
  chapterTitle: string;
  sourceType: 'viva' | 'mcq' | 'essay' | 'homework';
  questionSummary: string;
  studentAnswer: string;
  correctConcept: string;
  rootCauseError: string; // e.g., "Nhầm lẫn giữa biến cố xung khắc và biến cố độc lập"
  remediationAdvice: string;
  timestamp: string;
  resolved?: boolean;
  options?: string[];
  correctIndex?: number;
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorClass: string;
  authorAvatar: string;
  timestamp: string;
  title: string;
  content: string;
  attachmentType?: 'image' | 'pdf' | 'doc' | 'exam';
  attachmentUrl?: string;
  attachmentName?: string;
  likes: number;
  commentsCount: number;
  comments: Array<{
    id: string;
    author: string;
    authorAvatar?: string;
    text: string;
    time: string;
    attachmentUrl?: string;
    attachmentName?: string;
  }>;
  isModerated?: boolean;
}

export interface ExamSet {
  id: string;
  title: string;
  durationMinutes: number;
  questionCount: number;
  category: 'Lý thuyết' | 'Tổng hợp' | 'Giữa kỳ' | 'Cuối kỳ';
  author: string;
  questions: Array<{
    id: string;
    text: string;
    type: 'essay' | 'mcq';
    options?: string[];
    correctIndex?: number;
    explanation?: string;
  }>;
  savedByUsersCount: number;
  isUserCreated?: boolean;
}

export interface AppUser {
  id: string;
  fullName: string;
  email: string;
  role: 'sinh_vien' | 'giang_vien' | 'nha_phat_trien';
  avatarUrl: string;
  studentId: string;
  university: string;
  classGroup: string;
  gpa: number;
  exp: number;
  level: number;
  streakDays: number;
  lastStudyDate?: string; // YYYY-MM-DD của ngày gần nhất tương tác học tập
  studyHours: number;
  exercisesSolved: number;
  accuracyRate: number;
  createdAt: string;
  lastActive: string;
  status: 'active' | 'suspended';
  recentActivity: Array<{
    action: string;
    detail: string;
    timestamp: string;
  }>;
}

export interface DevDatabaseStats {
  totalUsers: number;
  activeToday: number;
  totalExercisesSolved: number;
  averageGpa: number;
  storageUsageMb: number;
}

export type ActiveToolType =
  | 'learning'
  | 'image_grading'
  | 'voice_chat'
  | 'essay_generator'
  | 'mcq_generator'
  | 'viva_exam'
  | 'mistake_stats'
  | 'mindmap'
  | 'forum'
  | 'profile'
  | 'charts'
  | 'casio_calc'
  | 'math_processor'
  | 'developer_db'
  | 'wysiwyg_math'
  | 'big_doc_processor';
