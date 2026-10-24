import React, { useState } from 'react';
import { MistakeRecord } from '../types/xstk';
import {
  BarChart3,
  AlertOctagon,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  Lightbulb,
  RotateCcw,
  Sparkles,
  BookOpen,
  Check,
  X,
  Award,
} from 'lucide-react';
import { MathFormula, MathText } from './MathFormula';
import confetti from 'canvas-confetti';

interface MistakeAnalyticsProps {
  mistakes: MistakeRecord[];
  onClearMistakes: () => void;
  onResolveMistake?: (id: string) => void;
  onAddExp?: (amount: number, details?: string) => void;
}

export const MistakeAnalytics: React.FC<MistakeAnalyticsProps> = ({
  mistakes,
  onClearMistakes,
  onResolveMistake,
  onAddExp,
}) => {
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved' | 'mcq' | 'essay' | 'viva'>('all');
  const [retryModalItem, setRetryModalItem] = useState<MistakeRecord | null>(null);
  const [retryInput, setRetryInput] = useState('');
  const [retrySuccess, setRetrySuccess] = useState<boolean | null>(null);

  const vivaMistakes = mistakes.filter((m) => m.sourceType === 'viva');
  const mcqMistakes = mistakes.filter((m) => m.sourceType === 'mcq');
  const essayMistakes = mistakes.filter((m) => m.sourceType === 'essay' || m.sourceType === 'homework');
  const resolvedMistakes = mistakes.filter((m) => m.resolved);

  const filteredMistakes = mistakes.filter((m) => {
    if (filter === 'unresolved') return !m.resolved;
    if (filter === 'resolved') return m.resolved;
    if (filter === 'mcq') return m.sourceType === 'mcq';
    if (filter === 'essay') return m.sourceType === 'essay' || m.sourceType === 'homework';
    if (filter === 'viva') return m.sourceType === 'viva';
    return true;
  });

  const handleOpenRetry = (m: MistakeRecord) => {
    setRetryModalItem(m);
    setRetryInput('');
    setRetrySuccess(null);
  };

  const handleConfirmRetry = () => {
    if (!retryModalItem) return;

    // Check if input is non-empty
    if (!retryInput.trim()) {
      alert('Em hãy nhập lời giải hoặc phương án sửa để AI ghi nhận nhé!');
      return;
    }

    setRetrySuccess(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#f59e0b'],
    });

    if (onResolveMistake) {
      onResolveMistake(retryModalItem.id);
    }
    if (onAddExp) {
      onAddExp(20, `Khắc phục thành công lỗi sai: "${retryModalItem.questionSummary.slice(0, 30)}..."`);
    }

    setTimeout(() => {
      setRetryModalItem(null);
      setRetrySuccess(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          <span>SỔ TAY CÂU SAI (MISTAKE NOTEBOOK) & AI PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          Sổ Tay Luyện Lại Câu Sai & Lộ Trình Phục Hồi Điểm Số
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Mỗi câu làm sai ở Trắc nghiệm, Tự luận và Vấn đáp đều được tự động lưu lại đây kèm phân tích lỗi sai từ Giảng viên AI. Hãy bấm <strong className="text-emerald-400 font-bold">"Luyện tập lại"</strong> để gỡ điểm và nhận thêm <strong className="text-cyan-300 font-bold">+20 XP</strong>!
        </p>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-rose-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(244,63,94,0.15)]">
          <div>
            <p className="text-[11px] text-rose-300 font-bold">Lỗi Vấn Đáp</p>
            <p className="text-2xl font-black font-mono text-rose-400 mt-1">{vivaMistakes.length}</p>
          </div>
          <AlertOctagon className="w-8 h-8 text-rose-400/60" />
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-cyan-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <div>
            <p className="text-[11px] text-cyan-300 font-bold">Lỗi Trắc Nghiệm</p>
            <p className="text-2xl font-black font-mono text-cyan-400 mt-1">{mcqMistakes.length}</p>
          </div>
          <ShieldAlert className="w-8 h-8 text-cyan-400/60" />
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-amber-500/30 flex items-center justify-between shadow-[0_0_15px_rgba(245,158,11,0.15)]">
          <div>
            <p className="text-[11px] text-amber-300 font-bold">Lỗi Tự Luận/iPad</p>
            <p className="text-2xl font-black font-mono text-amber-400 mt-1">{essayMistakes.length}</p>
          </div>
          <BarChart3 className="w-8 h-8 text-amber-400/60" />
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-emerald-500/40 flex items-center justify-between shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <div>
            <p className="text-[11px] text-emerald-300 font-bold">Đã Sửa Thành Công</p>
            <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
              {resolvedMistakes.length}/{mistakes.length}
            </p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
      </div>

      {/* AI Common Error Insights */}
      <div className="bg-slate-900/90 border-2 border-cyan-500/40 p-5 rounded-2xl space-y-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 font-black text-cyan-300 text-xs sm:text-sm">
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          <span>Nhận Định Nguyên Nhân Gốc Rễ Từ AI Tutor (Dựa trên 4 Chuyên Đề Đại Học)</span>
        </div>
        <div className="text-xs text-slate-100 leading-relaxed font-medium">
          <MathText text="Sinh viên thường nhầm lẫn giữa biến cố xung khắc và biến cố độc lập khi áp dụng công thức cộng $P(A+B)$, quên nhân xác suất điều kiện trong công thức Bayes, hoặc nhầm giữa độ lệch chuẩn tổng thể $\sigma$ đã biết (dùng $Z_{\alpha/2}$) và chưa biết (dùng $t_{\alpha/2}^{(n-1)}$ Student) trong Ước lượng khoảng tin cậy Bài 5." />
        </div>
      </div>

      {/* Filter Chips & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { key: 'all', label: `Tất cả (${mistakes.length})` },
              { key: 'unresolved', label: `Chưa sửa (${mistakes.length - resolvedMistakes.length})` },
              { key: 'resolved', label: `Đã sửa (${resolvedMistakes.length})` },
              { key: 'mcq', label: `Trắc nghiệm (${mcqMistakes.length})` },
              { key: 'essay', label: `Tự luận (${essayMistakes.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === t.key
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:border-cyan-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {mistakes.length > 0 && (
          <button
            onClick={onClearMistakes}
            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
          >
            Xóa lịch sử lỗi sai
          </button>
        )}
      </div>

      {/* Mistakes List */}
      <div className="bg-slate-900/90 border-2 border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        {filteredMistakes.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-300 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <p className="font-black text-white text-sm">Không có câu sai nào trong danh mục này!</p>
            <p className="text-slate-300">
              Hãy tiếp tục làm đề thi trắc nghiệm và tự luận để thử thách bản thân.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredMistakes.map((m) => (
              <div
                key={m.id}
                className={`p-5 space-y-3.5 transition-colors ${
                  m.resolved ? 'bg-emerald-950/20' : 'bg-slate-900/60'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-cyan-300 text-xs">
                      {m.chapterTitle} • [{m.sourceType.toUpperCase()}]
                    </span>
                    {m.resolved && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        <Check className="w-3 h-3 text-emerald-400" />
                        ĐÃ KHẮC PHỤC (+20 XP)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{m.timestamp}</span>
                </div>

                <div className="text-slate-100 font-semibold text-xs sm:text-sm leading-relaxed">
                  <span className="text-white font-bold">Đề bài: </span>
                  <MathText text={m.questionSummary} inline />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-200 space-y-1">
                    <p className="font-bold text-[11px] text-rose-300">🔴 Lời giải em đã nộp:</p>
                    <MathText text={m.studentAnswer} />
                  </div>

                  <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-emerald-200 space-y-1">
                    <p className="font-bold text-[11px] text-emerald-300">🟢 Khái niệm / Lời giải chuẩn:</p>
                    <MathText text={m.correctConcept} />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-950 border border-cyan-500/30 rounded-xl text-slate-200 space-y-1.5 text-xs">
                  <p className="font-bold text-cyan-300 text-[11px] flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Phân tích nguyên nhân & Hướng dẫn sư phạm:</span>
                  </p>
                  <p>
                    <strong className="text-white">Nguyên nhân sai lầm:</strong> <MathText text={m.rootCauseError} inline />
                  </p>
                  <p>
                    <strong className="text-white">Lộ trình bổ trợ:</strong> <MathText text={m.remediationAdvice} inline />
                  </p>
                </div>

                {/* Retry Button */}
                <div className="flex items-center justify-end pt-1">
                  {!m.resolved ? (
                    <button
                      onClick={() => handleOpenRetry(m)}
                      className="py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Luyện Tập Lại Câu Này (+20 XP)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenRetry(m)}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs border border-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3 text-cyan-400" />
                      <span>Ôn lại thêm lần nữa</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Interactive Re-try Modal */}
      {retryModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-400/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 font-black text-cyan-300 text-sm">
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span>PHỤC THÙ CÂU SAI: {retryModalItem.chapterTitle}</span>
              </div>
              <button
                onClick={() => setRetryModalItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <p className="text-slate-400 font-bold mb-1">Đề bài:</p>
                <p className="text-white font-medium">
                  <MathText text={retryModalItem.questionSummary} />
                </p>
              </div>

              <div className="p-3 bg-cyan-950/50 rounded-xl border border-cyan-500/30">
                <p className="text-cyan-300 font-bold mb-1">Gợi ý khắc phục từ Thầy AI:</p>
                <div className="text-slate-200"><MathText text={retryModalItem.remediationAdvice} /></div>
              </div>

              <div className="space-y-1.5">
                <label className="text-white font-bold block">
                  Nhập câu trả lời / phương án đúng của em:
                </label>
                <textarea
                  value={retryInput}
                  onChange={(e) => setRetryInput(e.target.value)}
                  placeholder="Nhập đáp án hoặc các bước tính toán đã sửa của em..."
                  rows={3}
                  className="w-full p-3 rounded-xl border-2 border-cyan-500/40 bg-slate-950 text-white font-medium text-xs outline-none focus:border-cyan-300"
                />
              </div>

              {retrySuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Xuất sắc! Em đã khắc phục thành công câu sai và nhận +20 XP!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRetryModalItem(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmRetry}
                disabled={retrySuccess === true}
                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs shadow transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Nộp Lời Giải Sửa Lỗi (+20 XP)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};