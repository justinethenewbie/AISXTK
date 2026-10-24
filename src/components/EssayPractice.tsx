import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Lightbulb,
  Sliders,
  CheckCircle2,
  RefreshCw,
  FileDown,
  Printer,
  Award,
  AlertCircle,
  BookOpen,
  HelpCircle,
  Layers,
  ChevronRight,
  ShieldAlert,
  Calculator,
  Flame,
} from 'lucide-react';
import { CHAPTERS_DATA } from '../data/curriculumData';
import { OFFICIAL_HUB_EXAMS, HubExamPaper, HubExamQuestion } from '../data/hubExamArchiveData';
import { HubExamCheatSheetModal } from './HubExamCheatSheetModal';
import { InteractiveCanvas } from './InteractiveCanvas';
import { MathFormula, MathText, fixStuckVietnameseMathWords } from './MathFormula';
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
      'Một công ty tài chính đầu tư vào 3 dự án độc lập A, B, C với xác suất thành công lần lượt là $P(A) = 0.7$, $P(B) = 0.8$, $P(C) = 0.6$. Nếu dự án thành công, công ty thu về lợi nhuận tương ứng là 100 triệu, 150 triệu và 200 triệu đồng; nếu thất bại thì lợi nhuận bằng 0. Gọi $X$ là tổng lợi nhuận công ty thu được.\n\na) Hãy lập luận xác định các giá trị có thể có của biến ngẫu nhiên $X$.\nb) Tính kỳ vọng $E(X)$ và độ lệch chuẩn $\\sigma(X)$ của tổng lợi nhuận công ty.',
    strategyHint:
      'Bước 1: Do 3 dự án độc lập, áp dụng tính chất tuyến tính của kỳ vọng:\n$$E(X) = E(X_A) + E(X_B) + E(X_C)$$\n\nBước 2: Với mỗi dự án $i$, kỳ vọng thành phần là $E(X_i) = p_i \\cdot r_i$.\n\nBước 3: Do các biến cố độc lập, phương sai tổng bằng tổng các phương sai:\n$$\\text{Var}(X) = \\text{Var}(X_A) + \\text{Var}(X_B) + \\text{Var}(X_C)$$\ntừ đó suy ra độ lệch chuẩn: $$\\sigma(X) = \\sqrt{\\text{Var}(X)}$$',
    keyFormulas: [
      'E(X) = \\sum_{i=1}^{n} E(X_i)',
      '\\text{Var}(X) = E(X^2) - [E(X)]^2',
      '\\sigma(X) = \\sqrt{\\text{Var}(X)}',
    ],
    expectedAnswerSummary:
      '$E(X) = 0.7 \\times 100 + 0.8 \\times 150 + 0.6 \\times 200 = 70 + 120 + 120 = 310$ (triệu đồng).',
  },
];

