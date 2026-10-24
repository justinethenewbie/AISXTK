import { Chapter, ExamSet, MascotItem, BadgeItem, WeeklyAchievement } from '../types/xstk';

export const INITIAL_BADGES: BadgeItem[] = [
  {
    id: 'badge_bayes',
    name: 'Chiến Binh Bayes',
    icon: '🧙‍♂️',
    rarity: 'legendary',
    description: 'Nắm vững bản chất xác suất có điều kiện, xác suất toàn phần và công thức suy diễn Bayes.',
    isUnlocked: true,
    isEquipped: true,
  },
  {
    id: 'badge_casio',
    name: 'Phù Thủy Casio 580',
    icon: '🧮',
    rarity: 'epic',
    description: 'Thành thạo bấm máy Casio fx-580VN X Menu 6 (Thống kê) và Menu 7 (Phân phối xác suất).',
    isUnlocked: true,
    isEquipped: true,
  },
  {
    id: 'badge_gpa_star',
    name: 'Thủ Khoa GPA 4.0',
    icon: '🌟',
    rarity: 'legendary',
    description: 'Đạt GPA hệ 4 từ 3.8 trở lên trong các kỳ thi trắc nghiệm và tự luận toàn diện.',
    isUnlocked: true,
    isEquipped: true,
  },
  {
    id: 'badge_streak',
    name: 'Chuyên Cần Vô Địch',
    icon: '🔥',
    rarity: 'rare',
    description: 'Duy trì chuỗi học tập 7 ngày liên tiếp không bỏ lỡ một buổi nào.',
    isUnlocked: true,
    isEquipped: false,
  },
  {
    id: 'badge_poisson',
    name: 'Bậc Thầy Poisson & Chuẩn',
    icon: '⚡',
    rarity: 'epic',
    description: 'Mô hình hóa chính xác các bài toán phân phối Poisson và Phân phối chuẩn Gauss.',
    isUnlocked: false,
    isEquipped: false,
  },
  {
    id: 'badge_no_mistake',
    name: 'Chiến Kê Xóa Sổ Lỗi Sai',
    icon: '🎯',
    rarity: 'rare',
    description: 'Ôn tập và sửa chữa thành công toàn bộ các câu hỏi trong Sổ Tay Câu Sai.',
    isUnlocked: false,
    isEquipped: false,
  },
];

export const INITIAL_WEEKLY_ACHIEVEMENTS: WeeklyAchievement[] = [
  {
    id: 'ach_dialogue',
    title: 'Nắm Vững Bản Chất 5 Bước',
    description: 'Bấm "Ok em đã hiểu" vượt qua trọn vẹn cả 5 bước học lý thuyết 1-1 với Thầy AI.',
    icon: '🎓',
    progress: 5,
    maxProgress: 5,
    isCompleted: true,
    isClaimed: true,
    badgeReward: INITIAL_BADGES[0], // Chiến Binh Bayes
  },
  {
    id: 'ach_casio',
    title: 'Siêu Tốc Bấm Máy Casio 580',
    description: 'Bấm Menu 6 hoặc Menu 7 tính phân phối hoặc thống kê mẫu từ 5 bài toán trở lên.',
    icon: '🧮',
    progress: 5,
    maxProgress: 5,
    isCompleted: true,
    isClaimed: true,
    badgeReward: INITIAL_BADGES[1], // Phù Thủy Casio
  },
  {
    id: 'ach_streak',
    title: 'Kỷ Luật Tuần Chuyên Cần',
    description: 'Duy trì chuỗi học liên tiếp 7 ngày trong tuần.',
    icon: '🔥',
    progress: 7,
    maxProgress: 7,
    isCompleted: true,
    isClaimed: true,
    badgeReward: INITIAL_BADGES[3], // Chuyên Cần Vô Địch
  },
  {
    id: 'ach_mcq',
    title: 'Thợ Săn Trắc Nghiệm',
    description: 'Làm đúng 15 câu hỏi trắc nghiệm khách quan trên hệ thống.',
    icon: '⚡',
    progress: 12,
    maxProgress: 15,
    isCompleted: false,
    isClaimed: false,
    badgeReward: INITIAL_BADGES[4], // Bậc Thầy Poisson
  },
  {
    id: 'ach_retry',
    title: 'Chiến Binh Phục Thù Câu Sai',
    description: 'Luyện tập lại và giải đúng 3 câu hỏi từng bị sai trong Sổ Tay Câu Sai.',
    icon: '🎯',
    progress: 2,
    maxProgress: 3,
    isCompleted: false,
    isClaimed: false,
    badgeReward: INITIAL_BADGES[5], // Chiến Kê Xóa Sổ Lỗi Sai
  },
];

export interface LeaderboardUser {
  id: string;
  fullName: string;
  studentId: string;
  avatarUrl: string;
  classGroup: string;
  major: string;
  exp: number;
  gpa: number;
  streakDays: number;
  equippedBadges: BadgeItem[];
}

export const MOCK_LEADERBOARD_USERS: LeaderboardUser[] = [
  {
    id: 'top-1',
    fullName: 'Nguyễn Minh Tuấn',
    studentId: '26110102',
    avatarUrl: '👨‍🎓',
    classGroup: '2026-DHKT01',
    major: 'Khoa học Dữ liệu',
    exp: 3420,
    gpa: 3.96,
    streakDays: 14,
    equippedBadges: [INITIAL_BADGES[0], INITIAL_BADGES[2], INITIAL_BADGES[1]],
  },
  {
    id: 'top-2',
    fullName: 'Trần Thu Hà',
    studentId: '26110341',
    avatarUrl: '👩‍🎓',
    classGroup: '2026-DHKT02',
    major: 'Toán Ứng Dụng',
    exp: 2890,
    gpa: 3.91,
    streakDays: 10,
    equippedBadges: [INITIAL_BADGES[2], INITIAL_BADGES[3], INITIAL_BADGES[4]],
  },
  {
    id: 'top-4',
    fullName: 'Lê Quốc Bảo',
    studentId: '26110088',
    avatarUrl: '👨‍💼',
    classGroup: '2026-DHKT01',
    major: 'Kỹ Thuật Phần Mềm',
    exp: 1840,
    gpa: 3.75,
    streakDays: 8,
    equippedBadges: [INITIAL_BADGES[1], INITIAL_BADGES[5]],
  },
  {
    id: 'top-5',
    fullName: 'Phạm Hoàng Nam',
    studentId: '26110512',
    avatarUrl: '🧑‍💻',
    classGroup: '2026-DHKT03',
    major: 'Trí Tuệ Nhân Tạo',
    exp: 980,
    gpa: 3.65,
    streakDays: 5,
    equippedBadges: [INITIAL_BADGES[3]],
  },
  {
    id: 'top-6',
    fullName: 'Đặng Thùy Dương',
    studentId: '26110776',
    avatarUrl: '👩‍🏫',
    classGroup: '2026-DHKT02',
    major: 'Thống Kê Kinh Tế',
    exp: 540,
    gpa: 3.42,
    streakDays: 4,
    equippedBadges: [INITIAL_BADGES[3]],
  },
  {
    id: 'top-7',
    fullName: 'Vũ Hải Đăng',
    studentId: '26110419',
    avatarUrl: '🧑‍🚀',
    classGroup: '2026-DHKT01',
    major: 'Khoa Học Máy Tính',
    exp: 220,
    gpa: 3.10,
    streakDays: 2,
    equippedBadges: [],
  },
];

export function getRankTier(exp: number): {
  tier: 'Đồng' | 'Bạc' | 'Vàng' | 'Kim Cương' | 'Cao thủ XSTK';
  color: string;
  badge: string;
  nextTierExp: number;
} {
  if (exp >= 2500) {
    return { tier: 'Cao thủ XSTK', color: 'text-amber-300 border-amber-400 bg-amber-950/80', badge: '👑', nextTierExp: 5000 };
  }
  if (exp >= 1300) {
    return { tier: 'Kim Cương', color: 'text-cyan-300 border-cyan-400 bg-cyan-950/80', badge: '💎', nextTierExp: 2500 };
  }
  if (exp >= 700) {
    return { tier: 'Vàng', color: 'text-yellow-300 border-yellow-400 bg-yellow-950/80', badge: '🥇', nextTierExp: 1300 };
  }
  if (exp >= 300) {
    return { tier: 'Bạc', color: 'text-slate-200 border-slate-300 bg-slate-800/80', badge: '🥈', nextTierExp: 700 };
  }
  return { tier: 'Đồng', color: 'text-amber-700 border-amber-600 bg-amber-950/40', badge: '🥉', nextTierExp: 300 };
}

