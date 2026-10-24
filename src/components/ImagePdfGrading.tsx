import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  FileText,
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Calculator,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  ListOrdered,
  Layers,
  Table as TableIcon,
  Sigma,
  HelpCircle,
  Award,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Cpu,
  PenTool,
  X,
  Play,
  RotateCcw,
  MessageCircle,
  Lightbulb,
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

export type StudyMode = 'socratic' | 'solve' | 'grade';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  mode: StudyMode;
  attachment?: {
    name: string;
    type: 'image' | 'pdf' | 'doc';
    dataUrl?: string;
  };
  drawingUrl?: string;
  // Full Solution data (for 'solve' mode or revealed in 'socratic' mode)
  solutionData?: any;
  // Socratic tutoring data
  socraticData?: {
    teacherExplanation: string;
    keyConcepts?: string[];
    casioTip?: string;
    comprehensionCheck?: string;
  };
  // Grading data
  gradingResult?: any;
}

const QUICK_MATH_SYMBOLS = [
  { label: 'x̄ (Trung bình mẫu)', code: '$\\bar{x}$' },
  { label: 's² (Phương sai hiệu chỉnh)', code: '$s^2$' },
  { label: 'μ (Kỳ vọng)', code: '$\\mu$' },
  { label: 'σ (Độ lệch chuẩn)', code: '$\\sigma$' },
  { label: 'Zqs (Tiêu chuẩn Z)', code: '$Z_{qs}$' },
  { label: 'tqs (Student)', code: '$t_{qs}$' },
  { label: 'P(A|B) (Xác suất điều kiện)', code: '$P(A|B)$' },
  { label: '∫dx (Tích phân)', code: '$\\int_{0}^{2} f(x) dx$' },
  { label: '∑ (Tổng xích ma)', code: '$\\sum_{i=1}^{n}$' },
  { label: 'Φ(z) (Hàm Laplace)', code: '$\\Phi(1.96)$' },
  { label: 'E(X)', code: '$E(X)$' },
  { label: 'Var(X)', code: '$Var(X)$' },
  { label: 'a/b (Phân số)', code: '$\\frac{a}{b}$' },
  { label: '√x (Căn bậc hai)', code: '$\\sqrt{x}$' },
  { label: '1 - α (Độ tin cậy)', code: '$1 - \\alpha$' },
  { label: 'ϵ (Sai số)', code: '$\\varepsilon$' },
  { label: 'χ² (Khi-bình phương)', code: '$\\chi^2$' },
];

const SAMPLE_STARTER_PROMPTS = [
  {
    title: 'Dư nợ tín dụng 100 khách hàng',
    desc: 'Bảng ghép lớp [10-30), [30-50)... tìm trung bình & phương sai mẫu hiệu chỉnh',
    prompt: 'Khảo sát dư nợ cho vay tiêu dùng của 100 khách hàng tại một phòng giao dịch (đơn vị: triệu đồng). Khoảng [10-30): 20 khách, [30-50): 35 khách, [50-70): 25 khách, [70-90): 15 khách, [90-110]: 5 khách. Yêu cầu: Xác định mức dư nợ trung bình và phương sai mẫu hiệu chỉnh.',
  },
  {
    title: 'Hàm mật độ biến liên tục & Kỳ vọng',
    desc: 'Cho f(x) = kx trên [0, 2], tìm hằng số k và E(X)',
    prompt: 'Cho biến ngẫu nhiên liên tục X có hàm mật độ xác suất f(x) = kx trên [0, 2] và bằng 0 ở ngoài khoảng đó. Tìm hằng số k và tính kỳ vọng E(X), phương sai Var(X)?',
  },
  {
    title: 'Ước lượng khoảng & Bài toán tìm cỡ mẫu',
    desc: 'Khoảng tin cậy 98% cho thu nhập & cần điều tra thêm bao nhiêu người',
    prompt: 'Khảo sát 120 công nhân thấy thu nhập trung bình là 12.38 triệu, độ lệch chuẩn mẫu hiệu chỉnh là 2.26 triệu. Hãy ước lượng thu nhập trung bình với độ tin cậy 98%. Để sai số không vượt quá 0.35 triệu thì cần khảo sát thêm ít nhất bao nhiêu người?',
  },
  {
    title: 'Đề thi trắc nghiệm 4 lựa chọn',
    desc: 'Giải chi tiết từng câu, bảng đáp án Ribbon và mẹo Casio 20s',
    prompt: 'Giải đề thi trắc nghiệm sau:\nCâu 1: Một hộp có 10 sản phẩm (7 tốt, 3 phế). Lấy ngẫu nhiên 2 sản phẩm. Xác suất có ít nhất 1 chính phẩm là?\nA. 1/15  B. 14/15  C. 7/10  D. 2/15\nCâu 2: X ~ N(20, 0.04). Tỷ lệ chi tiết đạt chuẩn [19.6; 20.4] là?\nA. 95.44%  B. 68.26%  C. 97.72%  D. 50%',
  },
];

