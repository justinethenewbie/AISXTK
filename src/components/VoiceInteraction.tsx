import React, { useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Send, Square, Play, BookOpen, CheckCircle } from 'lucide-react';
import { aiFetch } from '../utils/apiHelper';
import { MathFormula, MathText } from './MathFormula';
import { normalizeSpokenMath, convertVoiceToMathAI } from '../utils/mathSpeechParser';

interface VoiceInteractionProps {
  onAddExp: (amount: number) => void;
}

export const VoiceInteraction: React.FC<VoiceInteractionProps> = ({ onAddExp }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState<any>(null);

  const startVoiceRecording = () => {
    setIsRecording(true);
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsRecording(false);
        handleSendVoiceQuery(text);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
      setTimeout(() => {
        const mockText = 'Thầy ơi, cho em hỏi công thức Bayes được áp dụng khi nào và tại sao cần nhóm biến cố đầy đủ?';
        setTranscript(mockText);
        setIsRecording(false);
        handleSendVoiceQuery(mockText);
      }, 2500);
    }
  };

  const handleSendVoiceQuery = async (textQuery: string) => {
    if (!textQuery.trim()) return;
    setIsLoading(true);

    try {
      const response = await aiFetch('/api/tutor/voice-chat', {
        method: 'POST',
        body: JSON.stringify({
          userSpeechText: textQuery,
          contextChapter: 'Hỏi đáp giọng nói XSTK',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setVoiceResponse(data.data);
        onAddExp(20);

        if ('speechSynthesis' in window && data.data?.spokenResponse) {
          const utterance = new SpeechSynthesisUtterance(data.data.spokenResponse);
          utterance.lang = 'vi-VN';
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
          <Mic className="w-5 h-5 text-cyan-400" />
          <span>TÍNH NĂNG TƯƠNG TÁC BẰNG GIỌNG NÓI AI & TRÌNH CHIẾU IPAD</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          Hỏi Đáp Giọng Nói XSTK & Tự Động Trình Bày Công Thức Lên Bảng
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Trao đổi trực tiếp bằng lời nói với Linh vật AI Cú AI Classroom. Do nội dung toán học phức tạp khó diễn đạt hết bằng lời, AI sẽ tự động xuất sơ đồ bước giải toán lên Bảng iPad màn hình lớn!
        </p>
      </div>

      {/* Voice Controls */}
      <div className="bg-slate-900/90 border-2 border-cyan-500/30 p-8 rounded-3xl text-center space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <div className="relative inline-block">
          <button
            onClick={isRecording ? () => setIsRecording(false) : startVoiceRecording}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-slate-950 transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] ${
              isRecording
                ? 'bg-rose-500 text-white animate-ping'
                : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:scale-105 active:scale-95'
            }`}
          >
            <Mic className="w-10 h-10 text-slate-950" />
          </button>
        </div>

        <div>
          <p className="text-base font-black text-white">
            {isRecording ? 'Đang lắng nghe công thức hoặc câu hỏi của bạn...' : 'Bấm vào Micro để đọc to công thức hoặc câu hỏi'}
          </p>
          <p className="text-xs text-slate-300 font-medium mt-1">
            Hệ thống tự động nhận diện ngôn ngữ nói toán học tiếng Việt và chuyển sang ký hiệu KaTeX $\LaTeX$ chuẩn!
          </p>
        </div>

        {/* Suggestion pills for quick voice/math test */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 max-w-2xl mx-auto">
          {[
            'Xác suất để đại lượng thống kê (F trừ p) chia cho căn bậc hai của (p nhân q trên n) nằm trong đoạn từ trừ z alpha trên hai đến z alpha trên hai là bằng một trừ alpha.',
            'Xác suất của A hợp B bằng P(A) cộng P(B) trừ P(AB)',
            'Công thức Bayes khi biết hệ biến cố đầy đủ H_i',
            'Đại lượng thống kê T bằng X ngang trừ muy chia cho s trên căn n tuân theo phân phối Student'
          ].map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTranscript(sample);
                handleSendVoiceQuery(sample);
              }}
              className="text-[11px] px-3 py-1.5 rounded-full bg-slate-950/80 hover:bg-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 transition-all text-left flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[280px]">{sample}</span>
            </button>
          ))}
        </div>

        {/* Text fallback input */}
        <div className="max-w-lg mx-auto flex items-center gap-2 pt-2">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Hoặc gõ/dán công thức bằng chữ tại đây..."
            className="flex-1 p-3 rounded-xl border border-cyan-500/30 bg-slate-950 text-white placeholder-slate-400 text-xs outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-medium"
          />
          <button
            onClick={() => handleSendVoiceQuery(transcript)}
            disabled={isLoading || !transcript.trim()}
            className="p-3 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-slate-950" />
          </button>
        </div>
      </div>

      {/* AI Voice & iPad Board Display */}
      {voiceResponse && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
          {/* Left: AI Audio Speech Response */}
          <div className="bg-slate-900 border-2 border-cyan-500/30 p-5 rounded-3xl space-y-3 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-cyan-300 font-black text-xs">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Phản Hồi Lời Nói Từ Cú AI Classroom</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-semibold">
                "{voiceResponse.spokenResponse}"
              </p>
            </div>
            {voiceResponse.recommendedAction && (
              <div className="pt-3 border-t border-slate-800 text-[11px] text-cyan-300 flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gợi ý: {voiceResponse.recommendedAction}</span>
              </div>
            )}
          </div>

          {/* Right: iPad Math Layout Board */}
          <div className="bg-slate-950 border-2 border-cyan-400/60 p-5 rounded-3xl text-cyan-300 font-mono text-xs space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] text-cyan-400 font-bold">
              <span>🖥️ BẢNG TRÌNH BÀY TOÁN HỌC IPAD (MATH_BOARD_SYNCED)</span>
              <span className="text-emerald-400 font-mono">KaTeX_RENDERED</span>
            </div>
            <div className="overflow-x-auto text-slate-100 text-xs sm:text-sm font-sans leading-relaxed py-2">
              <MathText text={voiceResponse.ipadMathBoard || 'Đang đồng bộ công thức toán học...'} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