export const INITIAL_MASCOT_ITEMS: MascotItem[] = [
  {
    id: 'hat_grad',
    name: 'Mũ Cử Nhân Thống Kê',
    type: 'hat',
    icon: '🎓',
    description: 'Chiếc mũ cử nhân chứng nhận học sinh xuất sắc XSTK.',
    rarity: 'rare',
    isEquipped: true,
  },
  {
    id: 'glasses_smart',
    name: 'Kính Trí Tuệ AI',
    type: 'accessory',
    icon: '👓',
    description: 'Tăng 15% tốc độ nhận diện công thức toán học.',
    rarity: 'epic',
    isEquipped: true,
  },
  {
    id: 'robe_gold',
    name: 'Áo Choàng Thầy Phù Thủy Bayes',
    type: 'outfit',
    icon: '🥼',
    description: 'Áo choàng nghiên cứu phân phối xác suất.',
    rarity: 'legendary',
    isEquipped: true,
  },
  {
    id: 'badge_top',
    name: 'Huy Hiệu Streak Safe',
    type: 'streak_protection',
    icon: '🛡️',
    description: 'Bảo vệ chuỗi Streak học tập khi bận thi cử.',
    rarity: 'epic',
    isEquipped: false,
  },
  {
    id: 'item_casio_gold',
    name: 'Casio FX-580VN X Mạ Vàng',
    type: 'accessory',
    icon: '🧮',
    description: 'Bảo bối bấm máy Menu 7 cực nhanh.',
    rarity: 'legendary',
    isEquipped: false,
  },
];

