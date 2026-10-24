import { MascotSpecies } from '../types/xstk';

export interface MascotInfo {
  id: MascotSpecies;
  species: MascotSpecies;
  name: string;
  shortTitle: string;
  emoji: string;
  role: string;
  tagline: string;
  personalityTag: string;
  description: string;
  gradient: string;
  badgeBg: string;
  borderColor: string;
  accentHex: string;
  specialCheer: string;
}

const RAW_MASCOT_CATALOG: Omit<MascotInfo, 'species' | 'personalityTag'>[] = [
  {
    id: 'owl',
    name: 'Cú Thông Thái',
    shortTitle: 'Cú Học Giả',
    emoji: '🦉',
    role: 'Chiến Thần Logic & Bayes',
    tagline: 'Soi sáng từng bài toán hóc búa trong màn đêm!',
    description: 'Bậc thầy về công thức xác suất toàn phần, định lý Bayes và giải phẫu các bẫy đề thi kinh điển.',
    gradient: 'from-amber-400 via-amber-500 to-amber-600',
    badgeBg: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
    borderColor: 'border-amber-400',
    accentHex: '#f59e0b',
    specialCheer: 'Cố lên bạn ơi, logic sắc bén sẽ đưa bạn đến điểm A+!',
  },
  {
    id: 'panda',
    name: 'Gấu Trúc Kungfu',
    shortTitle: 'Gấu Trúc Chill',
    emoji: '🐼',
    role: 'Trùm Chill & Bền Bỉ',
    tagline: 'Vừa nhai lá trúc vừa vượt qua kỳ thi nhẹ tênh!',
    description: 'Chuyên gia biến các công thức tích phân phức tạp thành bài toán nhẹ nhàng, giữ tâm lý luôn thư thái.',
    gradient: 'from-emerald-400 via-teal-500 to-slate-800',
    badgeBg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    borderColor: 'border-emerald-400',
    accentHex: '#10b981',
    specialCheer: 'Thư giãn chút nào, hít thở sâu rồi bài toán nào cũng sẽ giải được!',
  },
  {
    id: 'crocodile',
    name: 'Cá Sấu Sát Thủ',
    shortTitle: 'Cá Sấu Sát Thủ',
    emoji: '🐊',
    role: 'Thợ Săn Điểm 10',
    tagline: 'Đã cắn trúng đề thi là không bao giờ buông!',
    description: 'Quyết liệt, tập trung cao độ, xử lý gọn ghẽ các bài toán kiểm định giả thuyết và ước lượng tham số.',
    gradient: 'from-green-500 via-emerald-600 to-teal-800',
    badgeBg: 'bg-green-950/80 text-green-300 border-green-500/40',
    borderColor: 'border-green-400',
    accentHex: '#22c55e',
    specialCheer: 'Tập trung nhắm trúng mục tiêu, đề khó mấy cũng phải đầu hàng!',
  },
  {
    id: 'lion',
    name: 'Sư Tử Dũng Mãnh',
    shortTitle: 'Sư Tử Chúa Sơn Lâm',
    emoji: '🦁',
    role: 'Bản Lĩnh Phòng Thi',
    tagline: 'Uy dũng hiên ngang, đánh tan mọi nỗi sợ hãi thi cử!',
    description: 'Truyền lửa tự tin, rèn luyện tư duy kiên định trước những đề thi dài ngoằng và câu hỏi đánh đố.',
    gradient: 'from-yellow-400 via-orange-500 to-amber-700',
    badgeBg: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
    borderColor: 'border-orange-400',
    accentHex: '#f97316',
    specialCheer: 'Tiếng gầm tri thức! Hãy tự tin bước vào phòng thi như một vị vua!',
  },
  {
    id: 'whale',
    name: 'Cá Voi Đại Dương',
    shortTitle: 'Cá Voi Tri Thức',
    emoji: '🐋',
    role: 'Đại Dương Kiến Thức',
    tagline: 'Bao la như biển cả, tĩnh lặng mà thấu suốt vạn vật!',
    description: 'Chuyên gia phân tích dữ liệu lớn, phân phối chuẩn Gauss và các định lý hội tụ xác suất vĩ mô.',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-700',
    badgeBg: 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40',
    borderColor: 'border-cyan-400',
    accentHex: '#06b6d4',
    specialCheer: 'Đại dương kiến thức mênh mông, mỗi bài toán là một giọt ngọc quý giá!',
  },
  {
    id: 'bear',
    name: 'Bác Gấu Tiến Sĩ',
    shortTitle: 'Bác Gấu Thân Tình',
    emoji: '🐻',
    role: 'Giảng Viên Feynman & Casio',
    tagline: 'Nồi canh chua XSTK, bấm máy Casio 580 trong 20 giây!',
    description: 'Bác Gấu thân yêu dạy kèm 1-1, giải thích trực quan bằng ví dụ đời sống và bấm máy tính chuẩn từng phím.',
    gradient: 'from-amber-600 via-orange-700 to-yellow-800',
    badgeBg: 'bg-amber-950/90 text-amber-200 border-amber-400/50',
    borderColor: 'border-amber-500',
    accentHex: '#d97706',
    specialCheer: 'Bác Gấu luôn ở đây đồng hành, khó chỗ nào Bác gỡ chỗ đó cho cháu!',
  },
  {
    id: 'fox',
    name: 'Cáo Tinh Nhanh',
    shortTitle: 'Cáo Tinh Nhanh',
    emoji: '🦊',
    role: 'Bậc Thầy Mẹo & Tốc Độ',
    tagline: 'Phát hiện bẫy trong 3 giây, giải trắc nghiệm siêu tốc!',
    description: 'Nhanh nhẹn, láu lỉnh, chuyên trị các mẹo bấm máy Casio nhanh, loại trừ phương án nhiễu cực chuẩn.',
    gradient: 'from-orange-400 via-rose-500 to-red-600',
    badgeBg: 'bg-rose-950/80 text-rose-300 border-rose-500/40',
    borderColor: 'border-rose-400',
    accentHex: '#fb7185',
    specialCheer: 'Mắt tinh tai thính, không một cái bẫy đề thi nào lọt qua được!',
  },
  {
    id: 'penguin',
    name: 'Cánh Cụt Nam Cực',
    shortTitle: 'Cánh Cụt Kiên Trì',
    emoji: '🐧',
    role: 'Kỷ Luật & Kiên Định',
    tagline: 'Từng bước vững chắc trên băng tuyết, không ngại khó khăn!',
    description: 'Tượng trưng cho sự kỷ luật, luyện tập mỗi ngày để xây dựng nền tảng xác suất vững chắc như tảng băng trôi.',
    gradient: 'from-sky-400 via-indigo-500 to-slate-900',
    badgeBg: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
    borderColor: 'border-sky-400',
    accentHex: '#38bdf8',
    specialCheer: 'Cứ đi đều đặn mỗi ngày, đường băng dài mấy ta cũng trượt tới đích!',
  },
  {
    id: 'dragon',
    name: 'Rồng Thần May Mắn',
    shortTitle: 'Rồng Thần Cực Phẩm',
    emoji: '🐲',
    role: 'Vận Khí Vô Song',
    tagline: 'Xác suất may mắn P = 1, thi đâu trúng đó rực rỡ vinh quang!',
    description: 'Linh vật huyền thoại mang lại vận may tối thượng, hóa giải mọi sự cố làm bài thi và thăng hoa phong độ.',
    gradient: 'from-purple-500 via-pink-500 to-amber-400',
    badgeBg: 'bg-purple-950/80 text-purple-200 border-purple-400/50',
    borderColor: 'border-purple-400',
    accentHex: '#a855f7',
    specialCheer: 'Vận may rồng thần nhập thể, tự tin khoanh trắc nghiệm là đúng phóc!',
  },
  {
    id: 'cat',
    name: 'Mèo Thần Tài AI Classroom',
    shortTitle: 'Mèo Thần Tài',
    emoji: '🐱',
    role: 'Vẫy Điểm A & Tài Lộc',
    tagline: 'Tay phải vẫy điểm 10, tay trái hút cúp GPA 4.0!',
    description: 'Đáng yêu, lanh lợi, luôn mang đến năng lượng tích cực và may mắn trong mọi bài kiểm tra ngân hàng.',
    gradient: 'from-amber-300 via-rose-400 to-yellow-500',
    badgeBg: 'bg-rose-950/80 text-rose-200 border-rose-400/50',
    borderColor: 'border-rose-300',
    accentHex: '#f43f5e',
    specialCheer: 'Meo meo! Điểm 10 đang vẫy gọi bạn, cùng rinh học bổng về nào!',
  },
];

