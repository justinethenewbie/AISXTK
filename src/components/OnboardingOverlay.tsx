import React, { useState } from 'react';
import { UserProfile, MascotSpecies } from '../types/xstk';
import { Mascot } from './Mascot';
import { MASCOT_CATALOG, getMascotById } from '../data/mascotCatalog';
import { HubEdtLogo } from './HubEdtLogo';
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
  const [selectedSpecies, setSelectedSpecies] = useState<MascotSpecies>(userProfile.equippedMascot?.species || 'owl');

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
      equippedMascot: {
        ...userProfile.equippedMascot,
        species: selectedSpecies,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative">
        {/* University & Developer Header */}
        <div className="mb-6 p-4 rounded-3xl bg-slate-950/80 border-2 border-cyan-500/40 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <HubEdtLogo size="sm" />
          <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-1 rounded-md font-black">
            AI Classroom v2.5 PRO
          </span>
        </div>

        {/* STEP 1: Name & Welcome */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Chào mừng bạn đến với AI Classroom • HUB
              </span>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Tạo Hồ Sơ Học Tập Cá Nhân
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Nhập Họ và Tên của bạn để bắt đầu hành trình chinh phục môn Xác Suất Thống Kê cùng AI Tutor!
              </p>
            </div>

            <form onSubmit={handleNextStep1} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Họ Và Tên Sinh Viên
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span>Tiếp tục chọn Linh vật đồng hành</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: Choose Companion Mascot */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Bước 2: Chọn Bạn Đồng Hành
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Chọn Linh Vật Đồng Hành Yêu Thích
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 max-w-md mx-auto">
                Linh vật sẽ ở bên cổ vũ, động viên và tương tác cùng bạn trong suốt quá trình học!
              </p>
            </div>

            {/* Mascot Grid Selection */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {MASCOT_CATALOG.map((m) => {
                const isSelected = selectedSpecies === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedSpecies(m.id)}
                    className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer text-center ${
                      isSelected
                        ? `${m.borderColor} bg-slate-950/90 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105`
                        : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-700/60 shadow-inner">
                      {m.imageUrl ? (
                        <img
                          src={m.imageUrl}
                          alt={m.name}
                          className="w-full h-full object-cover rounded-xl select-none"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <span className="text-2xl filter drop-shadow">{m.emoji}</span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white truncate w-full mt-1">{m.shortTitle}</span>
                    <span className="text-[10px] text-cyan-400 truncate w-full">{m.role}</span>
                  </button>
                );
              })}
            </div>

            {/* Selected Mascot Preview with Speech */}
            <div className="py-2 flex justify-center">
              <Mascot
                size="md"
                equipped={{ ...userProfile.equippedMascot, species: selectedSpecies }}
                speechText={`Tuyệt vời ${fullName}! Mình là ${getMascotById(selectedSpecies).name}. Mình sẽ luôn ở bên cổ vũ và đồng hành cùng bạn chinh phục Xác Suất Thống Kê!`}
                onClick={() => setStep(3)}
              />
            </div>

            <button
              onClick={() => setStep(3)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Xác nhận chọn {getMascotById(selectedSpecies).name} & Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
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