function getSafeStrategyHint(essay: any): string {
  if (!essay) return 'Đọc kỹ đề bài, xác định mô hình biến ngẫu nhiên và áp dụng công thức tương ứng.';
  let hint =
    essay.strategyHint ||
    essay.strategy ||
    essay.hint ||
    essay.defaultStrategyHint ||
    essay.solutionStrategy ||
    essay.guidance ||
    essay.steps ||
    '';

  if (!hint || typeof hint !== 'string' || hint.trim() === 'undefined' || hint.trim() === 'null') {
    if (essay.keyFormulas && Array.isArray(essay.keyFormulas) && essay.keyFormulas.length > 0) {
      return `Bước 1: Đọc kỹ giả thiết đề bài, xác định các thông số ban đầu.\n\nBước 2: Áp dụng công thức cốt lõi: $${essay.keyFormulas.join('$; $')}$.\n\nBước 3: Thế số liệu, tính toán kết quả và nêu ý nghĩa kinh tế thực tế.`;
    }
    return 'Bước 1: Phân tích các dữ kiện giả thiết của bài toán.\n\nBước 2: Xác định dạng phân phối hoặc công thức thống kê tương ứng.\n\nBước 3: Lập luận chặt chẽ và tính toán kết quả.';
  }

  // Phục hồi các từ ngữ toán - thống kê bị dính chữ (nếu có từ trước)
  hint = fixStuckVietnameseMathWords(hint);

  // Tách dòng rõ ràng trước mỗi Bước X và xóa dấu chấm thừa
  hint = hint.replace(/(?:\.\s*)?\n*\s*(\bBước\s*\d+\s*:)/gi, '\n\n$1 ');

  // Khắc phục triệt để lỗi gõ nhầm =/sqrt hoặc =/\sqrt hoặc \sqrt Var(X)
  hint = hint.replace(/([=+\-*/(,])\s*\/\s*\\?sqrt\b/gi, '$1 \\sqrt');
  hint = hint.replace(/(^|[\s(])\/\s*\\?sqrt\b/gi, '$1\\sqrt');
  hint = hint.replace(/\\sqrt\s*\{?\s*(?:\\text\{)?Var\}?\s*\(([^)]+)\)\s*\}?/gi, '\\sqrt{\\text{Var}($1)}');

  // Chuẩn hóa an toàn các công thức xác suất nếu chưa được delimit
  hint = hint.replace(/(?<!\$)\bE\(X\)\s*=\s*E\(X_A\)\s*\+\s*E\(X_B\)\s*\+\s*E\(X_C\)\b(?!\$)/g, '$E(X) = E(X_A) + E(X_B) + E(X_C)$');
  hint = hint.replace(/(?<!\$)\bE\(X_i\)\s*=\s*p_i\s*[*·\u00B7]\s*r_i\b(?!\$)/g, '$E(X_i) = p_i \\cdot r_i$');
  hint = hint.replace(/(?<!\$)\b(?:\\text\{Var\}|Var)\(X\)\s*=\s*(?:\\text\{Var\}|Var)\(X_A\)\s*\+\s*(?:\\text\{Var\}|Var)\(X_B\)\s*\+\s*(?:\\text\{Var\}|Var)\(X_C\)\b(?!\$)/g, '$\\text{Var}(X) = \\text{Var}(X_A) + \\text{Var}(X_B) + \\text{Var}(X_C)$');
  hint = hint.replace(/(?<!\$)\bf\s*=\s*m\s*\/\s*n\b(?!\$)/g, '$f = \\frac{m}{n}$');

  return hint.trim();
}

export const EssayPractice: React.FC<EssayPracticeProps> = ({ onAddExp, onRecordMistake }) => {
  // Chế độ xem: Sinh đề tự luận AI hoặc Kho đề thi chính thức HUB (2026 & 2023)
  const [viewMode, setViewMode] = useState<'hub_official_exams' | 'ai_generator'>('hub_official_exams');

  // Official HUB Exams State
  const [selectedExamId, setSelectedExamId] = useState<string>('hub_2026_02a');
  const [activeHubQIdx, setActiveHubQIdx] = useState<number>(0);

  // Modal CamScanner Cheat Sheet
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  // Config form state for AI Generator
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

  // Two-way interactive dialogue with Professor
  const [essayDialogue, setEssayDialogue] = useState<
    Array<{ studentQuestion: string; teacherReply: string; comprehensionCheck?: string }>
  >([]);
  const [essayFollowUpInput, setEssayFollowUpInput] = useState('');
  const [isAskingTeacher, setIsAskingTeacher] = useState(false);

  const currentHubExam = OFFICIAL_HUB_EXAMS.find((e) => e.id === selectedExamId) || OFFICIAL_HUB_EXAMS[0];
  const currentHubQuestion = currentHubExam.questions[activeHubQIdx] || currentHubExam.questions[0];

  const handleAskTeacherAboutEssay = async (customQ?: string) => {
    const q = customQ || essayFollowUpInput;
    if (!q.trim()) return;
    setIsAskingTeacher(true);

    try {
      const curQText = viewMode === 'hub_official_exams' ? currentHubQuestion.text : essayList[activeEssayIdx]?.question;
      const response = await aiFetch('/api/tutor/interactive-qa', {
        method: 'POST',
        body: JSON.stringify({
          contextType: 'essay',
          problemContext: `Đề bài: ${curQText}`,
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
    if (viewMode === 'hub_official_exams') {
      if (activeHubQIdx < currentHubExam.questions.length - 1) {
        setActiveHubQIdx((prev) => prev + 1);
        setEvaluationResult(null);
        setEssayDialogue([]);
      } else {
        alert('Chúc mừng em đã hoàn thành toàn bộ 5 câu hỏi trong đề thi chính thức HUB này!');
      }
    } else {
      if (activeEssayIdx < essayList.length - 1) {
        setActiveEssayIdx((prev) => prev + 1);
        setEvaluationResult(null);
        setEssayDialogue([]);
      } else {
        alert('Chúc mừng em đã hoàn thành toàn bộ các bài tự luận trong danh sách!');
      }
    }
  };

  const handleExportHubWord = () => {
    exportExercisesToWord({
      title: `${currentHubExam.title.toUpperCase()} - ${currentHubExam.code}`,
      subject: 'MÔN: XÁC SUẤT VÀ THỐNG KÊ TOÁN (HUB 2026)',
      chapterTitle: `${currentHubExam.faculty} • Thời gian: ${currentHubExam.durationMinutes} phút`,
      difficulty: 'Đề thi chính thức chuẩn phòng thi',
      exercises: currentHubExam.questions.map((q) => ({
        question: `[${q.points} Điểm] ${q.text}`,
        title: q.title,
        strategyHint: `Bảo bối CamScanner HUB: ${q.camScannerFormulaRef}\nPhím bấm Casio fx-580: ${q.casioKeySequence.join(' -> ')}`,
        keyFormulas: [q.camScannerFormulaRef],
        expectedAnswerSummary: q.solutionSteps.join('\n') + `\nĐáp số cuối: ${q.finalAnswer}`,
      })),
      isMcq: false,
      includeSolutions: includeSolutionsInExport,
    });
  };

  const handleExportHubPdf = () => {
    exportExercisesToPdf({
      title: `${currentHubExam.title} - ${currentHubExam.code}`,
      subject: 'MÔN: XÁC SUẤT VÀ THỐNG KÊ TOÁN',
      chapterTitle: `${currentHubExam.faculty} • Thời gian: ${currentHubExam.durationMinutes} phút`,
      difficulty: 'Đề thi chính thức HUB',
      exercises: currentHubExam.questions.map((q) => ({
        question: `[${q.points} Điểm] ${q.text}`,
        title: q.title,
        strategyHint: `Công thức CamScanner HUB: ${q.camScannerFormulaRef}`,
        keyFormulas: [q.camScannerFormulaRef],
        expectedAnswerSummary: q.solutionSteps.join(' ') + `\nĐáp số: ${q.finalAnswer}`,
      })),
      isMcq: false,
      includeSolutions: includeSolutionsInExport,
    });
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
        const sanitizedExercises = data.exercises.map((ex: any, idx: number) => ({
          ...ex,
          id: ex.id || `gen_essay_${idx + 1}`,
          strategyHint: getSafeStrategyHint(ex),
        }));
        setEssayList(sanitizedExercises);
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
    const activeProblem = viewMode === 'hub_official_exams' ? currentHubQuestion : essayList[activeEssayIdx];
    if (!activeProblem) return;

    setIsSubmitting(true);
    setEvaluationResult(null);

    try {
      const response = await aiFetch('/api/tutor/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: dataUrl,
          textContent: `Đề bài: "${activeProblem.text || activeProblem.question}"\nBài làm của sinh viên: "${typedText}"`,
          chapterTitle: viewMode === 'hub_official_exams' ? `Đề thi chính thức HUB 2026 - ${activeProblem.title}` : 'Bài tập tự luận do AI sinh theo yêu cầu',
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
          `Thi thử tự luận HUB: ${activeProblem.title || 'Bài tập XSTK'} (${score}/10 điểm)`,
          1,
          gpaEquivalent
        );

        if (score < 8 && onRecordMistake) {
          onRecordMistake({
            id: `essay_mistake_${activeProblem.id || Date.now()}`,
            chapterId: typeof selectedChapterId === 'number' ? selectedChapterId : 1,
            chapterTitle: viewMode === 'hub_official_exams' ? 'Đề thi HUB 2026' : `Chương ${selectedChapterId}`,
            sourceType: 'essay',
            questionSummary: activeProblem.text || activeProblem.question,
            studentAnswer: typedText || 'Bài làm viết tay trên bảng',
            correctConcept: activeProblem.finalAnswer || activeProblem.expectedAnswerSummary || 'Trình bày theo phương pháp giải chuẩn HUB',
            rootCauseError:
              data.data.rootCauseError ||
              (data.data.criticalErrors && data.data.criticalErrors[0]) ||
              'Lỗi lập luận công thức hoặc trình bày tự luận',
            remediationAdvice:
              activeProblem.commonTraps ||
              data.data.betterStrategy ||
              'Tham khảo lại công thức trong Tờ CamScanner HUB trước khi thế số',
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
      {/* Top Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-3 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              🏛️ HUB
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  ĐẠI HỌC NGÂN HÀNG TP.HCM
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">CHUẨN 75 PHÚT</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Kho Đề Thi Chính Thức & Trình Luyện Tự Luận Toàn Diện
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCheatSheetOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
            >
              <FileText className="w-4 h-4" />
              <span>📜 Mở Tờ Công Thức HUB (CamScanner)</span>
            </button>
          </div>
        </div>

        {/* View Mode Selector Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setViewMode('hub_official_exams')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
              viewMode === 'hub_official_exams'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. KHO ĐỀ THI CHÍNH THỨC HUB (2026 & 2023 - 75 PHÚT)</span>
          </button>

          <button
            onClick={() => setViewMode('ai_generator')}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${
              viewMode === 'ai_generator'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>2. SINH ĐỀ TỰ LUẬN THEO YÊU CẦU (AI GENERATOR)</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: OFFICIAL HUB EXAM ARCHIVE */}
      {viewMode === 'hub_official_exams' && (
        <div className="space-y-6">
          {/* Exam Selector Strip */}
          <div className="p-4 bg-slate-900 border-2 border-cyan-500/30 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">Chọn đề thi:</span>
              <div className="flex flex-wrap gap-2">
                {OFFICIAL_HUB_EXAMS.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => {
                      setSelectedExamId(exam.id);
                      setActiveHubQIdx(0);
                      setEvaluationResult(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                      selectedExamId === exam.id
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {exam.code}
                  </button>
                ))}
              </div>
            </div>

            {/* Export buttons for HUB Official Exam */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportHubWord}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Tải đề thi HUB ra file Word (.doc)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Xuất Đề Word</span>
              </button>
              <button
                onClick={handleExportHubPdf}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                title="In hoặc Lưu thành PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Xuất Đề PDF</span>
              </button>
            </div>
          </div>

          {/* Official Exam Paper Header */}
          <div className="p-5 bg-slate-950 border-2 border-slate-800 rounded-3xl space-y-2 text-center relative overflow-hidden">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
              TRƯỜNG ĐẠI HỌC NGÂN HÀNG THÀNH PHỐ HỒ CHÍ MINH (HUB)
            </div>
            <div className="text-sm font-extrabold text-cyan-300">
              {currentHubExam.faculty}
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white pt-1">
              {currentHubExam.title} - {currentHubExam.code}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl mx-auto">
              Thời gian làm bài: <strong>{currentHubExam.durationMinutes} phút</strong> (Không kể thời gian phát đề) • {currentHubExam.description}
            </p>
          </div>

          {/* 5 Questions Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {currentHubExam.questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  setActiveHubQIdx(idx);
                  setEvaluationResult(null);
                  setEssayDialogue([]);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeHubQIdx === idx
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-cyan-500/40'
                }`}
              >
                <span>Câu {q.questionNumber}</span>
                <span className="text-[10px] opacity-80 font-mono">({q.points}đ)</span>
              </button>
            ))}
          </div>

          {/* Question Card */}
          <div className="bg-slate-900 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 flex-wrap gap-2">
              <span className="font-black text-cyan-300 text-base">
                {currentHubQuestion.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-lg border border-cyan-500/40 font-bold">
                  Thang điểm: {currentHubQuestion.points}đ
                </span>
                <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/40 font-bold">
                  {currentHubQuestion.topic}
                </span>
              </div>
            </div>

            {/* Problem Text */}
            <div className="text-sm sm:text-base text-white font-medium leading-relaxed bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800">
              <MathText text={currentHubQuestion.text} />
            </div>

            {/* CamScanner Formula Reference & Casio fx-580 Sequence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Formula Sheet Reference */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>Bảo Bối CamScanner HUB Cần Dùng:</span>
                  </span>
                  <button
                    onClick={() => setIsCheatSheetOpen(true)}
                    className="text-[11px] text-cyan-400 hover:underline font-bold"
                  >
                    Xem tờ phao ➔
                  </button>
                </div>
                <div className="text-slate-200 text-xs font-mono leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  <MathText text={currentHubQuestion.camScannerFormulaRef} />
                </div>
              </div>

              {/* Casio Keypress Guide */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-2">
                <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>Cách Bấm Máy Casio fx-580VN X Thực Tế:</span>
                </span>
                <ul className="text-slate-300 text-xs font-mono space-y-1 list-disc list-inside bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                  {currentHubQuestion.casioKeySequence.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trap Warning Alert */}
            {currentHubQuestion.commonTraps && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-300 block font-bold mb-0.5">Cảnh báo bẫy phòng thi nguy hiểm:</strong>
                  {currentHubQuestion.commonTraps}
                </div>
              </div>
            )}

            {/* Interactive iPad Canvas */}
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
                      <span>Kết Quả Chấm Điểm Đề Thi HUB (Barem Chính Thức):</span>
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
                  </div>

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
                      </div>
                    </div>
                  ))}

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

                  <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-slate-300 font-medium text-[11px]">
                      Chừng nào em đã hiểu rõ toàn bộ bài này và không còn thắc mắc, hãy bấm xác nhận để làm bài tiếp theo!
                    </p>
                    <button
                      onClick={handleNextEssay}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Em đã hiểu hoàn toàn, chuyển sang câu tiếp theo! ➔</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: AI CUSTOM GENERATOR */}
      {viewMode === 'ai_generator' && (
        <div className="space-y-6">
          {/* Setup Form */}
          <form onSubmit={handleGenerateCustomEssays} className="bg-slate-900/90 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="flex items-center gap-2 font-black text-cyan-300 text-xs border-b border-slate-800 pb-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>BẢNG THIẾT LẬP THÔNG SỐ ĐỀ THI TỰ LUẬN AI</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
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
                  >
                    <FileText className="w-4 h-4" />
                    <span>Xuất Word (.doc)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all"
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
                    <MathText text={getSafeStrategyHint(currentEssay)} />
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

                <div className="pt-2">
                  <InteractiveCanvas
                    onExportCanvas={handleGradeEssaySubmission}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official HUB Exam Cheat Sheet Modal */}
      <HubExamCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
};
