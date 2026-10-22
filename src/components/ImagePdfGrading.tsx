import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Image,
  CheckCircle,
  Lightbulb,
  Award,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Sigma,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Calculator,
  AlertTriangle,
  BookOpen,
  MessageCircle,
  Send,
  Mic,
  MicOff,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Cpu,
  HelpCircle,
  Table as TableIcon,
  ListOrdered,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InteractiveCanvas } from './InteractiveCanvas';
import { MathText } from './MathFormula';
import { aiFetch } from '../utils/apiHelper';
import { normalizeSpokenMath } from '../utils/mathSpeechParser';

interface ImagePdfGradingProps {
  onAddExp: (amount: number, details?: string, count?: number, gpaScore?: number) => void;
  onRecordMistake: (mistake: any) => void;
}

export const ImagePdfGrading: React.FC<ImagePdfGradingProps> = ({
  onAddExp,
  onRecordMistake,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [useiPadCanvas, setUseiPadCanvas] = useState(false);

  // Solving states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [solutionData, setSolutionData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'solution' | 'grade'>('solution');

  // Audio / Speech Synthesis state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedRibbon, setCopiedRibbon] = useState(false);

  // Pedagogical Q&A & Traps
  const [showPedagogicalAnswer, setShowPedagogicalAnswer] = useState(false);
  const [hasUnderstood, setHasUnderstood] = useState(false);
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [followupChat, setFollowupChat] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [isAnsweringFollowup, setIsAnsweringFollowup] = useState(false);

  // Voice STT for input & followup
  const [isListeningInput, setIsListeningInput] = useState(false);
  const [isListeningFollowup, setIsListeningFollowup] = useState(false);

  // Tab 2: Grading states
  const [studentResponse, setStudentResponse] = useState('');
  const [gradingResult, setGradingResult] = useState<any>(null);

  const solutionRef = useRef<HTMLDivElement>(null);

  // Animated loading progress text
  useEffect(() => {
    let timer: any;
    if (isLoading) {
      setLoadingStage(1);
      timer = setInterval(() => {
        setLoadingStage((prev) => (prev < 4 ? prev + 1 : prev));
      }, 900);
    } else {
      setLoadingStage(0);
    }
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile(uploaded);

    if (uploaded.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreviewUrl(reader.result as string);
      reader.readAsDataURL(uploaded);
    } else {
      setFilePreviewUrl(null);
    }
  };

  // Trigger Full AI Solve (Multimodal)
  const handleSolveProblem = async (canvasDataUrl?: string, canvasText?: string) => {
    setIsLoading(true);
    setSolutionData(null);
    setGradingResult(null);
    setFollowupChat([]);
    setHasUnderstood(false);
    setShowPedagogicalAnswer(false);

    const imgBase64 = canvasDataUrl || filePreviewUrl || '';
    const textContent = canvasText || inputText || (file ? `File đính kèm: ${file.name}` : '');

    try {
      const response = await aiFetch('/api/tutor/solve-multimodal', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: imgBase64,
          textContent,
          chapterTitle: 'Giải bài tập thực tế Xác Suất Thống Kê',
          mode: 'solve',
          strategyOnly: true,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setSolutionData(data.data);
        setActiveTab('solution');
        onAddExp(45, 'Phân tích & giải chi tiết bài toán bằng AI Multimodal');

        // Smooth scroll to solution
        setTimeout(() => {
          solutionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      }
    } catch (err) {
      console.error('Solve error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Grade student's own handwritten/equation solution (Tab 2)
  const handleEvaluateStudentAnswer = async (canvasDataUrl?: string, customText?: string) => {
    const textToSubmit = customText || studentResponse;
    if (!textToSubmit.trim() && !canvasDataUrl) return;
    setIsLoading(true);

    try {
      const response = await aiFetch('/api/tutor/evaluate', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: canvasDataUrl || filePreviewUrl || '',
          textContent: `Đề bài: "${solutionData?.problemTitle || inputText || ''}". Lời giải của sinh viên: "${textToSubmit}"`,
          chapterTitle: solutionData?.chapter || 'Chấm bài tập thực tế',
          mode: 'grade',
          strategyOnly: false,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setGradingResult(data.data);
        const score = typeof data.data?.totalScore === 'number' ? data.data.totalScore : 7.5;
        const gpaVal = (score / 10) * 4.0;
        if (score >= 7) {
          onAddExp(80, `Chấm bài tự làm: ${score}/10đ`, 1, gpaVal);
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } else {
          onAddExp(30, `Chấm bài tự làm: ${score}/10đ`, 1, gpaVal);
          onRecordMistake({
            id: `mistake_upload_${Date.now()}`,
            chapterId: 0,
            chapterTitle: solutionData?.chapter || 'Bài tập tự upload',
            sourceType: 'essay',
            questionSummary: solutionData?.problemTitle || 'Bài toán upload ngoài hệ thống',
            studentAnswer: textToSubmit,
            correctConcept: 'Theo lời giải chi tiết chuẩn của AI Tutor',
            rootCauseError: data.data?.rootCauseError || 'Lỗi tính toán hoặc hiểu nhầm khái niệm',
            remediationAdvice: data.data?.betterStrategy || 'Đọc lại bảng bóc tách từ khóa và hướng dẫn Casio',
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

  // Audio Speech Synthesis (Read the full explanation out loud)
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt của bạn chưa hỗ trợ giọng đọc Web Speech API.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!solutionData) return;

    // Build spoken script
    let speechScript = `${solutionData.problemTitle || 'Bài toán xác suất thống kê'}. `;
    if (solutionData.keywordBreakdown && solutionData.keywordBreakdown.length > 0) {
      speechScript += 'Thầy phân tích đề bài từ các từ khóa như sau: ';
      solutionData.keywordBreakdown.forEach((item: any) => {
        speechScript += `Từ ${item.keyword}, ta bóc tách được ${item.deduction}. `;
      });
    }

    if (solutionData.detailedSteps && solutionData.detailedSteps.length > 0) {
      speechScript += 'Về các bước giải chi tiết: ';
      solutionData.detailedSteps.forEach((st: any) => {
        speechScript += `${st.stepTitle}. ${st.explanation}. `;
      });
    }

    if (solutionData.finalAnswers && solutionData.finalAnswers.length > 0) {
      speechScript += 'Đáp số cuối cùng: ';
      solutionData.finalAnswers.forEach((ans: any) => {
        speechScript += `${ans.name} là ${ans.value} ${ans.unit}. `;
      });
    }

    // Clean KaTeX symbols from speech
    const cleanText = speechScript
      .replace(/\$+/g, '')
      .replace(/\\bar\{x\}/g, 'x ngang')
      .replace(/\\mu/g, 'muy')
      .replace(/\\sigma/g, 'xích ma')
      .replace(/\\alpha/g, 'an pha')
      .replace(/s\^2/g, 's bình phương')
      .replace(/\\sum/g, 'tổng')
      .replace(/\\approx/g, 'xấp xỉ')
      .replace(/[\\_{}^]/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Copy quick answer ribbon for multiple choice exams
  const handleCopyAnswerRibbon = () => {
    if (!solutionData?.multipleChoiceSolutions?.length) return;
    const summary = solutionData.multipleChoiceSolutions
      .map((q: any) => `Câu ${q.questionNumber || q.id}: ${q.correctOption}`)
      .join(' | ');
    navigator.clipboard.writeText(summary);
    setCopiedRibbon(true);
    setTimeout(() => setCopiedRibbon(false), 2000);
  };

  // Copy full solution markdown
  const handleCopySolution = () => {
    if (!solutionData) return;

    let text = `# ${solutionData.problemTitle}\n\n`;
    text += `**Dạng bài toán:** ${solutionData.problemType}\n`;
    text += `**Chương:** ${solutionData.chapter}\n\n`;

    if (solutionData.multipleChoiceSolutions?.length) {
      text += `## ĐÁP ÁN ĐỀ THI TRẮC NGHIỆM CHI TIẾT\n`;
      solutionData.multipleChoiceSolutions.forEach((q: any) => {
        text += `### Câu ${q.questionNumber}: ${q.questionText}\n`;
        if (q.options) {
          Object.entries(q.options).forEach(([k, v]) => {
            text += `- [${k}] ${v}${String(k).trim().toUpperCase() === String(q.correctOption).trim().toUpperCase() ? ' (ĐÁP ÁN ĐÚNG)' : ''}\n`;
          });
        }
        text += `\n**Đáp án đúng:** ${q.correctOption}\n`;
        text += `**Lời giải chi tiết:** ${q.stepByStepSolution}\n`;
        if (q.mathFormulaKatex) text += `$$${q.mathFormulaKatex}$$\n`;
        if (q.casioShortcut) text += `**Bấm máy Casio fx-580VN X:** ${q.casioShortcut}\n`;
        if (q.whyOtherOptionsWrong) text += `**Bẫy phương án khác:** ${q.whyOtherOptionsWrong}\n\n`;
      });
    }

    if (solutionData.subQuestions?.length) {
      text += `## GIẢI CHI TIẾT TỪNG Ý / TIỂU MỤC (A, B, C, D...)\n`;
      solutionData.subQuestions.forEach((sq: any) => {
        text += `### ${sq.partLabel}: ${sq.questionStatement}\n`;
        text += `${sq.explanation}\n`;
        if (sq.mathFormulaKatex) text += `$$${sq.mathFormulaKatex}$$\n`;
        if (sq.finalAnswer) text += `**Đáp số:** ${sq.finalAnswer.symbol || ''} = ${sq.finalAnswer.value} ${sq.finalAnswer.unit || ''}\n`;
        if (sq.casioShortcut) text += `**Bấm máy Casio:** ${sq.casioShortcut}\n\n`;
      });
    }

    if (solutionData.keywordBreakdown?.length) {
      text += `## 1. Phân Tích Đề Bài Từ Từng Từ Khóa\n`;
      solutionData.keywordBreakdown.forEach((k: any) => {
        text += `- **${k.keyword}** -> ${k.mathSymbol}: ${k.deduction}\n`;
      });
      text += `\n`;
    }

    if (solutionData.detailedSteps?.length) {
      text += `## 2. Lời Giải Chi Tiết Từng Bước\n`;
      solutionData.detailedSteps.forEach((s: any) => {
        text += `### ${s.stepTitle}\n${s.explanation}\n$$${s.mathFormulaKatex}$$\n${s.resultNote || ''}\n\n`;
      });
    }

    if (solutionData.finalAnswers?.length) {
      text += `## 3. Đáp Số Cuối Cùng\n`;
      solutionData.finalAnswers.forEach((a: any) => {
        text += `- ${a.name} (${a.symbol}): **${a.value} ${a.unit}** (${a.summary})\n`;
      });
      text += `\n`;
    }

    if (solutionData.casioGuide) {
      text += `## 4. Hướng Dẫn Bấm Máy Casio fx-580VN X\n`;
      text += `- Cài đặt: ${solutionData.casioGuide.prerequisite || ''}\n`;
      solutionData.casioGuide.keystrokes?.forEach((k: any) => {
        text += `- Bước ${k.stepOrder}: ${k.actionTitle} [${k.keys?.join(' -> ')}] -> ${k.screenDisplayNote}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Send interactive follow-up question about this solution to AI
  const handleSendFollowup = async () => {
    if (!followupQuestion.trim() || isAnsweringFollowup) return;
    const q = followupQuestion;
    setFollowupQuestion('');
    setFollowupChat((prev) => [...prev, { role: 'user', text: q }]);
    setIsAnsweringFollowup(true);

    try {
      const response = await aiFetch('/api/tutor/interactive-qa', {
        method: 'POST',
        body: JSON.stringify({
          contextType: 'math_processor',
          problemContext: `${solutionData?.problemTitle || ''}. ${solutionData?.rawExtractedText || ''}`,
          previousSolution: JSON.stringify(solutionData),
          studentQuestion: q,
          history: followupChat,
        }),
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data) {
        setFollowupChat((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: resJson.data.teacherExplanation || 'Thầy đã giải thích thêm chi tiết cho em.',
          },
        ]);
        onAddExp(15, 'Đặt câu hỏi đào sâu lời giải cùng AI');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnsweringFollowup(false);
    }
  };

  // STT Voice input handler for question
  const startVoiceInput = (target: 'input' | 'followup') => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Trình duyệt chưa hỗ trợ ghi âm Speech-to-Text.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    if (target === 'input') setIsListeningInput(true);
    else setIsListeningFollowup(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const parsed = normalizeSpokenMath(transcript);
      if (target === 'input') {
        setInputText((prev) => (prev ? prev + ' ' + parsed : parsed));
      } else {
        setFollowupQuestion((prev) => (prev ? prev + ' ' + parsed : parsed));
      }
    };

    recognition.onerror = () => {
      setIsListeningInput(false);
      setIsListeningFollowup(false);
    };

    recognition.onend = () => {
      setIsListeningInput(false);
      setIsListeningFollowup(false);
    };

    recognition.start();
  };

  return (
    <div className="space-y-6 text-slate-100 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-2 border-cyan-500/40 p-6 sm:p-8 rounded-3xl space-y-3 shadow-[0_0_35px_rgba(6,182,212,0.18)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2.5 text-cyan-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
          <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span>Trợ Lý Multimodal AI Giải Toán XSTK Toàn Diện</span>
        </div>
        <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.35)] tracking-tight">
          Bóc Tách Từ Khóa Đề Bài, Giải Chi Tiết Chuẩn KaTeX & Hướng Dẫn Bấm Máy Casio
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium max-w-3xl">
          Tải ảnh bài tập, file PDF hoặc vẽ tay trên bảng iPad. Hệ thống AI phân tích đề bài từ từng từ khóa, lập bảng số liệu trung gian, giải từng bước chi tiết và mô phỏng từng phím bấm máy tính <strong className="text-cyan-300 font-bold">Casio fx-580VN X</strong> chính xác 100%!
        </p>
      </div>

      {/* Input Selector: Upload vs iPad Canvas */}
      <div className="flex gap-2">
        <button
          onClick={() => setUseiPadCanvas(false)}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            !useiPadCanvas
              ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_18px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload File / Hình Ảnh Đề Bài</span>
        </button>

        <button
          onClick={() => setUseiPadCanvas(true)}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
            useiPadCanvas
              ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_18px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-cyan-400/50 hover:text-white'
          }`}
        >
          <Image className="w-4 h-4" />
          <span>Viết Tay Lên Bảng iPad</span>
        </button>
      </div>

      {!useiPadCanvas ? (
        <div className="bg-slate-900/90 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.1)]">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-cyan-500/40 rounded-2xl p-6 sm:p-8 text-center bg-slate-950 hover:border-cyan-400 transition-all cursor-pointer group">
            <input
              type="file"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer space-y-3 block">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform">
                <Upload className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-white">
                  {file ? file.name : 'Nhấp để tải lên bài tập (Ảnh chụp đề bài JPG/PNG, file PDF, Word)'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Hỗ trợ nhận diện chữ viết tay tiếng Việt, bảng số liệu ghép lớp & ký hiệu KaTeX
                </p>
              </div>
            </label>
          </div>

          {/* Image Preview */}
          {filePreviewUrl && (
            <div className="max-w-2xl mx-auto rounded-2xl overflow-hidden border-2 border-cyan-500/40 shadow-xl bg-slate-950 p-2">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 text-xs text-cyan-300 font-bold mb-2">
                <span>Hình ảnh đề bài đã đính kèm</span>
                <span className="text-[11px] text-slate-400">Độ phân giải gốc</span>
              </div>
              <img
                src={filePreviewUrl}
                alt="Bài tập upload"
                className="w-full max-h-96 object-contain rounded-xl mx-auto"
              />
            </div>
          )}

          {/* Additional text or question input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>Nhập bổ sung câu hỏi hoặc ghi chú đề bài (tùy chọn):</span>
              </label>
              <button
                type="button"
                onClick={() => startVoiceInput('input')}
                className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all cursor-pointer ${
                  isListeningInput
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                }`}
              >
                {isListeningInput ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isListeningInput ? 'Đang lắng nghe...' : 'Nói giọng nói (STT)'}</span>
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="VD: Xác định mức dư nợ trung bình và phương sai mẫu hiệu chỉnh... (Hoặc nói trực tiếp bằng micro)"
              className="w-full h-24 bg-slate-950 border border-cyan-500/30 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none font-sans"
            />
          </div>

          {/* Action Trigger Button */}
          <button
            onClick={() => handleSolveProblem()}
            disabled={isLoading || (!filePreviewUrl && !inputText.trim() && !file)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 text-slate-950" />
            )}
            <span>
              {isLoading
                ? 'AI ĐANG BÓC TÁCH ĐỀ BÀI & GIẢI CHI TIẾT...'
                : '⚡ PHÂN TÍCH & GIẢI TOÀN DIỆN CÙNG AI GEMINI'}
            </span>
          </button>
        </div>
      ) : (
        /* iPad Canvas Option */
        <InteractiveCanvas
          submitButtonText="⚡ PHÂN TÍCH & GIẢI CHI TIẾT TỪ BẢN VẼ IPAD"
          onExportCanvas={(url, text) => handleSolveProblem(url, text)}
          isSubmitting={isLoading}
        />
      )}

      {/* Loading Skeleton Indicator */}
      {isLoading && (
        <div className="bg-slate-900 border-2 border-cyan-500/40 p-8 rounded-3xl text-center space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.2)] animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Cpu className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-black text-white">
              AI Tutor Đang Xử Lý Đề Bài & Lập Lời Giải...
            </h3>
            <div className="flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold text-cyan-300">
              <span className={loadingStage >= 1 ? 'text-emerald-400 font-bold' : 'opacity-40'}>
                1. Đọc dữ liệu đề bài
              </span>
              <span>➔</span>
              <span className={loadingStage >= 2 ? 'text-emerald-400 font-bold' : 'opacity-40'}>
                2. Bóc tách từng từ khóa
              </span>
              <span>➔</span>
              <span className={loadingStage >= 3 ? 'text-emerald-400 font-bold' : 'opacity-40'}>
                3. Tính toán công thức KaTeX
              </span>
              <span>➔</span>
              <span className={loadingStage >= 4 ? 'text-emerald-400 font-bold' : 'opacity-40'}>
                4. Mô phỏng phím Casio 580
              </span>
            </div>
          </div>
        </div>
      )}

      {/* RESULT SECTION */}
      {solutionData && (
        <div ref={solutionRef} className="space-y-6 animate-fade-in">
          {/* Tab Selector between AI Full Solution and Student Self-Practice */}
          <div className="flex gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('solution')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'solution'
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>Lời Giải & Phân Tích Toàn Diện (Chuẩn Gemini)</span>
            </button>

            <button
              onClick={() => setActiveTab('grade')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'grade'
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Chấm Điểm Bài Tự Làm Của Em (Thang 10)</span>
            </button>
          </div>

          {activeTab === 'solution' ? (
            <div className="space-y-6">
              {/* Solution Header Card */}
              <div className="bg-slate-900 border-2 border-cyan-500/40 p-6 rounded-3xl shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    <span>{solutionData.chapter || 'Xác Suất Thống Kê Đại Học'}</span>
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black text-white">
                    {solutionData.problemTitle || 'Bài Toán Được Phân Tích & Giải Chi Tiết'}
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold">
                    Dạng bài: <strong className="text-cyan-300">{solutionData.problemType}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleToggleSpeech}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      isSpeaking
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? 'Dừng đọc' : 'Nghe AI Giảng Bài'}</span>
                  </button>

                  <button
                    onClick={handleCopySolution}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Đã sao chép!' : 'Sao chép lời giải'}</span>
                  </button>
                </div>
              </div>

              {/* SECTION: MULTIPLE CHOICE EXAM SOLVER (IF APPLICABLE) */}
              {(solutionData.isMultipleChoiceExam || (solutionData.multipleChoiceSolutions && solutionData.multipleChoiceSolutions.length > 0)) && (
                <div className="space-y-4">
                  {/* Quick Answer Ribbon */}
                  <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-2 border-emerald-400/60 p-5 rounded-3xl shadow-[0_0_25px_rgba(16,185,129,0.2)] space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-sm sm:text-base">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>Bảng Tra Đáp Án Nhanh Đề Thi Trắc Nghiệm ({solutionData.multipleChoiceSolutions?.length || 0} Câu)</span>
                      </div>
                      <button
                        onClick={handleCopyAnswerRibbon}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {copiedRibbon ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedRibbon ? 'Đã chép đáp án!' : 'Sao chép bảng đáp án'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-wrap">
                      {solutionData.multipleChoiceSolutions?.map((mc: any, idx: number) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 border-2 border-emerald-500/40 text-xs font-mono font-black flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="text-slate-400 font-sans font-bold text-[11px]">Câu {mc.questionNumber || idx + 1}:</span>
                          <span className="text-emerald-300 text-sm bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50">
                            {mc.correctOption}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sequential Question Cards */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-cyan-400 font-black text-sm sm:text-base px-2">
                      <ListOrdered className="w-5 h-5 text-cyan-400" />
                      <span>Lời Giải Tuần Tự Từng Câu Trắc Nghiệm (Không Giới Hạn - Chuẩn KaTeX & Casio)</span>
                    </div>

                    {solutionData.multipleChoiceSolutions?.map((mc: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-900 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-lg hover:border-cyan-400/50 transition-all"
                      >
                        {/* Question Header */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs sm:text-sm">
                              Câu {mc.questionNumber || idx + 1}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">Trắc nghiệm 4 lựa chọn</span>
                          </div>

                          <div className="text-xs sm:text-sm text-white font-bold leading-relaxed pt-1">
                            <MathText text={mc.questionText} />
                          </div>
                        </div>

                        {/* Options Grid */}
                        {mc.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            {Object.entries(mc.options).map(([optKey, optVal]: [string, any]) => {
                              const isCorrect = String(optKey).trim().toUpperCase() === String(mc.correctOption).trim().toUpperCase();
                              return (
                                <div
                                  key={optKey}
                                  className={`p-3 rounded-2xl flex items-start gap-2.5 text-xs transition-all ${
                                    isCorrect
                                      ? 'bg-emerald-950/60 border-2 border-emerald-400 text-emerald-200 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                                      : 'bg-slate-950 border border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <span
                                    className={`w-6 h-6 rounded-lg font-mono font-black text-xs flex items-center justify-center shrink-0 ${
                                      isCorrect
                                        ? 'bg-emerald-400 text-slate-950 shadow-md'
                                        : 'bg-slate-800 text-slate-300'
                                    }`}
                                  >
                                    {optKey}
                                  </span>
                                  <div className="flex-1 pt-0.5">
                                    <MathText text={String(optVal)} inline />
                                    {isCorrect && (
                                      <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-emerald-300 font-black uppercase bg-emerald-900/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
                                        <CheckCircle className="w-3 h-3" /> ĐÁP ÁN ĐÚNG
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Step by step solution & KaTeX */}
                        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5">
                          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                            <Sparkles className="w-4 h-4 text-cyan-400" />
                            <span>Chứng Minh & Lời Giải Chi Tiết:</span>
                          </div>

                          <div className="text-xs text-slate-200 leading-relaxed font-medium">
                            <MathText text={mc.stepByStepSolution} />
                          </div>

                          {mc.mathFormulaKatex && (
                            <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/30 overflow-x-auto text-cyan-200 text-xs sm:text-sm font-mono">
                              <MathText text={`$$${mc.mathFormulaKatex}$$`} />
                            </div>
                          )}
                        </div>

                        {/* Casio shortcut */}
                        {mc.casioShortcut && (
                          <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl flex items-start gap-2 text-xs text-amber-200">
                            <Calculator className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                              <strong className="text-amber-300">Bấm máy Casio fx-580VN X trong 20s: </strong>
                              <span>{mc.casioShortcut}</span>
                            </div>
                          </div>
                        )}

                        {/* Trap analysis */}
                        {mc.whyOtherOptionsWrong && (
                          <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl flex items-start gap-2 text-xs text-rose-200">
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                              <strong className="text-rose-300">Bẫy phương án sai: </strong>
                              <span>{mc.whyOtherOptionsWrong}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: SUB-QUESTIONS / MULTI-PART PROBLEM SOLVER (IF APPLICABLE) */}
              {(solutionData.hasSubQuestions || (solutionData.subQuestions && solutionData.subQuestions.length > 0)) && (
                <div className="bg-slate-900 border-2 border-emerald-500/40 p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-black text-sm sm:text-base">
                      <Layers className="w-5 h-5 text-emerald-400" />
                      <span>Giải Chi Tiết Toàn Bộ Các Ý / Tiểu Mục (Ý a, b, c, d... - Không Bỏ Sót)</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                      Hoàn thành 100% tất cả các câu hỏi của đề
                    </span>
                  </div>

                  <div className="space-y-4">
                    {solutionData.subQuestions?.map((sq: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-emerald-500/30 p-5 rounded-2xl space-y-3 hover:border-emerald-400/60 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 rounded-lg bg-emerald-400 text-slate-950 font-black text-xs">
                            {sq.partLabel || `Ý ${idx + 1}`}
                          </span>
                          <h4 className="font-bold text-white text-xs sm:text-sm">
                            <MathText text={sq.questionStatement} inline />
                          </h4>
                        </div>

                        <div className="text-xs text-slate-300 leading-relaxed font-medium">
                          <MathText text={sq.explanation} />
                        </div>

                        {sq.mathFormulaKatex && (
                          <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/30 overflow-x-auto text-cyan-200 text-xs sm:text-sm font-mono">
                            <MathText text={`$$${sq.mathFormulaKatex}$$`} />
                          </div>
                        )}

                        {sq.finalAnswer && (
                          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 flex items-center justify-between flex-wrap gap-2 text-xs">
                            <span className="text-slate-300 font-bold">Đáp số ý này:</span>
                            <span className="font-mono font-black text-emerald-300 text-sm flex items-center gap-1.5">
                              {sq.finalAnswer.symbol && <MathText text={sq.finalAnswer.symbol} inline />}
                              <span>= {sq.finalAnswer.value}</span>
                              <span className="text-xs font-normal text-slate-300">{sq.finalAnswer.unit}</span>
                            </span>
                          </div>
                        )}

                        {sq.casioShortcut && (
                          <div className="p-2.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
                            <div>
                              <strong className="text-amber-300">Bấm máy: </strong>
                              <span>{sq.casioShortcut}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PILLAR 1: KEYWORD DECONSTRUCTION */}
              {solutionData.keywordBreakdown && solutionData.keywordBreakdown.length > 0 && (
                <div className="bg-slate-900 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-lg">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-sm sm:text-base border-b border-slate-800 pb-3">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span>1. Phân Tích Đề Bài Từ Từng Từ Khóa & Số Liệu Đề Cho</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {solutionData.keywordBreakdown.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-cyan-500/25 p-4 rounded-2xl space-y-2 hover:border-cyan-400/50 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                            🔍 Từ đề: "{item.keyword}"
                          </span>
                          <span className="font-mono text-cyan-300 font-bold text-xs bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded">
                            <MathText text={item.mathSymbol} inline />
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          <MathText text={item.deduction} inline />
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PILLAR 2: INTERMEDIATE CALCULATION TABLE (IF APPLICABLE) */}
              {solutionData.summaryTable && (
                <div className="bg-slate-900 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-lg">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-sm sm:text-base border-b border-slate-800 pb-3">
                    <TableIcon className="w-5 h-5 text-cyan-400" />
                    <span>2. Bảng Tính Toán Số Liệu Trung Gian</span>
                  </div>

                  <p className="text-xs text-slate-300 font-semibold">{solutionData.summaryTable.title}</p>

                  <div className="overflow-x-auto rounded-2xl border border-cyan-500/30 bg-slate-950">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-cyan-300 border-b border-cyan-500/30">
                          {solutionData.summaryTable.headers?.map((h: string, i: number) => (
                            <th key={i} className="p-3 font-bold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {solutionData.summaryTable.rows?.map((row: any[], rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-slate-900/60 transition-colors">
                            {row.map((cell: any, cIdx: number) => (
                              <td key={cIdx} className="p-3 font-mono text-slate-200">
                                {typeof cell === 'string' && cell.includes('\\') ? (
                                  <MathText text={cell} inline />
                                ) : (
                                  cell
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {solutionData.summaryTable.totalRow && (
                          <tr className="bg-cyan-950/40 text-cyan-200 font-black border-t-2 border-cyan-500/50">
                            {solutionData.summaryTable.totalRow.map((cell: any, cIdx: number) => (
                              <td key={cIdx} className="p-3 font-mono">
                                {typeof cell === 'string' && cell.includes('\\') ? (
                                  <MathText text={cell} inline />
                                ) : (
                                  cell
                                )}
                              </td>
                            ))}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* PILLAR 3: DETAILED STEP-BY-STEP SOLUTION (KATEX MATH) */}
              {solutionData.detailedSteps && solutionData.detailedSteps.length > 0 && (
                <div className="bg-slate-900 border-2 border-cyan-500/30 p-6 rounded-3xl space-y-4 shadow-lg">
                  <div className="flex items-center gap-2 text-cyan-400 font-black text-sm sm:text-base border-b border-slate-800 pb-3">
                    <Sigma className="w-5 h-5 text-cyan-400" />
                    <span>3. Lời Giải Chi Tiết Từng Bước (Chuẩn KaTeX Đại Học)</span>
                  </div>

                  <div className="space-y-4">
                    {solutionData.detailedSteps.map((step: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-2.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center">
                            {step.stepNumber || idx + 1}
                          </span>
                          <h4 className="font-bold text-white text-xs sm:text-sm">{step.stepTitle}</h4>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {step.explanation}
                        </p>

                        {step.mathFormulaKatex && (
                          <div className="p-3.5 bg-slate-900 rounded-xl border border-cyan-500/30 overflow-x-auto text-cyan-200 text-xs sm:text-sm font-mono">
                            <MathText text={`$$${step.mathFormulaKatex}$$`} />
                          </div>
                        )}

                        {step.resultNote && (
                          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{step.resultNote}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PILLAR 4: FINAL ANSWERS CARD */}
              {solutionData.finalAnswers && solutionData.finalAnswers.length > 0 && (
                <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-emerald-400/60 p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <div className="flex items-center gap-2 text-emerald-300 font-black text-sm sm:text-base border-b border-slate-800 pb-3">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <span>4. Bảng Đáp Số Chuẩn Cuối Cùng</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {solutionData.finalAnswers.map((ans: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-slate-900/90 border border-emerald-500/40 p-4 rounded-2xl space-y-1.5"
                      >
                        <div className="text-xs text-slate-400 font-bold">{ans.name}</div>
                        <div className="text-lg sm:text-xl font-black font-mono text-emerald-300 flex items-center gap-1.5">
                          {ans.symbol && <MathText text={ans.symbol} inline />}
                          <span>= {ans.value}</span>
                          <span className="text-xs font-normal text-slate-300">{ans.unit}</span>
                        </div>
                        {ans.summary && <p className="text-[11px] text-slate-300">{ans.summary}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PILLAR 5: CASIO FX-580VN X KEYSTROKE GUIDE */}
              {solutionData.casioGuide && (
                <div className="bg-slate-900 border-2 border-amber-400/50 p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(245,158,11,0.15)]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-amber-300 font-black text-sm sm:text-base">
                      <Calculator className="w-5 h-5 text-amber-400" />
                      <span>5. Hướng Dẫn Bấm Máy Tính {solutionData.casioGuide.model || 'Casio fx-580VN X'}</span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2.5 py-1 rounded-lg">
                      Kiểm tra đáp số siêu tốc & chính xác 100%
                    </span>
                  </div>

                  {solutionData.casioGuide.prerequisite && (
                    <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 leading-relaxed font-semibold">
                      <strong className="text-amber-400">⚡ Cài đặt tiên quyết:</strong>{' '}
                      {solutionData.casioGuide.prerequisite}
                    </div>
                  )}

                  {solutionData.casioGuide.keystrokes && (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-white">📌 Trình tự các phím bấm thực hiện:</p>
                      <div className="space-y-2">
                        {solutionData.casioGuide.keystrokes.map((ks: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2 font-bold text-white">
                              <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
                                {ks.stepOrder || idx + 1}
                              </span>
                              <span>{ks.actionTitle}</span>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              {ks.keys?.map((k: string, kIdx: number) => (
                                <React.Fragment key={kIdx}>
                                  <span className="bg-slate-900 text-amber-300 border border-amber-500/40 font-mono font-bold px-2 py-0.5 rounded shadow-sm text-xs">
                                    {k}
                                  </span>
                                  {kIdx < ks.keys.length - 1 && <span className="text-slate-600 font-bold">➔</span>}
                                </React.Fragment>
                              ))}
                            </div>

                            <span className="text-[11px] text-slate-400 font-medium">
                              {ks.screenDisplayNote}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Casio Result Reading Table */}
                  {solutionData.casioGuide.resultReading && (
                    <div className="pt-2 space-y-2">
                      <p className="text-xs font-bold text-white">
                        📟 Đối chiếu ký hiệu trên màn hình Casio với đáp án bài thi:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {solutionData.casioGuide.resultReading.map((rr: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-black text-amber-300 text-sm">
                                <MathText text={rr.symbolOnScreen} inline />
                              </span>
                              <span className="font-mono font-black text-white text-sm">
                                {rr.numericValue}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-300 font-semibold">{rr.meaning}</div>
                            <div className="text-[10px] text-amber-400/90 italic">{rr.instruction}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PILLAR 6: EXAM TRAPS & TIPS */}
              {solutionData.examTraps && solutionData.examTraps.length > 0 && (
                <div className="bg-slate-900 border-2 border-rose-500/40 p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(244,63,94,0.15)]">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-sm sm:text-base border-b border-slate-800 pb-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <span>6. Bẫy Phòng Thi & Mẹo Tránh Mất Điểm Oan</span>
                  </div>

                  <div className="space-y-3">
                    {solutionData.examTraps.map((trap: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-950 border border-rose-500/30 rounded-2xl space-y-2"
                      >
                        <h4 className="font-bold text-xs sm:text-sm text-rose-300 flex items-center gap-1.5">
                          <span>⚠️</span>
                          <span>{trap.trapTitle}</span>
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {trap.trapDescription}
                        </p>
                        <div className="p-2.5 bg-rose-950/40 rounded-xl border border-rose-500/30 text-[11px] text-rose-200 font-semibold">
                          💡 <strong>Cách phòng ngừa:</strong> {trap.preventionTip}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PILLAR 7: PEDAGOGICAL COMPREHENSION CHECK & INTERACTIVE QA */}
              {solutionData.pedagogicalCheck && (
                <div className="bg-slate-900 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-4 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-cyan-300 font-black text-sm sm:text-base">
                      <HelpCircle className="w-5 h-5 text-cyan-400" />
                      <span>7. Câu Hỏi Kiểm Tra Đọc Hiểu & Trao Đổi Cùng Thầy AI</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-3">
                    <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                      💬 Câu hỏi của Thầy: "{solutionData.pedagogicalCheck.question}"
                    </p>

                    {solutionData.pedagogicalCheck.hint && (
                      <p className="text-xs text-slate-400 italic">
                        Gợi ý: {solutionData.pedagogicalCheck.hint}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPedagogicalAnswer(!showPedagogicalAnswer)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        {showPedagogicalAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{showPedagogicalAnswer ? 'Ẩn đáp án' : 'Xem Đáp Án & Bản Chất'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setHasUnderstood(true);
                          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
                          onAddExp(50, 'Nắm vững bản chất bài toán qua câu hỏi đọc hiểu');
                        }}
                        disabled={hasUnderstood}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          hasUnderstood
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{hasUnderstood ? 'Đã hiểu bài (+50 XP)!' : 'Ok em đã hiểu trọn vẹn!'}</span>
                      </button>
                    </div>

                    {showPedagogicalAnswer && (
                      <div className="p-3.5 bg-slate-900 rounded-xl border border-emerald-500/40 text-xs text-slate-200 leading-relaxed font-semibold animate-fade-in">
                        <strong className="text-emerald-400">Giải thích bản chất:</strong>{' '}
                        {solutionData.pedagogicalCheck.answer}
                      </div>
                    )}
                  </div>

                  {/* Interactive Follow-up Chat with AI */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <MessageCircle className="w-4 h-4 text-cyan-400" />
                      <span>Hỏi thêm Thầy AI về bài toán này nếu còn chỗ chưa rõ:</span>
                    </div>

                    {followupChat.length > 0 && (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {followupChat.map((msg, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-2xl text-xs ${
                              msg.role === 'user'
                                ? 'bg-cyan-950/60 border border-cyan-500/30 text-cyan-100 ml-8'
                                : 'bg-slate-950 border border-slate-800 text-slate-200 mr-8'
                            }`}
                          >
                            <span className="font-bold block text-[11px] text-cyan-400 mb-1">
                              {msg.role === 'user' ? 'Em hỏi:' : 'Thầy AI giải thích:'}
                            </span>
                            <MathText text={msg.text} />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={followupQuestion}
                          onChange={(e) => setFollowupQuestion(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendFollowup()}
                          placeholder="VD: Thầy ơi sao bài này phải chia n-1 thay vì chia n ạ?..."
                          className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => startVoiceInput('followup')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300"
                        >
                          <Mic className={`w-4 h-4 ${isListeningFollowup ? 'animate-pulse text-rose-400' : ''}`} />
                        </button>
                      </div>

                      <button
                        onClick={handleSendFollowup}
                        disabled={isAnsweringFollowup || !followupQuestion.trim()}
                        className="px-4 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-cyan-300 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isAnsweringFollowup ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Gửi</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: STUDENT SELF-PRACTICE & RUBRIC GRADING */
            <div className="bg-slate-900 border-2 border-emerald-400/50 p-6 rounded-3xl space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-emerald-300 font-black text-sm sm:text-base border-b border-slate-800 pb-3">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>Thử Thách Tự Giải & Nộp Bài Chấm Barem Thang 10</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Hãy thử tự tay trình bày lại lời giải vào khung soạn thảo hoặc vẽ lên bảng iPad. Thầy AI sẽ chấm điểm chi tiết theo thang 10 (Trình bày 2đ, Nhận diện mô hình 3đ, Tính toán 3đ, Kết luận 2đ) và cộng điểm tích lũy GPA cho em!
              </p>

              <InteractiveCanvas
                initialText={studentResponse}
                placeholder="Nhấp vào trang văn bản này để bắt đầu gõ lời giải... Nhấn π Equation để điền công thức vào ô vuông."
                submitButtonText="NỘP LỜI GIẢI ĐỂ CHẤM ĐIỂM & TÍCH LŨY GPA EXP"
                isSubmitting={isLoading}
                onExportCanvas={(dataUrl, text) => {
                  setStudentResponse(text);
                  handleEvaluateStudentAnswer(dataUrl, text);
                }}
              />

              {gradingResult && (
                <div className="mt-4 p-5 rounded-2xl bg-slate-950 border-2 border-emerald-400/60 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      Kết Quả Chấm Điểm
                    </span>
                    <span className="font-mono text-2xl font-black text-emerald-400">
                      {gradingResult.totalScore} / 10 điểm
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                    <MathText text={gradingResult.detailedFeedback} />
                  </div>

                  {gradingResult.betterStrategy && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 text-xs text-slate-300 space-y-1">
                      <strong className="text-emerald-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-400" /> Lời khuyên tối ưu từ AI:
                      </strong>
                      <MathText text={gradingResult.betterStrategy} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
