import React, { useState } from 'react';
import { UserProfile, MascotItem, BadgeItem, WeeklyAchievement, MascotSpecies } from '../types/xstk';
import { Mascot } from './Mascot';
import { MASCOT_CATALOG, getMascotById } from '../data/mascotCatalog';
import {
  Award,
  Flame,
  Shield,
  Sparkles,
  User,
  Package,
  Gift,
  Check,
  Lock,
  Trophy,
  Crown,
  Medal,
  ChevronRight,
  Eye,
  X,
  Target,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  INITIAL_BADGES,
  INITIAL_WEEKLY_ACHIEVEMENTS,
  MOCK_LEADERBOARD_USERS,
  getRankTier,
  LeaderboardUser,
} from '../data/curriculumData';

interface AiProfileMascotProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onAddExp?: (amount: number, detail?: string) => void;
}

export const AiProfileMascot: React.FC<AiProfileMascotProps> = ({
  userProfile,
  onUpdateProfile,
  onAddExp,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'badges' | 'achievements' | 'ranking' | 'inventory' | 'lootbox'>('profile');
  const [openingLootbox, setOpeningLootbox] = useState(false);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  // Inspected peer modal state for ranking
  const [selectedPeer, setSelectedPeer] = useState<LeaderboardUser | null>(null);

  const currentBadges = userProfile.badges || INITIAL_BADGES;
  const equippedBadgeIds = userProfile.equippedBadges || ['badge_bayes', 'badge_casio', 'badge_gpa_star'];
  const weeklyAchievements = userProfile.weeklyAchievements || INITIAL_WEEKLY_ACHIEVEMENTS;

  const rankInfo = getRankTier(userProfile.exp);

  const toggleEquipBadge = (badge: BadgeItem) => {
    if (!badge.isUnlocked) {
      alert('Huy hiệu này chưa được mở khóa! Hãy hoàn thành mục tiêu tuần để nhận nhé.');
      return;
    }

    let updatedIds = [...equippedBadgeIds];
    if (updatedIds.includes(badge.id)) {
      updatedIds = updatedIds.filter((id) => id !== badge.id);
    } else {
      if (updatedIds.length >= 3) {
        alert('Bạn chỉ có thể gắn tối đa 3 huy hiệu tiêu biểu lên hồ sơ và bảng xếp hạng!');
        return;
      }
      updatedIds.push(badge.id);
    }

    onUpdateProfile({ equippedBadges: updatedIds });
  };

  const handleClaimAchievement = (ach: WeeklyAchievement) => {
    if (!ach.isCompleted || ach.isClaimed) return;

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
    });

    // Mark achievement claimed and unlock the corresponding badge
    const updatedAchs = weeklyAchievements.map((a) =>
      a.id === ach.id ? { ...a, isClaimed: true } : a
    );

    const updatedBadges = currentBadges.map((b) =>
      b.id === ach.badgeReward.id ? { ...b, isUnlocked: true } : b
    );

    onUpdateProfile({
      weeklyAchievements: updatedAchs,
      badges: updatedBadges,
    });

    if (onAddExp) {
      onAddExp(50, `Nhận thành tựu tuần: "${ach.title}" (+50 XP)`);
    }

    alert(`🎉 Chúc mừng bạn đã nhận Huy Hiệu "${ach.badgeReward.name}" ${ach.badgeReward.icon} và +50 XP! Hãy vào Kho Huy Hiệu để gắn lên hồ sơ nhé.`);
  };

  const toggleEquipItem = (item: MascotItem) => {
    const currentEquipped = { ...userProfile.equippedMascot };

    if (item.type === 'hat') {
      currentEquipped.hat = currentEquipped.hat === item.id ? undefined : item.id;
    } else if (item.type === 'outfit') {
      currentEquipped.outfit = currentEquipped.outfit === item.id ? undefined : item.id;
    } else if (item.type === 'accessory') {
      currentEquipped.accessory = currentEquipped.accessory === item.id ? undefined : item.id;
    }

    onUpdateProfile({ equippedMascot: currentEquipped });
  };

  const handleSelectMascotSpecies = (species: MascotSpecies) => {
    onUpdateProfile({
      equippedMascot: {
        ...userProfile.equippedMascot,
        species,
      },
    });
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleOpenLootbox = () => {
    if (userProfile.unlockedLootboxes <= 0) return;
    setOpeningLootbox(true);
    setRewardMsg(null);

    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      const rewards = [
        { name: 'Mũ Phù Thủy Bayes Mạ Vàng', icon: '🧙‍♂️', type: 'hat' as const, desc: 'Tăng 20% khả năng giải bài tập Bayes' },
        { name: 'Vé Bảo Vệ Chuỗi Streak 3 Ngày', icon: '🛡️', type: 'streak_protection' as const, desc: 'Bảo vệ streak khi nghỉ học' },
        { name: 'Casio FX-580VN X Kim Cương Neon', icon: '💎', type: 'accessory' as const, desc: 'Phụ kiện siêu hiếm' },
      ];

      const won = rewards[Math.floor(Math.random() * rewards.length)];

      const newItem: MascotItem = {
        id: `won_${Date.now()}`,
        name: won.name,
        type: won.type,
        icon: won.icon,
        description: won.desc,
        rarity: 'legendary',
        isEquipped: false,
      };

      onUpdateProfile({
        unlockedLootboxes: userProfile.unlockedLootboxes - 1,
        inventory: [...userProfile.inventory, newItem],
      });

      setRewardMsg(`🎉 Chúc mừng! Bạn mở được Rương Kho Báu: "${won.name}" ${won.icon}!`);
      setOpeningLootbox(false);
    }, 1500);
  };

  // Find equipped badges objects
  const equippedBadgeObjects = currentBadges.filter((b) => equippedBadgeIds.includes(b.id));

  // Merge current user into mock leaderboard for complete view
  const myLeaderboardEntry: LeaderboardUser = {
    id: 'my-user',
    fullName: `${userProfile.fullName} (Bạn)`,
    studentId: userProfile.studentId,
    avatarUrl: userProfile.avatarUrl || '👨‍🎓',
    classGroup: userProfile.classGroup,
    major: userProfile.major,
    exp: userProfile.exp,
    gpa: userProfile.gpa,
    streakDays: userProfile.streakDays,
    equippedBadges: equippedBadgeObjects,
  };

  const allLeaderboard = [...MOCK_LEADERBOARD_USERS, myLeaderboardEntry].sort((a, b) => b.exp - a.exp);
  const myRankPosition = allLeaderboard.findIndex((u) => u.id === 'my-user') + 1;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 text-white p-6 rounded-3xl shadow-[0_0_25px_rgba(6,182,212,0.2)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="text-5xl bg-cyan-500/20 p-3.5 rounded-2xl border border-cyan-500/40 backdrop-blur shadow-[0_0_15px_rgba(6,182,212,0.3)] shrink-0">
            {userProfile.avatarUrl && (userProfile.avatarUrl.startsWith('http') || userProfile.avatarUrl.startsWith('data:')) ? (
              <img src={userProfile.avatarUrl} alt={userProfile.fullName} className="w-14 h-14 rounded-xl object-cover" />
            ) : (
              <span>{userProfile.avatarUrl || '👨‍🎓'}</span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                {userProfile.fullName}
              </h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${rankInfo.color} flex items-center gap-1 shadow-xs`}>
                <span>{rankInfo.badge}</span>
                <span>{rankInfo.tier}</span>
              </span>
            </div>

            <p className="text-xs text-slate-300 font-medium mt-1">
              MSSV: {userProfile.studentId} • Lớp: {userProfile.classGroup} • Ngành: {userProfile.major}
            </p>

            {/* Badges Equipped Showcase */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5">
              <span className="text-[11px] font-bold text-slate-400">Huy hiệu gắn hồ sơ:</span>
              {equippedBadgeObjects.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic">Chưa gắn huy hiệu</span>
              ) : (
                equippedBadgeObjects.map((b) => (
                  <span
                    key={b.id}
                    title={`${b.name}: ${b.description}`}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-900 border border-cyan-400/50 rounded-full text-xs text-cyan-200 font-bold shadow-xs cursor-help"
                  >
                    <span>{b.icon}</span>
                    <span className="text-[11px]">{b.name}</span>
                  </span>
                ))
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3 text-xs font-bold">
              <span className="bg-cyan-950/80 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/40 shadow">
                Level {userProfile.level} ({userProfile.exp} XP)
              </span>
              <span className="bg-emerald-950/80 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 shadow">
                GPA Hệ 4: {userProfile.gpa} / 4.0
              </span>
              <span className="bg-amber-950/80 text-amber-300 px-3 py-1 rounded-full border border-amber-500/40 shadow flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Hạng #{myRankPosition} Toàn Trường
              </span>
            </div>
          </div>
        </div>

        {/* Live Mascot Preview */}
        <Mascot size="sm" equipped={userProfile.equippedMascot} speechText="Huy hiệu của bạn trông rất phong độ!" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-bold space-x-2 sm:space-x-6 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>1. Hồ Sơ & Đánh Giá</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`pb-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'badges'
              ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Medal className="w-3.5 h-3.5" />
          <span>2. Kho Huy Hiệu ({currentBadges.filter((b) => b.isUnlocked).length}/{currentBadges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('achievements')}
          className={`pb-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'achievements'
              ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>3. Thành Tựu Tuần ({weeklyAchievements.filter((a) => a.isCompleted).length}/{weeklyAchievements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ranking')}
          className={`pb-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'ranking'
              ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>4. Bảng Xếp Hạng & Ranking</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'inventory'
              ? 'border-b-2 border-cyan-400 text-cyan-300 font-black drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>5. Linh Vật & Rương ({userProfile.unlockedLootboxes})</span>
        </button>
      </div>

      {/* TAB 1: Profile & Assessment */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-4 bg-slate-900 border-2 border-cyan-500/30 rounded-2xl shadow-md">
              <p className="text-slate-300 font-bold mb-1">Chuỗi Streak</p>
              <p className="text-xl font-black text-cyan-400 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-cyan-400 text-cyan-400" />
                <span>{userProfile.streakDays} Ngày</span>
              </p>
            </div>

            <div className="p-4 bg-slate-900 border-2 border-cyan-500/30 rounded-2xl shadow-md">
              <p className="text-slate-300 font-bold mb-1">Điểm Hệ 4 (GPA)</p>
              <p className="text-xl font-black text-emerald-400 font-mono">{userProfile.gpa} / 4.0</p>
            </div>

            <div className="p-4 bg-slate-900 border-2 border-amber-500/30 rounded-2xl shadow-md">
              <p className="text-slate-300 font-bold mb-1">Bậc Xếp Hạng</p>
              <p className="text-xl font-black text-amber-400 font-mono">{rankInfo.badge} {rankInfo.tier}</p>
            </div>

            <div className="p-4 bg-slate-900 border-2 border-cyan-500/30 rounded-2xl shadow-md">
              <p className="text-slate-300 font-bold mb-1">Giờ Tích Lũy</p>
              <p className="text-xl font-black text-white font-mono">{userProfile.studyHours}h</p>
            </div>
          </div>

          {/* Rank Progress Card */}
          <div className="bg-slate-900 border-2 border-cyan-500/40 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-cyan-300">Tiến trình lên Hạng kế tiếp:</span>
              <span className="text-white font-mono">{userProfile.exp} / {rankInfo.nextTierExp} XP</span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (userProfile.exp / rankInfo.nextTierExp) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-300">
              💡 Mỗi bài tập trắc nghiệm đúng (+15 XP), bài tự luận (+30 XP) hoặc vượt qua 5 bước lý thuyết (+25 XP) sẽ giúp bạn nhanh chóng thăng hạng lên <strong>Cao thủ XSTK</strong>!
            </p>
          </div>

          <div className="bg-slate-900 border-2 border-cyan-500/30 p-5 rounded-2xl space-y-2">
            <h4 className="font-black text-cyan-300 text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Nhận Định Năng Lực Toàn Diện Từ Giảng Viên AI Classroom</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-medium">
              Bạn đạt phong độ rất vững vàng ở <strong className="text-cyan-300">Bài 1 (Bayes & Xác suất đầy đủ)</strong> và <strong className="text-cyan-300">Bài 3 (Phân phối Chuẩn & Casio fx-580VN X)</strong>. Hãy duy trì giải bài tập thường xuyên và ôn lại <strong className="text-emerald-300">Sổ Tay Câu Sai</strong> để bảo toàn mức GPA 4.0 tuyệt đối!
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Kho Huy Hiệu (Badge Warehouse) */}
      {activeTab === 'badges' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-white text-xs sm:text-sm">
                KHO HUY HIỆU & HUY CHƯƠNG THÀNH TỰU (BADGE WAREHOUSE)
              </h3>
              <p className="text-xs text-slate-300">
                Chọn tối đa 3 huy hiệu để trang trí lên hồ sơ cá nhân và bảng xếp hạng danh dự!
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-3 py-1 rounded-xl">
              Đã gắn: {equippedBadgeIds.length} / 3 huy hiệu
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {currentBadges.map((b) => {
              const isEquipped = equippedBadgeIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                    isEquipped
                      ? 'bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : b.isUnlocked
                      ? 'bg-slate-900/80 border-slate-700 hover:border-cyan-500/40'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 bg-slate-950 rounded-xl border border-slate-800">
                      {b.icon}
                    </span>
                    <span className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                      b.rarity === 'legendary'
                        ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                        : b.rarity === 'epic'
                        ? 'bg-purple-950 text-purple-300 border-purple-500/40'
                        : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {b.rarity}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>{b.name}</span>
                      {!b.isUnlocked && <Lock className="w-3 h-3 text-slate-500" />}
                    </h4>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {b.description}
                    </p>
                  </div>

                  <div>
                    {b.isUnlocked ? (
                      <button
                        onClick={() => toggleEquipBadge(b)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all ${
                          isEquipped
                            ? 'bg-rose-500 hover:bg-rose-600 text-white shadow'
                            : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        }`}
                      >
                        {isEquipped ? 'Gỡ Bỏ Khỏi Hồ Sơ' : 'Gắn Lên Hồ Sơ (Showcase)'}
                      </button>
                    ) : (
                      <div className="w-full py-2 px-3 rounded-xl text-[11px] font-bold text-center bg-slate-950 text-slate-500 border border-slate-800 flex items-center justify-center gap-1">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Chưa mở khóa</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Thành Tựu Tuần (Weekly Achievements) */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl flex items-center justify-between">
            <div>
              <h3 className="font-black text-white text-xs sm:text-sm">
                DANH SÁCH THÀNH TỰU TUẦN & HUY CHƯƠNG DANH DỰ
              </h3>
              <p className="text-xs text-slate-300">
                Hoàn thành các mốc nhiệm vụ để nhận huy hiệu độc quyền và +50 XP thưởng!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {weeklyAchievements.map((ach) => {
              const pct = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));
              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    ach.isClaimed
                      ? 'bg-slate-900/60 border-emerald-500/30'
                      : ach.isCompleted
                      ? 'bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-950/80 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    <span className="text-3xl p-2.5 bg-slate-950 rounded-2xl border border-slate-800 shrink-0">
                      {ach.icon}
                    </span>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-white text-xs sm:text-sm">{ach.title}</h4>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          [{ach.progress}/{ach.maxProgress}]
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{ach.description}</p>

                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 max-w-md">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto">
                    {ach.isClaimed ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Đã nhận huy hiệu
                      </span>
                    ) : ach.isCompleted ? (
                      <button
                        onClick={() => handleClaimAchievement(ach)}
                        className="w-full sm:w-auto py-2 px-4 bg-gradient-to-r from-amber-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Nhận Huy Hiệu ({ach.badgeReward.name})</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                        <span>Đang thực hiện ({pct}%)</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Bảng Xếp Hạng & Ranking */}
      {activeTab === 'ranking' && (
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <div>
              <div className="flex items-center gap-2 font-black text-amber-400 text-xs sm:text-sm">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>BẢNG XẾP HẠNG TOÀN DIỆN KHÓA XÁC SUẤT THỐNG KÊ (XSTK)</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Xếp hạng dựa trên tổng điểm kinh nghiệm (XP), điểm GPA hệ 4 và các danh hiệu huy chương đạt được!
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-black text-cyan-300 bg-slate-950 px-3 py-1 rounded-xl border border-cyan-500/40">
                Vị trí của bạn: #{myRankPosition}
              </span>
            </div>
          </div>

          {/* Ranking Tiers Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2.5 bg-amber-950/40 border border-amber-700/50 rounded-xl">
              <span className="text-base">🥉</span>
              <p className="font-bold text-amber-700">Đồng</p>
              <p className="text-[10px] text-slate-400 font-mono">0 - 299 XP</p>
            </div>
            <div className="p-2.5 bg-slate-800/60 border border-slate-500/50 rounded-xl">
              <span className="text-base">🥈</span>
              <p className="font-bold text-slate-200">Bạc</p>
              <p className="text-[10px] text-slate-400 font-mono">300 - 699 XP</p>
            </div>
            <div className="p-2.5 bg-yellow-950/50 border border-yellow-500/50 rounded-xl">
              <span className="text-base">🥇</span>
              <p className="font-bold text-yellow-300">Vàng</p>
              <p className="text-[10px] text-slate-400 font-mono">700 - 1299 XP</p>
            </div>
            <div className="p-2.5 bg-cyan-950/60 border border-cyan-400/50 rounded-xl">
              <span className="text-base">💎</span>
              <p className="font-bold text-cyan-300">Kim Cương</p>
              <p className="text-[10px] text-slate-400 font-mono">1300 - 2499 XP</p>
            </div>
            <div className="col-span-2 sm:col-span-1 p-2.5 bg-amber-950/80 border border-amber-400/60 rounded-xl shadow-[0_0_10px_rgba(245,158,11,0.3)]">
              <span className="text-base">👑</span>
              <p className="font-bold text-amber-300">Cao thủ XSTK</p>
              <p className="text-[10px] text-amber-400/90 font-mono">2500+ XP</p>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-3xl overflow-hidden shadow-lg">
            <div className="divide-y divide-slate-800">
              {allLeaderboard.map((u, idx) => {
                const uRank = getRankTier(u.exp);
                const isMe = u.id === 'my-user';
                return (
                  <div
                    key={u.id}
                    onClick={() => setSelectedPeer(u)}
                    className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer transition-all ${
                      isMe
                        ? 'bg-cyan-950/40 border-l-4 border-cyan-400 hover:bg-cyan-950/60'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                      </div>

                      <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xl shrink-0">
                        {u.avatarUrl && (u.avatarUrl.startsWith('http') || u.avatarUrl.startsWith('data:')) ? (
                          <img src={u.avatarUrl} alt={u.fullName} className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                          <span>{u.avatarUrl || '👨‍🎓'}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`font-bold text-xs sm:text-sm ${isMe ? 'text-cyan-300 font-black' : 'text-white'}`}>
                            {u.fullName}
                          </span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${uRank.color}`}>
                            {uRank.badge} {uRank.tier}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          MSSV: {u.studentId} • Lớp: {u.classGroup}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                      {/* Equipped Badges */}
                      <div className="flex items-center gap-1">
                        {u.equippedBadges.map((b) => (
                          <span
                            key={b.id}
                            title={`${b.name}: ${b.description}`}
                            className="p-1 bg-slate-950 rounded-lg border border-slate-700 text-xs"
                          >
                            {b.icon}
                          </span>
                        ))}
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-black text-white font-mono block">
                          {u.exp} XP
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold block">
                          GPA: {u.gpa}
                        </span>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Inventory & Lootbox */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Mascot Companion Selection */}
          <div className="bg-slate-900/80 border-2 border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🐾</span>
                <div>
                  <h3 className="font-black text-sm text-white flex items-center gap-2">
                    <span>CHỌN BẠN ĐỒNG HÀNH XSTK (10 LINH VẬT HUB)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                      AI Classroom Mascot Hub
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Linh vật bạn chọn sẽ xuất hiện cổ vũ trong suốt quá trình học và hiển thị trên toàn bộ trang web!
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 px-3 py-1 rounded-full border border-cyan-500/40">
                Đang chọn: {getMascotById(userProfile.equippedMascot?.species || 'owl').name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {MASCOT_CATALOG.map((m) => {
                const isSelected = (userProfile.equippedMascot?.species || 'owl') === m.species;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMascotSpecies(m.species)}
                    className={`relative p-3 rounded-xl border-2 text-left transition-all group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] ring-2 ring-cyan-400/30'
                        : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                        ✓ Đang chọn
                      </span>
                    )}
                    <div>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-2 flex items-center justify-center rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/80 group-hover:scale-110 transition-transform shadow-md">
                        {m.imageUrl ? (
                          <img
                            src={m.imageUrl}
                            alt={m.name}
                            className="w-full h-full object-cover rounded-2xl select-none"
                            style={{ imageRendering: 'pixelated' }}
                          />
                        ) : (
                          <span className="text-3xl sm:text-4xl">{m.emoji}</span>
                        )}
                      </div>
                      <div className="font-black text-xs text-white text-center">{m.name}</div>
                      <div className="text-[10px] text-cyan-300 font-semibold text-center">{m.role}</div>
                      <div className="text-[10px] text-slate-400 text-center line-clamp-1 mt-0.5">
                        {m.personalityTag}
                      </div>
                    </div>
                    <div
                      className={`mt-2 py-1 text-center text-[10px] font-bold rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300'
                      }`}
                    >
                      {isSelected ? 'Đang kích hoạt' : 'Chọn linh vật'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="font-black text-xs sm:text-sm text-white">
              TRANG PHỤC & PHỤ KIỆN LINH VẬT ĐÃ THU THẬP:
            </h3>
            <button
              onClick={() => setActiveTab('lootbox')}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow flex items-center gap-1"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Mở Rương Kho Báu ({userProfile.unlockedLootboxes})</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userProfile.inventory.map((item) => {
              const isEquipped =
                userProfile.equippedMascot.hat === item.id ||
                userProfile.equippedMascot.outfit === item.id ||
                userProfile.equippedMascot.accessory === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-2.5 ${
                    isEquipped
                      ? 'bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-950 border-slate-800 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-1 bg-slate-900 rounded-xl border border-slate-700">{item.icon}</span>
                    <span className="text-[10px] font-mono uppercase bg-cyan-950/80 text-cyan-300 font-bold px-2.5 py-0.5 rounded border border-cyan-500/40">
                      {item.rarity}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-white text-xs">{item.name}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 font-medium">{item.description}</p>
                  </div>

                  <button
                    onClick={() => toggleEquipItem(item)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all ${
                      isEquipped
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow'
                        : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    }`}
                  >
                    {isEquipped ? 'Gỡ Bỏ' : 'Trang Bị Lên Linh Vật'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 6: Lootbox */}
      {activeTab === 'lootbox' && (
        <div className="bg-slate-900 border-2 border-cyan-500/30 p-8 rounded-3xl text-center space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
          <div className="w-20 h-20 bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-lg animate-bounce">
            🎁
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">
              Bạn Đang Có {userProfile.unlockedLootboxes} Rương Kho Báu
            </h3>
            <p className="text-xs text-slate-300 font-medium">Mở rương hoàn thành bài học để nhận vật phẩm trang phục hoặc vé bảo vệ streak!</p>
          </div>

          {rewardMsg && (
            <div className="p-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 rounded-xl text-xs font-bold animate-pulse max-w-md mx-auto">
              {rewardMsg}
            </div>
          )}

          <button
            onClick={handleOpenLootbox}
            disabled={openingLootbox || userProfile.unlockedLootboxes <= 0}
            className="py-3 px-8 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{openingLootbox ? 'Đang mở Rương Kho Báu...' : 'MỞ RƯƠNG NGAY'}</span>
          </button>
        </div>
      )}

      {/* Peer Profile Modal (When clicking a student in Leaderboard) */}
      {selectedPeer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-400/60 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-black text-cyan-300 text-xs">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>HỒ SƠ NGƯỜI HỌC TRÊN BẢNG XẾP HẠNG</span>
              </div>
              <button onClick={() => setSelectedPeer(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center text-3xl shrink-0">
                {selectedPeer.avatarUrl && (selectedPeer.avatarUrl.startsWith('http') || selectedPeer.avatarUrl.startsWith('data:')) ? (
                  <img src={selectedPeer.avatarUrl} alt={selectedPeer.fullName} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <span>{selectedPeer.avatarUrl || '👨‍🎓'}</span>
                )}
              </div>
              <div>
                <h3 className="font-black text-white text-base">{selectedPeer.fullName}</h3>
                <p className="text-xs text-slate-300">MSSV: {selectedPeer.studentId} • {selectedPeer.classGroup}</p>
                <p className="text-[11px] text-cyan-400 font-medium">{selectedPeer.major}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-[10px]">Cấp Bậc</p>
                <p className="font-black text-amber-300 mt-0.5">{getRankTier(selectedPeer.exp).tier}</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-[10px]">Điểm GPA</p>
                <p className="font-black text-emerald-400 font-mono mt-0.5">{selectedPeer.gpa} / 4.0</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-slate-400 text-[10px]">Tích Lũy XP</p>
                <p className="font-black text-white font-mono mt-0.5">{selectedPeer.exp} XP</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Huy hiệu thành tựu đã gắn:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPeer.equippedBadges.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Người học chưa gắn huy hiệu nào</p>
                ) : (
                  selectedPeer.equippedBadges.map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 bg-slate-950 rounded-xl border border-cyan-500/40 flex items-center gap-2 text-xs"
                    >
                      <span className="text-xl">{b.icon}</span>
                      <div>
                        <p className="font-bold text-white text-[11px]">{b.name}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{b.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setSelectedPeer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};