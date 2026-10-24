/**
 * Real-time Streak Manager for AI Classroom
 *
 * Quy tắc tính Streak Thời Gian Thực:
 * 1. Chỉ khi người dùng thực sự TƯƠNG TÁC HỌC TẬP (làm bài tập, hỏi gia sư AI, nộp bài giải,
 *    giải bài tập trên lớp, nhận EXP học tập) thì chuỗi Streak mới được tích lũy / gia hạn.
 * 2. ĐĂNG NHẬP HOẶC TRUY CẬP ĐƠN THUẦN KHÔNG ĐƯỢC TÍNH / TĂNG STREAK.
 * 3. Nếu người dùng đã học hôm qua và học tiếp hôm nay: Streak tăng +1 ngày liên tục.
 * 4. Nếu người dùng đã học hôm nay rồi: Giữ nguyên Streak hôm nay (không tăng trùng lặp nhiều lần trong cùng 1 ngày).
 * 5. Nếu người dùng bỏ lỡ từ 1 ngày trở lên không học: Streak sẽ về 0; khi làm bài học mới sẽ bắt đầu lại từ 1.
 */

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  if (!dateStr1 || !dateStr2) return 9999;
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = d1.getTime() - d2.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export interface StreakEvaluation {
  streakDays: number;
  lastStudyDate?: string;
  hasStudiedToday: boolean;
  status: 'completed_today' | 'pending_today' | 'broken' | 'new';
  statusText: string;
}

/**
 * Kiểm tra trạng thái Streak khi người dùng đăng nhập / mở app
 * TUYỆT ĐỐI KHÔNG TĂNG STREAK TẠI ĐÂY!
 */
export function evaluateStreakOnAccess(currentStreak: number, lastStudyDate?: string): StreakEvaluation {
  const today = getLocalDateString();
  if (!lastStudyDate) {
    return {
      streakDays: 0,
      lastStudyDate: undefined,
      hasStudiedToday: false,
      status: 'new',
      statusText: 'Chưa có chuỗi học tập (Làm 1 bài tập hôm nay để bắt đầu!)',
    };
  }

  const diffDays = getDaysDifference(today, lastStudyDate);

  if (diffDays === 0) {
    // Người dùng đã hoàn thành tương tác học tập trong ngày hôm nay
    return {
      streakDays: Math.max(1, currentStreak || 1),
      lastStudyDate,
      hasStudiedToday: true,
      status: 'completed_today',
      statusText: 'Hôm nay bạn đã hoàn thành bài học! Chuỗi streak đang được giữ vững 🔥',
    };
  } else if (diffDays === 1) {
    // Đã học ngày hôm qua, hôm nay chưa học: Giữ nguyên streak chờ người dùng học hôm nay
    return {
      streakDays: Math.max(1, currentStreak || 1),
      lastStudyDate,
      hasStudiedToday: false,
      status: 'pending_today',
      statusText: 'Bạn chưa học hôm nay. Hoàn thành 1 bài tập để giữ và tăng chuỗi streak! ⏳',
    };
  } else {
    // Bỏ lỡ từ 1 ngày trở lên mà không học: Chuỗi bị gián đoạn
    return {
      streakDays: 0,
      lastStudyDate,
      hasStudiedToday: false,
      status: 'broken',
      statusText: 'Chuỗi học tập đã bị gián đoạn do bỏ lỡ ngày học. Hãy làm bài tập ngay để tạo chuỗi mới! 🚀',
    };
  }
}

/**
 * Ghi nhận tương tác học tập thực tế để gia hạn / tích lũy Streak
 * Chỉ gọi khi người dùng hoàn thành bài tập, tương tác với Gia sư AI, nộp bài giải, v.v.
 */
export function recordStudyInteraction(
  currentStreak: number,
  lastStudyDate?: string
): {
  streakDays: number;
  lastStudyDate: string;
  isNewIncrement: boolean;
  status: 'completed_today';
  celebrationMessage?: string;
} {
  const today = getLocalDateString();
  if (!lastStudyDate) {
    // Lần đầu tiên học tập
    return {
      streakDays: 1,
      lastStudyDate: today,
      isNewIncrement: true,
      status: 'completed_today',
      celebrationMessage: '🎉 Chúc mừng bạn đã bắt đầu chuỗi học tập: Ngày thứ 1!',
    };
  }

  const diffDays = getDaysDifference(today, lastStudyDate);

  if (diffDays === 0) {
    // Đã học trong ngày hôm nay rồi: Giữ nguyên streak, tiếp tục tích lũy EXP
    return {
      streakDays: Math.max(1, currentStreak || 1),
      lastStudyDate: today,
      isNewIncrement: false,
      status: 'completed_today',
    };
  } else if (diffDays === 1) {
    // Đã học hôm qua và hôm nay vừa hoàn thành bài học: TĂNG STREAK +1!
    const newStreak = (currentStreak || 0) + 1;
    return {
      streakDays: newStreak,
      lastStudyDate: today,
      isNewIncrement: true,
      status: 'completed_today',
      celebrationMessage: `🔥 Đỉnh nóc! Bạn vừa duy trì chuỗi học tập: ${newStreak} ngày liên tục!`,
    };
  } else {
    // Đã bỏ lỡ ngày trước: Khởi động lại streak ngày thứ 1
    return {
      streakDays: 1,
      lastStudyDate: today,
      isNewIncrement: true,
      status: 'completed_today',
      celebrationMessage: '🔥 Bắt đầu chuỗi học tập mới: 1 ngày liên tục! Hãy tiếp tục duy trì vào ngày mai nhé!',
    };
  }
}
