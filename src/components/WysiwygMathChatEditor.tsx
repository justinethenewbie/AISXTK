import React, { useState, useRef, useEffect, useId } from 'react';
import {
  Scissors,
  Copy,
  ClipboardPaste,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Eraser,
  Highlighter,
  Type,
  List,
  ListOrdered,
  ListTree,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Indent,
  Outdent,
  ArrowUpDown,
  Pilcrow,
  PaintBucket,
  Grid,
  ChevronDown,
  Sparkles,
  Send,
  Pencil,
  Trash2,
  Mic,
  MicOff,
  Check,
  Plus,
  RefreshCw,
  CornerDownRight,
  Eye,
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';
import { renderKatexSafe, cleanLatexString } from './MathFormula';

// Declare custom math-field web component for MathLive if available
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': any;
    }
  }
}

// Preset Quick Symbols for SXTK
const SXTK_SYMBOLS = [
  { label: 'μ', insert: '\\mu', name: 'Kỳ vọng (Mean)' },
  { label: 'σ', insert: '\\sigma', name: 'Độ lệch chuẩn' },
  { label: 'P(A)', insert: 'P(A)', name: 'Xác suất biến cố A' },
  { label: '∫', insert: '\\int', name: 'Tích phân' },
  { label: '∑', insert: '\\sum', name: 'Tổng xích-ma' },
  { label: '∏', insert: '\\prod', name: 'Tích Pi' },
  { label: '⟹', insert: '\\implies', name: 'Suy ra' },
];

