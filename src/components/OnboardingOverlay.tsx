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
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-[#070d18] border-2 border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative text-white">
        {/* University & Developer Header with Cyber Neon styling */}
        <div className="mb-6 p-4 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/40 flex items-center justify-between shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <HubEdtLogo size="sm" />
          <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-black shadow-inner">
            AI Classroom v2.5 PRO
          </span>
        </div>

        {/* STEP 1: Name & Welcome */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                Chào mừng bạn đến với AI Classroom • HUB
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                Tạo Hồ Sơ Học Tập Cá Nhân
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
                Nhập Họ và Tên của bạn để bắt đầu hành trình chinh phục môn Xác Suất Thống Kê cùng AI Tutor!
              </p>
            </div>

            <form onSubmit={handleNextStep1} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Họ Và Tên Sinh Viên</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-slate-700 focus:border-cyan-400 bg-slate-900/90 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 outline-none text-sm font-semibold transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-4 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
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
            <div className="text-center space-y-1.5">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                BƯỚC 2: CHỌN BẠN ĐỒNG HÀNH
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                Chọn Linh Vật Đồng Hành Yêu Thích
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-md mx-auto leading-relaxed">
                Linh vật sẽ ở bên cổ vũ, động viên và tương tác cùng bạn trong suốt quá trình học!
              </p>
            </div>

            {/* Mascot Grid Selection (10 HUB Companions) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
              {MASCOT_CATALOG.map((m) => {
                const isSelected = selectedSpecies === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedSpecies(m.id)}
                    className={`p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 cursor-pointer text-center group ${
                      isSelected
                        ? `${m.borderColor} bg-slate-900 border-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/50 scale-105`
                        : 'border-slate-800 bg-slate-950/80 hover:border-cyan-500/50 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-700/60 shadow-inner group-hover:scale-105 transition-transform">
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
                    <span className="text-xs font-bold text-white truncate w-full mt-1 group-hover:text-cyan-200 transition-colors">
                      {m.shortTitle}
                    </span>
                    <span className="text-[10px] font-mono font-semibold text-cyan-400 truncate w-full">
                      {m.role}
                    </span>
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
              className="w-full py-4 px-4 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Xác nhận chọn {getMascotById(selectedSpecies).name} & Tiếp tục</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: Student Details */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                BƯỚC 3: THÔNG TIN HỌC TẬP
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                Thông Tin Sinh Viên & Lớp Học
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                Linh vật AI sẽ cá nhân hóa lộ trình và bài tập theo ngành học của bạn!
              </p>
            </div>

            <form onSubmit={handleNextStep3} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Lớp học phần</span>
                </label>
                <div className="relative">
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    placeholder="Ví dụ: 2026-DHKT01"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-700 focus:border-cyan-400 bg-slate-900/90 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 outline-none text-sm font-semibold transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Tên ngành học</span>
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    placeholder="Ví dụ: Tài chính Ngân hàng / Khoa học Dữ liệu"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-700 focus:border-cyan-400 bg-slate-900/90 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 outline-none text-sm font-semibold transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-cyan-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                  <IdCard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Mã số sinh viên (MSSV)</span>
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Ví dụ: 26110293"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-slate-700 focus:border-cyan-400 bg-slate-900/90 text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/30 outline-none text-sm font-mono font-semibold transition-all shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-4 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
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
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
                HƯỚNG DẪN TÍNH NĂNG ĐỈNH CAO
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.2)]">
                Khám Phá AI Classroom HUB!
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Sẵn sàng làm chủ toàn diện Xác Suất Thống Kê với bộ công cụ học tập thông minh
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all hover:border-amber-400">
                <p className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <span>📖</span>
                  <span>Lộ trình 4 Bước Feynman</span>
                </p>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Định nghĩa đơn giản, mô hình trực quan, bài tập thực hành & AI chấm điểm toàn diện.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all hover:border-cyan-400">
                <p className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <span>📝</span>
                  <span>AI Tutor Chấm Bảng iPad</span>
                </p>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Tương tác bằng viết tay iPad/chuột, upload PDF/ảnh, nhận chiến lược giải trước khi xem đáp án.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all hover:border-purple-400">
                <p className="font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                  <span>🗣️</span>
                  <span>Tương tác Giọng nói 2 Chiều</span>
                </p>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Trao đổi Q&A giọng nói với Linh vật thông thái, tự động xuất sơ đồ giải lên bảng iPad.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all hover:border-emerald-400">
                <p className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <span>🧮</span>
                  <span>Máy tính Casio FX-580VN</span>
                </p>
                <p className="text-slate-300 leading-relaxed font-medium">
                  Hướng dẫn bấm máy Menu 7 Phân phối & Thống kê chi tiết chuẩn xác từng phím.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleFinishOnboarding}
                className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700 font-bold rounded-2xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Bỏ qua (Skip)</span>
              </button>

              <button
                onClick={handleFinishOnboarding}
                className="flex-2 py-3.5 px-4 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.6)] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
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