export const CHAPTERS_DATA: Chapter[] = [
  {
    id: 1,
    title: 'Bài 1: Xác Suất và Công Thức Tính Xác Suất',
    shortTitle: 'Bài 1: Xác suất cơ bản',
    subtitle: 'Khái niệm biến cố, công thức cộng, công thức nhân, xác suất có điều kiện, Bayes & Bernoulli',
    iconName: 'Percent',
    isCompleted: true,
    score: 9.5,
    feynmanConcept: {
      coreDefinition:
        'Xác suất là tỷ lệ dự đoán về khả năng xảy ra của một hiện tượng ngẫu nhiên chưa biết trước kết quả.',
      simpleExplanation:
        'Hình dung ngân hàng cho 1.000 doanh nghiệp vay vốn, trong đó có 50 doanh nghiệp vỡ nợ. Tỷ lệ không trả được nợ là 50/1000 = 5%. Xác suất ở đây giúp ngân hàng tính toán lập quỹ dự phòng rủi ro để không bị phá sản.',
      realWorldAnalogy: 'Tung đồng xu hoặc lập quỹ dự phòng rủi ro tín dụng tài chính ngân hàng.',
      diagramType: 'bar',
      diagramData: [
        { name: 'Trả đúng hạn', value: 950 },
        { name: 'Trả chậm', value: 30 },
        { name: 'Không trả (Vỡ nợ)', value: 20 },
      ],
    },
    keyFormulas: [
      {
        name: 'Định nghĩa cổ điển',
        formula: 'P(A) = \\frac{n_A}{n_\\Omega}',
        description: 'Tỷ lệ số kết quả thuận lợi cho biến cố A trên tổng số kết quả đồng khả năng.',
      },
      {
        name: 'Công thức cộng xác suất',
        formula: 'P(A + B) = P(A) + P(B) - P(A \\cdot B)',
        description: 'Nếu A, B xung khắc (A \\cdot B = \\emptyset) thì P(A+B) = P(A) + P(B).',
      },
      {
        name: 'Xác suất có điều kiện',
        formula: 'P(A|B) = \\frac{P(A \\cdot B)}{P(B)}',
        description: 'Xác suất biến cố A xảy ra khi biết biến cố B đã xảy ra.',
      },
      {
        name: 'Công thức Bernoulli',
        formula: 'P_n(k) = C_n^k \\cdot p^k \\cdot q^{n-k}',
        description: 'Xác suất có đúng k lần xuất hiện biến cố A trong n phép thử độc lập.',
        casioTip: 'Dùng phím Menu 7 -> Binomial PD để tính nhanh P_n(k).',
      },
      {
        name: 'Công thức Bayes',
        formula: 'P(H_i|A) = \\frac{P(H_i) \\cdot P(A|H_i)}{\\sum_{j=1}^n P(H_j) \\cdot P(A|H_j)}',
        description: 'Tính xác suất của nguyên nhân H_i khi biết kết quả A đã xảy ra.',
      },
    ],
    roadmapSteps: [
      '1. Hiểu phép thử, Không gian mẫu (\\Omega) & Biến cố',
      '2. Phân biệt biến cố Xung khắc, Độc lập, Biến cố đối (A, \\bar{A})',
      '3. Áp dụng Công thức cộng và nhân xác suất',
      '4. Làm chủ Xác suất có điều kiện P(A|B)',
      '5. Thành thạo Công thức Bernoulli, Xác suất đầy đủ & Bayes',
    ],
    feynmanSteps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Đặt Vấn Đề Thực Tế (Teacher Hook)',
        content:
          'Chào các em! Thầy xin đặt một vấn đề thực tế: Một ngân hàng cho 200 doanh nghiệp vay tổng cộng 4.512 tỷ đồng. Theo thống kê lịch sử, xác suất vỡ nợ là 5% và khả năng thu hồi tài sản thế chấp đạt 80%. Vậy ngân hàng cần lập quỹ dự phòng rủi ro bao nhiêu tỷ đồng để đảm bảo an toàn vốn vay? Việc dự đoán này chính là ứng dụng trực tiếp của Xác Suất Thống Kê!',
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Giảng Giải Bản Chất Khái Niệm',
        content:
          'Thầy muốn các em hiểu: Phép thử ngẫu nhiên là một hành động mà kết quả không thể biết trước chắc chắn (như tung xúc xắc hay theo dõi tình trạng trả nợ của khách hàng). Tập hợp tất cả các kết quả có thể xảy ra tạo thành Không gian mẫu \\Omega. Biến cố A là một tập con của \\Omega. Đừng bao giờ học vẹt công thức, hãy luôn nhớ: Xác suất P(A) đo lường cơ hội xảy ra của A!',
      },
      {
        stepNumber: 3,
        title: 'Bước 3: Xây Dựng Công Thức Toán & Ký Hiệu KaTeX',
        content:
          'Thầy hướng dẫn cách áp dụng hai quy tắc vàng:\n1) Quy tắc cộng: P(A+B) = P(A) + P(B) - P(AB). Nếu A và B xung khắc (không thể cùng xảy ra), P(AB) = 0.\n2) Xác suất có điều kiện: P(A|B) = \\frac{P(AB)}{P(B)}, tức xác suất A xảy ra khi đã biết B xảy ra.\n3) Công thức Bayes: P(H_i|A) = \\frac{P(H_i)P(A|H_i)}{\\sum P(H_j)P(A|H_j)}.',
      },
      {
        stepNumber: 4,
        title: 'Bước 4: Các Ví Dụ Mẫu Chi Tiết Từ Giáo Viên',
        content:
          'Thầy làm mẫu 3 ví dụ thực tế:\n• Ví dụ 1: Đầu tư cổ phiếu & trái phiếu -> P(A+B) = 0.6 + 0.5 - 0.3 = 0.8 (80%).\n• Ví dụ 2: Lợi nhuận quý công ty công bố tốt P(B)=0.6, cổ phiếu tăng giá P(AB)=0.4 -> Xác suất tăng giá khi biết lợi nhuận tốt P(A|B) = 0.4/0.6 = 66.7%.\n• Ví dụ 3: Tung 3 lần con xúc xắc, xác suất xuất hiện mặt 6 chấm đúng 2 lần theo Bernoulli P_3(2) = C_3^2 (1/6)^2 (5/6) = 5/72.',
      },
    ],
    practiceExamples: [
      {
        id: 'ex1_1',
        title: 'Ví dụ 1: Đầu tư tài chính & Công thức cộng',
        problem:
          'Một nhà đầu tư dự định đầu tư vào Cổ phiếu (xác suất sinh lời 60%) và Trái phiếu (xác suất sinh lời 50%). Xác suất để CẢ HAI cùng sinh lời là 30%. Tính xác suất để nhà đầu tư có ít nhất một khoản đầu tư sinh lời?',
        given: ['P(A) = 0.6 (Cổ phiếu)', 'P(B) = 0.5 (Trái phiếu)', 'P(AB) = 0.3 (Cả hai)'],
        baremRubric: 'Gọi biến cố (2đ) - Công thức cộng (3đ) - Thay số & tính đúng (3đ) - Kết luận kinh tế (2đ)',
        defaultStrategyHint:
          'Gọi A="Cổ phiếu sinh lời", B="Trái phiếu sinh lời". "Có ít nhất 1 khoản sinh lời" tương ứng biến cố tổng A + B. Sử dụng công thức P(A + B) = P(A) + P(B) - P(AB).',
        sampleSolution:
          'Gọi A="Cổ phiếu sinh lời", B="Trái phiếu sinh lời". Ta có P(A)=0.6, P(B)=0.5, P(AB)=0.3.\nXác suất cần tìm P(A+B) = P(A) + P(B) - P(AB) = 0.6 + 0.5 - 0.3 = 0.8 (80%).',
      },
      {
        id: 'ex1_2',
        title: 'Ví dụ 2: Phân tích điểm tín dụng & Xác suất có điều kiện',
        problem:
          'Trong 100 khách hàng vay vốn có 90 khách hàng có điểm tín dụng >750, có 85 khách hàng đã trả nợ đúng hạn trong 6 tháng qua (P(AB) = 0.85, P(B) = 0.90). Tính xác suất khách hàng trả nợ đúng hạn khi biết họ có điểm tín dụng >750?',
        given: ['P(B) = 0.90 (Điểm tín dụng >750)', 'P(AB) = 0.85 (Điểm tín dụng tốt VÀ Trả đúng hạn)'],
        baremRubric: 'Công thức xác suất điều kiện (3đ) - Tính toán (4đ) - Ý nghĩa tài chính (3đ)',
        defaultStrategyHint: 'Sử dụng công thức xác suất có điều kiện P(A|B) = P(AB) / P(B) = 0.85 / 0.90.',
        sampleSolution: 'P(A|B) = \\frac{0.85}{0.90} = 0.9444 (94.44%).\nNghĩa là khách hàng có điểm tín dụng >750 thì khả năng trả nợ đúng hạn lên tới 94.44%.',
      },
      {
        id: 'ex1_3',
        title: 'Ví dụ 3: Bayes trong kiểm soát chất lượng bóng đèn',
        problem:
          'Nhà máy có 3 máy A, B, C sản xuất bóng đèn chiếm tỷ lệ 25%, 35%, 40%. Tỷ lệ phế phẩm lần lượt là 3%, 2%, 1%. Mua 1 bóng đèn thấy bị hỏng. Tính xác suất bóng này do máy C sản xuất?',
        given: ['P(H1)=0.25, P(H2)=0.35, P(H3)=0.40', 'P(L|H1)=0.03, P(L|H2)=0.02, P(L|H3)=0.01'],
        baremRubric: 'Hệ biến cố đầy đủ (2đ) - Xác suất đầy đủ P(Lỗi) (4đ) - Bayes P(H3|Lỗi) (4đ)',
        defaultStrategyHint: '1) P(Lỗi) = 0.25*0.03 + 0.35*0.02 + 0.40*0.01 = 0.0185 (1.85%).\n2) Bayes P(H3|Lỗi) = (0.40*0.01) / 0.0185 = 0.2162 (21.62%).',
        sampleSolution: 'P(Lỗi) = 0.0185.\nP(H3|Lỗi) = \\frac{0.40 \\times 0.01}{0.0185} = 0.2162 (21.62%).',
      },
    ],
    homeworkTasks: [
      {
        id: 'hw1_1',
        title: 'Bài tập 1: Biểu diễn biến cố sản phẩm tốt/xấu',
        question:
          'Kiểm tra ngẫu nhiên 3 sản phẩm. Gọi A_k = "Sản phẩm thứ k tốt" (k=1,2,3). Biểu diễn biến cố B: "Có ít nhất 1 sản phẩm xấu" qua A_k?',
        type: 'essay',
      },
      {
        id: 'hw1_2',
        title: 'Bài tập 2: Khảo sát khách hàng nam/nữ thu nhập cao',
        question:
          'Khảo sát 100 khách hàng ngân hàng: 80 khách nam, 20 khách nữ. Có 80 khách điểm tín dụng >750, trong đó 70 người thu nhập >30 triệu/tháng. Chọn ngẫu nhiên 1 người, tính xác suất gặp khách nam có điểm tín dụng >750?',
        type: 'essay',
      },
      {
        id: 'hw1_3',
        title: 'Bài tập 3: Trắc nghiệm trừ điểm & Công thức Bernoulli',
        question:
          'Bài thi 20 câu hỏi trắc nghiệm (mỗi câu 4 lựa chọn). Chọn bừa ngẫu nhiên. Đúng được +0.5 điểm, sai trừ 0.1 điểm. Tính xác suất để học sinh được đúng 7.6 điểm (tương ứng đúng 16 câu, sai 4 câu)?',
        type: 'essay',
      },
      {
        id: 'hw1_4',
        title: 'Bài tập 4: Rủi ro bảo hiểm y tế khách hàng',
        question:
          'Công ty bảo hiểm phân loại khách hàng: 40% nhóm 18-30 tuổi (xác suất bồi thường 0.1), 35% nhóm 31-50 tuổi (xác suất bồi thường 0.3), 25% nhóm >50 tuổi (xác suất bồi thường 0.6). Tính tỷ lệ khách hàng yêu cầu bồi thường chung?',
        type: 'essay',
      },
    ],
  },
  {
    id: 2,
    title: 'Bài 2: Biến Ngẫu Nhiên và Các Đặc Trưng Số',
    shortTitle: 'Bài 2: Biến ngẫu nhiên',
    subtitle: 'Biến ngẫu nhiên rời rạc & liên tục, Hàm mật độ, Mode, Kỳ vọng E(X), Phương sai Var(X)',
    iconName: 'Calculator',
    isCompleted: true,
    score: 9.0,
    feynmanConcept: {
      coreDefinition:
        'Biến ngẫu nhiên X là một quy tắc gán mỗi kết quả của phép thử ngẫu nhiên với một số thực.',
      simpleExplanation:
        'Thay vì ghi "Sấp" hay "Ngửa" khi tung đồng xu, ta đặt X=1 nếu Sấp, X=0 nếu Ngửa. Hoặc X là lãi suất cho vay ngân hàng trong tương lai (8%, 12%).',
      realWorldAnalogy: 'Đo lường mức độ rủi ro phương sai Var(X) trong danh mục đầu tư chứng khoán.',
      diagramType: 'normal_curve',
      diagramData: [
        { x: -3, y: 0.004 },
        { x: -2, y: 0.054 },
        { x: -1, y: 0.242 },
        { x: 0, y: 0.398 },
        { x: 1, y: 0.242 },
        { x: 2, y: 0.054 },
        { x: 3, y: 0.004 },
      ],
    },
    keyFormulas: [
      {
        name: 'Kỳ vọng E(X) rời rạc',
        formula: 'E(X) = \\sum_{i=1}^n x_i \\cdot p_i',
        description: 'Giá trị trung bình cân bằng của biến ngẫu nhiên X.',
        casioTip: 'Bật chế độ Frequency (Tần số) trong 1-Variable Statistics.',
      },
      {
        name: 'Kỳ vọng E(X) liên tục',
        formula: 'E(X) = \\int_{-\\infty}^{+\\infty} x \\cdot f(x) dx',
        description: 'Tích phân của x nhân với hàm mật độ f(x).',
      },
      {
        name: 'Phương sai Var(X)',
        formula: 'Var(X) = E(X^2) - [E(X)]^2',
        description: 'Mức độ biến động / phân tán của X xung quanh giá trị trung bình.',
      },
      {
        name: 'Độ lệch chuẩn',
        formula: '\\sigma(X) = \\sqrt{Var(X)}',
        description: 'Cùng đơn vị đo với biến ngẫu nhiên X.',
      },
    ],
    roadmapSteps: [
      '1. Phân biệt BNN Rời rạc vs BNN Liên tục',
      '2. Lập Bảng phân phối xác suất & Điều kiện hàm mật độ \\int f(x)dx = 1',
      '3. Tính Mode X (giá trị có xác suất / mật độ lớn nhất)',
      '4. Tính Kỳ vọng E(X) và ý nghĩa trung bình tài chính',
      '5. Tính Phương sai Var(X) & Độ lệch chuẩn \\sigma(X) đo lường rủi ro',
    ],
    feynmanSteps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Đặt Vấn Đề Đánh Giá Rủi Ro Cổ Phiếu',
        content: 'Thầy chào các em! Trong quản trị danh mục đầu tư, cổ phiếu A có lợi nhuận kỳ vọng 10% nhưng phương sai 0.04. Cổ phiếu B có lợi nhuận 5% nhưng phương sai chỉ 0.01. Tại sao nhà đầu tư ưa thích an toàn lại chọn B dù lợi nhuận thấp hơn?',
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Giảng Giải Bản Chất Phương Sai',
        content: 'Thầy nhấn mạnh: Kỳ vọng E(X) cho biết "điểm cân bằng trung bình". Nhưng Phương sai Var(X) mới đo lường "mức độ rủi ro / biến động". Phương sai càng lớn nghĩa là kết quả thực tế càng dễ bị lệch xa so với kỳ vọng!',
      },
      {
        stepNumber: 3,
        title: 'Bước 3: Công Thức Toán Tính Var(X)',
        content: 'Var(X) = E(X^2) - [E(X)]^2. Với BNN liên tục có hàm mật độ f(x): E(X) = \\int x f(x) dx, E(X^2) = \\int x^2 f(x) dx.',
      },
      {
        stepNumber: 4,
        title: 'Bước 4: Ví Dụ Mẫu Chi Tiết Của Giáo Viên',
        content: 'Cổ phiếu X: 20% (xác suất 0.3), 10% (xác suất 0.5), -5% (xác suất 0.2). E(X) = 20*0.3 + 10*0.5 + (-5)*0.2 = 10%. E(X^2) = 400*0.3 + 100*0.5 + 25*0.2 = 175. Var(X) = 175 - 10^2 = 75. Độ lệch chuẩn \\sigma = \\sqrt{75} \\approx 8.66%.',
      },
    ],
    practiceExamples: [
      {
        id: 'ex2_1',
        title: 'Ví dụ: Đánh giá cổ phiếu & Phương sai rủi ro',
        problem:
          'Cổ phiếu X có các khả năng lợi nhuận năm tới: Lời 20% (xác suất 0.3), Lời 10% (xác suất 0.5), Lỗ 5% (xác suất 0.2). Tính lợi nhuận kỳ vọng E(X) và phương sai Var(X)?',
        given: ['X1 = 20, p1 = 0.3', 'X2 = 10, p2 = 0.5', 'X3 = -5, p3 = 0.2'],
        baremRubric: 'Tính E(X) (3đ) - Tính E(X^2) (3đ) - Tính Var(X) (2đ) - Ý nghĩa tài chính (2đ)',
        defaultStrategyHint:
          '1. Tính E(X) = 20*0.3 + 10*0.5 + (-5)*0.2.\n2. Tính E(X^2) = 20^2*0.3 + 10^2*0.5 + (-5)^2*0.2.\n3. Var(X) = E(X^2) - [E(X)]^2.',
        sampleSolution:
          'E(X) = 6 + 5 - 1 = 10%.\nE(X^2) = 400*0.3 + 100*0.5 + 25*0.2 = 120 + 50 + 5 = 175.\nVar(X) = 175 - 10^2 = 75.\nĐộ lệch chuẩn \\sigma = \\sqrt{75} \\approx 8.66%.',
      },
    ],
    homeworkTasks: [
      {
        id: 'hw2_1',
        title: 'Bài tập 1: Bảng phân phối xác suất',
        question:
          'Cho BNN X có bảng phân phối: X={1, 2, 3, 4, 5, 6, 7} với xác suất P={a, 2a, 2a, 3a, a^2, 2a^2, 7a^2+a}. Tìm giá trị hằng số a?',
        type: 'essay',
      },
    ],
  },
  {
    id: 3,
    title: 'Bài 3: Các Phân Phối Xác Suất Thông Dụng',
    shortTitle: 'Bài 3: Phân phối chuẩn & Poisson',
    subtitle: 'Nhị thức B(n,p), Poisson P(λ), Chuẩn N(μ, σ²), Student t, Chi-bình phương, Fisher F',
    iconName: 'TrendingUp',
    isCompleted: false,
    feynmanConcept: {
      coreDefinition:
        'Phân phối xác suất thông dụng là những mô hình toán học mô tả quy luật xuất hiện của dữ liệu trong tự nhiên và kinh tế.',
      simpleExplanation:
        'Nếu đo chiều cao của 1 triệu sinh viên, biểu đồ luôn có hình cái chuông (Phân phối chuẩn). Nếu đếm số cuộc gọi điện thoại đến tổng đài ngân hàng trong 1 phút, nó tuân theo Phân phối Poisson.',
      realWorldAnalogy: 'Đường cong hình chuông Gaussian trong điểm thi SAT/IELTS hoặc sai số sản xuất.',
      diagramType: 'normal_curve',
      diagramData: [
        { x: '-3σ', y: 0.01 },
        { x: '-2σ', y: 0.05 },
        { x: '-1σ', y: 0.24 },
        { x: 'μ (Trung bình)', y: 0.4 },
        { x: '+1σ', y: 0.24 },
        { x: '+2σ', y: 0.05 },
        { x: '+3σ', y: 0.01 },
      ],
    },
    keyFormulas: [
      {
        name: 'Phân phối Chuẩn N(μ, σ²)',
        formula: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}',
        description: 'Chuyển về chuẩn tắc Z = \\frac{X - \\mu}{\\sigma} \\sim N(0,1).',
        casioTip: 'Casio Menu 7 -> Normal CD. Lower, Upper, \\sigma, \\mu.',
      },
      {
        name: 'Phân phối Poisson P(λ)',
        formula: 'P(X = k) = \\frac{e^{-\\lambda} \\cdot \\lambda^k}{k!}',
        description: 'Đếm số sự kiện hiếm xảy ra trong 1 khoảng thời gian / không gian liên tục.',
        casioTip: 'Casio Menu 7 -> Poisson PD / CD.',
      },
    ],
    roadmapSteps: [
      '1. Phân phối rời rạc: Nhị thức B(n,p) & Poisson P(\\lambda)',
      '2. Phân phối liên tục: Chuẩn N(\\mu, \\sigma^2) & Đều U(a,b) & Mũ Exp(\\lambda)',
      '3. Chuẩn hóa biến số Z = \\frac{X - \\mu}{\\sigma} để tra bảng Laplace \\Phi(z)',
      '4. Sử dụng máy tính Casio Menu 7 tính xác suất tích lũy Normal CD',
      '5. Nhận biết các phân phối kiểm định: Student t, Chi-bình phương \\chi^2, Fisher F',
    ],
    feynmanSteps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Đặt Vấn Đề Đường Cong Phân Phối Chuẩn',
        content: 'Tại sao đo chiều cao 1 triệu người hay đo kích thước viên bi thép sản xuất hàng loạt đều có biểu đồ hình cái chuông? Đó chính là Định lý Giới hạn Trung tâm (Central Limit Theorem)!',
      },
      {
        stepNumber: 2,
        title: 'Bước 2: Giảng Giải Chuẩn Hóa Z',
        content: 'Thầy nhấn mạnh: Chỉ cần thực hiện phép biến đổi Z = \\frac{X - \\mu}{\\sigma}, mọi bài toán Phân phối chuẩn N(\\mu, \\sigma^2) đều trở về Phân phối Chuẩn tắc N(0,1) với bảng tra duy nhất!',
      },
    ],
    practiceExamples: [
      {
        id: 'ex3_1',
        title: 'Ví dụ: Tuổi thọ sản phẩm & Phân phối chuẩn',
        problem:
          'Tuổi thọ bóng đèn có phân phối chuẩn với trung bình \\mu = 2000 giờ, phương sai \\sigma^2 = 400 giờ^2 (độ lệch chuẩn \\sigma = 20 giờ). Thời gian bảo hành miễn phí là 1950 giờ. Tính tỷ lệ sản phẩm phải bảo hành?',
        given: ['\\mu = 2000', '\\sigma = 20', 'Cần tính P(X < 1950)'],
        baremRubric: 'Chuẩn hóa Z (3đ) - Tra bảng Laplace (4đ) - Kết luận tỷ lệ (3đ)',
        defaultStrategyHint:
          '1. Đặt Z = \\frac{X - 2000}{20}.\n2. Ta có P(X < 1950) = P(Z < \\frac{1950 - 2000}{20}) = P(Z < -2.5).\n3. Bấm Casio Menu 7 -> Normal CD: Lower=-9999, Upper=-2.5, \\sigma=1, \\mu=0.',
        sampleSolution:
          'Z = \\frac{1950 - 2000}{20} = -2.5.\nP(X < 1950) = \\Phi(-2.5) = 0.5 - \\Phi_0(2.5) = 0.5 - 0.4938 = 0.0062 (0.62%).\nVậy tỷ lệ sản phẩm phải bảo hành chỉ là 0.62%.',
      },
    ],
    homeworkTasks: [
      {
        id: 'hw3_1',
        title: 'Bài tập 1: Quản trị rủi ro vỡ nợ ngân hàng',
        question:
          'Ngân hàng có 10.000 khoản vay cá nhân, xác suất vỡ nợ p = 0.0005. Sử dụng xấp xỉ Poisson (\\lambda = n \\cdot p = 5), tính xác suất trong năm tới có đúng 4 khoản vay bị vỡ nợ?',
        type: 'essay',
      },
    ],
  },
  {
    id: 4,
    title: 'Bài 4: Mẫu Ngẫu Nhiên và Các Số Đặc Trưng',
    shortTitle: 'Bài 4: Mẫu ngẫu nhiên',
    subtitle: 'Tổng thể & Mẫu khảo sát, Trung bình mẫu X̄, Phương sai S², Phương sai hiệu chỉnh s²',
    iconName: 'PieChart',
    isCompleted: false,
    feynmanConcept: {
      coreDefinition:
        'Mẫu ngẫu nhiên là tập hợp con gồm n phần tử được chọn từ Tổng thể để quan sát và suy diễn đặc trưng toàn cục.',
      simpleExplanation:
        'Muốn biết chiều cao trung bình của 1 triệu học sinh lớp 12 toàn quốc, ta chọn ngẫu nhiên 2.000 em để đo. Kết quả trung bình mẫu 1m65 sẽ xấp xỉ chiều cao thực tế.',
      realWorldAnalogy: 'Thử máu bệnh nhân (chỉ rút vài ml máu làm mẫu thử đại diện cho toàn bộ cơ thể).',
      diagramType: 'bar',
      diagramData: [
        { name: '<10 triệu', value: 5 },
        { name: '10-20 tr', value: 12 },
        { name: '20-30 tr', value: 18 },
        { name: '30-40 tr', value: 24 },
        { name: '40-50 tr', value: 23 },
        { name: '50-60 tr', value: 11 },
        { name: '>60 triệu', value: 7 },
      ],
    },
    keyFormulas: [
      {
        name: 'Trung bình mẫu cụ thể (x̄)',
        formula: '\\bar{x} = \\frac{\\sum_{i=1}^k n_i \\cdot x_i}{n}',
        description: 'x_i là điểm đại diện trung vị của từng khoảng phân lớp.',
      },
      {
        name: 'Phương sai mẫu hiệu chỉnh (s²)',
        formula: 's^2 = \\frac{1}{n - 1} \\sum_{i=1}^k n_i \\cdot (x_i - \\bar{x})^2',
        description: 'Ước lượng không chệch cho phương sai tổng thể \\sigma^2.',
        casioTip: 'Bấm Casio Menu 6 (Statistics) -> 1-Variable. Nhập dữ liệu đọc ngay x̄ và s_x.',
      },
    ],
    roadmapSteps: [
      '1. Phân biệt Tổng thể (Population) vs Mẫu (Sample)',
      '2. Xác định điểm đại diện trung điểm cho dữ liệu dạng khoảng [a, b)',
      '3. Tính Trung bình mẫu x̄',
      '4. Tính Phương sai mẫu hiệu chỉnh s² và Độ lệch chuẩn mẫu s',
      '5. Áp dụng Định lý Giới hạn Trung tâm cho trung bình mẫu X̄ ~ N(\\mu, \\sigma^2/n)',
    ],
    feynmanSteps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Điểm đại diện',
        content: 'Khoảng [10, 20) có điểm đại diện x_i = \\frac{10+20}{2} = 15.',
      },
    ],
    practiceExamples: [
      {
        id: 'ex4_1',
        title: 'Ví dụ: Doanh số siêu thị 100 ngày',
        problem:
          'Thống kê doanh số bán hàng (X: triệu đồng/ngày) của 100 ngày tại siêu thị: <10tr (5 ngày), 10-20tr (12 ngày), 20-30tr (18 ngày), 30-40tr (24 ngày), 40-50tr (23 ngày), 50-60tr (11 ngày), >60tr (7 ngày). Tính doanh số trung bình x̄ và phương sai hiệu chỉnh s²?',
        given: ['Đại diện x_i: 5, 15, 25, 35, 45, 55, 65', 'Tần số n_i: 5, 12, 18, 24, 23, 11, 7', 'Tổng n = 100'],
        baremRubric: 'Bảng điểm đại diện (2đ) - Tính x̄ (3đ) - Tính s² (3đ) - Nhận xét (2đ)',
        defaultStrategyHint: 'Sử dụng phím Casio Menu 6 -> 1-Variable Statistics. Lập bảng x_i và n_i.',
        sampleSolution: 'Trung bình mẫu x̄ = 35.9 triệu đồng/ngày.\nPhương sai hiệu chỉnh s² = 240.19.\nĐộ lệch chuẩn s = 15.576 triệu đồng.',
      },
    ],
    homeworkTasks: [
      {
        id: 'hw4_1',
        title: 'Bài tập 1: Lãi suất huy động ngân hàng',
        question:
          'Thống kê lãi suất kỳ hạn 12 tháng tại 50 chi nhánh: [5.0-5.5%) 8 chi nhánh, [5.5-6.0%) 15, [6.0-6.5%) 12, [6.5-7.0%) 10, [7.0-7.5%] 5. Tính lãi suất trung bình mẫu x̄ và s?',
        type: 'essay',
      },
    ],
  },
  {
    id: 5,
    title: 'Bài 5: Ước Lượng Khoảng',
    shortTitle: 'Bài 5: Khoảng tin cậy',
    subtitle: 'Ước lượng khoảng cho Tỷ lệ p, Trung bình μ, Phương sai σ², Sai số biên ε, Độ tin cậy 1-α',
    iconName: 'Target',
    isCompleted: false,
    feynmanConcept: {
      coreDefinition:
        'Ước lượng khoảng là việc tìm một khoảng số (\\theta_1, \\theta_2) chứa giá trị tham số thực tế của tổng thể với độ tin cậy (1-\\alpha) cho trước.',
      simpleExplanation:
        'Thay vì phán đoán chính xác tỷ lệ trái cây hỏng là 9%, ta ước lượng với độ tin cậy 95% rằng tỷ lệ trái hỏng nằm trong khoảng từ 8.21% đến 9.79%.',
      realWorldAnalogy: 'Dự báo khoảng biến động doanh thu hoặc khoảng lãi suất kỳ vọng cổ phiếu.',
      diagramType: 'bar',
      diagramData: [
        { name: 'Giới hạn dưới (f - ε)', value: 8.21 },
        { name: 'Tỷ lệ mẫu (f)', value: 9.0 },
        { name: 'Giới hạn trên (f + ε)', value: 9.79 },
      ],
    },
    keyFormulas: [
      {
        name: 'Khoảng tin cậy Tỷ lệ p (n >= 30)',
        formula: '(f - z_{\\alpha/2} \\cdot \\sqrt{\\frac{f(1-f)}{n}} , f + z_{\\alpha/2} \\cdot \\sqrt{\\frac{f(1-f)}{n}})',
        description: 'Sai số biên \\epsilon = z_{\\alpha/2} \\cdot \\sqrt{\\frac{f(1-f)}{n}}. Với độ tin cậy 95%, z_{0.025} = 1.96.',
        casioTip: 'Tra z_{\\alpha/2}: Casio Menu 7 -> Inverse Normal (Area = 1 - \\alpha/2).',
      },
      {
        name: 'Khoảng tin cậy Trung bình \\mu (n >= 30)',
        formula: '(\\bar{x} - z_{\\alpha/2} \\cdot \\frac{s}{\\sqrt{n}} , \\bar{x} + z_{\\alpha/2} \\cdot \\frac{s}{\\sqrt{n}})',
        description: 'Nếu n < 30 và chưa biết \\sigma, thay z_{\\alpha/2} bằng phân phối Student t_{\\alpha/2}^{(n-1)}.',
      },
    ],
    roadmapSteps: [
      '1. Xác định tham số cần ước lượng (Tỷ lệ p, Trung bình \\mu, Phương sai \\sigma^2)',
      '2. Xác định cỡ mẫu n và độ tin cậy 1-\\alpha -> Tra giá trị tới hạn z_{\\alpha/2} hoặc t_{\\alpha/2}',
      '3. Tính sai số chính xác \\epsilon',
      '4. Viết khoảng tin cậy hai phía (\\bar{x} - \\epsilon, \\bar{x} + \\epsilon)',
      '5. Xác định cỡ mẫu tối thiểu n_{min} khi biết yêu cầu sai số',
    ],
    feynmanSteps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Ý nghĩa độ tin cậy',
        content: 'Độ tin cậy 95% có nghĩa là nếu lấy 100 mẫu khảo sát độc lập, khoảng 95 khoảng ước lượng sẽ chứa tham số thực tế.',
      },
    ],
    practiceExamples: [
      {
        id: 'ex5_1',
        title: 'Ví dụ: Ước lượng tỷ lệ trái cây hỏng & Cỡ mẫu',
        problem:
          'Kiểm tra 50 sọt trái cây (mỗi sọt 100 trái -> tổng 5000 trái) thấy có 450 trái không đạt tiêu chuẩn (f = 450/5000 = 0.09).\na) Ước lượng tỷ lệ trái hỏng với độ tin cậy 95%?\nb) Với độ tin cậy 95%, muốn sai số \\epsilon <= 0.005 thì cần kiểm tra bao nhiêu sọt?',
        given: ['n = 5000', 'f = 0.09', '1-\\alpha = 0.95 -> z_{0.025} = 1.96'],
        baremRubric: 'Tính f & z (2đ) - Tính sai số \\epsilon (3đ) - Khoảng tin cậy (3đ) - Tính cỡ mẫu n_min (2đ)',
        defaultStrategyHint:
          'a) Tính \\epsilon = 1.96 \\cdot \\sqrt{\\frac{0.09 \\cdot 0.91}{5000}} = 0.0079. Khoảng tin cậy (0.09 - 0.0079, 0.09 + 0.0079).\nb) n_{min} = f(1-f) \\cdot (\\frac{z}{\\epsilon})^2 = 0.09 \\cdot 0.91 \\cdot (\\frac{1.96}{0.005})^2 = 12586 trái -> chia 100 = 126 sọt.',
        sampleSolution:
          'a) Khoảng tin cậy tỷ lệ hỏng: (8.21%, 9.79%).\nb) Số trái cần kiểm tra n >= 0.09 \\cdot 0.91 \\cdot (\\frac{1.96}{0.005})^2 = 12586 trái, tương ứng 126 sọt.',
      },
    ],
    homeworkTasks: [
      {
        id: 'hw5_1',
        title: 'Bài tập 1: Dư nợ vay tiêu dùng ngân hàng',
        question:
          'Khảo sát 100 khách hàng ngân hàng: trung bình dư nợ x̄ = 42.5 triệu, s = 18.2 triệu. Ước lượng dư nợ trung bình thực tế với độ tin cậy 95%?',
        type: 'essay',
      },
    ],
  },
  {
    id: 6,
    title: 'Bài 6: Kiểm Định Giả Thiết Trong Thống Kê',
    shortTitle: 'Bài 6: Kiểm định giả thiết',
    subtitle: 'Nguyên lý H₀ & H₁, Tiêu chuẩn Z_qs, T_qs, Miền bác bỏ W_α, Mức ý nghĩa α',
    iconName: 'ShieldAlert',
    isCompleted: false,
    feynmanConcept: {
      coreDefinition:
        'Kiểm định giả thiết là việc quyết định chấp nhận hay bác bỏ giả thiết H₀ dựa trên bằng chứng dữ liệu mẫu khảo sát.',
      simpleExplanation:
        'Giống như tòa án xử án: Bị cáo mặc định vô tội (H₀). Công tố viên thu thập bằng chứng (mẫu khảo sát). Nếu bằng chứng quá đủ mâu thuẫn (Z_{qs} rơi vào miền bác bỏ W_\\alpha), tòa tuyên bố bác bỏ H₀ và chấp nhận H₁.',
      realWorldAnalogy: 'Tòa án xét xử hoặc kiểm tra dây chuyền sản xuất có thực sự bị sai lệch tiêu chuẩn hay không.',
      diagramType: 'normal_curve',
      diagramData: [
        { name: 'Miền chấp nhận H₀', y: 0.35 },
        { name: 'Z_qs = 1.142', y: 0.15 },
        { name: 'Miền bác bỏ W_α (|Z| > 1.96)', y: 0.02 },
      ],
    },
    keyFormulas: [
      {
        name: 'Tiêu chuẩn kiểm định Tỷ lệ Z_qs',
        formula: 'Z_{qs} = \\frac{f - p_0}{\\sqrt{\\frac{p_0(1-p_0)}{n}}}',
        description: 'Kiểm định 2 phía: Bác bỏ H₀ nếu |Z_{qs}| > z_{\\alpha/2}.',
      },
      {
        name: 'Tiêu chuẩn kiểm định Trung bình Z_qs',
        formula: 'Z_{qs} = \\frac{\\bar{x} - \\mu_0}{\\frac{s}{\\sqrt{n}}}',
        description: 'Nếu n < 30 dùng phân phối Student T_{qs} với bậc tự do n - 1.',
      },
    ],
    roadmapSteps: [
      '1. Phát biểu Giả thiết H₀ và Đối thiết H₁ (2 phía, 1 phía lớn hơn, 1 phía nhỏ hơn)',
      '2. Xác định Mức ý nghĩa \\alpha và Miền bác bỏ W_\\alpha',
      '3. Tính Tiêu chuẩn kiểm định Z_{qs} / T_{qs} / \\chi^2_{qs} từ dữ liệu mẫu',
      '4. So sánh Z_{qs} với miền bác bỏ W_\\alpha',
      '5. Kết luận: Bác bỏ H₀ (chấp nhận H₁) hay Chưa đủ bằng chứng bác bỏ H₀',
    ],
    feynmanSteps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Thiết lập giả thiết',
        content: 'H₀ luôn mang dấu "=" (VD: H₀: p = 0.05). H₁ mang dấu khác "!= ", ">" hoặc "<".',
      },
    ],
    practiceExamples: [
      {
        id: 'ex6_1',
        title: 'Ví dụ: Đánh giá cải tiến kỹ thuật giảm phế phẩm',
        problem:
          'Tỷ lệ phế phẩm nhà máy trước cải tiến là 5% (p₀ = 0.05). Sau cải tiến, kiểm tra 400 sản phẩm thấy 16 phế phẩm (f = 16/400 = 0.04). Với mức ý nghĩa \\alpha = 0.01, việc cải tiến có làm giảm tỷ lệ phế phẩm không?',
        given: ['H₀: p = 0.05 vs H₁: p < 0.05 (1 phía)', 'n = 400, f = 0.04', '\\alpha = 0.01 -> z_{0.01} = 2.33 -> W = (-\\infty, -2.33)'],
        baremRubric: 'Lập H₀, H₁ (2đ) - Xác định miền bác bỏ (2đ) - Tính Z_qs (3đ) - Kết luận (3đ)',
        defaultStrategyHint:
          '1. Lập cặp giả thiết H₀: p = 0.05; H₁: p < 0.05.\n2. Z_{qs} = \\frac{0.04 - 0.05}{\\sqrt{\\frac{0.05 \\cdot 0.95}{400}}} = -0.9177.\n3. So sánh Z_{qs} với -2.33. Vì -0.92 > -2.33 nên Z_{qs} không thuộc W_\\alpha.',
        sampleSolution:
          'Z_{qs} = -0.9177. Do Z_{qs} không thuộc miền bác bỏ W = (-\\infty, -2.33), ta chưa đủ bằng chứng bác bỏ H₀ ở mức ý nghĩa 1%. Chưa thể khẳng định cải tiến kỹ thuật làm giảm tỷ lệ phế phẩm.',
      },
    ],
    homeworkTasks: [
      {
        id: 'hw6_1',
        title: 'Bài tập 1: Kiểm định máy đóng gói',
        question:
          'Trọng lượng đóng gói tiêu chuẩn là 101g. Khảo sát 100 gói: x̄ = 100.2g, s = 2.1g. Với \\alpha = 0.05, có thể cho rằng máy đang đóng gói nhẹ hơn quy định?',
        type: 'essay',
      },
    ],
  },
  {
    id: 7,
    title: 'Bài 7: So Sánh 2 Tham Số Mẫu Khoa Học',
    shortTitle: 'Bài 7: So sánh 2 tham số',
    subtitle: 'So sánh 2 tỷ lệ p₁ vs p₂, So sánh 2 trung bình μ₁ vs μ₂, So sánh 2 phương sai Fisher F-test',
    iconName: 'GitCompare',
    isCompleted: false,
    feynmanConcept: {
      coreDefinition:
        'So sánh 2 tham số giúp đánh giá sự khác biệt mang tính ý nghĩa thống kê giữa hai tổng thể độc lập.',
      simpleExplanation:
        'Phương pháp dạy học mới làm điểm trung bình lớp A đạt 7.8, lớp truyền thống đạt 7.2. Liệu chênh lệch 0.6 điểm này là do ngẫu nhiên hay phương pháp mới thực sự hiệu quả hơn?',
      realWorldAnalogy: 'Thử nghiệm A/B Testing trong tiếp thị số hoặc so sánh hiệu quả 2 loại thuốc y học.',
      diagramType: 'bar',
      diagramData: [
        { name: 'Thành phố A (sử dụng AI)', value: 64.0 },
        { name: 'Thành phố B (sử dụng AI)', value: 55.5 },
      ],
    },
    keyFormulas: [
      {
        name: 'Tiêu chuẩn So sánh 2 Tỷ lệ Z_qs',
        formula: 'Z_{qs} = \\frac{f_1 - f_2}{\\sqrt{f(1-f)(\\frac{1}{n} + \\frac{1}{m})}}',
        description: 'f = \\frac{k_1 + k_2}{n + m} là tỷ lệ chung của 2 mẫu.',
      },
      {
        name: 'Tiêu chuẩn So sánh 2 Trung bình Student t_qs',
        formula: 't_{qs} = \\frac{\\bar{x} - \\bar{y}}{\\sqrt{s_p^2 (\\frac{1}{n} + \\frac{1}{m})}}',
        description: 's_p^2 là phương sai gộp (Pooled Variance): s_p^2 = \\frac{(n-1)s_1^2 + (m-1)s_2^2}{n + m - 2}.',
      },
    ],
    roadmapSteps: [
      '1. Xác định bài toán so sánh: 2 tỷ lệ (A/B testing) / 2 trung bình / 2 phương sai',
      '2. Tính tỷ lệ chung f hoặc Phương sai gộp s_p^2',
      '3. Tính Tiêu chuẩn Z_{qs} / t_{qs} / F_{qs}',
      '4. Tra bảng z_\\alpha, t_\\alpha(n+m-2) hoặc F_\\alpha',
      '5. Đưa ra kết luận có sự khác biệt có ý nghĩa thống kê hay không',
    ],
    feynmanSteps: [
      {
        stepNumber: 1,
        title: 'Bước 1: Phương sai gộp s_p^2',
        content: 'Vì giả thiết 2 tổng thể có cùng phương sai, việc gộp mẫu giúp ước lượng độ biến động chính xác hơn rất nhiều!',
      },
    ],
    practiceExamples: [
      {
        id: 'ex7_1',
        title: 'Ví dụ: So sánh chiến dịch quảng cáo AI ở 2 thành phố',
        problem:
          'Thành phố A khảo sát 500 khách hàng thấy 320 người dùng ứng dụng AI (f₁ = 320/500 = 0.64). Thành phố B khảo sát 450 khách hàng thấy 250 người dùng AI (f₂ = 250/450 = 0.5556). Với \\alpha = 0.05, tỷ lệ dùng AI ở thành phố A có cao hơn B?',
        given: ['n₁ = 500, k₁ = 320', 'n₂ = 450, k₂ = 250', 'Tỷ lệ chung f = (320+250)/(500+450) = 570/950 = 0.60'],
        baremRubric: 'Tính tỷ lệ f (2đ) - Tiêu chuẩn Z_qs (4đ) - So sánh miền bác bỏ (2đ) - Kết luận (2đ)',
        defaultStrategyHint:
          '1. H₀: p₁ = p₂ vs H₁: p₁ > p₂.\n2. Z_{qs} = \\frac{0.64 - 0.5556}{\\sqrt{0.60 \\cdot 0.40 \\cdot (\\frac{1}{500} + \\frac{1}{450})}} = 2.65.\n3. Với \\alpha = 0.05 kiểm định 1 phía, z_{0.05} = 1.645.',
        sampleSolution:
          'Z_{qs} = 2.65 > 1.645 (thuộc miền bác bỏ W = (1.645, +\\infty)). Bác bỏ H₀. Vậy tỷ lệ dùng AI tại Thành phố A cao hơn Thành phố B có ý nghĩa thống kê.',
      },
    ],
    homeworkTasks: [
      {
        id: 'hw7_1',
        title: 'Bài tập 1: So sánh hiệu quả 2 phương pháp giảng dạy',
        question:
          'Nhóm 1 (Truyền thống): n₁=25, x̄₁=7.2, s₁=1.1. Nhóm 2 (Tích hợp AI): n₂=22, x̄₂=7.8, s₂=1.3. Với \\alpha = 0.05, phương pháp tích hợp AI có thực sự tốt hơn?',
        type: 'essay',
      },
    ],
  },
];

