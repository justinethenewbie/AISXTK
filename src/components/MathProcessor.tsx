import React, { useState } from 'react';
import { Calculator, Zap, Sparkles, Copy, Check, ExternalLink } from 'lucide-react';
import { MathFormula, MathText } from './MathFormula';
import { WordEquationRibbon } from './WordEquationRibbon';
import { aiFetch } from '../utils/apiHelper';
import { renderRawMathToKatexHtml } from '../utils/mathDisplayUtils';

export const MathProcessor: React.FC = () => {
  const [expressionInput, setExpressionInput] = useState('int(0, 2, 3*x^2)');
  const [showEquationToolbar, setShowEquationToolbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [solutionData, setSolutionData] = useState<any>({
    parsedTitle: 'Tích phân xác định hàm đa thức',
    step1Rephrased: '\\int_{0}^{2} 3x^2 \\, dx',
    step2Antiderivative: 'F(x) = \\int 3x^2 dx = 3 \\cdot \\frac{x^3}{3} = x^3',
    step3SubstituteLimits: 'F(2) - F(0) = 2^3 - 0^3 = 8 - 0 = 8',
    step4FinalFraction: '8/1',
    step4FinalDecimal: '8.0000',
    step4Summary: 'Giá trị tích phân xác định bằng 8',
    casioGuide: {
      keySequence: [
        'Bấm phím Tích phân ∫dx (ngay dưới nút ALPHA)',
        'Nhập hàm số: bấm 3, sau đó bấm ALPHA + X, bấm x² để được 3X²',
        'Bấm mũi tên xuống nhập cận dưới: 0',
        'Bấm mũi tên lên nhập cận trên: 2',
        'Bấm phím = để hiển thị kết quả 8',
      ],
      infinityNote: 'LƯU Ý PHÒNG THI: Nếu cận là +∞ hãy thay bằng 10^9 (hoặc 10 nếu là phân phối chuẩn tắc Z); cận -∞ thay bằng -10^9 để máy Casio fx-580VN X tính xấp xỉ chính xác.',
      fullTipText: 'Bấm phím ∫dx dưới phím ALPHA → nhập hàm theo biến X → nhập cận → bấm =',
    },
  });

  const [copied, setCopied] = useState(false);

  // Two-way interactive dialogue with Professor on this solution
  const [mathDialogue, setMathDialogue] = useState<
    Array<{ studentQuestion: string; teacherReply: string; comprehensionCheck?: string }>
  >([]);
  const [mathFollowUpInput, setMathFollowUpInput] = useState('');
  const [isAskingTeacher, setIsAskingTeacher] = useState(false);
  const [isConfirmedUnderstood, setIsConfirmedUnderstood] = useState(false);

  const handleAskTeacherAboutMath = async (customQ?: string) => {
    const q = customQ || mathFollowUpInput;
    if (!q.trim()) return;
    setIsAskingTeacher(true);

    try {
      const response = await aiFetch('/api/tutor/interactive-qa', {
        method: 'POST',
        body: JSON.stringify({
          contextType: 'math_processor',
          problemContext: `Biểu thức toán: ${expressionInput}\nĐề bài KaTeX: ${solutionData?.step1Rephrased || ''}`,
          previousSolution: `Nguyên hàm: ${solutionData?.step2Antiderivative || ''}\nThế cận: ${solutionData?.step3SubstituteLimits || ''}\nKết quả: ${solutionData?.step4Summary || ''}`,
          studentQuestion: q,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setMathDialogue((prev) => [
          ...prev,
          {
            studentQuestion: q,
            teacherReply: resData.data.teacherExplanation,
            comprehensionCheck: resData.data.comprehensionCheck,
          },
        ]);
        setMathFollowUpInput('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAskingTeacher(false);
    }
  };

  const handleResetForNextMathProblem = () => {
    setExpressionInput('');
    setSolutionData(null);
    setMathDialogue([]);
    setIsConfirmedUnderstood(false);
  };

  // Quick insertion tags - High contrast Neon Cyan & Emerald
  const QUICK_INSERT_TAGS = [
    { label: '∫(a, b, f(x))', code: 'int(0, 1, 2*x)' },
    { label: '∫(-∞, +∞)', code: 'int(-inf, +inf, f(x))' },
    { label: '+inf (+∞)', code: '+inf' },
    { label: '-inf (-∞)', code: '-inf' },
    { label: 'e^(x)', code: 'e^(-2*x)' },
    { label: 'sqrt(x)', code: 'sqrt(x)' },
    { label: 'nCr(n, k)', code: 'nCr(10, 3)' },
    { label: 'nPr(n, k)', code: 'nPr(10, 3)' },
    { label: 'Phi(z)', code: 'Phi(1.96)' },
    { label: 'P(X ≤ x)', code: 'P(X <= 2)' },
    { label: 'E(X)', code: 'E(X) = int(0, 1, x*f(x))' },
    { label: 'Var(X)', code: 'Var(X)' },
    { label: 'sigma (σ)', code: 'sigma' },
    { label: 'sum(a, b, f(x))', code: 'sum(1, 5, x^2)' },
  ];

  // Common preset problems
  const PRESET_PROBLEMS = [
    {
      name: 'Bài 1: Tìm hằng số k hàm mật độ',
      input: 'int(0, 2, k*x^2) = 1',
    },
    {
      name: 'Bài 2: Tính kỳ vọng E(X) biến liên tục',
      input: 'E(X) = int(0, 1, x * (2*x))',
    },
    {
      name: 'Bài 3: Tích phân suy rộng cận vô cực',
      input: 'int(1, +inf, 3*x^(-4))',
    },
    {
      name: 'Bài 4: Phân phối mũ P(X > 2)',
      input: 'int(2, +inf, 0.5*e^(-0.5*x))',
    },
    {
      name: 'Bài 5: Phân phối chuẩn tắc Phi(1.96)',
      input: 'Phi(1.96)',
    },
  ];

  const handleSolve = async (overrideInput?: string) => {
    const targetExpr = (overrideInput || expressionInput).trim();
    if (!targetExpr) return;
    setIsLoading(true);

    try {
      const response = await aiFetch('/api/tutor/solve-math', {
        method: 'POST',
        body: JSON.stringify({ rawInput: targetExpr }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        setSolutionData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(expressionInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner - High Contrast Neon Cyan & Emerald (No Harsh Orange) */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/50 text-white rounded-3xl p-6 shadow-[0_0_35px_rgba(6,182,212,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-cyan-300">
            <span className="p-1.5 bg-cyan-500/20 rounded-lg border border-cyan-500/40">
              <Calculator className="w-4 h-4 text-cyan-400" />
            </span>
            <span className="tracking-wider uppercase">BỘ VI XỬ LÝ TOÁN HỌC & GIA SƯ XÁC SUẤT THỐNG KÊ ĐẠI HỌC</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            Xử Lý Biểu Thức Tích Phân & Biến Ngẫu Nhiên Liên Tục
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed font-medium">
            Hỗ trợ nhập liệu bằng phím thông thường: <code className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-mono font-bold">int(a, b, f(x))</code>, <code className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-mono font-bold">-inf</code>, <code className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-mono font-bold">+inf</code>, <code className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-mono font-bold">e^(x)</code>, <code className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-mono font-bold">nCr(n, k)</code>, <code className="bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded font-mono font-bold">Phi(z)</code>. Tự động giải chi tiết 4 bước và chỉ rõ cách bấm máy Casio fx-580VN X trong phòng thi!
          </p>
        </div>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-slate-900/90 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-5 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        {/* Preset Selector */}
        <div className="space-y-2">
          <span className="text-[11px] font-black text-cyan-300 uppercase tracking-wider block">
            ⚡ Nạp nhanh bài toán mẫu thường gặp:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_PROBLEMS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setExpressionInput(preset.input)}
                className="px-3 py-1.5 bg-slate-950 hover:bg-cyan-950/70 text-slate-100 hover:text-cyan-300 text-xs font-bold rounded-xl border border-slate-700 hover:border-cyan-400 transition-all shadow-xs"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Word Ribbon Toolbar & Large Drafting Sheet (Matches Image 2) */}
        <div className="space-y-3">
          <WordEquationRibbon
            title="Soạn Thảo Biểu Thức Vi Tích Phân & Ký Hiệu SXTK (Chuẩn Word WYSIWYG)"
            placeholder="Nhập biểu thức tích phân cần giải (ví dụ: \int_{0}^{2} 3x^2 dx hoặc int(0, 2, 3*x^2)...)"
            initialText={expressionInput}
            submitButtonText="BỘ VI XỬ LÝ TOÁN HỌC: BẮT ĐẦU GIẢI 4 BƯỚC PÓLYA"
            isSubmitting={isLoading}
            onSendToAI={(fullText) => {
              setExpressionInput(fullText);
              handleSolve(fullText);
            }}
          />
        </div>

        {/* Live Math Display (Khung Hiển Thị Trực Quan KaTeX Sách Giáo Khoa) */}
        <div className="p-3.5 bg-slate-950/90 rounded-2xl border-2 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-black text-cyan-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]"></span>
              <span>HIỂN THỊ CÔNG THỨC TOÁN TRỰC QUAN (LIVE MATH DISPLAY):</span>
            </span>
            <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
              Natural Textbook Display
            </span>
          </div>
          <div className="min-h-[52px] flex items-center justify-center p-2.5 bg-slate-900/95 rounded-xl border border-cyan-500/30 overflow-x-auto text-cyan-200">
            <div
              className="text-base sm:text-lg font-bold font-mono tracking-wide text-center"
              dangerouslySetInnerHTML={{ __html: renderRawMathToKatexHtml(expressionInput || '0', true) }}
            />
          </div>
        </div>

        {/* Standalone Simulator Link */}
        <div className="flex justify-end pt-1">
          <a
            href="/casio-simulator.html"
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white font-extrabold rounded-xl text-xs flex items-center gap-2 transition-all border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <span>Mở Máy Tính Casio Độc Lập (Full HTML)</span>
          </a>
        </div>
      </div>

      {/* 4-Step Solution View - High Contrast Pure White & Neon Accent */}
      {solutionData && (
        <div className="bg-slate-900 border-2 border-cyan-400/50 p-6 rounded-3xl space-y-6 shadow-[0_0_35px_rgba(6,182,212,0.2)] animate-fade-in text-white">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-black text-white text-lg flex items-center gap-2.5">
              <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <Zap className="w-5 h-5 text-cyan-400" />
              </span>
              <span>{solutionData.parsedTitle || 'Kết Quả Giải Bài Toán XSTK'}</span>
            </h3>
            <span className="font-mono text-xs bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-black px-3 py-1 rounded-full shadow-xs">
              Quy Trình 4 Bước Chuẩn
            </span>
          </div>

          <div className="space-y-4 text-xs leading-relaxed">
            {/* Step 1 */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2">
              <span className="font-black text-cyan-300 uppercase tracking-wider text-xs block">
                Bước 1: Viết lại đề bài bằng công thức toán học KaTeX rõ ràng
              </span>
              <div className="py-2 text-cyan-200 text-sm">
                <MathFormula math={solutionData.step1Rephrased || expressionInput} block />
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2">
              <span className="font-black text-cyan-300 uppercase tracking-wider text-xs block">
                Bước 2: Tìm nguyên hàm F(x) chi tiết từng bước
              </span>
              <div className="text-slate-100 font-semibold text-xs sm:text-sm leading-relaxed">
                <MathText text={solutionData.step2Antiderivative} />
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2">
              <span className="font-black text-cyan-300 uppercase tracking-wider text-xs block">
                Bước 3: Thế cận trên trừ cận dưới F(b) - F(a) & Giới hạn lim
              </span>
              <div className="text-slate-100 font-semibold text-xs sm:text-sm leading-relaxed">
                <MathText text={solutionData.step3SubstituteLimits} />
              </div>
            </div>

            {/* Step 4: Final Output in 2 formats (High Contrast Emerald) */}
            <div className="p-5 bg-emerald-950/40 rounded-2xl border-2 border-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.2)] space-y-3">
              <span className="font-black text-emerald-300 uppercase tracking-wider text-xs block">
                Bước 4: Xuất kết quả cuối cùng ở 2 dạng (Phân số tối giản & Số thập phân 4 chữ số)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 text-center">
                  <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider block">
                    Dạng 1: Phân số tối giản
                  </span>
                  <div className="text-2xl font-mono font-black text-emerald-300 mt-1 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                    {solutionData.step4FinalFraction || '---'}
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 text-center">
                  <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider block">
                    Dạng 2: Số thập phân (4 chữ số Casio)
                  </span>
                  <div className="text-2xl font-mono font-black text-cyan-300 mt-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                    {solutionData.step4FinalDecimal || '---'}
                  </div>
                </div>
              </div>

              {solutionData.step4Summary && (
                <p className="text-center font-bold text-slate-200 text-xs sm:text-sm pt-1">
                  {solutionData.step4Summary}
                </p>
              )}
            </div>

            {/* Casio fx-580VN X Exam Tip Guide - High Contrast Neon Card */}
            {solutionData.casioGuide && (
              <div className="p-5 bg-slate-950 rounded-2xl border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-3">
                <div className="flex items-center gap-2 font-black text-cyan-300 text-xs sm:text-sm">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <span>Cách bấm máy Casio fx-580VN X trong phòng thi:</span>
                </div>

                <ul className="space-y-1.5 text-slate-100 font-semibold text-xs list-disc list-inside">
                  {solutionData.casioGuide.keySequence?.map((step: string, sIdx: number) => (
                    <li key={sIdx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ul>

                {solutionData.casioGuide.infinityNote && (
                  <div className="p-3 bg-cyan-950/80 rounded-xl border border-cyan-400/50 text-cyan-200 font-bold text-xs flex items-center gap-2 shadow-xs">
                    <span className="text-base">⚠️</span>
                    <span>{solutionData.casioGuide.infinityNote}</span>
                  </div>
                )}
              </div>
            )}

            {/* Interactive Blackboard Q&A with Professor */}
            <div className="p-6 bg-slate-950 rounded-2xl border-2 border-cyan-500/50 shadow-[0_0_25px_rgba(6,182,212,0.15)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-black text-cyan-300 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Trao Đổi Trực Tiếp Với Thầy Giáo AI Về Bài Toán Này:</span>
                </span>
                <span className="text-[11px] text-slate-300 font-bold">
                  Không giới hạn câu hỏi cho đến khi hiểu rõ bản chất
                </span>
              </div>

              {/* Existing discussions */}
              {mathDialogue.map((d, dIdx) => (
                <div key={dIdx} className="space-y-2 bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30">
                  <div className="text-cyan-300 font-bold text-xs flex items-center gap-1.5">
                    <span>🙋 Em hỏi:</span>
                    <MathText text={d.studentQuestion} />
                  </div>
                  <div className="text-slate-100 text-xs pt-2 border-t border-slate-800 space-y-2">
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

              {/* Suggested quick questions */}
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-bold block w-full">Gợi ý hỏi nhanh:</span>
                {[
                  'Thầy ơi tại sao nguyên hàm lại ra biểu thức này?',
                  'Nếu cận là vô cực thì tính giới hạn lim thế nào?',
                  'Chỉ em cách bấm máy Casio fx-580VN X chi tiết hơn',
                ].map((sq, sqIdx) => (
                  <button
                    key={sqIdx}
                    onClick={() => handleAskTeacherAboutMath(sq)}
                    disabled={isAskingTeacher}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-400 rounded-xl font-bold text-[11px] transition-all"
                  >
                    {sq}
                  </button>
                ))}
              </div>

              {/* Input for custom question */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={mathFollowUpInput}
                  onChange={(e) => setMathFollowUpInput(e.target.value)}
                  placeholder="Gõ câu hỏi để Thầy giải đáp chi tiết từng bước biến đổi..."
                  className="flex-1 bg-slate-900 border border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-cyan-300"
                  onKeyDown={(e) => e.key === 'Enter' && handleAskTeacherAboutMath()}
                />
                <button
                  onClick={() => handleAskTeacherAboutMath()}
                  disabled={isAskingTeacher}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
                >
                  {isAskingTeacher ? <Zap className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Hỏi Thầy</span>
                </button>
              </div>

              {/* Pedagogical Checkpoint: Confirm understanding before proceeding */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <p className="text-slate-300 font-medium text-[11px]">
                  {isConfirmedUnderstood
                    ? '✅ Em đã xác nhận hiểu rõ bài toán này! Có thể nhập bài mới phía trên.'
                    : 'Chừng nào em đã nắm vững toàn bộ 4 bước giải trên, hãy bấm xác nhận để hoàn tất!'}
                </p>
                <button
                  onClick={() => {
                    setIsConfirmedUnderstood(true);
                    handleResetForNextMathProblem();
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Em đã hiểu hoàn toàn, sẵn sàng giải bài tiếp theo! ➔</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
