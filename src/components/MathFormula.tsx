import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  math: string;
  block?: boolean;
  className?: string;
}

/**
 * Auto-fix LaTeX syntax errors, swallowed control characters, Unicode minus, escaped dollars (\$), missing closing braces, and un-delimited LaTeX commands.
 */
export function sanitizeAndFixMathText(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return rawText || '';
  let text = rawText;

  // 1. Khôi phục các lệnh LaTeX nếu bị JSON nuốt ký tự điều khiển (\f, \b, \t, \r)
  text = text
    .replace(/\x08(ar|eta|inom|egin|mathbf)/g, '\\b$1')
    .replace(/\x0c(rac|orall)/g, '\\f$1')
    .replace(/\t(imes|ext|heta|au|o|frac|rightarrow)/g, '\\t$1')
    .replace(/\r(ight|ho|angle)/g, '\\r$1');

  // 2. Chuẩn hóa dấu trừ Unicode (−) về dấu trừ toán học (-)
  text = text.replace(/−/g, '-');

  // 3. SỬA LỖI `\$` LÀM VỠ CÔNG THỨC Ở BẢN ĐỒ TƯ DUY:
  // Nếu có dấu `\$` nằm sau các lệnh LaTeX hoặc trước dấu chấm câu (; , . ) làm lẻ cặp dấu $,
  // chuyển `\$` về lại dấu đóng `$` chuẩn.
  text = text.replace(/\\\$(?=\s*[;,.।)|\]\s]|$)/g, '$');

  // Đếm số lượng dấu $ đơn (không tính $$). Nếu vẫn bị lẻ do còn 1 dấu \$ bị escape nhầm, gỡ bỏ dấu \ đó:
  const singleDollars = text.replace(/\$\$/g, '').match(/(?<!\\)\$/g) || [];
  if (singleDollars.length % 2 !== 0 && text.includes('\\$')) {
    text = text.replace(/\\\$/g, '$');
  }

  // 4. Hàm cân bằng dấu ngoặc nhọn { } bị thiếu bên trong biểu thức toán
  const balanceBraces = (str: string) => {
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
      if (str[i] === '{' && str[i - 1] !== '\\') depth++;
      else if (str[i] === '}' && str[i - 1] !== '\\') {
        if (depth > 0) depth--;
      }
    }
    return depth > 0 ? str + '}'.repeat(depth) : str;
  };

  // 5. Nếu chuỗi bị lẻ dấu $ (mở $ mà quên đóng $ ở cuối), tự động đóng $ lại
  const updatedSingleDollars = text.replace(/\$\$/g, '').match(/(?<!\\)\$/g) || [];
  if (updatedSingleDollars.length % 2 !== 0) {
    text = text + '$';
  }

  // 6. NGUYÊN TẮC AN TOÀN:
  // - Nếu chuỗi ĐÃ CÓ SẴN dấu $ hoặc \( hoặc \[, TUYỆT ĐỐI KHÔNG tự ý bọc thêm dấu $ nữa (để không làm hỏng Bản đồ tư duy và các công thức đang hiển thị đúng). Chỉ cân bằng ngoặc { } bên trong các cặp $...$ hiện có.
  const hasDelimiters = /(\$|\\\(|\\\[)/.test(text);
  if (hasDelimiters) {
    return text.replace(/\$([^$]+)\$/g, (_, inner) => '$' + balanceBraces(inner) + '$');
  }

  // - Chỉ khi chuỗi HOÀN TOÀN CHƯA CÓ dấu $ nào mà lại chứa lệnh LaTeX trần (\frac, \sqrt, \int, \sum, \implies...) thì mới bọc $...$:
  const hasNakedLatex = /\\(frac|tfrac|sqrt|int|iint|sum|prod|left|right|implies|iff|bar|hat|vec|mathbf|text|rightarrow|Rightarrow)/.test(text);
  if (hasNakedLatex) {
    return '$' + balanceBraces(text.trim()) + '$';
  }

  return text;
}

/**
 * Clean up common artifacts in LaTeX math strings and fix broken syntax
 */
export function cleanLatexString(raw: string): string {
  if (!raw) return '';
  const sanitized = sanitizeAndFixMathText(raw);
  let cleaned = sanitized
    .trim()
    .replace(/\\?\\?ellipsis/gi, '\\dots')
    .replace(/…/g, '\\dots')
    .replace(/\\\\/g, '\\');

  // Balance curly braces { and }
  let openBraces = 0;
  let inEscape = false;
  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '\\' && !inEscape) {
      inEscape = true;
      continue;
    }
    if (!inEscape) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces = Math.max(0, openBraces - 1);
    }
    inEscape = false;
  }

  if (openBraces > 0) {
    cleaned += '}'.repeat(openBraces);
  }

  return cleaned;
}

/**
 * Safely render a LaTeX math formula via KaTeX
 */
