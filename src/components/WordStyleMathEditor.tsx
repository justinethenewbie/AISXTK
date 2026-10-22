import React, { useState, useRef, useEffect, useCallback } from 'react';
import 'mathlive';
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
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
  Sparkles,
  Send,
  Pencil,
  Trash2,
  Mic,
  X,
  Sun,
  Moon,
  Search,
  Sigma,
} from 'lucide-react';
import { renderKatexSafe } from './MathFormula';
import { normalizeSpokenMath } from '../utils/mathSpeechParser';
import {
  WORD_11_STRUCTURES,
  WORD_SYMBOLS_GALLERY,
  QUICK_XSTK_BAR,
  SYMBOL_CATEGORIES,
} from '../data/wordEquationData';

export interface WordStyleMathEditorProps {
  initialText?: string;
  placeholder?: string;
  submitButtonText?: string;
  isSubmitting?: boolean;
  showSendButton?: boolean;
  onSendToAI?: (fullText: string, drawingDataUrl?: string) => void;
  defaultPaperTheme?: 'white' | 'dark';
  title?: string;
  compact?: boolean;
  onInsertLaTeX?: (latex: string) => void;
}

export const WordStyleMathEditor: React.FC<WordStyleMathEditorProps> = ({
  initialText = '',
  placeholder = 'Nhấp vào trang văn bản này để bắt đầu gõ bài giải tự luận... Nhấn "π Equation" hoặc phím Alt + = để chèn công thức.',
  submitButtonText = 'NỘP CÂU TRẢ LỜI / BÀI GIẢI CHO AI CHẤM',
  isSubmitting = false,
  showSendButton = true,
  onSendToAI,
  defaultPaperTheme = 'dark',
}) => {
  const [paperTheme, setPaperTheme] = useState<'white' | 'dark'>(defaultPaperTheme);

  // Formatting state
  const [fontFamily, setFontFamily] = useState('Aptos (Body)');
  const [fontSize, setFontSize] = useState(14);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  // Active math field currently focused
  const [activeMathField, setActiveMathField] = useState<any>(null);

  // Ribbon menus
  const [openStructureMenu, setOpenStructureMenu] = useState<string | null>(null);
  const [isSymbolsGalleryExpanded, setIsSymbolsGalleryExpanded] = useState<boolean>(false);
  const [selectedSymbolCategory, setSelectedSymbolCategory] = useState<string>('all');
  const [symbolSearchQuery, setSymbolSearchQuery] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Editor DOM reference (Contenteditable page)
  const editorRef = useRef<HTMLDivElement | null>(null);
  const savedSelectionRange = useRef<Range | null>(null);

  // iPad Freehand Drawing Layer Overlay
  const [isIpadDrawingMode, setIsIpadDrawingMode] = useState(false);
  const [penColor, setPenColor] = useState('#06b6d4');
  const [penWidth, setPenWidth] = useState(3);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawings, setHasDrawings] = useState(false);

  // Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const [speechHelperMessage, setSpeechHelperMessage] = useState<string | null>(null);

  // Save current caret position inside contenteditable
  const saveCaretPosition = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editorRef.current) return;
    const range = sel.getRangeAt(0);
    if (editorRef.current.contains(range.commonAncestorContainer)) {
      savedSelectionRange.current = range.cloneRange();
    }
  }, []);

  // Restore caret position
  const restoreCaretPosition = useCallback(() => {
    if (!savedSelectionRange.current) return false;
    const sel = window.getSelection();
    if (!sel) return false;
    sel.removeAllRanges();
    sel.addRange(savedSelectionRange.current);
    return true;
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenStructureMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation helpers into / out of a math-field
  const moveCaretAfterElement = useCallback((element: HTMLElement) => {
    const parent = element.parentNode;
    if (!parent) return;

    let nextNode = element.nextSibling;
    if (!nextNode || nextNode.nodeType !== Node.TEXT_NODE) {
      const space = document.createTextNode('\u00A0');
      parent.insertBefore(space, element.nextSibling);
      nextNode = space;
    }

    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(nextNode, 1);
    range.collapse(true);
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const moveCaretBeforeElement = useCallback((element: HTMLElement) => {
    const parent = element.parentNode;
    if (!parent) return;

    let prevNode = element.previousSibling;
    if (!prevNode || prevNode.nodeType !== Node.TEXT_NODE) {
      const space = document.createTextNode('\u00A0');
      parent.insertBefore(space, element);
      prevNode = space;
    }

    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(prevNode, (prevNode.nodeValue || '').length);
    range.collapse(true);
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const insertLineBreakAfterElement = useCallback((element: HTMLElement) => {
    const parent = element.parentNode;
    if (!parent) return;

    const br = document.createElement('br');
    const space = document.createTextNode('\u00A0');

    if (element.nextSibling) {
      parent.insertBefore(br, element.nextSibling);
      parent.insertBefore(space, br.nextSibling);
    } else {
      parent.appendChild(br);
      parent.appendChild(space);
    }

    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(space, 0);
    range.collapse(true);
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Configure a MathLive <math-field> element with full Word-style behavior
  const setupMathFieldElement = useCallback(
    (mf: any) => {
      // NOTE: Do NOT set contenteditable="false"! MathLive requires contenteditable !== "false"
      // so that its internal keyboard sink is active and keystrokes/numbers can be typed into placeholders.
      mf.className = 'word-equation-inline';
      mf.setAttribute('placeholder', 'Type equation here.');

      // High-contrast formula text color: electric cyan on dark, deep blue on white
      const mathColor = paperTheme === 'white' ? '#0284c7' : '#38bdf8';
      mf.style.color = mathColor;
      mf.style.setProperty('--color', mathColor);
      mf.style.fontWeight = '600';

      mf.addEventListener('focus', () => {
        setActiveMathField(mf);
      });

      mf.addEventListener('click', () => {
        setActiveMathField(mf);
      });

      // MathLive's native move-out event handles caret stepping out to text at formula boundaries
      mf.addEventListener('move-out', (ev: any) => {
        if (ev.detail?.direction === 'forward' || ev.detail?.direction === 'downward') {
          moveCaretAfterElement(mf);
        } else if (ev.detail?.direction === 'backward' || ev.detail?.direction === 'upward') {
          moveCaretBeforeElement(mf);
        }
      });

      mf.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          insertLineBreakAfterElement(mf);
        } else if (e.key === 'Backspace' && (!mf.value || mf.value.trim() === '')) {
          e.preventDefault();
          moveCaretBeforeElement(mf);
          mf.remove();
        }
      });

      return mf;
    },
    [paperTheme, moveCaretAfterElement, moveCaretBeforeElement, insertLineBreakAfterElement]
  );

  // Update math formula color whenever paper theme changes
  useEffect(() => {
    if (!editorRef.current) return;
    const fields = editorRef.current.querySelectorAll('math-field');
    const mathColor = paperTheme === 'white' ? '#0284c7' : '#38bdf8';
    fields.forEach((f: any) => {
      f.style.color = mathColor;
      f.style.setProperty('--color', mathColor);
    });
  }, [paperTheme]);

  // Initialize editor content from initialText if provided
  useEffect(() => {
    if (!editorRef.current) return;
    if (!initialText) {
      // empty editor
      return;
    }

    // Parse potential $...$ or $$...$$ formulas in initialText into live <math-field> elements
    editorRef.current.innerHTML = '';
    const lines = initialText.split('\n');

    lines.forEach((line, lineIdx) => {
      const lineDiv = document.createElement('div');
      const parts = line.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

      parts.forEach((part) => {
        if (!part) return;
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const rawLatex = part.slice(2, -2).trim();
          const mf = document.createElement('math-field') as any;
          setupMathFieldElement(mf);
          mf.value = rawLatex;
          lineDiv.appendChild(mf);
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const rawLatex = part.slice(1, -1).trim();
          const mf = document.createElement('math-field') as any;
          setupMathFieldElement(mf);
          mf.value = rawLatex;
          lineDiv.appendChild(mf);
        } else {
          lineDiv.appendChild(document.createTextNode(part));
        }
      });

      if (lineDiv.childNodes.length === 0) {
        lineDiv.appendChild(document.createElement('br'));
      }

      editorRef.current?.appendChild(lineDiv);
    });
  }, [initialText, setupMathFieldElement]);

  // Shortcut Alt + = to insert "Type equation here."
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        handleInsertNewEquation();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // --- ACTIONS: INSERT NEW EQUATION FRAME (TYPE EQUATION HERE.) ---
  const handleInsertNewEquation = (initialLatex = '') => {
    const editor = editorRef.current;
    if (!editor) return;

    const mf = document.createElement('math-field') as any;
    setupMathFieldElement(mf);

    const sel = window.getSelection();
    let inserted = false;

    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      range.deleteContents();

      const frag = document.createDocumentFragment();
      // Leading zero-width or non-breaking space
      frag.appendChild(document.createTextNode('\u00A0'));
      frag.appendChild(mf);
      // Trailing non-breaking space so user can click right after to continue typing words
      const spaceAfter = document.createTextNode('\u00A0');
      frag.appendChild(spaceAfter);

      range.insertNode(frag);
      inserted = true;
    }

    if (!inserted) {
      // Append to the end of the editor
      const p = document.createElement('div');
      p.appendChild(mf);
      p.appendChild(document.createTextNode('\u00A0'));
      editor.appendChild(p);
    }

    // Focus the new math field so user can start typing directly
    setTimeout(() => {
      mf.focus();
      setActiveMathField(mf);
      if (initialLatex) {
        if (typeof mf.setValue === 'function') {
          mf.setValue(initialLatex, { selectionMode: 'placeholder' });
        } else if (typeof mf.insert === 'function') {
          mf.insert(initialLatex, { selectionMode: 'placeholder' });
        } else if (typeof mf.executeCommand === 'function') {
          mf.executeCommand(['insert', initialLatex, { selectionMode: 'placeholder' }]);
        }
      }
    }, 40);
  };

  // --- ACTIONS: EXECUTE STRUCTURE TEMPLATE INTO ACTIVE EQUATION ---
  const handleExecuteStructure = (structureLatex: string) => {
    setOpenStructureMenu(null);

    // If an active MathLive field is currently focused and in the DOM, execute command directly into it!
    if (activeMathField && document.contains(activeMathField)) {
      activeMathField.focus();
      if (typeof activeMathField.insert === 'function') {
        activeMathField.insert(structureLatex, { selectionMode: 'placeholder' });
      } else if (typeof activeMathField.executeCommand === 'function') {
        activeMathField.executeCommand(['insert', structureLatex, { selectionMode: 'placeholder' }]);
      }
      return;
    }

    // Otherwise, insert a new "Type equation here." box with this structure
    handleInsertNewEquation(structureLatex);
  };

  // --- ACTIONS: INSERT SYMBOL INTO ACTIVE EQUATION ---
  const handleInsertSymbol = (symbolLatex: string) => {
    if (activeMathField && document.contains(activeMathField)) {
      activeMathField.focus();
      if (typeof activeMathField.insert === 'function') {
        activeMathField.insert(symbolLatex);
      } else if (typeof activeMathField.executeCommand === 'function') {
        activeMathField.executeCommand(['insert', symbolLatex]);
      }
      return;
    }

    // If no math field active, create one or insert into text at caret
    handleInsertNewEquation(symbolLatex);
  };

  // Text Formatting Commands
  const executeFormattingCommand = (command: string, value: string | undefined = undefined) => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
    restoreCaretPosition();
    document.execCommand(command, false, value);
    saveCaretPosition();

    // Update toggled state
    if (command === 'bold') setIsBold(!isBold);
    if (command === 'italic') setIsItalic(!isItalic);
    if (command === 'underline') setIsUnderline(!isUnderline);
    if (command === 'strikeThrough') setIsStrikethrough(!isStrikethrough);
  };

  // Canvas Drawing Handlers
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

  // Voice Recognition Handler
  const toggleVoiceRecognition = () => {
    if (isListening) {
      setIsListening(false);
      setSpeechHelperMessage(null);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechHelperMessage('Trình duyệt không hỗ trợ nhận diện giọng nói');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechHelperMessage('Đang lắng nghe... (tự nhận diện x ngang, pi, muy, sigma, tích phân)');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0].transcript)
          .join('');
        const converted = normalizeSpokenMath(transcript);
        setSpeechHelperMessage(`Đã nghe: "${converted}"`);
        if (event.results[0].isFinal) {
          // If in an active math field, insert directly; otherwise insert text in editor
          if (activeMathField && typeof activeMathField.executeCommand === 'function' && document.contains(activeMathField)) {
            activeMathField.executeCommand(['insert', converted]);
          } else {
            if (editorRef.current) {
              editorRef.current.focus();
              restoreCaretPosition();
              document.execCommand('insertText', false, converted + ' ');
              saveCaretPosition();
            }
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechHelperMessage('Lỗi micro, vui lòng thử lại');
      };

      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechHelperMessage('Không thể mở micro');
    }
  };

  // Serialize full document content for AI backend (stripping #? placeholders & wrapping in $...$)
  const serializeFullDocument = (): string => {
    const container = editorRef.current;
    if (!container) return '';

    let result = '';

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.nodeValue || '';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tagName = el.tagName.toLowerCase();

        if (tagName === 'math-field') {
          const mf = el as any;
          let latex = (mf.getValue ? mf.getValue('latex') : mf.value) || '';
          latex = latex.replace(/\\placeholder(\[.*?\])?\{\}/g, '').replace(/#\?/g, '').trim();
          if (latex) {
            result += ` $ ${latex} $ `;
          }
        } else if (tagName === 'br') {
          result += '\n';
        } else if (tagName === 'div' || tagName === 'p') {
          if (result && !result.endsWith('\n')) {
            result += '\n';
          }
          node.childNodes.forEach(walk);
          if (!result.endsWith('\n')) {
            result += '\n';
          }
        } else {
          node.childNodes.forEach(walk);
        }
      }
    };

    walk(container);
    return result.replace(/\u00A0/g, ' ').replace(/\u200B/g, '').trim();
  };

  // Submit Handler
  const handleSend = () => {
    if (!onSendToAI) return;
    const fullText = serializeFullDocument();
    let drawingDataUrl: string | undefined = undefined;
    if (hasDrawings && canvasRef.current) {
      drawingDataUrl = canvasRef.current.toDataURL('image/png');
    }
    onSendToAI(fullText, drawingDataUrl);
  };

  return (
    <div className="w-full flex flex-col rounded-3xl border-2 border-cyan-500/40 bg-slate-950 shadow-[0_0_35px_rgba(6,182,212,0.15)] text-slate-800 dark:text-slate-100 font-sans select-none overflow-visible">
      {/* ========================================================================= */}
      {/* 1. TOP MS WORD EQUATION RIBBON (Home Toolbar & 11 Structures + Symbols)   */}
      {/* ========================================================================= */}
      <div
        ref={dropdownRef}
        className={`p-2.5 text-xs flex flex-col gap-2 select-none overflow-visible rounded-t-3xl z-40 transition-colors border-b ${
          paperTheme === 'white'
            ? 'bg-[#f1f5f9] text-slate-800 border-slate-300 shadow-sm'
            : 'bg-slate-900 text-slate-100 border-cyan-500/30 shadow-md'
        }`}
      >
        {/* ROW 1: Word Standard Formatting Ribbon (Tab Home) */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
          {/* Clipboard Group */}
          <div className="flex items-center gap-1 border-r border-slate-700/60 pr-2">
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = await navigator.clipboard.readText();
                  if (text && editorRef.current) {
                    editorRef.current.focus();
                    restoreCaretPosition();
                    document.execCommand('insertText', false, text);
                    saveCaretPosition();
                  }
                } catch {
                  // clipboard fallback
                }
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="Dán văn bản (Paste)"
            >
              <ClipboardPaste className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-semibold hidden sm:inline">Paste</span>
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('cut')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Cắt (Cut)"
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('copy')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Sao chép (Copy)"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Font Controls */}
          <div className="flex items-center gap-1.5 border-r border-slate-700/60 pr-2">
            <select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                executeFormattingCommand('fontName', e.target.value);
              }}
              className="h-7 px-2 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400"
            >
              <option value="Aptos (Body)">Aptos (Word)</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Cambria Math">Cambria Math</option>
              <option value="Arial">Arial</option>
            </select>

            <select
              value={fontSize}
              onChange={(e) => {
                const sz = Number(e.target.value);
                setFontSize(sz);
                executeFormattingCommand('fontSize', sz > 18 ? '5' : sz > 14 ? '4' : '3');
              }}
              className="h-7 px-1.5 rounded-lg text-xs font-semibold bg-slate-950 border border-slate-700 text-slate-100 outline-none focus:border-cyan-400 w-12"
            >
              {[12, 13, 14, 16, 18, 20, 24].map((sz) => (
                <option key={sz} value={sz}>
                  {sz}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => executeFormattingCommand('bold')}
              className={`p-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                isBold ? 'bg-cyan-500 text-slate-950' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="In đậm (Bold)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('italic')}
              className={`p-1.5 rounded-lg italic text-xs cursor-pointer ${
                isItalic ? 'bg-cyan-500 text-slate-950' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="In nghiêng (Italic)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('underline')}
              className={`p-1.5 rounded-lg underline text-xs cursor-pointer ${
                isUnderline ? 'bg-cyan-500 text-slate-950' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Gạch chân (Underline)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('strikeThrough')}
              className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                isStrikethrough ? 'bg-cyan-500 text-slate-950' : 'hover:bg-slate-800 text-slate-300'
              }`}
              title="Gạch ngang chữ (Strikethrough)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('subscript')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 cursor-pointer"
              title="Chỉ số dưới (x₂)"
            >
              <Subscript className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('superscript')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 cursor-pointer"
              title="Chỉ số trên (x²)"
            >
              <Superscript className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Paragraph Alignment */}
          <div className="hidden md:flex items-center gap-1 border-r border-slate-700/60 pr-2">
            <button
              type="button"
              onClick={() => executeFormattingCommand('justifyLeft')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 cursor-pointer"
              title="Căn trái"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('justifyCenter')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 cursor-pointer"
              title="Căn giữa"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('justifyRight')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 cursor-pointer"
              title="Căn phải"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('justifyFull')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 cursor-pointer"
              title="Căn đều hai bên"
            >
              <AlignJustify className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('insertUnorderedList')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 cursor-pointer"
              title="Danh sách dấu chấm"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeFormattingCommand('insertOrderedList')}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 cursor-pointer"
              title="Danh sách số thứ tự"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Special Cluster: iPad Ink, Voice, Theme */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => setIsIpadDrawingMode(!isIpadDrawingMode)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                isIpadDrawingMode
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-950 text-slate-200 border-slate-700 hover:text-white'
              }`}
            >
              <Pencil className="w-3.5 h-3.5 text-cyan-400" />
              <span>Viết Tay iPad</span>
            </button>

            {hasDrawings && (
              <button
                type="button"
                onClick={clearCanvasStrokes}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-950 text-rose-300 border border-rose-500/50 hover:bg-rose-900 transition-colors cursor-pointer"
                title="Tẩy nét viết tay"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Tẩy Nét</span>
              </button>
            )}

            <button
              type="button"
              onClick={toggleVoiceRecognition}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950'
              }`}
              title="Nói câu trả lời - Nhận diện giọng nói chuyển thành ký tự toán học"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Nói câu trả lời</span>
            </button>

            <button
              type="button"
              onClick={() => setPaperTheme(paperTheme === 'white' ? 'dark' : 'white')}
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Chuyển chế độ Nền Sáng / Tối"
            >
              {paperTheme === 'white' ? (
                <Moon className="w-4 h-4 text-cyan-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          </div>
        </div>

        {/* ROW 2: WORD EQUATION STRUCTURES & π BUTTON (Primary Math Engine) */}
        <div className="flex flex-wrap items-center gap-1.5 relative overflow-visible pt-1">
          {/* Main "π Equation" Action Button */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleInsertNewEquation()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_18px_rgba(6,182,212,0.45)] transition-all cursor-pointer mr-1"
            title="Chèn khung công thức mới trực tiếp vào dòng chữ (Alt + =)"
          >
            <span className="font-serif italic text-lg leading-none">π</span>
            <span>Equation</span>
            <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono">Alt + =</span>
          </button>

          {/* 11 STRUCTURE DROPDOWNS (Matches Microsoft Word 100%) */}
          {WORD_11_STRUCTURES.map((struct) => (
            <div key={struct.id} className="relative overflow-visible">
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  setOpenStructureMenu(openStructureMenu === struct.id ? null : struct.id)
                }
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  openStructureMenu === struct.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-950/90 text-slate-200 border-slate-700 hover:border-cyan-400 hover:text-cyan-300'
                }`}
              >
                <span className="font-mono text-sm leading-none">{struct.iconName}</span>
                <span className="truncate max-w-[85px] sm:max-w-none">{struct.label.split(' ')[0]}</span>
                <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
              </button>

              {/* Floating Structure Menu with Dashed Square Placeholders */}
              {openStructureMenu === struct.id && (
                <div className="absolute left-0 top-full mt-2 w-72 sm:w-84 max-h-96 overflow-y-auto bg-slate-900 border-2 border-cyan-400 rounded-2xl shadow-[0_0_35px_rgba(0,0,0,0.9)] p-3 text-slate-100 z-[99999] animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between text-xs font-black text-cyan-300 border-b border-slate-800 pb-2 mb-2">
                    <span>{struct.label}</span>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setOpenStructureMenu(null)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 mb-2 italic">
                    Bấm chọn mẫu cấu trúc dưới đây để điền số trực tiếp vào các ô vuông nét đứt:
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {struct.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleExecuteStructure(item.latex)}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-950 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-400 text-slate-100 transition-all group shadow-sm cursor-pointer"
                        title={item.name}
                      >
                        <span
                          className="text-sm font-mono text-cyan-200 group-hover:scale-110 transition-transform py-1"
                          dangerouslySetInnerHTML={{ __html: renderKatexSafe(item.preview) }}
                        />
                        <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 mt-1 truncate max-w-full font-medium">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Quick XSTK Bar */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 py-1 rounded-xl text-cyan-300 ml-auto">
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap mr-1">XSTK:</span>
            {QUICK_XSTK_BAR.slice(0, 10).map((sym, idx) => (
              <button
                key={idx}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleInsertSymbol(sym.latex)}
                className="px-1.5 py-0.5 rounded-md hover:bg-cyan-500/20 hover:text-cyan-200 text-xs font-serif font-bold transition-colors cursor-pointer"
                title={sym.name}
              >
                {sym.label}
              </button>
            ))}
          </div>
        </div>

        {/* ROW 3: SYMBOLS GALLERY STRIP & FULL EXPANDED DRAWER */}
        <div className="pt-1 flex items-center justify-between gap-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 py-0.5">
            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap mr-1">Ký hiệu Toán:</span>
            {WORD_SYMBOLS_GALLERY.slice(0, 24).map((sym, sIdx) => (
              <button
                key={sIdx}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleInsertSymbol(sym.latex)}
                className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-cyan-950/80 hover:text-cyan-300 text-slate-200 text-xs font-serif font-bold border border-slate-800/80 hover:border-cyan-400/50 transition-colors cursor-pointer shrink-0"
                title={`${sym.name} (${sym.latex})`}
              >
                {sym.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsSymbolsGalleryExpanded(!isSymbolsGalleryExpanded)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-cyan-400 text-cyan-400 hover:text-cyan-300 text-[11px] font-bold shrink-0 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>{isSymbolsGalleryExpanded ? 'Đóng Kho Ký Hiệu' : 'Mở Toàn Bộ Ký Hiệu Word'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isSymbolsGalleryExpanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* FULL EXPANDED WORD SYMBOLS EXPLORER MODAL */}
        {isSymbolsGalleryExpanded && (
          <div className="flex flex-col gap-2.5 p-3.5 bg-slate-950 rounded-2xl border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-150">
            {/* Header with Search and Category Badges */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <span className="text-cyan-400">Ω</span>
                  <span>KHO KÝ HIỆU TOÁN HỌC & XSTK MICROSOFT WORD</span>
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold border border-cyan-500/40">
                  {WORD_SYMBOLS_GALLERY.length} ký hiệu chuẩn
                </span>
              </div>

              {/* Search input */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm ký hiệu (chi, sigma, kỳ vọng, p-val...)"
                  value={symbolSearchQuery}
                  onChange={(e) => setSymbolSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-7 py-1 text-xs rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-medium"
                />
                {symbolSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setSymbolSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills (Word Official Categories) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {SYMBOL_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setSelectedSymbolCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    selectedSymbolCategory === cat.id
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-500/50 hover:text-white'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="ml-1 opacity-70 text-[10px]">({cat.badge})</span>
                </button>
              ))}
            </div>

            {/* Grid of Filtered Symbols */}
            {(() => {
              const filtered = WORD_SYMBOLS_GALLERY.filter((sym) => {
                const matchesCat =
                  selectedSymbolCategory === 'all' || sym.category === selectedSymbolCategory;
                const matchesSearch =
                  !symbolSearchQuery.trim() ||
                  sym.name.toLowerCase().includes(symbolSearchQuery.toLowerCase()) ||
                  sym.label.toLowerCase().includes(symbolSearchQuery.toLowerCase()) ||
                  sym.latex.toLowerCase().includes(symbolSearchQuery.toLowerCase());
                return matchesCat && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    Không tìm thấy ký hiệu phù hợp với "{symbolSearchQuery}". Vui lòng thử từ khóa khác.
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-14 lg:grid-cols-18 gap-1.5 max-h-56 overflow-y-auto p-1 bg-slate-900/70 rounded-xl border border-slate-800">
                  {filtered.map((sym, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleInsertSymbol(sym.latex)}
                      className="h-10 flex flex-col items-center justify-center rounded-xl bg-slate-950 hover:bg-cyan-500/25 hover:border-cyan-400 text-slate-100 hover:text-cyan-200 text-sm font-serif font-bold border border-slate-800 text-center transition-all cursor-pointer group shadow-sm"
                      title={`${sym.name} - Nhấp để chèn (Mã: ${sym.latex})`}
                    >
                      <span className="group-hover:scale-125 transition-transform">{sym.label}</span>
                    </button>
                  ))}
                </div>
              );
            })()}

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span className="italic">
                💡 Nhấp vào bất kỳ ký hiệu nào để chèn trực tiếp vào vị trí con trỏ của bài làm hoặc công thức.
              </span>
              <button
                type="button"
                onClick={() => setIsSymbolsGalleryExpanded(false)}
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline cursor-pointer"
              >
                Thu gọn bảng
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. DRAFTING CANVAS: WYSIWYG A4 WORD PAGE (CONTENTEDITABLE, MULTI-LINE)     */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-6 bg-[#020617] relative flex flex-col items-center min-h-[420px]">
        {/* Subtle Guide Banner */}
        <div className="w-full max-w-4xl mb-3 flex items-center justify-between text-xs px-2">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Soạn Thảo Chuẩn Word: Tự Động Xuống Hàng Khi Gõ Dài & Chèn Công Thức Inline Cùng Dòng</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            (Bấm "π Equation" hoặc Alt + = để chèn công thức)
          </span>
        </div>

        {/* Speech helper toast */}
        {speechHelperMessage && (
          <div className="w-full max-w-4xl mb-2 px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400/60 text-cyan-200 text-xs font-semibold flex items-center justify-between">
            <span>{speechHelperMessage}</span>
            <button
              type="button"
              onClick={() => setSpeechHelperMessage(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Real A4 Paper Layout Container */}
        <div
          className={`relative w-full max-w-4xl min-h-[380px] rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.6)] border transition-all ${
            paperTheme === 'white'
              ? 'paper-theme-white bg-white border-slate-300 text-slate-900 shadow-md'
              : 'bg-[#030712] border-2 border-cyan-500/50 text-white shadow-[0_0_30px_rgba(6,182,212,0.18)]'
          }`}
        >
          {/* Main Contenteditable Page Sheet */}
          <div
            ref={editorRef}
            contentEditable={true}
            suppressContentEditableWarning={true}
            onKeyUp={saveCaretPosition}
            onMouseUp={saveCaretPosition}
            data-placeholder={placeholder}
            className="word-sheet-editor w-full min-h-[380px] p-6 sm:p-8 outline-none text-sm sm:text-base selection:bg-cyan-500/30 font-medium"
            style={{
              fontFamily: fontFamily.includes('Aptos')
                ? 'system-ui, -apple-system, sans-serif'
                : fontFamily,
              fontSize: `${fontSize}px`,
              color: paperTheme === 'white' ? '#0f172a' : '#ffffff',
            }}
          />

          {/* iPad Freehand Drawing Canvas Overlay */}
          {isIpadDrawingMode && (
            <canvas
              ref={canvasRef}
              width={900}
              height={500}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="absolute inset-0 w-full h-full z-20 cursor-crosshair touch-none"
            />
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM ACTION BAR: SUBMIT TO AI (TỰ ĐỘNG CHUYỂN <MATH-FIELD> THÀNH $) */}
        {/* ========================================================================= */}
        {showSendButton && (
          <div className="w-full max-w-4xl mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400">
              💡 Các công thức <code className="text-cyan-300">π Equation</code> sẽ tự động chuyển thành mã chuẩn để AI chấm điểm chính xác 100%.
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? 'ĐANG GỬI BÀI CHO AI...' : submitButtonText}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordStyleMathEditor;