export const ImagePdfGrading: React.FC<ImagePdfGradingProps> = ({
  onAddExp,
  onRecordMistake,
}) => {
  // Current user-selectable mode
  const [studyMode, setStudyMode] = useState<StudyMode>('solve');

  // Input states
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreviewUrl, setAttachedPreviewUrl] = useState<string | null>(null);
  const [showCanvasDrawer, setShowCanvasDrawer] = useState(false);
  const [canvasDrawingUrl, setCanvasDrawingUrl] = useState<string | null>(null);
  const [showMathToolbar, setShowMathToolbar] = useState(false);

  // Voice Interaction state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Submitting / Loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);

  // Conversational message history
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // UI helpers
  const [copiedRibbonId, setCopiedRibbonId] = useState<string | null>(null);
  const [copiedSolutionId, setCopiedSolutionId] = useState<string | null>(null);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [understoodQuestions, setUnderstoodQuestions] = useState<Record<string, boolean>>({});

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Loading animation stages
  useEffect(() => {
    let timer: any;
    if (isSubmitting) {
      setLoadingStage(1);
      timer = setInterval(() => {
        setLoadingStage((prev) => (prev < 4 ? prev + 1 : prev));
      }, 850);
    } else {
      setLoadingStage(0);
    }
    return () => clearInterval(timer);
  }, [isSubmitting]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSubmitting, showCanvasDrawer]);

  // Handle file attachment
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachedFile(file);

    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onloadend = () => setAttachedPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        const text = reader.result as string;
        if (text) {
          setInputText((prev) => (prev ? `${prev}\n\n${text}` : text));
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  const removeAttachment = () => {
    setAttachedFile(null);
    setAttachedPreviewUrl(null);
  };

  const removeDrawing = () => {
    setCanvasDrawingUrl(null);
  };

  // Voice Speech-To-Text (Microphone)
  const handleToggleVoiceInput = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Trình duyệt của bạn chưa hỗ trợ Web Speech API. Bạn có thể gõ chữ trực tiếp vào khung chat.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsRecordingVoice(true);

    recognition.onresult = (event: any) => {
      const rawText = event.results[0][0].transcript;
      const normalized = normalizeSpokenMath(rawText);
      setInputText((prev) => (prev ? `${prev} ${normalized}` : normalized));
      setIsRecordingVoice(false);
    };

    recognition.onerror = () => setIsRecordingVoice(false);
    recognition.onend = () => setIsRecordingVoice(false);

    recognition.start();
  };

  // Text-To-Speech (Listen to AI voice)
  const handleToggleSpeech = (msgId: string, speechText: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt chưa hỗ trợ Text-to-Speech.');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanSpeech = speechText
      .replace(/\$\$[\s\S]*?\$\$/g, ' công thức toán ')
      .replace(/\$([^\$]+)\$/g, '$1')
      .replace(/\\bar\{x\}/g, 'x ngang')
      .replace(/s\^2/g, 'phương sai s bình phương')
      .replace(/\\mu/g, 'muy')
      .replace(/\\sigma/g, 'độ lệch chuẩn sigma')
      .replace(/\\alpha/g, 'alpha')
      .replace(/\\ge/g, 'lớn hơn hoặc bằng')
      .replace(/\\le/g, 'nhỏ hơn hoặc bằng')
      .replace(/\\approx/g, 'xấp xỉ')
      .replace(/#/g, '')
      .replace(/\*/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(msgId);
  };

  // Insert Quick Math Symbol
  const handleInsertMath = (code: string) => {
    setInputText((prev) => (prev ? `${prev} ${code}` : code));
    textareaRef.current?.focus();
  };

  // Primary Dispatcher: Send Message / Problem to AI
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    const hasImage = !!attachedPreviewUrl || !!canvasDrawingUrl;
    const hasText = !!textToSend.trim();
    const hasFile = !!attachedFile;

    if (!hasText && !hasImage && !hasFile) return;

    const userMessageId = `user_${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: textToSend.trim(),
      mode: studyMode,
      attachment: attachedFile
        ? {
            name: attachedFile.name,
            type: attachedFile.type.startsWith('image/') ? 'image' : 'pdf',
            dataUrl: attachedPreviewUrl || undefined,
          }
        : undefined,
      drawingUrl: canvasDrawingUrl || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setAttachedFile(null);
    setAttachedPreviewUrl(null);
    setCanvasDrawingUrl(null);
    setShowCanvasDrawer(false);
    setIsSubmitting(true);

    try {
      const activeImageBase64 = userMsg.drawingUrl || userMsg.attachment?.dataUrl || '';
      const activeTextContent = userMsg.text || (userMsg.attachment ? `Tệp: ${userMsg.attachment.name}` : '');

      if (studyMode === 'solve') {
        // Full Multimodal Solver (Comprehensive 7 Pillars + Multiple Choice Ribbon + Sub-questions)
        const response = await aiFetch('/api/tutor/solve-multimodal', {
          method: 'POST',
          body: JSON.stringify({
            imageBase64: activeImageBase64,
            textContent: activeTextContent,
            chapterTitle: 'Giải toán Xác Suất Thống Kê Toàn Diện',
            mode: 'solve',
            strategyOnly: true,
          }),
        });

        const data = await response.json();
        if (data.success && data.data) {
          const aiMessageId = `ai_${Date.now()}`;
          const aiMsg: ChatMessage = {
            id: aiMessageId,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Bác Gấu đã phân tích đề bài toàn diện và bóc tách xong! Dưới đây là bài giải chi tiết chuẩn tự luận và hướng dẫn bấm máy Casio fx-580VN X:`,
            mode: 'solve',
            solutionData: data.data,
          };
          setMessages((prev) => [...prev, aiMsg]);
          onAddExp(50, 'Giải toàn diện bài toán cùng Gemini XSTK');
        }
      } else if (studyMode === 'socratic') {
        // Socratic 1-1 Tutor Companion (Guide step-by-step, no immediate spoilers)
        const response = await aiFetch('/api/tutor/interactive-qa', {
          method: 'POST',
          body: JSON.stringify({
            contextType: 'general',
            problemContext: activeTextContent,
            previousSolution: activeImageBase64 ? 'Đề bài gửi qua ảnh/bản vẽ đính kèm' : '',
            studentQuestion: activeTextContent || 'Bác Gấu ơi, bài này bắt đầu từ đâu ạ? Bác hướng dẫn và cùng giải với cháu nhé!',
            history: messages.slice(-6).map((m) => ({
              role: m.sender === 'user' ? 'student' : 'teacher',
              text: m.text,
            })),
          }),
        });

        const data = await response.json();
        if (data.success && data.data) {
          const aiMessageId = `ai_${Date.now()}`;
          const aiMsg: ChatMessage = {
            id: aiMessageId,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: data.data.teacherExplanation,
            mode: 'socratic',
            socraticData: {
              teacherExplanation: data.data.teacherExplanation,
              keyConcepts: data.data.keyConcepts,
              casioTip: data.data.casioTip,
              comprehensionCheck: data.data.comprehensionCheck,
            },
          };
          setMessages((prev) => [...prev, aiMsg]);
          onAddExp(30, 'Học 1-1 cùng Bác Gấu Socratic');
        }
      } else if (studyMode === 'grade') {
        // Grade Student Submission
        const response = await aiFetch('/api/tutor/evaluate', {
          method: 'POST',
          body: JSON.stringify({
            imageBase64: activeImageBase64,
            textContent: activeTextContent,
            chapterTitle: 'Chấm bài tập thực tế',
            mode: 'grade',
            strategyOnly: false,
          }),
        });

        const data = await response.json();
        if (data.success && data.data) {
          const aiMessageId = `ai_${Date.now()}`;
          const aiMsg: ChatMessage = {
            id: aiMessageId,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: `Bác Gấu đã chấm xong bài tự làm của cháu! Tổng điểm: ${data.data.totalScore}/10 điểm.`,
            mode: 'grade',
            gradingResult: data.data,
          };
          setMessages((prev) => [...prev, aiMsg]);

          const score = typeof data.data?.totalScore === 'number' ? data.data.totalScore : 8;
          const gpaVal = (score / 10) * 4.0;
          if (score >= 7) {
            onAddExp(70, `Chấm bài tự làm: ${score}/10đ`, 1, gpaVal);
            confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
          } else {
            onAddExp(30, `Chấm bài tự làm: ${score}/10đ`, 1, gpaVal);
            onRecordMistake({
              id: `mistake_${Date.now()}`,
              chapterId: 0,
              chapterTitle: 'Bài tập tự luyện',
              sourceType: 'essay',
              questionSummary: activeTextContent.slice(0, 100) || 'Bài tập tự upload',
              studentAnswer: activeTextContent,
              correctConcept: 'Theo hướng dẫn giải chuẩn của Bác Gấu',
              rootCauseError: data.data.rootCauseError || 'Lỗi áp dụng sai công thức hoặc tính toán',
              remediationAdvice: data.data.betterStrategy || 'Ôn lại các bước lập công thức tự luận',
              timestamp: new Date().toLocaleTimeString(),
            });
          }
        }
      }
    } catch (err) {
      console.error('Chat submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Socratic Fast Action Trigger (e.g. "Gợi ý tiếp", "Chỉ cách bấm Casio", "Mở toàn bộ lời giải")
  const handleSocraticAction = async (action: 'next_hint' | 'casio' | 'reveal_all', msg: ChatMessage) => {
    if (action === 'reveal_all') {
      setIsSubmitting(true);
      try {
        const response = await aiFetch('/api/tutor/solve-multimodal', {
          method: 'POST',
          body: JSON.stringify({
            textContent: msg.socraticData?.teacherExplanation || 'Giải chi tiết bài toán',
            chapterTitle: 'Giải toàn diện bài toán XSTK',
            mode: 'solve',
            strategyOnly: true,
          }),
        });
        const data = await response.json();
        if (data.success && data.data) {
          setRevealedSolutions((prev) => ({ ...prev, [msg.id]: true }));
          const aiMessageId = `ai_reveal_${Date.now()}`;
          const aiMsg: ChatMessage = {
            id: aiMessageId,
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: 'Bác Gấu mở toang toàn bộ bài giải chi tiết và bảng số liệu cho cháu tham khảo đây! Hãy đối chiếu từng dòng nhé:',
            mode: 'solve',
            solutionData: data.data,
          };
          setMessages((prev) => [...prev, aiMsg]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSubmitting(false);
      }
    } else if (action === 'casio') {
      const prompt = `Bác Gấu ơi, cháu muốn biết mẹo bấm máy tính Casio fx-580VN X cho bài toán này, từng phím bấm cụ thể ra sao ạ?`;
      handleSendMessage(prompt);
    } else if (action === 'next_hint') {
      const prompt = `Bác Gấu gợi ý cho cháu bước tư duy tiếp theo với ạ, cháu đang làm dở tới đây rồi!`;
      handleSendMessage(prompt);
    }
  };

  // Copy helpers
  const handleCopyRibbon = (msgId: string, solutions: any[]) => {
    const summary = solutions.map((q: any) => `Câu ${q.questionNumber || q.id}: ${q.correctOption}`).join(' | ');
    navigator.clipboard.writeText(summary);
    setCopiedRibbonId(msgId);
    setTimeout(() => setCopiedRibbonId(null), 2000);
  };

  const handleCopySolutionText = (msgId: string, solutionData: any) => {
    let text = `# ${solutionData.problemTitle}\n\n`;
    if (solutionData.multipleChoiceSolutions?.length) {
      text += `## ĐÁP ÁN TRẮC NGHIỆM CHI TIẾT\n`;
      solutionData.multipleChoiceSolutions.forEach((q: any) => {
        text += `Câu ${q.questionNumber}: ${q.questionText}\nĐáp án đúng: ${q.correctOption}\n${q.stepByStepSolution}\n\n`;
      });
    }
    if (solutionData.detailedSteps?.length) {
      text += `## LỜI GIẢI CHI TIẾT TỰ LUẬN\n`;
      solutionData.detailedSteps.forEach((s: any) => {
        text += `### ${s.stepTitle}\n${s.explanation}\n$$${s.mathFormulaKatex}$$\n\n`;
      });
    }
    navigator.clipboard.writeText(text);
    setCopiedSolutionId(msgId);
    setTimeout(() => setCopiedSolutionId(null), 2000);
  };

  return (
    <div className="space-y-6 text-slate-100 w-full pb-8 min-w-0">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-2 border-cyan-500/40 p-5 sm:p-7 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.18)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5 text-cyan-400 font-extrabold text-sm sm:text-base tracking-wider uppercase">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span>Trợ Lý Gemini XSTK Đa Phương Thức (Học Kèm 1-1 & Giải Toán)</span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-emerald-300 font-mono">Bác Gấu Tiến Sĩ Online</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-3xl font-black text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.35)] mt-2">
          Không Gian Học Tập 1-1, Giải Đề Toàn Diện & Tương Tác Giọng Nói Chuẩn Gemini
        </h2>
        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium mt-2">
          Nói chuyện giọng nói hai chiều, tải ảnh bài tập, file PDF/Word hoặc vẽ nháp trên bảng iPad. AI cùng bạn giải từng câu, gỡ bẫy phòng thi và mô phỏng từng phím bấm <strong className="text-cyan-300 font-bold">Casio fx-580VN X</strong>!
        </p>
      </div>

      {/* 2. Interactive Study Mode Selector (3 Pills) */}
      <div className="bg-slate-900/90 border border-slate-800 p-2.5 sm:p-3 rounded-2xl flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <button
            onClick={() => setStudyMode('socratic')}
            className={`px-5 py-3 rounded-xl text-sm sm:text-base font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              studyMode === 'socratic'
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-[0_0_18px_rgba(245,158,11,0.4)]'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>🎓 Cùng Giải & Dạy Kèm 1-1</span>
          </button>

          <button
            onClick={() => setStudyMode('solve')}
            className={`px-5 py-3 rounded-xl text-sm sm:text-base font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              studyMode === 'solve'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_18px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>⚡ Giải Toàn Diện Trọn Gói</span>
          </button>

          <button
            onClick={() => setStudyMode('grade')}
            className={`px-5 py-3 rounded-xl text-sm sm:text-base font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              studyMode === 'grade'
                ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white font-black shadow-[0_0_18px_rgba(217,70,239,0.4)]'
                : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Award className="w-5 h-5" />
            <span>📝 Chấm Điểm Bài Tự Làm</span>
          </button>
        </div>

        {messages.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm('Xóa lịch sử hội thoại hiện tại để làm bài mới?')) {
                setMessages([]);
                window.speechSynthesis.cancel();
                setSpeakingMessageId(null);
              }
            }}
            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-rose-400 flex items-center gap-1.5 hover:bg-slate-800/80 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm bài mới</span>
          </button>
        )}
      </div>

      {/* 3. Empty State / Starter Hero Prompt Cards */}
      {messages.length === 0 && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 sm:p-10 rounded-3xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Sparkles className="w-8 h-8 text-cyan-400" />
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Bác Gấu Tiến Sĩ Đã Sẵn Sàng Đồng Hành Cùng Cháu!
            </h3>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
              Cháu có thể tải ảnh đề bài, file PDF, vẽ nháp lên iPad hoặc gõ trực tiếp bên dưới. Hoặc bấm chọn nhanh một bài mẫu điển hình để thử nghiệm:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
            {SAMPLE_STARTER_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-400/60 hover:bg-slate-900/80 transition-all group text-left cursor-pointer space-y-2 shadow-sm"
              >
                <div className="text-sm sm:text-base font-bold text-cyan-300 flex items-center justify-between">
                  <span>{item.title}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 line-clamp-3 leading-relaxed">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Conversational Timeline Messages */}
      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {/* User Message Bubble */}
              {msg.sender === 'user' && (
                <div className="flex justify-end">
                  <div className="max-w-4xl w-full bg-gradient-to-r from-cyan-950/90 to-slate-900 border border-cyan-500/40 p-4 sm:p-5 rounded-3xl rounded-tr-sm shadow-md space-y-2.5 text-sm sm:text-base text-slate-100">
                    <div className="flex items-center justify-between text-xs sm:text-sm text-cyan-300 font-bold border-b border-cyan-500/20 pb-2">
                      <span>👤 Em hỏi:</span>
                      <span className="text-slate-400 font-mono text-xs">{msg.timestamp}</span>
                    </div>

                    {msg.attachment && (
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-cyan-500/30 flex items-center gap-2.5 text-xs sm:text-sm">
                        {msg.attachment.type === 'image' ? (
                          <ImageIcon className="w-5 h-5 text-cyan-400 shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                        )}
                        <span className="truncate text-white font-medium">{msg.attachment.name}</span>
                      </div>
                    )}

                    {msg.attachment?.dataUrl && (
                      <div className="rounded-xl overflow-hidden border border-cyan-500/30 max-h-72 bg-slate-950">
                        <img src={msg.attachment.dataUrl} alt="Đính kèm" className="w-full object-contain max-h-72" />
                      </div>
                    )}

                    {msg.drawingUrl && (
                      <div className="rounded-xl overflow-hidden border border-emerald-500/30 max-h-72 bg-slate-950 p-2">
                        <span className="text-xs text-emerald-400 font-bold block mb-1">✍️ Bản vẽ nháp iPad:</span>
                        <img src={msg.drawingUrl} alt="Bản vẽ" className="w-full object-contain max-h-72 rounded-lg" />
                      </div>
                    )}

                    {msg.text && (
                      <div className="leading-relaxed font-medium">
                        <MathText text={msg.text} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assistant Message Bubble */}
              {msg.sender === 'assistant' && (
                <div className="flex justify-start w-full">
                  <div className="w-full bg-slate-900 border-2 border-cyan-500/30 p-5 sm:p-7 rounded-3xl rounded-tl-sm shadow-[0_0_25px_rgba(6,182,212,0.1)] space-y-6">
                    {/* Header bar of AI message */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 flex-wrap gap-2.5">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-base flex items-center justify-center shadow-md">
                          🐻
                        </span>
                        <div>
                          <div className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                            <span>Bác Gấu Tiến Sĩ XSTK</span>
                            <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded border border-cyan-500/40 uppercase font-mono">
                              {msg.mode === 'socratic' ? 'Dạy Kèm 1-1' : (msg.mode === 'solve' ? 'Giải Toàn Diện' : 'Chấm Bài')}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">{msg.timestamp}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSpeech(msg.id, msg.text)}
                          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                            speakingMessageId === msg.id
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {speakingMessageId === msg.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          <span>{speakingMessageId === msg.id ? 'Dừng đọc' : 'Nghe Bác Giảng'}</span>
                        </button>

                        {msg.solutionData && (
                          <button
                            onClick={() => handleCopySolutionText(msg.id, msg.solutionData)}
                            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
                          >
                            {copiedSolutionId === msg.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedSolutionId === msg.id ? 'Đã chép!' : 'Sao chép'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Main Body Text */}
                    {msg.text && (
                      <div className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium space-y-3">
                        <MathText text={msg.text} />
                      </div>
                    )}

                    {/* SOCRATIC TUTORING ACTION BUTTONS */}
                    {msg.mode === 'socratic' && msg.socraticData && (
                      <div className="p-4 sm:p-5 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-3.5">
                        {msg.socraticData.casioTip && (
                          <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-sm sm:text-base text-amber-200 flex items-start gap-2.5">
                            <Calculator className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-amber-300 font-bold">Gợi ý Casio 580:</strong> {msg.socraticData.casioTip}
                            </div>
                          </div>
                        )}

                        {msg.socraticData.comprehensionCheck && (
                          <div className="text-sm sm:text-base text-cyan-200 font-semibold p-3.5 bg-cyan-950/30 rounded-xl border border-cyan-500/30 leading-relaxed">
                            {msg.socraticData.comprehensionCheck}
                          </div>
                        )}

                        <div className="flex items-center gap-2.5 flex-wrap pt-1">
                          <button
                            onClick={() => handleSocraticAction('next_hint', msg)}
                            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Lightbulb className="w-4 h-4" />
                            <span>Gợi ý bước tiếp theo</span>
                          </button>

                          <button
                            onClick={() => handleSocraticAction('casio', msg)}
                            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Calculator className="w-4 h-4" />
                            <span>Chỉ cách bấm máy Casio</span>
                          </button>

                          <button
                            onClick={() => handleSocraticAction('reveal_all', msg)}
                            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer font-black"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Em bí rồi, mở toàn bộ lời giải</span>
                          </button>

                          <button
                            onClick={() => {
                              setUnderstoodQuestions((prev) => ({ ...prev, [msg.id]: true }));
                              confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
                              onAddExp(50, 'Hiểu trọn vẹn câu hỏi cùng Bác Gấu');
                            }}
                            disabled={understoodQuestions[msg.id]}
                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                              understoodQuestions[msg.id]
                                ? 'bg-emerald-500 text-white cursor-default'
                                : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{understoodQuestions[msg.id] ? 'Đã hiểu bài (+50 EXP)!' : 'Ok em đã hiểu trọn vẹn!'}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FULL SOLUTION SECTIONS (If in 'solve' mode or revealed) */}
                    {msg.solutionData && (
                      <div className="space-y-5 pt-2">
                        {/* A. Quick Answer Ribbon for Multiple-Choice Exam */}
                        {msg.solutionData.multipleChoiceSolutions?.length > 0 && (
                          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-2 border-emerald-400/60 p-4 sm:p-5 rounded-2xl shadow-lg space-y-3.5">
                            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-2.5">
                              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm sm:text-base">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Bảng Tra Đáp Án Nhanh Đề Thi Trắc Nghiệm ({msg.solutionData.multipleChoiceSolutions.length} Câu)</span>
                              </div>
                              <button
                                onClick={() => handleCopyRibbon(msg.id, msg.solutionData.multipleChoiceSolutions)}
                                className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 flex items-center gap-2 transition-all cursor-pointer"
                              >
                                {copiedRibbonId === msg.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                <span>{copiedRibbonId === msg.id ? 'Đã chép!' : 'Sao chép bảng đáp án'}</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 flex-wrap">
                              {msg.solutionData.multipleChoiceSolutions.map((mc: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-sm font-mono font-black flex items-center gap-2"
                                >
                                  <span className="text-slate-400 font-sans font-bold text-xs">Câu {mc.questionNumber || idx + 1}:</span>
                                  <span className="text-emerald-300 text-base bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-500/50">
                                    {mc.correctOption}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* B. Sequential Multiple Choice Question Cards */}
                        {msg.solutionData.multipleChoiceSolutions?.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-cyan-400 font-black text-sm sm:text-base px-1">
                              <ListOrdered className="w-5 h-5 text-cyan-400" />
                              <span>Lời Giải Tuần Tự Từng Câu Trắc Nghiệm:</span>
                            </div>

                            {msg.solutionData.multipleChoiceSolutions.map((mc: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-slate-950 border border-cyan-500/30 p-4 sm:p-6 rounded-2xl space-y-4 hover:border-cyan-400/50 transition-all"
                              >
                                <div className="flex items-start gap-3">
                                  <span className="px-3 py-1 rounded-lg bg-cyan-400 text-slate-950 font-black text-sm shrink-0">
                                    Câu {mc.questionNumber || idx + 1}
                                  </span>
                                  <div className="text-sm sm:text-base text-white font-bold flex-1 leading-relaxed">
                                    <MathText text={mc.questionText} />
                                  </div>
                                </div>

                                {mc.options && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                    {Object.entries(mc.options).map(([optKey, optVal]: [string, any]) => {
                                      const isCorrect = String(optKey).trim().toUpperCase() === String(mc.correctOption).trim().toUpperCase();
                                      return (
                                        <div
                                          key={optKey}
                                          className={`p-3 sm:p-3.5 rounded-xl flex items-start gap-2.5 text-sm sm:text-base ${
                                            isCorrect
                                              ? 'bg-emerald-950/60 border-2 border-emerald-400 text-emerald-200 font-bold shadow-sm'
                                              : 'bg-slate-900 border border-slate-800 text-slate-300'
                                          }`}
                                        >
                                          <span
                                            className={`w-6 h-6 rounded-lg font-mono font-black text-sm flex items-center justify-center shrink-0 ${
                                              isCorrect ? 'bg-emerald-400 text-slate-950' : 'bg-slate-800 text-slate-300'
                                            }`}
                                          >
                                            {optKey}
                                          </span>
                                          <div className="flex-1 pt-0.5">
                                            <MathText text={String(optVal)} inline />
                                            {isCorrect && (
                                              <span className="ml-2 text-xs text-emerald-300 font-black uppercase bg-emerald-900/60 px-1.5 py-0.5 rounded">
                                                ✓ Đúng
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2.5 text-sm sm:text-base">
                                  <div className="text-slate-200 leading-relaxed font-medium">
                                    <MathText text={mc.stepByStepSolution} />
                                  </div>
                                  {mc.mathFormulaKatex && (
                                    <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 overflow-x-auto text-cyan-200 font-mono text-base sm:text-lg">
                                      <MathText text={`$$${mc.mathFormulaKatex}$$`} />
                                    </div>
                                  )}
                                </div>

                                {mc.casioShortcut && (
                                  <div className="p-3 sm:p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-sm sm:text-base text-amber-200 flex items-start gap-2.5">
                                    <Calculator className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-amber-300 font-bold">Bấm máy Casio 20s: </strong>
                                      <span>{mc.casioShortcut}</span>
                                    </div>
                                  </div>
                                )}

                                {mc.whyOtherOptionsWrong && (
                                  <div className="p-3 sm:p-3.5 bg-rose-950/30 border border-rose-500/30 rounded-xl text-sm sm:text-base text-rose-200 flex items-start gap-2.5">
                                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-rose-300 font-bold">Bẫy phương án sai: </strong>
                                      <span>{mc.whyOtherOptionsWrong}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* C. Sub-Questions (Ý a, b, c, d... / Yêu cầu 1, 2...) */}
                        {msg.solutionData.subQuestions?.length > 0 && (
                          <div className="bg-slate-950 border border-emerald-500/30 p-4 sm:p-5 rounded-2xl space-y-4">
                            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm sm:text-base">
                              <Layers className="w-5 h-5 text-emerald-400" />
                              <span>Giải Chi Tiết Toàn Bộ Các Ý (Ý a, b, c, d... - Không Bỏ Sót):</span>
                            </div>

                            <div className="space-y-4">
                              {msg.solutionData.subQuestions.map((sq: any, idx: number) => (
                                <div key={idx} className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                                  <div className="flex items-start gap-2.5">
                                    <span className="px-3 py-1 rounded bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shrink-0">
                                      {sq.partLabel || `Ý ${idx + 1}`}
                                    </span>
                                    <h4 className="font-bold text-white text-sm sm:text-base leading-relaxed">
                                      <MathText text={sq.questionStatement} inline />
                                    </h4>
                                  </div>

                                  <div className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                                    <MathText text={sq.explanation} />
                                  </div>

                                  {sq.mathFormulaKatex && (
                                    <div className="p-3 sm:p-4 bg-slate-950 rounded-xl border border-cyan-500/30 overflow-x-auto text-cyan-200 font-mono text-base sm:text-lg">
                                      <MathText text={`$$${sq.mathFormulaKatex}$$`} />
                                    </div>
                                  )}

                                  {sq.finalAnswer && (
                                    <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/40 flex items-center justify-between text-sm sm:text-base flex-wrap gap-2">
                                      <span className="text-slate-300 font-bold">Đáp số:</span>
                                      <span className="font-mono font-black text-emerald-300 flex items-center gap-2 text-base">
                                        {sq.finalAnswer.symbol && <MathText text={sq.finalAnswer.symbol} inline />}
                                        <span>= {sq.finalAnswer.value}</span>
                                        <span className="text-sm font-normal text-slate-300">{sq.finalAnswer.unit}</span>
                                      </span>
                                    </div>
                                  )}

                                  {sq.casioShortcut && (
                                    <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-sm sm:text-base text-amber-200 flex items-start gap-2.5">
                                      <Calculator className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                      <div>
                                        <strong className="text-amber-300 font-bold">Bấm máy: </strong>
                                        <span>{sq.casioShortcut}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* D. Keyword Breakdown */}
                        {msg.solutionData.keywordBreakdown?.length > 0 && (
                          <div className="bg-slate-950 border border-cyan-500/20 p-4 sm:p-5 rounded-2xl space-y-3">
                            <span className="text-sm sm:text-base font-bold text-cyan-400 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-cyan-400" /> 1. Bóc Tách Từ Khóa Đề Bài:
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              {msg.solutionData.keywordBreakdown.map((item: any, kIdx: number) => (
                                <div key={kIdx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg text-xs sm:text-sm">
                                      "{item.keyword}"
                                    </span>
                                    <span className="text-cyan-300 font-mono font-bold text-sm">
                                      <MathText text={item.mathSymbol} inline />
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                                    <MathText text={item.deduction} inline />
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* E. Casio fx-580VN X Keystroke Guide */}
                        {msg.solutionData.casioGuide && (
                          <div className="bg-slate-950 border border-amber-400/40 p-4 sm:p-5 rounded-2xl space-y-3.5">
                            <div className="flex items-center gap-2.5 text-amber-300 font-bold text-sm sm:text-base">
                              <Calculator className="w-5 h-5 text-amber-400" />
                              <span>Thần Chú Bấm Máy Casio fx-580VN X:</span>
                            </div>

                            {msg.solutionData.casioGuide.prerequisite && (
                              <p className="text-sm sm:text-base text-amber-200/90 bg-amber-950/40 p-3 rounded-xl border border-amber-500/30">
                                <strong>⚡ Tiên quyết:</strong> {msg.solutionData.casioGuide.prerequisite}
                              </p>
                            )}

                            {msg.solutionData.casioGuide.keystrokes && (
                              <div className="space-y-2 text-sm sm:text-base">
                                {msg.solutionData.casioGuide.keystrokes.map((ks: any, ksIdx: number) => (
                                  <div key={ksIdx} className="p-2.5 sm:p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                                    <div className="font-bold text-white flex items-center gap-2">
                                      <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                                        {ks.stepOrder || ksIdx + 1}
                                      </span>
                                      <span>{ks.actionTitle}</span>
                                    </div>
                                    <div className="flex items-center gap-1 font-mono text-amber-300 text-xs sm:text-sm font-bold">
                                      {ks.keys?.join(' ➔ ')}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* F. Exam Traps */}
                        {msg.solutionData.examTraps?.length > 0 && (
                          <div className="bg-slate-950 border border-rose-500/30 p-4 sm:p-5 rounded-2xl space-y-3">
                            <span className="text-sm sm:text-base font-bold text-rose-400 flex items-center gap-2">
                              <AlertTriangle className="w-5 h-5 text-rose-400" /> Cái Bẫy Phòng Thi Chết Người:
                            </span>
                            <div className="space-y-2.5 text-sm sm:text-base">
                              {msg.solutionData.examTraps.map((tr: any, trIdx: number) => (
                                <div key={trIdx} className="p-3.5 bg-rose-950/30 rounded-xl border border-rose-500/30 space-y-1.5">
                                  <strong className="text-rose-300 block font-bold text-sm sm:text-base">⚠️ {tr.trapTitle}</strong>
                                  <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">{tr.trapDescription}</p>
                                  <div className="text-emerald-300 text-xs sm:text-sm font-semibold pt-0.5">
                                    💡 <strong>Cách phòng ngừa:</strong> {tr.preventionTip}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* G. Pedagogical Checkpoint */}
                        {msg.solutionData.pedagogicalCheck && (
                          <div className="bg-cyan-950/40 border border-cyan-500/40 p-4 sm:p-5 rounded-2xl space-y-3 text-sm sm:text-base">
                            <span className="font-black text-cyan-300 text-xs sm:text-sm uppercase tracking-wider block">
                              🛑 TRẠM DỪNG CHÂN - KIỂM TRA ĐỘ HIỂU BÀI 🛑
                            </span>
                            <p className="font-bold text-white text-sm sm:text-base leading-relaxed">
                              💬 Câu hỏi của Bác: "{msg.solutionData.pedagogicalCheck.question}"
                            </p>
                            {msg.solutionData.pedagogicalCheck.hint && (
                              <p className="text-slate-400 italic text-xs sm:text-sm">
                                Gợi ý: {msg.solutionData.pedagogicalCheck.hint}
                              </p>
                            )}
                            <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 text-emerald-200 font-semibold text-sm sm:text-base leading-relaxed">
                              <strong>Giải thích bản chất:</strong> {msg.solutionData.pedagogicalCheck.answer}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* GRADING FEEDBACK (If in 'grade' mode) */}
                    {msg.gradingResult && (
                      <div className="p-5 bg-slate-950 rounded-2xl border border-purple-500/40 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-purple-300 text-base sm:text-lg">Bảng Điểm Barem Chi Tiết</span>
                          <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                            {msg.gradingResult.totalScore}/10đ
                          </span>
                        </div>
                        {msg.gradingResult.detailedFeedback && (
                          <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium">
                            {msg.gradingResult.detailedFeedback}
                          </p>
                        )}
                        {msg.gradingResult.errors?.length > 0 && (
                          <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-sm sm:text-base text-rose-200">
                            <strong>Lỗi cần khắc phục:</strong> {msg.gradingResult.errors.join('; ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isSubmitting && (
            <div className="bg-slate-900 border-2 border-cyan-500/30 p-5 sm:p-6 rounded-3xl flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Cpu className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Bác Gấu Đang Xử Lý & Lập Lời Giải...
                </h4>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-300 flex-wrap">
                  <span className={loadingStage >= 1 ? 'text-emerald-400 font-bold' : 'opacity-40'}>1. Đọc đề bài</span>
                  <span>➔</span>
                  <span className={loadingStage >= 2 ? 'text-emerald-400 font-bold' : 'opacity-40'}>2. Bóc tách dữ liệu</span>
                  <span>➔</span>
                  <span className={loadingStage >= 3 ? 'text-emerald-400 font-bold' : 'opacity-40'}>3. Tính toán KaTeX</span>
                  <span>➔</span>
                  <span className={loadingStage >= 4 ? 'text-emerald-400 font-bold' : 'opacity-40'}>4. Phím Casio 580</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      )}

      {/* 5. Expandable iPad Canvas Drawer (No pop-up overlap) */}
      {showCanvasDrawer && (
        <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm sm:text-base">
              <PenTool className="w-5 h-5 text-cyan-400" />
              <span>Bảng Viết Nháp & Vẽ Tay iPad XSTK</span>
            </div>
            <button
              onClick={() => setShowCanvasDrawer(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <InteractiveCanvas
            submitButtonText="ĐÍNH KÈM BẢN VẼ VÀO KHUNG CHAT"
            onExportCanvas={(url, text) => {
              if (url) setCanvasDrawingUrl(url);
              if (text) setInputText((prev) => (prev ? `${prev}\n${text}` : text));
              setShowCanvasDrawer(false);
            }}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* 6. Expandable Quick Math Symbols Drawer */}
      {showMathToolbar && (
        <div className="bg-slate-900 border border-cyan-500/30 p-3 sm:p-4 rounded-2xl shadow-xl space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between text-xs sm:text-sm text-cyan-300 font-bold border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2">
              <Sigma className="w-4 h-4" /> Bàn Phím Ký Hiệu & Biểu Thức XSTK Nhanh
            </span>
            <button onClick={() => setShowMathToolbar(false)} className="text-slate-400 hover:text-white p-1 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap max-h-40 overflow-y-auto pr-1">
            {QUICK_MATH_SYMBOLS.map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertMath(sym.code)}
                className="px-3 py-1.5 bg-slate-950 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl text-sm font-mono text-cyan-200 transition-all cursor-pointer whitespace-nowrap"
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 7. Gemini-Style Omni-Dock Input Bar */}
      <div className="bg-slate-900/95 border-2 border-cyan-500/40 p-3 sm:p-4 rounded-3xl shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-3 sticky bottom-16 z-30 backdrop-blur-md">
        {/* Attached previews chips */}
        {(attachedFile || canvasDrawingUrl) && (
          <div className="flex items-center gap-2.5 flex-wrap pb-1">
            {attachedFile && (
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs sm:text-sm flex items-center gap-2 text-cyan-300">
                {attachedFile.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                ) : (
                  <FileText className="w-4 h-4 text-amber-400" />
                )}
                <span className="max-w-xs truncate text-white">{attachedFile.name}</span>
                <button onClick={removeAttachment} className="hover:text-rose-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {canvasDrawingUrl && (
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-xs sm:text-sm flex items-center gap-2 text-emerald-300">
                <PenTool className="w-4 h-4" />
                <span className="text-white">Bản vẽ iPad</span>
                <button onClick={removeDrawing} className="hover:text-rose-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Text Input Row with Integrated Icons */}
        <div className="flex items-end gap-2 sm:gap-3">
          {/* File Upload Button */}
          <label
            htmlFor="gemini-file-upload"
            className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-400/60 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer shrink-0"
            title="Đính kèm ảnh bài tập, file PDF hoặc Word"
          >
            <Upload className="w-5 h-5" />
            <input
              type="file"
              id="gemini-file-upload"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {/* iPad Canvas Toggle Button */}
          <button
            type="button"
            onClick={() => setShowCanvasDrawer(!showCanvasDrawer)}
            className={`p-3 rounded-2xl border transition-all shrink-0 cursor-pointer ${
              showCanvasDrawer
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/60'
            }`}
            title="Mở bảng viết tay iPad"
          >
            <PenTool className="w-5 h-5" />
          </button>

          {/* Math Keyboard Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMathToolbar(!showMathToolbar)}
            className={`p-3 rounded-2xl border transition-all shrink-0 cursor-pointer ${
              showMathToolbar
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-400/60'
            }`}
            title="Bật dải phím công thức nhanh"
          >
            <Sigma className="w-5 h-5" />
          </button>

          {/* Main Multiline Textarea */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                studyMode === 'socratic'
                  ? 'Gửi bài tập hoặc hỏi Bác Gấu để cùng giải 1-1 từng bước... (Enter để gửi)'
                  : studyMode === 'solve'
                  ? 'Nhập đề bài hoặc dán biểu thức, tải file để AI giải toàn diện... (Enter để gửi)'
                  : 'Dán lời giải của em vào đây để Bác Gấu chấm điểm... (Enter để gửi)'
              }
              rows={2}
              className="w-full bg-slate-950 border border-cyan-500/30 rounded-2xl p-3 sm:p-3.5 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none font-sans leading-relaxed min-h-[58px]"
            />
          </div>

          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={handleToggleVoiceInput}
            className={`p-3 rounded-2xl border transition-all shrink-0 cursor-pointer ${
              isRecordingVoice
                ? 'bg-rose-500 text-white animate-pulse border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.5)]'
                : 'bg-slate-950 border-slate-800 text-cyan-400 hover:border-cyan-400/60'
            }`}
            title={isRecordingVoice ? 'Đang lắng nghe...' : 'Nói tiếng Việt (STT)'}
          >
            {isRecordingVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isSubmitting || (!inputText.trim() && !attachedFile && !canvasDrawingUrl)}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black hover:opacity-95 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0 cursor-pointer"
            title="Gửi câu hỏi / đề bài"
          >
            {isSubmitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
