import React, { useState } from 'react';
import {
  HelpCircle,
  Send,
  Award,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Mic,
  FileText,
  MessageSquare,
  CheckCircle2,
  BookOpen,
  Key,
} from 'lucide-react';
import { CHAPTERS_DATA } from '../data/curriculumData';
import { InteractiveCanvas } from './InteractiveCanvas';
import { MathFormula, MathText } from './MathFormula';
import { WordEquationRibbon } from './WordEquationRibbon';
import { aiFetch } from '../utils/apiHelper';
import { normalizeSpokenMath } from '../utils/mathSpeechParser';

interface TheoreticalVivaProps {
  onAddExp: (amount: number, activityDetail?: string, exercisesCount?: number, gpaValue?: number) => void;
  onRecordMistake: (mistake: any) => void;
}

export const TheoreticalViva: React.FC<TheoreticalVivaProps> = ({ onAddExp, onRecordMistake }) => {
  // Mode: 'examiner_mode' (AI asks student) vs 'student_mode' (Student asks AI with any multimodal input)
  const [vivaMode, setVivaMode] = useState<'examiner_mode' | 'student_mode'>('examiner_mode');

  const [selectedChapterId, setSelectedChapterId] = useState<number | 'all'>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Examiner Mode State
  const [session, setSession] = useState<any>(null);
  const [studentAnswerText, setStudentAnswerText] = useState('');
  const [vivaFollowUpInput, setVivaFollowUpInput] = useState('');
  const [showFollowUpBox, setShowFollowUpBox] = useState(false);

  // Student Asking Mode State (Multimodal)
  const [studentQuestionText, setStudentQuestionText] = useState('');
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [useCanvasDrawing, setUseCanvasDrawing] = useState(false);
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);

  // Conversation history in Student Asking Mode
  const [studentQnAHistory, setStudentQnAHistory] = useState<
    Array<{
      question: string;
      image?: string;
      fileName?: string;
      answer: {
        teacherExplanation: string;
        keyTakeaways?: string[];
        followUpCheckQuestion?: string;
        suggestedFormulas?: string[];
      };
    }>
  >([]);

  const currentChapterTitle =
    selectedChapterId === 'all'
      ? 'Xác Suất Thống Kê Toàn Diện'
      : CHAPTERS_DATA.find((c) => c.id === selectedChapterId)?.title || 'XSTK';

  // --- EXAMINER MODE HANDLERS ---
  const handleStartExaminerSession = async () => {
    setIsLoading(true);
    setSession(null);
    setStudentAnswerText('');

    try {
      const response = await aiFetch('/api/tutor/viva', {
        method: 'POST',
        body: JSON.stringify({
          chapterTitle: currentChapterTitle,
          mode: 'examiner_ask',
          history: [],
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setSession({
          chapterTitle: currentChapterTitle,
          history: [],
          currentQuestion: data.data.nextQuestion || 'Em hãy giải thích ý nghĩa của Định lý Giới hạn Trung tâm và khi nào áp dụng?',
          totalScore: 0,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswerToExaminer = async (canvasDataUrl?: string, canvasText?: string) => {
    const ansText = canvasText || studentAnswerText;
    if (!ansText.trim() && !canvasDataUrl) return;
    if (!session) return;

    setIsLoading(true);
    const newHistory = [
      ...session.history,
      {
        question: session.currentQuestion,
        studentAnswer: ansText || 'Đã nộp bài giải qua nét vẽ bảng iPad',
      },
    ];

    try {
      const response = await aiFetch('/api/tutor/viva', {
        method: 'POST',
        body: JSON.stringify({
          chapterTitle: session.chapterTitle,
          mode: 'submit_answer',
          studentAnswer: ansText || 'Bài giải qua hình ảnh / nét vẽ bảng iPad',
          history: newHistory,
          imageBase64: canvasDataUrl,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        const result = data.data;
        const awardedScore = result.evaluation?.score ?? result.score ?? 8;
        const feedbackText = result.evaluation?.feedback || result.feedback || 'Giám khảo đã ghi nhận câu trả lời.';
        const gaps = result.evaluation?.knowledgeGaps || result.knowledgeGaps || [];
        const comprehensionCheck = result.comprehensionCheck || 'Em đã hiểu rõ lời giải thích và nhận xét của Thầy chưa?';
        const nextQ = result.nextQuestion || null;

        const updatedHistory = [...session.history];
        updatedHistory.push({
          question: session.currentQuestion,
          studentAnswer: ansText || 'Bài giải hình ảnh bảng iPad',
          score: awardedScore,
          feedback: feedbackText,
          gaps,
          comprehensionCheck,
          followUpDiscussions: [],
        });

        // Pedagogical checkpoint: Do not auto-advance until student confirms understanding!
        setSession({
          ...session,
          history: updatedHistory,
          pendingNextQuestion: nextQ,
          currentQuestion: null,
          totalScore: session.totalScore + awardedScore,
        });

        onAddExp(
          awardedScore * 10,
          `Vấn đáp AI: Đạt ${awardedScore}/10 điểm - "${session.chapterTitle}"`,
          1
        );
        setStudentAnswerText('');

        if (gaps && gaps.length > 0) {
          onRecordMistake({
            id: `viva_gap_${Date.now()}`,
            chapterId: typeof selectedChapterId === 'number' ? selectedChapterId : 1,
            chapterTitle: session.chapterTitle,
            sourceType: 'viva',
            questionSummary: session.currentQuestion,
            studentAnswer: ansText,
            correctConcept: 'Lý thuyết chuẩn vấn đáp giáo sư',
            rootCauseError: gaps[0],
            remediationAdvice: feedbackText,
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToNextQuestion = () => {
    if (!session || !session.pendingNextQuestion) return;
    setSession({
      ...session,
      currentQuestion: session.pendingNextQuestion,
      pendingNextQuestion: null,
    });
    setShowFollowUpBox(false);
    setVivaFollowUpInput('');
  };

  const handleAskFollowUpInViva = async (customQ?: string) => {
    const q = customQ || vivaFollowUpInput;
    if (!q.trim() || !session) return;
    setIsLoading(true);

    try {
      const lastHistoryItem = session.history[session.history.length - 1];
      const response = await aiFetch('/api/tutor/interactive-qa', {
        method: 'POST',
        body: JSON.stringify({
          contextType: 'viva',
          problemContext: lastHistoryItem?.question || session.chapterTitle,
          previousSolution: lastHistoryItem?.feedback || '',
          studentQuestion: q,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const updatedHistory = [...session.history];
        const curTurn = updatedHistory[updatedHistory.length - 1];
        if (curTurn) {
          curTurn.followUpDiscussions = curTurn.followUpDiscussions || [];
          curTurn.followUpDiscussions.push({
            studentQuestion: q,
            teacherReply: resData.data.teacherExplanation,
            comprehensionCheck: resData.data.comprehensionCheck,
          });
        }
        setSession({
          ...session,
          history: updatedHistory,
        });
        setVivaFollowUpInput('');
        setShowFollowUpBox(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // --- STUDENT ASKS AI HANDLERS (MULTIMODAL) ---
  const handleAskAI = async (canvasDataUrl?: string, canvasText?: string) => {
    const qText = canvasText || studentQuestionText.trim();
    const imgData = canvasDataUrl || attachedImageBase64;

    if (!qText && !imgData && !attachedFile) return;

    setIsLoading(true);

    try {
      const response = await aiFetch('/api/tutor/viva', {
        method: 'POST',
        body: JSON.stringify({
          chapterTitle: currentChapterTitle,
          mode: 'student_ask',
          studentQuestion: qText || (attachedFile ? `Giải đáp nội dung file ${attachedFile.name}` : 'Giải đáp hình ảnh/bảng iPad đính kèm'),
          imageBase64: imgData,
          fileMetadata: attachedFile ? { name: attachedFile.name, type: attachedFile.type } : undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setStudentQnAHistory((prev) => [
          ...prev,
          {
            question: qText || 'Câu hỏi bài tập qua hình ảnh / tệp đính kèm',
            image: imgData || undefined,
            fileName: attachedFile?.name,
            answer: data.data,
          },
        ]);

        setStudentQuestionText('');
        setAttachedImageBase64(null);
        setAttachedFile(null);
        onAddExp(20);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setAttachedImageBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startVoiceInput = () => {
    setIsVoiceRecording(true);
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = 'vi-VN';
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        const converted = normalizeSpokenMath(text);
        if (vivaMode === 'student_mode') {
          setStudentQuestionText(converted);
        } else {
          setStudentAnswerText(converted);
        }
        setIsVoiceRecording(false);
      };

      rec.onerror = () => setIsVoiceRecording(false);
      rec.start();
    } else {
      setTimeout(() => {
        const sample = 'Thầy ơi, giải thích giúp em bài toán kiểm định giả thiết với mức ý nghĩa $\\alpha = 0.05$ và $\\mu = 50$ với ạ!';
        if (vivaMode === 'student_mode') {
          setStudentQuestionText(sample);
        } else {
          setStudentAnswerText(sample);
        }
        setIsVoiceRecording(false);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-2 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-sm">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <span>TÍNH NĂNG VẤN ĐÁP LÝ THUYẾT AI ĐA CHIỀU & ĐA PHƯƠNG THỨC</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
          Vấn Đáp Hai Chiều: Giám Khảo Khảo Sát & Sinh Viên Hỏi Thỏa Đáp Tri Thức
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
          Bạn có thể để AI đóng vai Giám khảo vấn đáp, hoặc <strong className="text-cyan-300 font-bold">tự do gửi bất kỳ câu hỏi, bài tập, hình ảnh, file PDF/Word, chữ viết tay bảng iPad</strong> để Giáo Sư AI trực tiếp giải đáp cặn kẽ!
        </p>

        {/* Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3">
          <button
            onClick={() => setVivaMode('examiner_mode')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              vivaMode === 'examiner_mode'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>1. Giám Khảo AI Khảo Sát & Chấm Điểm</span>
          </button>

          <button
            onClick={() => setVivaMode('student_mode')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              vivaMode === 'student_mode'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>2. Người Dùng Hỏi AI (Văn Bản, Viết Tay, Ảnh, File)</span>
          </button>
        </div>
      </div>

      {/* MODE 1: EXAMINER ASKS STUDENT */}
      {vivaMode === 'examiner_mode' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border-2 border-cyan-500/30 p-5 rounded-3xl flex flex-wrap items-center justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-200">Chủ đề vấn đáp:</span>
              <select
                value={selectedChapterId}
                onChange={(e) => setSelectedChapterId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="p-2.5 rounded-xl border border-cyan-500/30 bg-slate-950 text-white text-xs outline-none font-bold focus:border-cyan-400"
              >
                <option value="all">Toàn bộ 7 Chương XSTK</option>
                {CHAPTERS_DATA.map((c) => (
                  <option key={c.id} value={c.id}>
                    Chương {c.id}: {c.shortTitle}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStartExaminerSession}
              disabled={isLoading}
              className="py-2.5 px-5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Đang chuẩn bị câu hỏi...' : 'BẮT ĐẦU PHIÊN VẤN ĐÁP MỚI'}</span>
            </button>
          </div>

          {/* Session Conversation Thread */}
          {session && (
            <div className="space-y-4 animate-fade-in">
              {session.history.map((turn: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="bg-slate-900/90 p-4 rounded-2xl border-2 border-cyan-500/40 text-xs shadow-md">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-cyan-300 flex items-center gap-1.5">
                        <span>👨‍🏫 Giám khảo AI hỏi câu #{i + 1}:</span>
                      </span>
                      <span className="text-[10px] bg-cyan-950/80 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 font-mono font-bold">
                        Vấn đáp trực tiếp
                      </span>
                    </div>
                    <div className="mt-2 font-bold text-white text-sm leading-relaxed">
                      <MathText text={turn.question} />
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs ml-4 space-y-3">
                    <div className="flex items-center justify-between text-slate-400 font-bold border-b border-slate-800 pb-1.5">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span>💬 Câu trả lời của em:</span>
                      </span>
                    </div>
                    <div className="text-slate-100 font-medium leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                      <MathText text={turn.studentAnswer} />
                    </div>

                    {turn.score !== undefined && (
                      <div className="p-4 bg-slate-900/95 rounded-2xl space-y-2.5 border-2 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                        {/* 10-point scale evaluation header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
                              Kết quả chấm điểm:
                            </span>
                            <span
                              className={`px-3 py-1 rounded-xl font-black text-xs flex items-center gap-1 shadow-sm ${
                                turn.score >= 8.5
                                  ? 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                                  : turn.score >= 7.0
                                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                                  : 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                              }`}
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>{turn.score} / 10 ĐIỂM</span>
                            </span>
                          </div>

                          <span className="text-[11px] font-bold text-slate-300">
                            {turn.score >= 8.5
                              ? '⭐ Xuất sắc - Nắm rất chắc bản chất'
                              : turn.score >= 7.0
                              ? '👍 Tốt - Đạt chuẩn học thuật'
                              : '💡 Cần lưu ý bổ sung kiến thức'}
                          </span>
                        </div>

                        {/* Full blackboard professor feedback */}
                        <div className="space-y-1">
                          <span className="text-[11px] font-black text-cyan-300 block">
                            👨‍🏫 Bài giảng & Nhận xét của Thầy (Toàn diện từng bước):
                          </span>
                          <blockquote className="text-slate-100 text-xs sm:text-[13px] leading-relaxed pl-3 border-l-2 border-cyan-400 bg-cyan-950/20 py-2.5 rounded-r-xl space-y-2">
                            <MathText text={turn.feedback} />
                          </blockquote>
                        </div>

                        {/* Comprehension check question */}
                        {turn.comprehensionCheck && (
                          <div className="p-3.5 bg-cyan-950/80 rounded-2xl border border-cyan-400/50 text-cyan-200 text-xs font-semibold space-y-1.5">
                            <div className="flex items-center gap-2 text-cyan-300 font-extrabold">
                              <Sparkles className="w-4 h-4 text-cyan-400" />
                              <span>Câu hỏi kiểm tra độ hiểu của Thầy (Socratic Check):</span>
                            </div>
                            <div className="text-white">
                              <MathText text={turn.comprehensionCheck} />
                            </div>
                          </div>
                        )}

                        {/* Thread of follow-up discussions on this turn */}
                        {turn.followUpDiscussions && turn.followUpDiscussions.length > 0 && (
                          <div className="space-y-2.5 pt-2 border-t border-slate-800">
                            {turn.followUpDiscussions.map((disc: any, dIdx: number) => (
                              <div key={dIdx} className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-cyan-500/30">
                                <div className="text-cyan-300 font-bold text-xs flex items-center gap-1.5">
                                  <span>🙋 Em hỏi thêm:</span> <MathText text={disc.studentQuestion} />
                                </div>
                                <div className="text-slate-100 text-xs pt-1 border-t border-slate-800">
                                  <span className="font-bold text-emerald-400 block mb-0.5">👨‍🏫 Thầy giải đáp:</span>
                                  <MathText text={disc.teacherReply} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Knowledge gaps pill if any */}
                        {turn.gaps && turn.gaps.length > 0 && (
                          <div className="p-2.5 bg-rose-950/80 text-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-500/50">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span>Lỗ hổng kiến thức cần khắc phục: {turn.gaps.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Pedagogical Checkpoint: Confirm understanding before advancing */}
              {session.pendingNextQuestion && !session.currentQuestion && (
                <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-400/80 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.25)] text-white animate-fade-in">
                  <div className="flex items-center gap-2 font-black text-emerald-300 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>XÁC NHẬN MỨC ĐỘ HIỂU BÀI CỦA EM TRƯỚC KHI TIẾP TỤC</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    Thầy muốn chắc chắn em đã thực sự hiểu thấu đáo bản chất của câu hỏi vừa rồi. Em hãy đọc kỹ bài giảng và nhận xét ở trên. Chừng nào em hoàn toàn hiểu và cảm thấy tự tin thì chúng ta mới chuyển sang câu tiếp theo nhé!
                  </p>

                  {showFollowUpBox && (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/40 space-y-3">
                      <span className="text-xs font-bold text-cyan-300 block">
                        💬 Nhập câu hỏi thắc mắc hoặc điểm em chưa rõ để Thầy giảng giải thêm:
                      </span>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={vivaFollowUpInput}
                          onChange={(e) => setVivaFollowUpInput(e.target.value)}
                          placeholder="Thầy ơi tại sao chỗ này em bị trừ điểm / Thầy giải thích thêm giúp em..."
                          className="flex-1 bg-slate-950 border-2 border-cyan-500/40 rounded-xl px-3.5 py-2.5 text-xs text-white font-bold outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/30 placeholder-slate-400 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                          onKeyDown={(e) => e.key === 'Enter' && handleAskFollowUpInViva()}
                        />
                        <button
                          onClick={() => handleAskFollowUpInViva()}
                          disabled={isLoading}
                          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-md"
                        >
                          Gửi hỏi Thầy
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      onClick={() => setShowFollowUpBox(!showFollowUpBox)}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold rounded-xl text-xs transition-colors flex items-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4 text-cyan-400" />
                      <span>{showFollowUpBox ? 'Đóng ô hỏi thêm' : 'Thầy ơi em chưa hiểu, muốn hỏi thêm'}</span>
                    </button>

                    <button
                      onClick={handleProceedToNextQuestion}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Em đã hiểu hoàn toàn, Thầy cho em câu tiếp theo! ➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Active Question to Answer */}
              {session.currentQuestion && (
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/50 text-white p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
                  <div className="flex items-center gap-2 font-black text-xs text-cyan-300">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>CÂU HỎI VẤN ĐÁP ĐANG CHỜ TRẢ LỜI:</span>
                  </div>

                  <div className="text-base font-extrabold text-white">
                    <MathText text={session.currentQuestion} />
                  </div>

                  {/* Unified Word Ribbon Toolbar & Large Drafting Sheet (Matches Image 2) */}
                  <div className="pt-2">
                    <WordEquationRibbon
                      title="Soạn Thảo Câu Trả Lời Vấn Đáp (Chuẩn Word WYSIWYG)"
                      placeholder="Nhấp vào trang tài liệu này để gõ câu trả lời, lập luận từng bước hoặc chèn công thức toán..."
                      submitButtonText="NỘP CÂU TRẢ LỜI CHO GIÁM KHẢO CHẤM"
                      isSubmitting={isLoading}
                      onSendToAI={(fullText, drawing) => handleSubmitAnswerToExaminer(drawing, fullText)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: STUDENT ASKS AI (MULTIMODAL: TEXT, DRAWING, IMAGE, FILE) */}
      {vivaMode === 'student_mode' && (
        <div className="space-y-6">
          {/* Multimodal Asking Input Box */}
          <div className="bg-slate-900/90 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 font-black text-cyan-300 text-xs">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>GỬI CÂU HỎI / BÀI TẬP BẤT KỲ ĐỂ GIÁO SƯ AI GIẢI ĐÁP & CHIA SẺ TRI THỨC</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUseCanvasDrawing(!useCanvasDrawing)}
                  className="px-3 py-1.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold rounded-xl text-xs hover:bg-cyan-900 transition-colors"
                >
                  {useCanvasDrawing ? 'Tắt Bảng Viết Tay' : '✍️ Viết Tay Lên Bảng iPad'}
                </button>
              </div>
            </div>

            {/* Unified Word Ribbon Toolbar & Large Drafting Sheet (Matches Image 2) */}
            <div className="pt-2">
              <WordEquationRibbon
                title="Soạn Thảo Đề Bài / Câu Hỏi Cho Giáo Sư AI (Chuẩn Word WYSIWYG)"
                placeholder="Gõ bất kỳ câu hỏi, lý thuyết, giải bài toán kinh tế, công thức Bayes, phân phối..."
                submitButtonText="GỬI CÂU HỎI CHO GIÁO SƯ AI"
                isSubmitting={isLoading}
                onSendToAI={(fullText, drawing) => handleAskAI(drawing, fullText)}
              />
            </div>
          </div>

          {/* Q&A Exchange History */}
          {studentQnAHistory.length > 0 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                Lịch Sử Giải Đáp & Chia Sẻ Tri Thức Với Giáo Sư AI
              </h3>

              {studentQnAHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]"
                >
                  {/* Question */}
                  <div className="flex items-start gap-2.5 text-xs">
                    <span className="p-1.5 bg-cyan-500 text-slate-950 rounded-lg font-black">Hỏi</span>
                    <div className="space-y-1">
                      <p className="font-bold text-white">{item.question}</p>
                      {item.fileName && (
                        <span className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-cyan-400 border border-slate-700">
                          Tệp: {item.fileName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Explanation & Lecture */}
                  <div className="p-5 bg-slate-950 rounded-2xl border border-cyan-500/30 text-xs space-y-3">
                    <div className="flex items-center gap-2 font-black text-cyan-300 text-xs">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Bài Giảng Giải Thích & Thỏa Đáp Từ Giáo Sư AI:</span>
                    </div>

                    <div className="text-slate-100 leading-relaxed font-medium">
                      <MathText text={item.answer.teacherExplanation} />
                    </div>

                    {item.answer.suggestedFormulas && item.answer.suggestedFormulas.length > 0 && (
                      <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/30 space-y-1">
                        <span className="font-bold text-cyan-300 text-[11px]">
                          📐 Công thức toán học liên quan:
                        </span>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.answer.suggestedFormulas.map((f, i) => (
                            <span key={i} className="font-mono bg-slate-950 px-2.5 py-1 rounded text-cyan-300 font-bold border border-cyan-500/40">
                              <MathFormula math={f} />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {item.answer.followUpCheckQuestion && (
                      <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/40 text-emerald-300 text-[11px] font-medium flex items-start gap-1.5">
                        <span className="font-bold shrink-0">❓ Câu hỏi củng cố của Thầy:</span>
                        <span className="flex-1"><MathText text={item.answer.followUpCheckQuestion} inline /></span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
