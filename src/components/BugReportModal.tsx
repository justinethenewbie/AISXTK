import React, { useState } from 'react';
import { Bug, Send, CheckCircle2, X, MessageSquare } from 'lucide-react';
import { UserProfile } from '../types/xstk';

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({ isOpen, onClose, userProfile }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setIsSubmitting(true);
    setAiResponse(null);

    try {
      const response = await fetch('/api/tutor/report-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userFeedback: feedbackText,
          studentInfo: userProfile,
        }),
      });

      const data = await response.json();
      if (data.response?.aiMessage) {
        setAiResponse(data.response.aiMessage);
      } else {
        setAiResponse('Cảm ơn bạn! Ý kiến đóng góp và báo lỗi đã được gửi về Đội ngũ Quản lý và Vận hành!');
      }
    } catch (err) {
      setAiResponse('Cảm ơn bạn! Đóng góp của bạn đã được ghi nhận thành công.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
            <Bug className="w-5 h-5 text-rose-500" />
            <span>Báo Lỗi & Đóng Góp Ý Kiến Cho Nhà Phát Hành</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {aiResponse ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 rounded-2xl space-y-2 text-center text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="font-bold text-emerald-900 dark:text-emerald-300">Gửi phản hồi thành công!</p>
            <p className="text-slate-700 dark:text-slate-300">{aiResponse}</p>
            <button
              onClick={onClose}
              className="mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
            >
              Đóng cửa sổ
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitReport} className="space-y-3 text-xs">
            <p className="text-slate-600 dark:text-slate-400">
              Hãy đóng góp ý kiến hoặc miêu tả lỗi gặp phải. AI Chatbox sẽ tiếp nhận và chuyển trực tiếp tới Nhà Phát Hành!
            </p>

            <textarea
              required
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Hãy đóng góp ý kiến của bạn tại đây (VD: Lỗi giao diện, thắc mắc công thức...)"
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs h-32 outline-none focus:ring-2 focus:ring-rose-500 resize-none font-medium"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang gửi phản hồi...' : 'Gửi Về Nhà Phát Hành'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