export const PRESET_EXAM_SETS: ExamSet[] = [
  {
    id: 'hub_exam_2026_02a',
    title: 'Đề Thi Kết Thúc Học Phần HUB 2026 - Mã Đề 02a',
    durationMinutes: 75,
    questionCount: 5,
    category: 'Cuối kỳ',
    author: 'Bộ Môn Toán Kinh Tế & Khoa KH Dữ Liệu HUB',
    savedByUsersCount: 2850,
    questions: [
      {
        id: 'hub_26_02a_q1',
        text: 'Một công ty tài chính nhập linh kiện vi mạch điện tử từ 3 phân xưởng I, II, III với tỷ lệ 45%, 35%, 20%. Tỷ lệ đạt chuẩn lần lượt là 92%, 88%, 95%. Lấy ngẫu nhiên 1 linh kiện, xác suất linh kiện đạt chuẩn chất lượng P(A) là bao nhiêu?',
        type: 'mcq',
        options: ['0.9120', '0.8950', '0.9340', '0.8800'],
        correctIndex: 0,
        explanation: 'Theo công thức xác suất đầy đủ: P(A) = 0.45 × 0.92 + 0.35 × 0.88 + 0.20 × 0.95 = 0.414 + 0.308 + 0.190 = 0.9120.',
      },
      {
        id: 'hub_26_02a_q2',
        text: 'Biết linh kiện lấy ra đạt chuẩn chất lượng, xác suất linh kiện đó do phân xưởng I sản xuất P(H₁|A) là:',
        type: 'mcq',
        options: ['0.4539 (45.39%)', '0.3377 (33.77%)', '0.2083 (20.83%)', '0.5000 (50.00%)'],
        correctIndex: 0,
        explanation: 'Áp dụng công thức Bayes: P(H₁|A) = (0.45 × 0.92) / 0.9120 = 0.414 / 0.9120 = 0.4539 (45.39%).',
      },
      {
        id: 'hub_26_02a_q3',
        text: 'Biến liên tục X có f(x) = k(x² - x) trên [1, 3] và bằng 0 ở ngoài. Hằng số k chuẩn hóa là:',
        type: 'mcq',
        options: ['k = 3/14', 'k = 14/3', 'k = 1/2', 'k = 3/8'],
        correctIndex: 0,
        explanation: 'Tích phân int(1 to 3) (x² - x) dx = [x³/3 - x²/2] từ 1 đến 3 = 14/3. Do int f(x)dx = 1 nên k = 3/14.',
      },
      {
        id: 'hub_26_02a_q4',
        text: 'Tuổi thọ pin điện thoại X ~ N(24, 4) (tháng). Tỷ lệ pin có tuổi thọ trên 26 tháng P(X > 26) là:',
        type: 'mcq',
        options: ['15.87%', '34.13%', '2.28%', '50.00%'],
        correctIndex: 0,
        explanation: 'Chú ý σ = √4 = 2 tháng. P(X > 26) = 0.5 - Φ((26-24)/2) = 0.5 - Φ(1.0) = 0.5 - 0.3413 = 0.1587 (15.87%).',
      },
      {
        id: 'hub_26_02a_q5',
        text: 'Khảo sát 100 chi nhánh ngân hàng: trung bình mẫu x̄ = 42.6 triệu, s = 10.7422 triệu. Độ chính xác ước lượng trung bình ở độ tin cậy 95% (z_0.025 = 1.96) là:',
        type: 'mcq',
        options: ['2.1055 triệu đồng', '1.0742 triệu đồng', '3.8416 triệu đồng', '0.5000 triệu đồng'],
        correctIndex: 0,
        explanation: 'ε = z_{α/2} × (s / √n) = 1.96 × (10.7422 / 10) = 2.1055 triệu đồng.',
      },
    ],
  },
  {
    id: 'hub_exam_2023_ca1',
    title: 'Đề Thi Chính Thức HUB 2023 - Đợt 31/03/2023 (Ca 1)',
    durationMinutes: 75,
    questionCount: 5,
    category: 'Cuối kỳ',
    author: 'Trường Đại Học Ngân Hàng TP.HCM',
    savedByUsersCount: 1980,
    questions: [
      {
        id: 'hub_23_ca1_q1',
        text: 'Hộp I có 8 chính phẩm, 2 phế phẩm. Hộp II có 6 chính phẩm, 4 phế phẩm. Lấy ngẫu nhiên từ mỗi hộp 2 sản phẩm. Xác suất lấy được đúng 3 chính phẩm là:',
        type: 'mcq',
        options: ['0.4504 (304/675)', '0.3500', '0.5210', '0.2400'],
        correctIndex: 0,
        explanation: 'Số phần tử không gian mẫu: C(10,2) × C(10,2) = 45 × 45 = 2025. Số cách lấy 3 chính phẩm: C(8,2)×[C(6,1)C(4,1)] + [C(8,1)C(2,1)]×C(6,2) = 28×24 + 16×15 = 672 + 240 = 912. Xác suất = 912/2025 = 304/675 ≈ 0.4504.',
      },
      {
        id: 'hub_23_ca1_q2',
        text: 'Hàm mật độ f(x) = ax + b trên [0, 2]. Biết E(X) = 7/6. Bấm Casio Menu 9 1 2 giải hệ ta được a và b là:',
        type: 'mcq',
        options: ['a = 1/4, b = 1/4', 'a = 1/2, b = 0', 'a = 1/3, b = 1/6', 'a = 3/8, b = 1/8'],
        correctIndex: 0,
        explanation: 'Hệ phương trình: 2a + 2b = 1 và (8/3)a + 2b = 7/6. Giải hệ được a = 1/4 (0.25) và b = 1/4 (0.25).',
      },
      {
        id: 'hub_23_ca1_q3',
        text: 'Thời gian tự học của 120 sinh viên HUB: x̄ = 13.2667 giờ, s = 4.2934 giờ. Nếu muốn sai số ước lượng đạt 0.5 giờ ở độ tin cậy 99% (z_0.005 = 2.58), cần khảo sát THÊM ít nhất bao nhiêu sinh viên?',
        type: 'mcq',
        options: ['371 sinh viên', '491 sinh viên', '120 sinh viên', '250 sinh viên'],
        correctIndex: 0,
        explanation: 'Cỡ mẫu tối thiểu n_{min} = (2.58² × 4.2934²) / 0.5² = (6.6564 × 18.4333) / 0.25 = 490.81 => n_{min} = 491. Số SV cần khảo sát THÊM = 491 - 120 = 371 sinh viên.',
      },
      {
        id: 'hub_23_ca1_q4',
        text: 'Trong bài toán kiểm định giả thiết H₀: μ = 12.5 vs H₁: μ > 12.5 với mức ý nghĩa α = 0.05. Miền bác bỏ W_α là:',
        type: 'mcq',
        options: ['W_α = (1.645, +∞)', 'W_α = (-∞, -1.645) ∪ (1.645, +∞)', 'W_α = (-∞, -1.96) ∪ (1.96, +∞)', 'W_α = (1.96, +∞)'],
        correctIndex: 0,
        explanation: 'Kiểm định 1 phía bên phải (dấu >) ở mức α = 0.05 có giá trị tới hạn z_{0.05} = 1.645. Miền bác bỏ là W_α = (1.645, +∞).',
      },
    ],
  },
  {
    id: 'exam_midterm_1',
    title: 'Đề Thi Giữa Kỳ XSTK Chuẩn Đại Học 2026',
    durationMinutes: 45,
    questionCount: 10,
    category: 'Giữa kỳ',
    author: 'Bộ Môn Toán Kinh Tế',
    savedByUsersCount: 1420,
    questions: [
      {
        id: 'q1',
        text: 'Một lô hàng có 10 sản phẩm (7 tốt, 3 xấu). Lấy ngẫu nhiên 4 sản phẩm. Xác suất lấy được đúng 3 sản phẩm tốt là bao nhiêu?',
        type: 'mcq',
        options: ['0.50', '0.35', '0.62', '0.48'],
        correctIndex: 0,
        explanation: 'Sử dụng công thức tổ hợp \\frac{C_7^3 \\cdot C_3^1}{C_{10}^4} = \\frac{35 \\cdot 3}{210} = 0.50.',
      },
    ],
  },
];
