import React, { useState } from 'react';
import { UserProfile } from '../types/xstk';
import { Mascot } from './Mascot';
import { Sparkles, ArrowRight, CheckCircle2, User, BookOpen, School, IdCard, SkipForward } from 'lucide-react';

interface OnboardingOverlayProps {
  userProfile: UserProfile;
  onComplete: (updatedProfile: Partial<UserProfile>) => void;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  userProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [fullName, setFullName] = useState(userProfile.fullName || '');
  const [classGroup, setClassGroup] = useState(userProfile.classGroup || '2026-DHKT01');
  const [major, setMajor] = useState(userProfile.major || 'Khoa học Dữ liệu & AI');
  const [studentId, setStudentId] = useState(userProfile.studentId || '26110293');

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setStep(2);
  };

  const handleNextStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(4);
  };

  const handleFinishOnboarding = () => {
    onComplete({
      isOnboarded: true,
      fullName: fullName.trim() || 'Sinh viên XSTK',
      classGroup: classGroup.trim() || 'Lớp XSTK',
      major: major.trim() || 'CNTT & Khoa học Dữ liệu',
      studentId: studentId.trim() || 'MSSV2026',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative">
        {/* Developer Info Header */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-bold text-lg flex items-center justify-center shadow">
              AI
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-900 dark:text-amber-300">
                Đội Ngũ Phát Triển & Cố Vấn AI Studio
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Hệ thống Học tập & Giảng dạy Xác Suất Thống Kê Thông Minh (VibeCoding)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-1 rounded-md font-semibold">
            v2.5 PRO
          </span>
        </div>

        {/* STEP 1: Name & Welcome */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Chào mừng bạn đến với VibeCoding XSTK
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Tạo Hồ Sơ Học Tập Cá Nhân
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Nhập Họ và Tên của bạn để bắt đầu hành trình chinh phục môn Xác Suất Thống Kê cùng AI Tutor!
              </p>
            </div>

            <form onSubmit={handleNextStep1} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Họ Và Tên
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <span>Tạo hồ sơ & Nhận Linh vật</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Mascot Appears */}
        {step === 2 && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Chào mừng {fullName}!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nhấp đúp chuột (hoặc chạm 2 lần) vào Cú Thông Thái để thiết lập thông tin học phần!
              </p>
            </div>

            <div className="py-4 flex justify-center">
              <Mascot
                size="lg"
                equipped={userProfile.equippedMascot}
                speechText={`Xin chào ${fullName}! Mình là Cú Thông Thái - trợ lý AI đồng hành cùng bạn học tốt môn Xác Suất Thống Kê. Hãy nhấp vào mình nhé!`}
                onClick={() => setStep(3)}
                onDoubleClick={() => setStep(3)}
              />
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-colors text-sm"
            >
              Tiếp tục điền thông tin cá nhân →
            </button>
          </div>
        )}

        {/* STEP 3: Student Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Thông Tin Sinh Viên & Lớp Học
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Linh vật AI sẽ cá nhân hóa lộ trình và bài tập theo ngành học của bạn!
              </p>
            </div>

            <form onSubmit={handleNextStep3} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Lớp học phần
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    placeholder="Ví dụ: 2026-DHKT01"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Tên ngành học
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Ví dụ: Tài chính Ngân hàng / Khoa học Dữ liệu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Mã số sinh viên (MSSV)
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Ví dụ: 26110293"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <span>Xác nhận & Khám phá Giao diện chính</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: Feature Tour & Intro with Skip option */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Hướng dẫn nhanh từ Linh vật Cú
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Khám Phá Các Tính Năng Đỉnh Cao!
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left text-xs">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700">
                <p className="font-bold text-amber-900 dark:text-amber-300 mb-1">📖 Lộ trình 4 Bước Feynman</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Định nghĩa đơn giản, mô hình trực quan, bài tập thực hành & AI chấm điểm toàn diện.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700">
                <p className="font-bold text-blue-900 dark:text-blue-300 mb-1">📝 AI Tutor Chấm Bảng iPad</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Tương tác bằng viết tay iPad/chuột, upload PDF/ảnh, nhận chiến lược giải trước khi xem đáp án.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-slate-800 border border-purple-200 dark:border-slate-700">
                <p className="font-bold text-purple-900 dark:text-purple-300 mb-1">🗣️ Tương tác Giọng nói</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Trao đổi Q&A giọng nói với Cú Thông Thái, tự động xuất sơ đồ giải lên bảng iPad.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700">
                <p className="font-bold text-emerald-900 dark:text-emerald-300 mb-1">🧮 Máy tính Casio FX-580VN</p>
                <p className="text-slate-600 dark:text-slate-400">
                  Hướng dẫn bấm máy Menu 7 Phân phối & Thống kê chi tiết từng phím.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleFinishOnboarding}
                className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Bỏ qua (Skip)</span>
              </button>

              <button
                onClick={handleFinishOnboarding}
                className="flex-2 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg transition-colors text-xs flex items-center justify-center gap-2"
              >
                <span>Bắt đầu Học XSTK Ngay!</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
