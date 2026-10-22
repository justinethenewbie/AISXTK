import React, { useState } from 'react';
import { CheckSquare, RefreshCw, CheckCircle2, HelpCircle, Sliders, Sparkles, AlertCircle, FileDown, Printer, FileText, Check, X, Key } from 'lucide-react';
import { CHAPTERS_DATA } from '../data/curriculumData';
import { MathFormula, MathText } from './MathFormula';
import { exportExercisesToWord, exportExercisesToPdf } from '../utils/exportUtils';
import { aiFetch } from '../utils/apiHelper';

interface McqPracticeProps {
  onAddExp: (amount: number, activityDetail?: string, exercisesCount?: number, gpaValue?: number) => void;
  onRecordMistake: (mistake: any) => void;
}

export const McqPractice: React.FC<McqPracticeProps> = ({ onAddExp, onRecordMistake }) => {
  // Config form state
  const [selectedChapterId, setSelectedChapterId] = useState<number | 'all'>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'Cơ bản' | 'Trung bình' | 'Vận dụng' | 'Vận dụng cao'>('Vận dụng');
  const [focusType, setFocusType] = useState<
    'Bài toán thực tế kinh tế & ngân hàng' | 'Lý thuyết & Khái niệm bản chất' | 'Kỹ năng tính toán công thức' | 'Câu hỏi bẫy thi cử'
  >('Bài toán thực tế kinh tế & ngân hàng');
  const [userExpectations, setUserExpectations] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [mcqList, setMcqList] = useState<any[]>([]);

  // Export config state
  const [includeSolutionsInExport, setIncludeSolutionsInExport] = useState(true);

  // User answers & Results
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  const handleGenerateCustomMcqs = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setShowResults(false);
    setUserAnswers({});
    setGenerationNotice(null);

    const chTitle =
      selectedChapterId === 'all'
        ? 'Toàn bộ 7 Chương Xác Suất Thống Kê Tổng Hợp'
        : CHAPTERS_DATA.find((c) => c.id === selectedChapterId)?.title || 'XSTK';

    try {
      const response = await aiFetch('/api/tutor/generate-similar', {
        method: 'POST',
        body: JSON.stringify({
          chapterId: selectedChapterId,
          chapterTitle: chTitle,
          type: 'mcq',
          count: questionCount,
          difficulty,
          focusType,
          userExpectations,
        }),
      });

      const data = await response.json();
      if (data.success && data.exercises && data.exercises.length > 0) {
        setMcqList(data.exercises);
        if (data.isAiGenerated) {
          setGenerationNotice('✨ Đề thi trắc nghiệm đã được sinh trực tiếp bằng Google Gemini AI theo đúng yêu cầu của bạn!');
        } else if (data.notice) {
          setGenerationNotice(data.notice);
        }
      } else {
        alert(data.error || 'Hệ thống đang chuẩn bị bộ đề theo yêu cầu, vui lòng thử lại!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (qIdx: number, optionIdx: number) => {
    if (showResults) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    setShowResults(true);
    let correctCount = 0;

    mcqList.forEach((q, idx) => {
      const userSel = userAnswers[idx];
      if (userSel === q.correctIndex) {
        correctCount += 1;
      } else {
        onRecordMistake({
          id: `mistake_mcq_${Date.now()}_${idx}`,
          chapterId: typeof selectedChapterId === 'number' ? selectedChapterId : 1,
          chapterTitle: typeof selectedChapterId === 'number' ? `Chương ${selectedChapterId}` : 'Tổng hợp XSTK',
          sourceType: 'mcq',
          questionSummary: q.question,
          studentAnswer: userSel !== undefined ? q.options?.[userSel] : 'Chưa chọn',
          correctConcept: q.options?.[q.correctIndex] || 'Đáp án đúng',
          rootCauseError: 'Lỗi chọn sai phương án trắc nghiệm',
          remediationAdvice: q.explanation || 'Đọc kỹ giải thích đáp án tại sao đúng/sai',
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    });

    const chapterName = selectedChapterId === 'all' ? 'Toàn bộ 7 Chương' : `Chương ${selectedChapterId}`;
    const gpaEquivalent = mcqList.length > 0 ? (correctCount / mcqList.length) * 4.0 : 0;
    onAddExp(
      correctCount * 15,
      `Thi trắc nghiệm: Đạt ${correctCount}/${mcqList.length} câu đúng (${chapterName})`,
      mcqList.length,
      gpaEquivalent
    );
  };

  const handleExportWord = () => {
    if (mcqList.length === 0) return;
    const chTitle =
      selectedChapterId === 'all'
        ? 'Toàn bộ 7 Chương XSTK Tổng Hợp'
        : CHAPTERS_DATA.find((c) => c.id === selectedChapterId)?.title || 'XSTK';

    exportExercisesToWord({
      title: `ĐỀ THI TRẮC NGHIỆM XSTK - ${mcqList.length} CÂU`,
      subject: 'MÔN: XÁC SUẤT VÀ THỐNG KÊ TOÁN',
      chapterTitle: chTitle,
      difficulty,
      exercises: mcqList.map((q) => ({
        question: q.question,
        title: q.title,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
      isMcq: true,
      includeSolutions: includeSolutionsInExport,
    });
  };

  const handleExportPdf = () => {
    if (mcqList.length === 0) return;
    const chTitle =
      selectedChapterId === 'all'
        ? 'Toàn bộ 7 Chương XSTK Tổng Hợp'
        : CHAPTERS_DATA.find((c) => c.id === selectedChapterId)?.title || 'XSTK';

    exportExercisesToPdf({
      title: `ĐỀ THI TRẮC NGHIỆM XSTK - ${mcqList.length} CÂU`,
      subject: 'MÔN: XÁC SUẤT VÀ THỐNG KÊ TOÁN',
      chapterTitle: chTitle,
      difficulty,
      exercises: mcqList.map((q) => ({
        question: q.question,
        title: q.title,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation,
      })),
      isMcq: true,
      includeSolutions: includeSolutionsInExport,
    });
  };

  const correctCount = Object.values(userAnswers).filter((ans, idx) => ans === mcqList[idx]?.correctIndex).length;
  const scorePercentage = mcqList.length > 0 ? Math.round((correctCount / mcqList.length) * 100) : 0;

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner - High Contrast Neon Cyan & Emerald */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
          <CheckSquare className="w-5 h-5 text-cyan-400" />
          <span>TRÌNH TẠO ĐỀ THI TRẮC NGHIỆM AI CÁ NHÂN HÓA TOÀN DIỆN</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          Thiết Lập Đề Thi Trắc Nghiệm Theo Yêu Cầu Riêng Của Bạn
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Tùy chỉnh số lượng câu hỏi (từ 5 đến 20 câu), chủ đề trong 7 chương, độ khó phân hóa và trọng tâm bài thi. AI sinh đề tức thì, chấm điểm chính xác và hỗ trợ xuất file Word/PDF in ấn!
        </p>
      </div>

      {/* Setup Form */}
      <form onSubmit={handleGenerateCustomMcqs} className="bg-slate-900/90 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div className="flex items-center gap-2 font-black text-cyan-300 text-xs border-b border-slate-800 pb-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>BẢNG THIẾT LẬP THÔNG SỐ ĐỀ THI TRẮC NGHIỆM</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Topic Select */}
          <div>
            <label className="block text-slate-200 font-bold mb-1.5">
              1. Chủ đề / Chương muốn hỏi:
            </label>
            <select
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-cyan-500/30 bg-slate-950 text-white font-semibold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            >
              <option value="all">Toàn bộ 7 Chương (Tổng hợp)</option>
              {CHAPTERS_DATA.map((c) => (
                <option key={c.id} value={c.id}>
                  Chương {c.id}: {c.shortTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-slate-200 font-bold mb-1.5">
              2. Số lượng câu hỏi:
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-cyan-500/30 bg-slate-950 text-white font-semibold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            >
              <option value={5}>5 câu hỏi (Luyện nhanh 15p)</option>
              <option value={10}>10 câu hỏi (Đề thi chuẩn 30p)</option>
              <option value={15}>15 câu hỏi (Đề thi giữa kỳ 45p)</option>
              <option value={20}>20 câu hỏi (Đề thi cuối kỳ 60p)</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-slate-200 font-bold mb-1.5">
              3. Mức độ câu hỏi:
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full p-3 rounded-xl border border-cyan-500/30 bg-slate-950 text-white font-semibold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            >
              <option value="Cơ bản">Cơ bản (Nhận biết)</option>
              <option value="Trung bình">Trung bình (Thông hiểu)</option>
              <option value="Vận dụng">Vận dụng (Bài toán thực tế)</option>
              <option value="Vận dụng cao">Vận dụng cao (Phân hóa 9-10đ)</option>
            </select>
          </div>

          {/* Focus Type */}
          <div>
            <label className="block text-slate-200 font-bold mb-1.5">
              4. Trọng tâm hình thức hỏi:
            </label>
            <select
              value={focusType}
              onChange={(e) => setFocusType(e.target.value as any)}
              className="w-full p-3 rounded-xl border border-cyan-500/30 bg-slate-950 text-white font-semibold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            >
              <option value="Bài toán thực tế kinh tế & ngân hàng">Kinh tế & Ngân hàng</option>
              <option value="Lý thuyết & Khái niệm bản chất">Lý thuyết bản chất & Định lý</option>
              <option value="Kỹ năng tính toán công thức">Kỹ năng tính toán & Bấm máy</option>
              <option value="Câu hỏi bẫy thi cử">Bẫy thi cử hay sai sót</option>
            </select>
          </div>
        </div>

        {/* User specific expectations */}
        <div>
          <label className="block text-xs text-slate-200 font-bold mb-1.5">
            5. Yêu cầu & Kỳ vọng cụ thể của bạn (Tùy chọn):
          </label>
          <input
            type="text"
            value={userExpectations}
            onChange={(e) => setUserExpectations(e.target.value)}
            placeholder="Ví dụ: Tập trung vào công thức Bayes, phân phối Poisson, tích phân liên tục và bảng số liệu..."
            className="w-full p-3 rounded-xl border border-cyan-500/30 bg-slate-950 text-white placeholder-slate-400 text-xs outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-medium"
          />
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>{isLoading ? `AI đang tạo ${questionCount} câu hỏi trắc nghiệm theo yêu cầu...` : `TẠO NGAY BỘ ĐỀ TRẮC NGHIỆM (${questionCount} CÂU)`}</span>
        </button>

        {generationNotice && (
          <div className="p-3 bg-cyan-950/70 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 flex items-center gap-2 animate-fade-in font-medium">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{generationNotice}</span>
          </div>
        )}
      </form>

      {/* Render Questions List */}
      {mcqList.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          {/* Export Action Bar (Word & PDF) */}
          <div className="p-4 bg-slate-900 border-2 border-cyan-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <FileDown className="w-5 h-5 text-cyan-400" />
              </span>
              <div>
                <p className="text-xs font-black text-white">Trích Xuất Đề Thi Ra File (Word / PDF)</p>
                <p className="text-[11px] text-slate-300 font-medium">Bộ đề gồm {mcqList.length} câu trắc nghiệm chuẩn format đại học</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-200 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={includeSolutionsInExport}
                  onChange={(e) => setIncludeSolutionsInExport(e.target.checked)}
                  className="rounded border-cyan-500 text-cyan-500 focus:ring-cyan-400"
                />
                <span>Kèm đáp án & Lời giải</span>
              </label>

              <button
                type="button"
                onClick={handleExportWord}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                title="Tải đề thi dạng file Microsoft Word (.doc)"
              >
                <FileText className="w-4 h-4" />
                <span>Xuất Word (.doc)</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                title="In hoặc Lưu thành file PDF chuẩn A4"
              >
                <Printer className="w-4 h-4" />
                <span>Xuất PDF</span>
              </button>
            </div>
          </div>

          {/* Summary Banner after submitting */}
          {showResults && (
            <div className="p-5 bg-slate-900 border-2 border-emerald-400/60 rounded-3xl flex items-center justify-between text-xs shadow-[0_0_20px_rgba(16,185,129,0.25)]">
              <div>
                <p className="font-black text-emerald-300 text-sm">Kết Quả Bài Làm Của Bạn</p>
                <p className="text-slate-200 font-medium mt-0.5">
                  Số câu đúng: <span className="text-emerald-400 font-bold">{correctCount}</span> / {mcqList.length} câu
                </p>
              </div>
              <div className="text-3xl font-black font-mono text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                {scorePercentage}%
              </div>
            </div>
          )}

          {mcqList.map((q, qIdx) => {
            const selectedOpt = userAnswers[qIdx];
            const isCorrect = selectedOpt === q.correctIndex;

            return (
              <div
                key={qIdx}
                className="bg-slate-900 border-2 border-cyan-500/25 p-5 rounded-2xl space-y-3 shadow-md hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2.5">
                  <span className="font-black text-cyan-300">
                    Câu hỏi #{qIdx + 1}: {q.title || `Trắc nghiệm câu ${qIdx + 1}`}
                  </span>
                  {showResults && (
                    <span
                      className={`font-black px-2.5 py-1 rounded-lg text-[10px] flex items-center gap-1 ${
                        isCorrect
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-500/50 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                      }`}
                    >
                      {isCorrect ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
                      <span>{isCorrect ? 'Chính xác (+15 EXP)' : 'Chưa chính xác'}</span>
                    </span>
                  )}
                </div>

                <div className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                  <MathText text={q.question} />
                </div>

                {/* Options List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                  {q.options?.map((opt: string, oIdx: number) => {
                    const isSelected = selectedOpt === oIdx;
                    let btnStyle =
                      'bg-slate-950 hover:bg-slate-800/80 text-slate-200 border-slate-700/80 hover:border-cyan-400/50';

                    if (isSelected) {
                      btnStyle = 'bg-cyan-950/80 border-cyan-400 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]';
                    }

                    if (showResults) {
                      if (oIdx === q.correctIndex) {
                        btnStyle = 'bg-emerald-950/90 border-emerald-400 text-emerald-200 font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)]';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'bg-rose-950/80 border-rose-400 text-rose-200 line-through opacity-80';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(qIdx, oIdx)}
                        className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${btnStyle}`}
                      >
                        <span className="font-black shrink-0 text-cyan-400">{String.fromCharCode(65 + oIdx)}.</span>
                        <span className="flex-1 text-slate-100 font-medium">
                          <MathText text={opt} inline />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Detailed Explanation upon Submission */}
                {showResults && (
                  <div className="p-4 bg-slate-950 rounded-xl border border-cyan-500/30 text-xs text-slate-200 space-y-1.5 mt-2">
                    <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>Giải thích chi tiết tại sao đáp án lại đúng/sai từ AI Tutor:</span>
                    </p>
                    <div className="text-slate-200 font-medium leading-relaxed">
                      <MathText text={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!showResults && (
            <button
              onClick={handleSubmitQuiz}
              disabled={Object.keys(userAnswers).length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all text-xs flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Nộp Bài Làm & Xem Điểm Chấm Ngay Tức Thì</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