export const MASCOT_CATALOG: MascotInfo[] = RAW_MASCOT_CATALOG.map((m) => ({
  ...m,
  species: m.id,
  personalityTag: m.tagline,
}));

/**
 * 20 Diverse Encouraging, Friendly & Caring Cheer Quotes for the Floating Pixel Companion Mascot
 */
export const MASCOT_20_CHEER_QUOTES: string[] = [
  'Cố lên bạn ơi, mỗi bài toán là một bước gần hơn tới điểm A+! ✨',
  'Học Xác suất Thống kê mệt không? Uống ngụm nước rồi cùng mình chiến tiếp nhé! 💧',
  'Biến cố may mắn P(A) = 1 đang chờ bạn ở cuối kỳ thi đấy! 🍀',
  'Đừng sợ công thức Bayes, đã có mình ở đây đồng hành cùng bạn rồi! 🦉',
  'Hôm nay bạn học rất chăm chỉ, mình cực kỳ tự hào về bạn! 🌟',
  'Nhớ bấm Mode 7 trên Casio 580 để kiểm tra bảng xác suất cho chuẩn nhé! 🧮',
  'Sai một li thì xem lại barem, quan trọng là mình hiểu được bản chất! 💡',
  'Cứ đi từng bước một, tích tiểu thành đại như định lý giới hạn trung tâm! 📈',
  'Giữ vững chuỗi streak học tập nhé, bạn đang làm rất cừ khôi đấy! 🔥',
  'Mỗi phút bạn đầu tư cho kiến thức hôm nay sẽ sinh lời gấp bội mai sau! 💎',
  'Đại học Ngân hàng tự hào vì có sinh viên chăm ngoan và tài năng như bạn! 🏛️',
  'Nghỉ mắt một chút nhìn xa 20 giây cho đỡ mỏi mắt nha bạn ơi! 👀',
  'Khó khăn chỉ là biến ngẫu nhiên tạm thời, sự kiên trì mới là kỳ vọng vững chắc! 📊',
  'Nếu thấy đề dài quá, hãy bóc tách từng giả thiết như Bác Gấu hướng dẫn nhé! 🎯',
  'Tự tin lên nào! Bạn thông minh và bản lĩnh hơn bạn nghĩ rất nhiều đấy! 🦁',
  'Hít một hơi thật sâu... thở ra nhẹ nhàng... Giờ ta lại giải quyết bài tiếp theo! 🍃',
  'Hôm nay tích thêm được bao nhiêu EXP rồi? Chuẩn bị mở hòm quà bí ẩn nha! 🎁',
  'Chỉ cần không bỏ cuộc, chắc chắn xác suất bạn qua môn với GPA 4.0 là 99.9%! 🚀',
  'Mình luôn ở góc này cổ vũ bạn, bất cứ khi nào bạn cần chút năng lượng tích cực! 💖',
  'Chúc bạn có một buổi học XSTK tràn đầy cảm hứng, điểm cao chót vót! 🌈',
];

export function getMascotById(id?: MascotSpecies): MascotInfo {
  const found = MASCOT_CATALOG.find((m) => m.id === id);
  return found || MASCOT_CATALOG[0]; // Default to Owl
}
