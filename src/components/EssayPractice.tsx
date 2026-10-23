import React, { useState } from 'react';
import { FileText, Sparkles, Lightbulb, Sliders, CheckCircle2, RefreshCw, FileDown, Printer, Award, AlertCircle } from 'lucide-react';
import { CHAPTERS_DATA } from '../data/curriculumData';
import { InteractiveCanvas } from './InteractiveCanvas';
import { MathFormula, MathText } from './MathFormula';
import { exportExercisesToWord, exportExercisesToPdf } from '../utils/exportUtils';
import { aiFetch } from '../utils/apiHelper';

interface EssayPracticeProps {
  onAddExp: (amount: number, details?: string, count?: number, gpaScore?: number) => void;
  onRecordMistake?: (record: any) => void;
}

const INITIAL_DEMO_ESSAYS = [
  {
    id: 'essay-1',
    title: 'Bài toán Thực tế: Phân tích Rủi ro & Kỳ vọng Doanh thu Dự án Đầu tư',
    question:
      'Một công ty tài chính đầu tư vào 3 dự án độc lập A, B, C với xác suất thành công lần lượt là P(A) = 0.7, P(B) = 0.8, P(C) = 0.6. Nếu dự án thành công, công ty thu về lợi nhuận tương ứng là 100 triệu, 150 triệu và 200 triệu đồng; nếu thất bại thì lợi nhuận bằng 0. Gọi X là tổng lợi nhuận công ty thu được.\n\na) Hãy lập luận xác định các giá trị có thể có của biến ngẫu nhiên X.\nb) Tính kỳ vọng E(X) và độ lệch chuẩn \\sigma(X) của tổng lợi nhuận công ty.',
    strategyHint:
      'Bước 1: Do 3 dự án độc lập, áp dụng tính chất tuyến tính của kỳ vọng: E(X) = E(X_A) + E(X_B) + E(X_C). Bước 2: Với mỗi dự án i, E(X_i) = p_i * r_i. Bước 3: Tính phương sai Var(X) = Var(X_A) + Var(X_B) + Var(X_C) do các biến độc lập.',
    keyFormulas: [
      'E(X) = \\sum_{i=1}^{n} E(X_i)',
      'Var(X) = E(X^2) - [E(X)]^2',
      '\\sigma(X) = \\sqrt{Var(X)}',
    ],
    expectedAnswerSummary:
      'E(X) = 0.7*100 + 0.8*150 + 0.6*200 = 70 + 120 + 120 = 310 (triệu đồng).',
  },
];