export function renderKatexSafe(mathStr: string, isBlock = false): string {
  if (!mathStr) return '';
  try {
    const clean = cleanLatexString(mathStr);
    return katex.renderToString(clean, {
      displayMode: isBlock,
      throwOnError: false,
      strict: false,
    });
  } catch (err) {
    // Fallback on unexpected syntax failure
    return `<span class="font-mono text-cyan-300 font-bold">${cleanLatexString(mathStr)}</span>`;
  }
}

/**
 * Component for dedicated math expressions
 */
export const MathFormula: React.FC<MathFormulaProps> = ({
  math,
  block = false,
  className = '',
}) => {
  const html = useMemo(() => {
    if (!math) return '';
    return renderKatexSafe(math, block);
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`my-2.5 overflow-x-auto text-center py-2.5 px-4 bg-slate-950/90 rounded-2xl border-2 border-cyan-500/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-sm font-mono ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block mx-0.5 font-mono text-cyan-300 font-semibold align-middle ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export interface MathSegment {
  type: 'text' | 'math';
  content: string;
  isBlock?: boolean;
  html?: string;
}

/**
 * Parse any mixed Vietnamese text containing LaTeX math formulas (with or without $ delimiters)
 * Keeps complete equations like "\epsilon = 1.96 \cdot \sqrt{\frac{p(1-p)}{n}}" intact.
 */
export function parseMathSegments(text: string): MathSegment[] {
  if (!text) return [];
  const sanitizedText = sanitizeAndFixMathText(text);

  // Regex pattern matching:
  // 1. $$...$$ block math
  // 2. \[...\] block math
  // 3. $...$ inline math
  // 4. \(...\) inline math
  // 5. Unescaped math equations containing LaTeX commands:
  //    Matches equations starting with optional LHS or standalone commands like \epsilon, \dots, \frac, \sqrt, \int, \sum, \mu, \sigma, etc.
  const mathPattern = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\(.*?\\\)|(?:\b[A-Za-z0-9_().,|+\-\/*\^\s]+\s*=\s*)?\\(?:epsilon|dots|ldots|cdots|mu|sigma|alpha|beta|lambda|theta|Phi|phi|chi|Omega|frac|sqrt|int|sum|cdot|times|pm|le|ge|ne|approx|sim|bar|hat|vec|infty|in|forall|exists|Rightarrow|Leftrightarrow)\b(?:[^{}\s,;.!?]|(?:\{[^{}]*\}))*)/g;

  const segments: MathSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathPattern.exec(sanitizedText)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: sanitizedText.slice(lastIndex, match.index),
      });
    }

    const raw = match[0];
    let isBlock = false;
    let mathContent = raw;

    if (raw.startsWith('$$') && raw.endsWith('$$')) {
      isBlock = true;
      mathContent = raw.slice(2, -2);
    } else if (raw.startsWith('\\[') && raw.endsWith('\\]')) {
      isBlock = true;
      mathContent = raw.slice(2, -2);
    } else if (raw.startsWith('$') && raw.endsWith('$')) {
      isBlock = false;
      mathContent = raw.slice(1, -1);
    } else if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
      isBlock = false;
      mathContent = raw.slice(2, -2);
    }

    segments.push({
      type: 'math',
      content: mathContent,
      isBlock,
      html: renderKatexSafe(mathContent, isBlock),
    });

    lastIndex = match.index + raw.length;
  }

  if (lastIndex < sanitizedText.length) {
    segments.push({
      type: 'text',
      content: sanitizedText.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Universal component that takes any string (plain Vietnamese text, paragraphs, LaTeX formulas)
 * and formats math formulas seamlessly using KaTeX without breaking the surrounding text.
 */
export const MathText: React.FC<{
  text?: string;
  className?: string;
  inline?: boolean;
}> = ({ text, className = '', inline = false }) => {
  const safeText = text || '';
  const segments = useMemo(() => parseMathSegments(safeText), [safeText]);

  if (!safeText) return null;

  const content = segments.map((seg, idx) => {
    if (seg.type === 'math') {
      if (seg.isBlock && !inline) {
        return (
          <div
            key={idx}
            className="my-2 text-center overflow-x-auto py-1 px-2 text-cyan-200"
            dangerouslySetInnerHTML={{ __html: seg.html || seg.content }}
          />
        );
      }
      return (
        <span
          key={idx}
          className="inline-block mx-0.5 text-cyan-300 font-mono font-medium align-middle"
          dangerouslySetInnerHTML={{ __html: seg.html || seg.content }}
        />
      );
    }

    // Text segment: split by line breaks to preserve formatting
    const lines = seg.content.split('\n');
    return (
      <span key={idx}>
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {line}
            {lIdx < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </span>
    );
  });

  if (inline) {
    return <span className={className}>{content}</span>;
  }

  return <div className={`leading-relaxed ${className}`}>{content}</div>;
};

/**
 * Render mixed text into pure HTML with embedded KaTeX spans for export documents (PDF/Word)
 */
export function renderMathToHtml(text: string): string {
  if (!text) return '';
  const segments = parseMathSegments(text);
  return segments
    .map((seg) => {
      if (seg.type === 'math') {
        return seg.html || seg.content;
      }
      return seg.content.replace(/\n/g, '<br>');
    })
    .join('');
}