// Equation Templates for π Equation Dropdown
const EQUATION_TEMPLATES = [
  {
    category: 'Phân số & Căn thức',
    items: [
      { label: 'Phân số đơn', latex: '\\frac{x}{3}', preview: '\\frac{a}{b}' },
      { label: 'Căn bậc hai', latex: '\\sqrt{x}', preview: '\\sqrt{x}' },
      { label: 'Căn bậc n', latex: '\\sqrt[n]{x}', preview: '\\sqrt[n]{x}' },
      { label: 'Sai số chuẩn', latex: '\\frac{\\sigma}{\\sqrt{n}}', preview: '\\frac{\\sigma}{\\sqrt{n}}' },
    ],
  },
  {
    category: 'Xác suất & Biến ngẫu nhiên',
    items: [
      { label: 'Xác suất điều kiện', latex: 'P(A|B) = \\frac{P(A \\cap B)}{P(B)}', preview: 'P(A|B)' },
      { label: 'Công thức Bayes', latex: 'P(B_i|A) = \\frac{P(B_i)P(A|B_i)}{\\sum P(B_k)P(A|B_k)}', preview: 'Bayes' },
      { label: 'Kỳ vọng rời rạc', latex: 'E(X) = \\sum x_i p_i', preview: 'E(X)' },
      { label: 'Phương sai Var(X)', latex: 'Var(X) = E(X^2) - [E(X)]^2', preview: 'Var(X)' },
      { label: 'Z-Score chuẩn hóa', latex: 'Z = \\frac{\\bar{X} - \\mu}{\\frac{\\sigma}{\\sqrt{n}}}', preview: 'Z' },
    ],
  },
  {
    category: 'Giải tích & Tích phân',
    items: [
      { label: 'Tích phân xác định', latex: '\\int_{a}^{b} f(x) \\, dx', preview: '\\int_a^b' },
      { label: 'Tích phân vô hạn', latex: '\\int_{-\\infty}^{+\\infty} f(x) \\, dx = 1', preview: '\\int_{-\\infty}^{+\\infty}' },
      { label: 'Giới hạn lim', latex: '\\lim_{x \\to \\infty} f(x)', preview: '\\lim' },
    ],
  },
  {
    category: 'Ma trận & Hệ phương trình',
    items: [
      { label: 'Ma trận 2x2', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', preview: '2\\times2' },
      { label: 'Véc-tơ cột', latex: '\\begin{pmatrix} x_1 \\\\ x_2 \\end{pmatrix}', preview: 'x' },
    ],
  },
];

interface WysiwygMathChatEditorProps {
  onSendMessage?: (text: string, mathLatex: string) => void;
  className?: string;
}

export const WysiwygMathChatEditor: React.FC<WysiwygMathChatEditorProps> = ({
  onSendMessage,
  className = '',
}) => {
  // Font and typography state
  const [fontFamily, setFontFamily] = useState('Aptos (Body)');
  const [fontSize, setFontSize] = useState(12);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [fontColor, setFontColor] = useState('#ffffff');
  const [highlightColor, setHighlightColor] = useState('transparent');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [lineSpacing, setLineSpacing] = useState('1.5');
  const [showPilcrow, setShowPilcrow] = useState(false);

  // Dropdown states
  const [showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false);
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [showEquationDropdown, setShowEquationDropdown] = useState(false);
  const [showFontColorDropdown, setShowFontColorDropdown] = useState(false);
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);
  const [showSpacingDropdown, setShowSpacingDropdown] = useState(false);

  // Interactive Equations & Math state
  // Inline equation 1: pre-filled matching user's image: \frac{x}{3} = 6 \rightarrow x = 18
  const [inlineEq1, setInlineEq1] = useState('\\frac{x}{3} = 6 \\rightarrow x = 18');
  // Dynamic active Word-style equation box
  const [activeWordEquation, setActiveWordEquation] = useState('');
  const [isEquationBoxFocused, setIsEquationBoxFocused] = useState(true);
  const [activeEquationInputMode, setActiveEquationInputMode] = useState<'visual' | 'code'>('visual');

  // Interactive Canvas & Freehand Drawing (iPad Mode)
  const [isIpadDrawingMode, setIsIpadDrawingMode] = useState(false);
  const [penColor, setPenColor] = useState('#22d3ee'); // cyan
  const [penWidth, setPenWidth] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawings, setHasDrawings] = useState(false);

  // Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [speechHelperMessage, setSpeechHelperMessage] = useState('Sẵn sàng nghe...');

  // Chat message thread & feedback
  const [chatMessages, setChatMessages] = useState<Array<{
    sender: 'user' | 'ai';
    text: string;
    math?: string;
    time: string;
  }>>([
    {
      sender: 'ai',
      text: 'Chào bạn! Tôi là Trợ giảng AI Xác Suất Thống Kê. Bạn có thể soạn lời giải toán trực tiếp bên dưới với định dạng Word WYSIWYG và gửi bài để tôi hỗ trợ nhé!',
      time: '07:00',
    },
  ]);

  // Main text area references
  const editableTextRef1 = useRef<HTMLDivElement | null>(null);
  const editableTextRef2 = useRef<HTMLDivElement | null>(null);
  const mathLiveFieldRef = useRef<any>(null);

  // Check if MathLive custom element is registered
  const [isMathLiveReady, setIsMathLiveReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && customElements.get('math-field')) {
      setIsMathLiveReady(true);
    } else {
      const interval = setInterval(() => {
        if (typeof window !== 'undefined' && customElements.get('math-field')) {
          setIsMathLiveReady(true);
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, []);

  // Voice Recognition setup
  const toggleVoiceRecognition = () => {
    if (isListening) {
      setIsListening(false);
      setSpeechHelperMessage('Đã dừng nghe');
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(true);
      setSpeechHelperMessage('Đang thu âm mô phỏng...');
      const simulatedPhrases = [
        'Xác suất P của biến cố A bằng n A chia n Omega',
        'Kỳ vọng E của X bằng tổng x i nhân p i',
        'Suy ra x bằng 18',
        'Độ lệch chuẩn sigma bằng căn bậc hai của phương sai',
      ];
      const randomPhrase = simulatedPhrases[Math.floor(Math.random() * simulatedPhrases.length)];
      setTimeout(() => {
        setVoiceTranscript(randomPhrase);
        setSpeechHelperMessage(`Nhận diện: "${randomPhrase}"`);
        setIsListening(false);
      }, 2500);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechHelperMessage('Đang lắng nghe lời giải...');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        setVoiceTranscript(transcript);
        setSpeechHelperMessage(`Đã nghe: "${transcript}"`);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechHelperMessage('Lỗi thu âm, thử lại nhé!');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
      setSpeechHelperMessage('Không thể mở micro');
    }
  };

  // Drawing Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isIpadDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
    setHasDrawings(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isIpadDrawingMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const clearCanvasStrokes = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawings(false);
  };

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
  }, [isIpadDrawingMode]);

  // Handle Quick Symbol Insert
  const handleInsertSymbol = (symbolLatex: string) => {
    if (isMathLiveReady && mathLiveFieldRef.current) {
      mathLiveFieldRef.current.insert(symbolLatex);
      mathLiveFieldRef.current.focus();
    } else {
      setActiveWordEquation((prev) => prev + symbolLatex);
    }
  };

  // Handle Template Insert from π Equation dropdown
  const handleInsertTemplate = (templateLatex: string) => {
    if (isMathLiveReady && mathLiveFieldRef.current) {
      mathLiveFieldRef.current.insert(templateLatex);
      mathLiveFieldRef.current.focus();
    } else {
      setActiveWordEquation((prev) => (prev ? prev + ' ' + templateLatex : templateLatex));
    }
    setShowEquationDropdown(false);
  };

  // Convert typed plain keystrokes into instant visual math (like Word Math AutoCorrect)
  const handleEquationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Keep or finalize
      return;
    }
  };

  // Quick Action: Paste from Clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        if (isMathLiveReady && mathLiveFieldRef.current) {
          mathLiveFieldRef.current.insert(text);
        } else {
          setActiveWordEquation((prev) => prev + text);
        }
      }
    } catch {
      // Fallback
      setActiveWordEquation((prev) => prev + ' \\frac{x}{3} = 6 ');
    }
  };

  // Quick Action: Copy Active Equation
  const handleCopy = () => {
    const content = activeWordEquation || inlineEq1;
    navigator.clipboard.writeText(content);
  };

  // Send solution to AI Tutor
  const handleSendSolution = () => {
    const solutionLatex = activeWordEquation || inlineEq1;
    const userMsg = {
      sender: 'user' as const,
      text: 'Lời giải của tôi:',
      math: solutionLatex,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const aiReply = {
        sender: 'ai' as const,
        text: 'Chính xác! Từ bước ' + (solutionLatex.includes('18') ? '$\\frac{x}{3} = 6 \\implies x = 18$' : 'trên') + ', bạn đã biến đổi đúng theo quy tắc nhân chéo. Tiếp theo bạn có thể tính xác suất $P(X \\ge 18)$ hoặc kiểm định giá trị này.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, aiReply]);
    }, 800);
  };

  return (
    <div
      className={`flex flex-col w-full bg-[#020617] text-slate-100 rounded-2xl border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden ${className}`}
      style={{ minHeight: '820px' }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP RIBBON TOOLBAR (SCIENTIFIC WORD-STYLE)                              */}
      {/* ========================================================================= */}
      <div className="bg-[#0b1329]/95 backdrop-blur-md border-b border-cyan-500/20 px-3 py-2 flex flex-wrap items-stretch gap-2 text-xs select-none">
        {/* ---------------- A. Clipboard Group ---------------- */}
        <div className="flex flex-col justify-between border-r border-slate-800/80 pr-2.5 min-w-[90px]">
          <div className="flex items-center gap-1.5 flex-1">
            {/* Big Paste button */}
            <button
              onClick={handlePaste}
              className="flex flex-col items-center justify-center p-1.5 px-2 rounded-lg hover:bg-slate-800/80 text-amber-300 hover:text-amber-200 transition-all group active:scale-95"
              title="Dán từ Clipboard (Ctrl+V)"
            >
              <div className="p-1 rounded bg-amber-500/10 border border-amber-500/30 group-hover:shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                <ClipboardPaste className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-[10px] font-semibold text-slate-300 flex items-center gap-0.5 mt-0.5">
                Paste <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </span>
            </button>

            {/* Small Cut and Copy stacked */}
            <div className="flex flex-col gap-1">
              <button
                onClick={() => {
                  handleCopy();
                  setActiveWordEquation('');
                }}
                className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
                title="Cắt (Cut)"
              >
                <Scissors className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
                title="Sao chép (Copy)"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 px-1">
            <span>Clipboard</span>
            <CornerDownRight className="w-2.5 h-2.5 opacity-50 cursor-pointer hover:opacity-100" />
          </div>
        </div>

        {/* ---------------- B. Font Group ---------------- */}
        <div className="flex flex-col justify-between border-r border-slate-800/80 pr-2.5 min-w-[240px]">
          {/* Top row of Font */}
          <div className="flex items-center gap-1">
            {/* Font family dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFontFamilyDropdown(!showFontFamilyDropdown)}
                className="flex items-center justify-between gap-1 px-2 py-1 bg-slate-900/90 border border-slate-700/60 rounded text-[11px] font-medium text-slate-200 hover:border-cyan-500/50 min-w-[105px]"
              >
                <span className="truncate">{fontFamily}</span>
                <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
              </button>
              {showFontFamilyDropdown && (
                <div className="absolute top-full left-0 mt-1 w-44 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-2xl py-1 z-50">
                  {['Aptos (Body)', 'Times New Roman', 'Cambria Math', 'JetBrains Mono', 'Segoe UI', 'Arial'].map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        setFontFamily(f);
                        setShowFontFamilyDropdown(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors flex items-center justify-between"
                      style={{ fontFamily: f }}
                    >
                      {f}
                      {fontFamily === f && <Check className="w-3 h-3 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Font size dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFontSizeDropdown(!showFontSizeDropdown)}
                className="flex items-center justify-between gap-1 px-2 py-1 bg-slate-900/90 border border-slate-700/60 rounded text-[11px] font-medium text-slate-200 hover:border-cyan-500/50 w-13"
              >
                <span>{fontSize}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
              {showFontSizeDropdown && (
                <div className="absolute top-full left-0 mt-1 w-16 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-2xl py-1 z-50 max-h-40 overflow-y-auto">
                  {[10, 11, 12, 14, 16, 18, 20, 24, 28].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setFontSize(s);
                        setShowFontSizeDropdown(false);
                      }}
                      className="w-full text-center px-2 py-1 text-xs hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* A^ increase / Av decrease */}
            <button
              onClick={() => setFontSize((s) => Math.min(s + 2, 36))}
              className="p-1 rounded hover:bg-slate-800 text-slate-200 font-bold text-xs"
              title="Tăng cỡ chữ"
            >
              A<sup>▲</sup>
            </button>
            <button
              onClick={() => setFontSize((s) => Math.max(s - 2, 8))}
              className="p-1 rounded hover:bg-slate-800 text-slate-200 font-bold text-xs"
              title="Giảm cỡ chữ"
            >
              A<sub>▼</sub>
            </button>

            {/* Case selector Aa */}
            <div className="relative">
              <button
                onClick={() => setShowCaseDropdown(!showCaseDropdown)}
                className="flex items-center gap-0.5 p-1 rounded hover:bg-slate-800 text-slate-200 font-bold text-xs"
                title="Đổi kiểu chữ hoa/thường"
              >
                Aa <ChevronDown className="w-2.5 h-2.5 opacity-60" />
              </button>
              {showCaseDropdown && (
                <div className="absolute top-full left-0 mt-1 w-36 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-2xl py-1 z-50 text-[11px]">
                  <button
                    onClick={() => setShowCaseDropdown(false)}
                    className="w-full text-left px-3 py-1 hover:bg-slate-800"
                  >
                    Sentence case
                  </button>
                  <button
                    onClick={() => setShowCaseDropdown(false)}
                    className="w-full text-left px-3 py-1 hover:bg-slate-800"
                  >
                    lowercase
                  </button>
                  <button
                    onClick={() => setShowCaseDropdown(false)}
                    className="w-full text-left px-3 py-1 hover:bg-slate-800 uppercase"
                  >
                    UPPERCASE
                  </button>
                </div>
              )}
            </div>

            {/* Clear formatting eraser */}
            <button
              onClick={() => {
                setIsBold(false);
                setIsItalic(false);
                setIsUnderline(false);
                setIsStrikethrough(false);
                setIsSubscript(false);
                setIsSuperscript(false);
                setFontColor('#ffffff');
                setHighlightColor('transparent');
              }}
              className="p-1 rounded hover:bg-slate-800 text-fuchsia-400 hover:text-fuchsia-300 ml-0.5"
              title="Xóa tất cả định dạng (Clear All Formatting)"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom row of Font */}
          <div className="flex items-center gap-0.5 mt-1">
            <button
              onClick={() => setIsBold(!isBold)}
              className={`p-1 px-1.5 rounded text-xs font-black transition-colors ${
                isBold ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="In đậm (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsItalic(!isItalic)}
              className={`p-1 px-1.5 rounded text-xs transition-colors ${
                isItalic ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="In nghiêng (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsUnderline(!isUnderline)}
              className={`p-1 px-1.5 rounded text-xs transition-colors flex items-center gap-0.5 ${
                isUnderline ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Gạch chân (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
              <ChevronDown className="w-2 h-2 opacity-50" />
            </button>
            <button
              onClick={() => setIsStrikethrough(!isStrikethrough)}
              className={`p-1 px-1.5 rounded text-xs transition-colors ${
                isStrikethrough ? 'bg-cyan-500/30 text-cyan-300' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Gạch ngang chữ"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsSubscript(!isSubscript);
                setIsSuperscript(false);
              }}
              className={`p-1 px-1.5 rounded text-xs transition-colors ${
                isSubscript ? 'bg-cyan-500/30 text-cyan-300' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Chỉ số dưới (Subscript x₂)"
            >
              <Subscript className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setIsSuperscript(!isSuperscript);
                setIsSubscript(false);
              }}
              className={`p-1 px-1.5 rounded text-xs transition-colors ${
                isSuperscript ? 'bg-cyan-500/30 text-cyan-300' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Chỉ số trên (Superscript x²)"
            >
              <Superscript className="w-3.5 h-3.5" />
            </button>

            {/* Glowing Text effect */}
            <button
              className="p-1 px-1.5 rounded hover:bg-slate-800 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] font-bold text-xs"
              title="Hiệu ứng chữ phát sáng"
            >
              A
            </button>

            {/* Highlighter marker */}
            <div className="relative">
              <button
                onClick={() => setShowHighlightDropdown(!showHighlightDropdown)}
                className="p-1 px-1.5 rounded hover:bg-slate-800 flex flex-col items-center"
                title="Màu đánh dấu văn bản"
              >
                <Highlighter className="w-3.5 h-3.5 text-yellow-300" />
                <span className="w-3 h-0.5 bg-yellow-400 mt-0.5 rounded-full" />
              </button>
              {showHighlightDropdown && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-2xl z-50 grid grid-cols-4 gap-1.5">
                  {['transparent', '#fef08a', '#86efac', '#67e8f9', '#f472b6'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setHighlightColor(color);
                        setShowHighlightDropdown(false);
                      }}
                      className="w-5 h-5 rounded border border-slate-700"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Font Color A with red underline */}
            <div className="relative">
              <button
                onClick={() => setShowFontColorDropdown(!showFontColorDropdown)}
                className="p-1 px-1.5 rounded hover:bg-slate-800 flex flex-col items-center"
                title="Màu chữ"
              >
                <span className="font-bold text-xs text-white leading-none">A</span>
                <span className="w-3 h-0.5 bg-red-500 mt-0.5 rounded-full" />
              </button>
              {showFontColorDropdown && (
                <div className="absolute top-full left-0 mt-1 p-2 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-2xl z-50 grid grid-cols-4 gap-1.5">
                  {['#ffffff', '#22d3ee', '#34d399', '#facc15', '#f87171', '#c084fc'].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setFontColor(color);
                        setShowFontColorDropdown(false);
                      }}
                      className="w-5 h-5 rounded border border-slate-700"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 px-1">
            <span>Font</span>
            <CornerDownRight className="w-2.5 h-2.5 opacity-50 cursor-pointer hover:opacity-100" />
          </div>
        </div>

        {/* ---------------- C. Paragraph Group ---------------- */}
        <div className="flex flex-col justify-between border-r border-slate-800/80 pr-2.5 min-w-[210px]">
          {/* Top row of Paragraph */}
          <div className="flex items-center gap-1">
            <button className="p-1 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-0.5" title="Danh sách dấu chấm">
              <List className="w-3.5 h-3.5" />
              <ChevronDown className="w-2 h-2 opacity-50" />
            </button>
            <button className="p-1 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-0.5" title="Danh sách đánh số">
              <ListOrdered className="w-3.5 h-3.5" />
              <ChevronDown className="w-2 h-2 opacity-50" />
            </button>
            <button className="p-1 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-0.5" title="Danh sách nhiều cấp">
              <ListTree className="w-3.5 h-3.5" />
              <ChevronDown className="w-2 h-2 opacity-50" />
            </button>
            <button className="p-1 rounded hover:bg-slate-800 text-slate-300" title="Giảm thụt lề">
              <Outdent className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-slate-800 text-slate-300" title="Tăng thụt lề">
              <Indent className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded hover:bg-slate-800 text-slate-300" title="Sắp xếp A-Z">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowPilcrow(!showPilcrow)}
              className={`p-1 rounded ${showPilcrow ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-slate-800 text-slate-300'}`}
              title="Hiện ký hiệu đoạn ¶"
            >
              <Pilcrow className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom row of Paragraph */}
          <div className="flex items-center gap-0.5 mt-1">
            <button
              onClick={() => setTextAlign('left')}
              className={`p-1 px-1.5 rounded ${textAlign === 'left' ? 'bg-cyan-500/30 text-cyan-300' : 'hover:bg-slate-800 text-slate-300'}`}
              title="Căn lề trái"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTextAlign('center')}
              className={`p-1 px-1.5 rounded ${textAlign === 'center' ? 'bg-cyan-500/30 text-cyan-300' : 'hover:bg-slate-800 text-slate-300'}`}
              title="Căn giữa"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTextAlign('right')}
              className={`p-1 px-1.5 rounded ${textAlign === 'right' ? 'bg-cyan-500/30 text-cyan-300' : 'hover:bg-slate-800 text-slate-300'}`}
              title="Căn phải"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTextAlign('justify')}
              className={`p-1 px-1.5 rounded ${textAlign === 'justify' ? 'bg-cyan-500/30 text-cyan-300' : 'hover:bg-slate-800 text-slate-300'}`}
              title="Căn đều 2 bên"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>

            {/* Line Spacing */}
            <div className="relative">
              <button
                onClick={() => setShowSpacingDropdown(!showSpacingDropdown)}
                className="p-1 px-1.5 rounded hover:bg-slate-800 text-slate-300 flex items-center gap-0.5"
                title="Khoảng cách dòng"
              >
                <span className="text-[10px] font-mono">{lineSpacing}</span>
                <ChevronDown className="w-2 h-2 opacity-50" />
              </button>
              {showSpacingDropdown && (
                <div className="absolute top-full left-0 mt-1 w-20 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-2xl py-1 z-50 text-[11px]">
                  {['1.0', '1.15', '1.5', '2.0'].map((sp) => (
                    <button
                      key={sp}
                      onClick={() => {
                        setLineSpacing(sp);
                        setShowSpacingDropdown(false);
                      }}
                      className="w-full text-center py-1 hover:bg-slate-800"
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fill color bucket */}
            <button className="p-1 px-1.5 rounded hover:bg-slate-800 text-slate-300" title="Tô màu nền đoạn">
              <PaintBucket className="w-3.5 h-3.5" />
            </button>

            {/* Borders */}
            <button className="p-1 px-1.5 rounded hover:bg-slate-800 text-slate-300" title="Đường viền bảng">
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 px-1">
            <span>Paragraph</span>
            <CornerDownRight className="w-2.5 h-2.5 opacity-50 cursor-pointer hover:opacity-100" />
          </div>
        </div>

        {/* ---------------- D. Equation & Special Ink Group (Stats Core) ---------------- */}
        <div className="flex flex-col justify-between flex-1 min-w-[340px]">
          {/* Top row: π Equation Button & SXTK Quick bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* The π Equation Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setShowEquationDropdown(!showEquationDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95"
              >
                <span className="text-base font-serif italic">π</span>
                <span className="text-xs">Equation</span>
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-80" />
              </button>

              {/* Dropdown Menu for Math Templates */}
              {showEquationDropdown && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900/98 backdrop-blur-xl border border-cyan-500/40 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] p-3 z-50 max-h-96 overflow-y-auto">
                  <div className="text-xs font-bold text-cyan-300 pb-2 border-b border-slate-800 mb-2 flex items-center justify-between">
                    <span>Mẫu Cấu Trúc Công Thức Toán</span>
                    <span className="text-[10px] text-slate-400 font-normal">Click chèn trực tiếp</span>
                  </div>
                  {EQUATION_TEMPLATES.map((cat, cIdx) => (
                    <div key={cIdx} className="mb-3">
                      <div className="text-[11px] font-semibold text-emerald-400 mb-1">{cat.category}</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {cat.items.map((item, iIdx) => (
                          <button
                            key={iIdx}
                            onClick={() => handleInsertTemplate(item.latex)}
                            className="flex flex-col items-center justify-center p-2 rounded-lg bg-slate-800/80 hover:bg-cyan-950/60 border border-slate-700/60 hover:border-cyan-500/60 text-slate-200 transition-all group"
                          >
                            <span
                              className="text-xs font-mono text-cyan-200 group-hover:scale-105 transition-transform"
                              dangerouslySetInnerHTML={{ __html: renderKatexSafe(item.preview) }}
                            />
                            <span className="text-[9px] text-slate-400 mt-1 truncate max-w-full">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ký hiệu SXTK Quick Bar */}
            <div className="flex items-center gap-1 bg-slate-900/70 border border-cyan-500/20 px-2 py-1 rounded-lg">
              <span className="text-[10px] font-bold text-cyan-400 whitespace-nowrap mr-1">Ký hiệu SXTK</span>
              <div className="flex items-center gap-0.5">
                {SXTK_SYMBOLS.map((sym, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleInsertSymbol(sym.insert)}
                    className="px-1.5 py-0.5 rounded hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-200 text-xs font-serif font-bold transition-colors"
                    title={sym.name}
                  >
                    {sym.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row: iPad Pencil, Eraser, and Voice Microphone */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* iPad Ink Toggle */}
            <button
              onClick={() => setIsIpadDrawingMode(!isIpadDrawingMode)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                isIpadDrawingMode
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/60 hover:border-slate-600'
              }`}
            >
              <Pencil className="w-3.5 h-3.5 text-cyan-400" />
              <span>Viết Tay iPad</span>
            </button>

            {/* Drawing Eraser */}
            <button
              onClick={clearCanvasStrokes}
              disabled={!hasDrawings}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${
                hasDrawings
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-slate-900/40 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
              title="Xóa toàn bộ nét bút viết tay"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tẩy Nét</span>
            </button>

            {/* Voice input pill */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={toggleVoiceRecognition}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-md ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                    : 'bg-blue-900/80 hover:bg-blue-800 text-cyan-200 border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-cyan-300" />
                <span>Nói câu trả lời</span>
              </button>

              {/* Interactive mini voice preview */}
              <div className="h-6 px-2 bg-slate-900/90 border border-slate-700/60 rounded-md flex items-center min-w-[130px] max-w-[200px]">
                <span className="text-[10px] text-slate-400 truncate font-mono">
                  {voiceTranscript || speechHelperMessage}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE DRAFTING CANVAS (CHAT COMPONENT)                           */}
      {/* ========================================================================= */}
      <div className="flex-1 p-4 md:p-6 bg-[#040816] flex flex-col relative overflow-hidden">
        {/* Subtle Cyber Neon Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #22d3ee 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* DOUBLE BORDER CYBER DRAFTING FRAME (As specified) */}
        <div className="relative flex-1 rounded-2xl border-2 border-cyan-500/40 p-1 shadow-[0_0_30px_rgba(6,182,212,0.15)] bg-slate-950/60 flex flex-col">
          {/* Inner border line creating the double-border effect */}
          <div className="relative flex-1 rounded-xl border border-cyan-500/20 bg-[#0b0f19] p-5 md:p-8 flex flex-col overflow-y-auto no-scrollbar">
            {/* iPad Freehand Drawing Layer (Overlay) */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className={`absolute inset-0 z-30 ${
                isIpadDrawingMode ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
              }`}
            />

            {/* iPad Pen Toolbar Indicator if Drawing is active */}
            {isIpadDrawingMode && (
              <div className="absolute top-3 right-3 z-40 bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 rounded-xl px-3 py-1.5 flex items-center gap-2 shadow-xl">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Chế độ Bút iPad
                </span>
                <div className="flex items-center gap-1 border-l border-slate-700 pl-2">
                  {['#22d3ee', '#10b981', '#facc15', '#ffffff'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setPenColor(c)}
                      className={`w-3.5 h-3.5 rounded-full border ${penColor === c ? 'scale-125 border-white shadow-md' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ---------------- MICRO-GUIDE PROMPT 1 ---------------- */}
            <div className="mb-4">
              <p className="text-slate-100 font-semibold text-sm md:text-base leading-relaxed tracking-wide select-text">
                Người dùng sẽ soạn bài ở đây và soạn làm sao không bị lỗi code và hiển thị ký tự như vầy ví dụ
              </p>
            </div>

            {/* ---------------- MICRO-GUIDE PROMPT 2 ---------------- */}
            <div className="mb-8">
              <p className="text-slate-200 text-sm md:text-base leading-relaxed tracking-wide select-text">
                Người dùng sẽ không bấm ký tự rồi nó chuyển sang code mà chỉnh sửa trực tiếp luôn
              </p>
            </div>

            {/* ---------------- EXAMPLE RENDERING ROW (CÁCH GIẢI BÀI TOÁN) ---------------- */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-6 p-4 rounded-xl bg-slate-900/30 border border-slate-800/60 hover:border-cyan-500/30 transition-all">
              <span className="text-slate-300 font-medium text-sm md:text-base whitespace-nowrap">
                Cách giải bài toán
              </span>

              {/* Pure Visual Inline Math without raw code glitches */}
              <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 rounded-lg border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <span
                  className="text-lg md:text-xl font-mono text-cyan-200 font-semibold tracking-wide"
                  dangerouslySetInnerHTML={{
                    __html: renderKatexSafe(inlineEq1),
                  }}
                />
                {/* Visual Blinking Cursor */}
                <span className="w-0.5 h-6 bg-cyan-400 animate-pulse rounded-full" />
              </div>
            </div>

            {/* ---------------- MICRO-GUIDE PROMPT 3 ---------------- */}
            <div className="mt-6 mb-4">
              <p className="text-slate-200 text-sm md:text-base leading-relaxed tracking-wide select-text">
                Vd người dùng đang đánh lời giải mà muốn đánh công thức thì nó sẽ nhảy ra khung để nhập công thức và chỉnh sửa trực tiếp dạng công thức giống word như vầy
              </p>
            </div>

            {/* ---------------- THE VISUAL WORD EQUATION BOX ---------------- */}
            <div className="my-4 relative group">
              {/* Soft outline jumped-open editable box with dashed light border */}
              <div
                className={`relative w-full max-w-2xl mx-auto rounded-lg transition-all ${
                  isEquationBoxFocused
                    ? 'border-2 border-dashed border-cyan-400/80 bg-slate-900/80 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
                    : 'border border-dashed border-slate-600/70 bg-slate-900/40 hover:border-cyan-500/50'
                }`}
              >
                {/* MathLive native WYSIWYG element if ready, otherwise fallback interactive KaTeX editor */}
                {isMathLiveReady ? (
                  <div className="p-3">
                    {React.createElement(
                      'math-field' as any,
                      {
                        ref: mathLiveFieldRef,
                        onInput: (e: any) => setActiveWordEquation(e.target.value),
                        onFocus: () => setIsEquationBoxFocused(true),
                        onBlur: () => setIsEquationBoxFocused(false),
                        style: {
                          width: '100%',
                          backgroundColor: 'transparent',
                          color: '#67e8f9',
                          fontSize: '18px',
                          outline: 'none',
                          border: 'none',
                          fontFamily: fontFamily,
                        },
                      },
                      activeWordEquation
                    )}
                    {!activeWordEquation && (
                      <div className="absolute inset-0 p-3 flex items-center pointer-events-none text-slate-400 font-serif italic text-base">
                        <span>Type equation here.</span>
                        <span className="w-0.5 h-5 bg-cyan-400 ml-1 animate-pulse" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback Live Interactive WYSIWYG Math Frame */
                  <div className="p-3.5 flex flex-col gap-2">
                    <div className="flex items-center min-h-[44px] px-3 py-1.5 rounded bg-slate-950/70 border border-slate-700/50">
                      {activeWordEquation ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="text-lg md:text-xl font-mono text-cyan-200"
                            dangerouslySetInnerHTML={{
                              __html: renderKatexSafe(activeWordEquation),
                            }}
                          />
                          <span className="w-0.5 h-5 bg-cyan-400 animate-pulse" />
                        </div>
                      ) : (
                        <div className="flex items-center text-slate-400 font-serif italic text-base">
                          <span>Type equation here.</span>
                          <span className="w-0.5 h-5 bg-cyan-400 ml-1 animate-pulse" />
                        </div>
                      )}
                    </div>

                    {/* Direct typing input that converts immediately to formula */}
                    <input
                      type="text"
                      value={activeWordEquation}
                      onChange={(e) => setActiveWordEquation(e.target.value)}
                      onFocus={() => setIsEquationBoxFocused(true)}
                      onBlur={() => setIsEquationBoxFocused(false)}
                      onKeyDown={handleEquationKeyDown}
                      placeholder="Gõ trực tiếp ký tự toán học (vd: x/3 = 6 hay \mu, P(A)...)"
                      className="w-full bg-transparent border-t border-slate-800 pt-2 text-xs font-mono text-slate-300 placeholder:text-slate-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Micro badge indicator */}
              <div className="text-center mt-2">
                <span className="text-[11px] text-cyan-400/80 font-medium">
                  ✦ Khung soạn thảo công thức chuẩn MS Word (Gõ trực tiếp không qua mã code)
                </span>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1 min-h-[40px]" />

            {/* AI Star Sparkle Icon in bottom right (like screenshot) */}
            <div className="absolute bottom-4 right-4 pointer-events-none select-none opacity-40 hover:opacity-100 transition-opacity">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-cyan-400">
                <path
                  d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ---------------- CHAT ACTION WORKBENCH (BOTTOM ROW) ---------------- */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveWordEquation('');
                setInlineEq1('\\frac{x}{3} = 6 \\rightarrow x = 18');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đặt lại</span>
            </button>

            <button
              onClick={() => {
                handleInsertTemplate('\\int_{0}^{+\\infty} \\lambda e^{-\\lambda x} dx = 1');
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-cyan-500/30 hover:border-cyan-500/60 text-xs text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Bước Tích Phân SXTK</span>
            </button>
          </div>

          {/* Send to AI Tutor Button */}
          <button
            onClick={handleSendSolution}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs md:text-sm shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all active:scale-95"
          >
            <Send className="w-4 h-4 text-slate-950" />
            <span>Gửi Bài Giải Cho AI Chấm</span>
          </button>
        </div>

        {/* Chat feedback messages */}
        {chatMessages.length > 1 && (
          <div className="mt-4 p-3 bg-slate-900/90 border border-cyan-500/30 rounded-xl space-y-2 max-h-48 overflow-y-auto">
            <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Phản hồi từ Gia Sư AI Xác Suất Thống Kê:</span>
            </div>
            {chatMessages.slice(1).map((msg, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                  msg.sender === 'ai'
                    ? 'bg-cyan-950/40 border border-cyan-500/20 text-cyan-100'
                    : 'bg-slate-800/60 border border-slate-700/40 text-slate-200 ml-6'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-bold">{msg.sender === 'ai' ? '🤖 AI Tutor' : '👤 Lời giải của bạn'}</span>
                  <span>{msg.time}</span>
                </div>
                <p>{msg.text}</p>
                {msg.math && (
                  <div
                    className="mt-1 font-mono text-cyan-300 font-semibold"
                    dangerouslySetInnerHTML={{ __html: renderKatexSafe(msg.math) }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WysiwygMathChatEditor;