export const EssayPractice: React.FC<EssayPracticeProps> = ({ onAddExp, onRecordMistake }) => {
  // Config form state
  const [selectedChapterId, setSelectedChapterId] = useState<number | 'all'>('all');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<'Cơ bản' | 'Trung bình' | 'Vận dụng' | 'Vận dụng cao'>('Vận dụng');
  const [focusType, setFocusType] = useState<
    'Bài toán thực tế kinh tế & ngân hàng' | 'Lập luận chứng minh & Biến cố' | 'Bảng số liệu phân phối tần số' | 'Kiểm định & Ước lượng mẫu'
  >('Bài toán thực tế kinh tế & ngân hàng');
  const [userExpectations, setUserExpectations] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [essayList, setEssayList] = useState<any[]>(INITIAL_DEMO_ESSAYS);

  // Export config state
  const [includeSolutionsInExport, setIncludeSolutionsInExport] = useState(true);

  // Submission state
  const [activeEssayIdx, setActiveEssayIdx] = useState(0);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  // Two-way interactive dialogue with Professor on graded essay
  const [essayDialogue, setEssayDialogue] = useState<
    Array<{ studentQuestion: string; teacherReply: string; comprehensionCheck?: string }>
  >([]);
  const [essayFollowUpInput, setEssayFollowUpInput] = useState('');
  const [isAskingTeacher, setIsAskingTeacher] = useState(false);

  const handleAskTeacherAboutEssay = async (customQ?: string) => {
    const q = customQ || essayFollowUpInput;
    if (!q.trim()) return;
    setIsAskingTeacher(true);

    try {
      const curEssay = essayList[activeEssayIdx];
      const response = await aiFetch('/api/tutor/interactive-qa', {
        method: 'POST',
        body: JSON.stringify({
          contextType: 'essay',
          problemContext: curEssay ? `Đề bài: ${curEssay.question}` : 'Bài tập tự luận',
          previousSolution: evaluationResult
            ? `Điểm: ${evaluationResult.totalScore}/10. Nhận xét: ${evaluationResult.detailedFeedback}`
            : '',
          studentQuestion: q,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setEssayDialogue((prev) => [
          ...prev,
          {
            studentQuestion: q,
            teacherReply: data.data.teacherExplanation,
            comprehensionCheck: data.data.comprehensionCheck,
          },
        ]);
        setEssayFollowUpInput('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingTeacher(false);
    }
  };

  const handleNextEssay = () => {
    if (activeEssayIdx < essayList.length - 1) {
      setActiveEssayIdx((prev) => prev + 1);
      setEvaluationResult(null);
      setEssayDialogue([]);
    } else {
      alert('Chúc mừng em đã hoàn thành toàn bộ các bài tự luận trong danh sách!');
    }
  };

  const handleExportWord = () => {
    if (essayList.length === 0) return;
    const chTitle =
      selectedChapterId === 'all'
        ? 'Toàn bộ 7 Chương XSTK Tổng Hợp'
        : CHAPTERS_DATA.find((c) => c.id === selectedChapterId)?.title || 'XSTK';

    exportExercisesToWord({
      title: `ĐỀ THI TỰ LUẬN XSTK - ${essayList.length} BÀI TOÁN`,
      subject: 'MÔN: XÁC SUẤT VÀ THỐNG KÊ TOÁN',
      chapterTitle: chTitle,
      difficulty,
      exercises: essayList.map((e) => ({
        question: e.question,
        title: e.title,
        strategyHint: e.strategyHint,
        keyFormulas: e.keyFormulas,
        expectedAnswerSummary: e.expectedAnswerSummary,
      })),
      isMcq: false,
      includeSolutions: includeSolutionsInExport,
    });
  };

  const handleExportPdf = () => {
    if (essayList.length === 0) return;
    const chTitle =
      selectedChapterId === 'all'
        ? 'Toàn bộ 7 Chương XSTK Tổng Hợp'
        : CHAPTERS_DATA.find((c) => c.id === selectedChapterId)?.title || 'XSTK';

    exportExercisesToPdf({
      title: `ĐỀ THI TỰ LUẬN XSTK - ${essayList.length} BÀI TOÁN`,
      subject: 'MÔN: XÁC SUẤT VÀ THỐNG KÊ TOÁN',
      chapterTitle: chTitle,
      difficulty,
      exercises: essayList.map((e) => ({
        question: e.question,
        title: e.title,
        strategyHint: e.strategyHint,
        keyFormulas: e.keyFormulas,
        expectedAnswerSummary: e.expectedAnswerSummary,
      })),
      isMcq: false,
      includeSolutions: includeSolutionsInExport,
    });
  };

  const handleGenerateCustomEssays = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setEvaluationResult(null);
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
          type: 'essay',
          count: questionCount,
          difficulty,
          focusType,
          userExpectations,
        }),
      });

      const data = await response.json();
      if (data.success && data.exercises && data.exercises.length > 0) {
        setEssayList(data.exercises);
        setActiveEssayIdx(0);
        onAddExp(30);
        if (data.isAiGenerated) {
          setGenerationNotice('✨ Đề thi tự luận đã được sinh trực tiếp bằng Google Gemini AI theo đúng yêu cầu của bạn!');
        } else if (data.notice) {
          setGenerationNotice(data.notice);
        }
      } else {
        setGenerationNotice(data.error || 'Hệ thống đang chuẩn bị bộ đề theo yêu cầu, vui lòng thử lại!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGradeEssaySubmission = async (dataUrl: string, typedText: string) => {
    const curEssay = essayList[activeEssayIdx];
    if (!curEssay) return;

    setIsSubmitting(true);
    setEvaluationResult(null);

    try {
      const response = await aiFetch('/api/tutor/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: dataUrl,
          textContent: `Đề bài: "${curEssay.question}"\nBài làm của sinh viên: "${typedText}"`,
          chapterTitle: 'Bài tập tự luận do AI sinh theo yêu cầu',
          strategyOnly: false,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEvaluationResult(data.data);
        const score =
          typeof data.data.totalScore === 'number'
            ? data.data.totalScore
            : typeof data.data.score === 'number'
            ? data.data.score
            : 8;
        const gpaEquivalent = (score / 10) * 4.0;
        onAddExp(
          score * 10,
          `Luyện tập tự luận: ${curEssay.title || 'Bài tập XSTK'} (${score}/10 điểm)`,
          1,
          gpaEquivalent
        );

        if (score < 8 && onRecordMistake) {
          onRecordMistake({
            id: `essay_mistake_${curEssay.id || Date.now()}`,
            chapterId: typeof selectedChapterId === 'number' ? selectedChapterId : 1,
            chapterTitle: typeof selectedChapterId === 'number' ? `Chương ${selectedChapterId}` : 'Tổng hợp XSTK',
            sourceType: 'essay',
            questionSummary: curEssay.question,
            studentAnswer: typedText || 'Bài làm viết tay trên bảng',
            correctConcept: curEssay.expectedAnswerSummary || 'Trình bày theo phương pháp giải chuẩn',
            rootCauseError:
              data.data.rootCauseError ||
              (data.data.criticalErrors && data.data.criticalErrors[0]) ||
              'Lỗi lập luận công thức hoặc trình bày tự luận',
            remediationAdvice:
              data.data.betterStrategy ||
              'Ôn lại định lý và các bước lập luận trước khi thế số',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      } else if (data.error) {
        setGenerationNotice(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentEssay = essayList[activeEssayIdx];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
          <FileText className="w-5 h-5 text-cyan-400" />
          <span>TRÌNH TẠO ĐỀ THI TỰ LUẬN AI CÁ NHÂN HÓA TOÀN DIỆN</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          Thiết Lập Đề Thi Tự Luận XSTK Theo Đúng Ý Muốn Của Bạn
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Tùy chọn chủ đề, số lượng câu hỏi, mức độ khó và kỳ vọng cụ thể. AI sẽ sinh đề thi ngay lập tức, cung cấp chiến lược giải từng bước và hỗ trợ làm bài trực tiếp trên bảng iPad!
        </p>
      </div>

      {/* Setup Form */}
      <form onSubmit={handleGenerateCustomEssays} className="bg-slate-900/90 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div className="flex items-center gap-2 font-black text-cyan-300 text-xs border-b border-slate-800 pb-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>BẢNG THIẾT LẬP THÔNG SỐ ĐỀ THI TỰ LUẬN</span>
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
              2. Số lượng bài toán tự luận:
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full p-3 rounded-xl border border-cyan-500/30 bg-slate-950 text-white font-semibold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            >
              <option value={3}>3 bài toán (Luyện nhanh 20p)</option>
              <option value={5}>5 bài toán (Đề tự luyện chuẩn 45p)</option>
              <option value={8}>8 bài toán (Đề ôn tập giữa kỳ)</option>
              <option value={10}>10 bài toán (Đề tổng ôn toàn diện 90p)</option>
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
              <option value="Cơ bản">Cơ bản (Áp dụng công thức trực tiếp)</option>
              <option value="Trung bình">Trung bình (Phân tích biến cố)</option>
              <option value="Vận dụng">Vận dụng (Bài toán thực tế kinh tế)</option>
              <option value="Vận dụng cao">Vận dụng cao (Phân hóa 9-10đ thi cử)</option>
            </select>
          </div>

          {/* Focus Type */}
          <div>
            <label className="block text-slate-200 font-bold mb-1.5">
              4. Trọng tâm hình thức:
            </label>
            <select
              value={focusType}
              onChange={(e) => setFocusType(e.target.value as any)}
              className="w-full p-3 rounded-xl border border-cyan-500/30 bg-slate-950 text-white font-semibold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            >
              <option value="Bài toán thực tế kinh tế & ngân hàng">Thực tế Kinh tế & Ngân hàng</option>
              <option value="Lập luận chứng minh & Biến cố">Phân tích biến cố & Xác suất điều kiện</option>
              <option value="Bảng số liệu phân phối tần số">Bảng số liệu tần số & Số đặc trưng</option>
              <option value="Kiểm định & Ước lượng mẫu">Ước lượng & Kiểm định giả thiết</option>
            </select>
          </div>
        </div>

        {/* User specific expectations */}
        <div>
          <label className="block text-xs text-slate-200 font-bold mb-1.5">
            5. Yêu cầu & Kỳ vọng riêng của bạn (Tùy chọn):
          </label>
          <input
            type="text"
            value={userExpectations}
            onChange={(e) => setUserExpectations(e.target.value)}
            placeholder="Ví dụ: Cần bài toán tính tỷ lệ thu hồi nợ xấu, hàm mật độ liên tục, tìm hằng số k và phương sai..."
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
          <span>{isLoading ? `AI đang tạo ${questionCount} bài toán tự luận theo yêu cầu...` : `TẠO NGAY BỘ ĐỀ TỰ LUẬN (${questionCount} BÀI TOÁN)`}</span>
        </button>

        {generationNotice && (
          <div className="p-3 bg-cyan-950/70 border border-cyan-500/40 rounded-xl text-xs text-cyan-200 flex items-center gap-2 animate-fade-in font-medium">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{generationNotice}</span>
          </div>
        )}
      </form>

      {/* Render Essay Problem Workspace */}
      {essayList.length > 0 && currentEssay && (
        <div className="space-y-6 animate-fade-in">
          {/* Export Action Bar (Word & PDF) */}
          <div className="p-4 bg-slate-900 border-2 border-cyan-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <FileDown className="w-5 h-5 text-cyan-400" />
              </span>
              <div>
                <p className="text-xs font-black text-white">Trích Xuất Đề Thi Tự Luận Ra File (Word / PDF)</p>
                <p className="text-[11px] text-slate-300 font-medium">Bộ đề gồm {essayList.length} bài toán tự luận có gợi ý chiến lược & barem điểm</p>
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
                <span>Kèm chiến lược giải & công thức</span>
              </label>

              <button
                type="button"
                onClick={handleExportWord}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                title="Tải đề thi tự luận dạng file Microsoft Word (.doc)"
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

          {/* Question Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {essayList.map((essay, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveEssayIdx(idx);
                  setEvaluationResult(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeEssayIdx === idx
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:text-white'
                }`}
              >
                Bài toán #{idx + 1}
              </button>
            ))}
          </div>

          {/* Current Essay Problem Card */}
          <div className="bg-slate-900 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="font-black text-cyan-300 text-sm sm:text-base">
                Bài toán #{activeEssayIdx + 1}: {currentEssay.title || `Bài tập tự luận ${activeEssayIdx + 1}`}
              </span>
              <span className="text-xs font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold px-3 py-1 rounded-lg">
                Chiến Lược Giải & Barem Rubric
              </span>
            </div>

            <div className="text-sm sm:text-base text-white font-medium leading-relaxed">
              <MathText text={currentEssay.question} />
            </div>

            {/* Strategy Hint Box */}
            <div className="p-4 sm:p-5 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2.5 text-sm sm:text-base">
              <div className="flex items-center gap-2 font-black text-cyan-300 text-sm sm:text-base">
                <Lightbulb className="w-5 h-5 text-cyan-400" />
                <span>Gợi ý chiến lược định hướng từng bước giải từ AI:</span>
              </div>
              <div className="text-slate-200 leading-relaxed font-medium">
                <MathText text={currentEssay.strategyHint || 'Đọc kỹ đề bài, xác định mô hình biến ngẫu nhiên và áp dụng công thức tương ứng.'} />
              </div>

              {currentEssay.keyFormulas && currentEssay.keyFormulas.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2 items-center">
                  <span className="font-bold text-xs sm:text-sm text-slate-300">Công thức cần dùng:</span>
                  {currentEssay.keyFormulas.map((f: string, i: number) => (
                    <span key={i} className="font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-cyan-500/40 text-cyan-300 font-bold text-xs sm:text-sm">
                      <MathFormula math={f} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Interactive iPad Canvas to write/type solution */}
            <div className="pt-2">
              <InteractiveCanvas
                onExportCanvas={handleGradeEssaySubmission}
                isSubmitting={isSubmitting}
              />
            </div>

            {/* AI Grading Result */}
            {evaluationResult && (
              <div className="space-y-4">
                <div className="p-6 bg-slate-950 border-2 border-emerald-400/80 rounded-3xl text-sm sm:text-base space-y-4 animate-fade-in shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <div className="flex items-center justify-between font-black text-emerald-300 text-sm sm:text-base flex-wrap gap-2">
                    <span className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      <span>Kết Quả Chấm Điểm & Nhận Xét Của Thầy Giáo AI:</span>
                    </span>
                    <span className="font-mono text-base sm:text-lg bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-xl border border-emerald-500/40">
                      {evaluationResult.totalScore} / 10 điểm
                    </span>
                  </div>
                  <div className="text-slate-100 leading-relaxed font-medium text-sm sm:text-base bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800">
                    <MathText text={evaluationResult.detailedFeedback} />
                  </div>
                  {evaluationResult.betterStrategy && (
                    <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-emerald-500/40">
                      <p className="font-bold text-emerald-300 mb-1.5 flex items-center gap-2 text-sm sm:text-base">
                        <Award className="w-5 h-5 text-emerald-400" />
                        <span>Lời khuyên phương pháp & chiến lược tối ưu:</span>
                      </p>
                      <div className="text-slate-200 leading-relaxed text-sm sm:text-base">
                        <MathText text={evaluationResult.betterStrategy} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Interactive Dialogue with Professor */}
                <div className="p-6 bg-slate-900/95 border-2 border-cyan-500/40 rounded-3xl space-y-4 text-sm sm:text-base shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-cyan-300 uppercase tracking-wider text-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Trao đổi trực tiếp với Thầy giáo về bài làm này (Không giới hạn câu hỏi):</span>
                    </span>
                    <span className="text-[11px] text-slate-300 font-bold">
                      Hỏi bất kỳ thắc mắc nào cho đến khi hiểu rõ
                    </span>
                  </div>

                  {/* Previous dialogue items */}
                  {essayDialogue.map((d, dIdx) => (
                    <div key={dIdx} className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-cyan-500/30">
                      <div className="text-cyan-300 font-bold flex items-center gap-1.5">
                        <span>🙋 Em hỏi:</span>
                        <MathText text={d.studentQuestion} />
                      </div>
                      <div className="text-slate-100 pt-2 border-t border-slate-800 space-y-2">
                        <span className="font-bold text-emerald-400 block">👨‍🏫 Thầy giải đáp chi tiết:</span>
                        <div className="leading-relaxed">
                          <MathText text={d.teacherReply} />
                        </div>
                        {d.comprehensionCheck && (
                          <div className="p-3 bg-cyan-950/60 rounded-xl border border-cyan-500/30 text-cyan-200 mt-2">
                            <span className="font-bold text-cyan-300 block mb-0.5">💡 Thầy kiểm tra lại:</span>
                            <MathText text={d.comprehensionCheck} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Suggested questions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="text-[11px] text-slate-400 font-bold block w-full">Gợi ý hỏi nhanh:</span>
                    {[
                      'Thầy ơi tại sao chỗ này em bị trừ điểm?',
                      'Nếu giải theo biến cố đối lập thì trình bày ra sao?',
                      'Chỉ em cách bấm máy Casio 580 để kiểm tra bài này với!',
                    ].map((sq, sqIdx) => (
                      <button
                        key={sqIdx}
                        onClick={() => handleAskTeacherAboutEssay(sq)}
                        disabled={isAskingTeacher}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-400 rounded-xl font-bold text-[11px] transition-all"
                      >
                        {sq}
                      </button>
                    ))}
                  </div>

                  {/* Custom question input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      value={essayFollowUpInput}
                      onChange={(e) => setEssayFollowUpInput(e.target.value)}
                      placeholder="Gõ hoặc nói câu hỏi để Thầy giải đáp chi tiết từng bước..."
                      className="flex-1 bg-slate-950 border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-300"
                      onKeyDown={(e) => e.key === 'Enter' && handleAskTeacherAboutEssay()}
                    />
                    <button
                      onClick={() => handleAskTeacherAboutEssay()}
                      disabled={isAskingTeacher}
                      className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
                    >
                      {isAskingTeacher ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Hỏi Thầy</span>
                    </button>
                  </div>

                  {/* Pedagogical Checkpoint: Only move to next problem when user confirms understanding */}
                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-slate-300 font-medium text-[11px]">
                      Chừng nào em đã hiểu rõ toàn bộ bài này và không còn thắc mắc, hãy bấm xác nhận để làm bài tiếp theo!
                    </p>
                    <button
                      onClick={handleNextEssay}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Em đã hiểu hoàn toàn, chuyển sang bài tiếp theo! ➔</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
