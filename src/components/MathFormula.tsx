import React, { useMemo } from 'react';
import katex from 'katex';

interface MathFormulaProps {
  math: string;
  block?: boolean;
  className?: string;
}

/**
 * Phục hồi khoảng trắng cho các cụm từ thuật ngữ toán - thống kê bị dính chữ (sticky words)
 */
export function fixStuckVietnameseMathWords(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let res = raw;
  const phrases: [RegExp, string][] = [
    [/Vớimỗidựáni/gi, 'Với mỗi dự án $i$'],
    [/Vớimỗidựán/gi, 'Với mỗi dự án '],
    [/mỗidựán/gi, 'mỗi dự án '],
    [/dựáni/gi, 'dự án $i$'],
    [/dựán/gi, 'dự án '],
    [/kỳvọngthànhphầnlà/gi, 'kỳ vọng thành phần là '],
    [/kỳvọngthànhphần/gi, 'kỳ vọng thành phần '],
    [/thànhphầnlà/gi, 'thành phần là '],
    [/thànhphần/gi, 'thành phần '],
    [/kỳvọng/gi, 'kỳ vọng '],
    [/Docácbiếncốđộclập/gi, 'Do các biến cố độc lập, '],
    [/cácbiếncốđộclập/gi, 'các biến cố độc lập'],
    [/biếncốđộclập/gi, 'biến cố độc lập'],
    [/biếncố/gi, 'biến cố '],
    [/độclập/gi, 'độc lập '],
    [/phươngsaitổngbằngtổngcácphươngsai/gi, 'phương sai tổng bằng tổng các phương sai'],
    [/phươngsaitổng/gi, 'phương sai tổng '],
    [/tổngbằngtổngcácphươngsai/gi, 'tổng bằng tổng các phương sai'],
    [/tổngbằngtổng/gi, 'tổng bằng tổng '],
    [/cácphươngsai/gi, 'các phương sai '],
    [/phươngsai/gi, 'phương sai '],
    [/từđósuyrađộlệchchuẩn/gi, 'từ đó suy ra độ lệch chuẩn '],
    [/từđósuyra/gi, 'từ đó suy ra '],
    [/từđó/gi, 'từ đó '],
    [/suyrađộlệchchuẩn/gi, 'suy ra độ lệch chuẩn '],
    [/suyra/gi, 'suy ra '],
    [/độlệchchuẩn/gi, 'độ lệch chuẩn '],
    [/biếnngẫunhiên/gi, 'biến ngẫu nhiên '],
    [/xácsuất/gi, 'xác suất '],
    [/phânphốixácsuất/gi, 'phân phối xác suất '],
    [/phânphốichuẩn/gi, 'phân phối chuẩn '],
    [/phânphối/gi, 'phân phối '],
    [/khoảngướclượng/gi, 'khoảng ước lượng '],
    [/ướclượng/gi, 'ước lượng '],
    [/kiểmđịnhgiảthuyết/gi, 'kiểm định giả thuyết '],
    [/kiểmđịnh/gi, 'kiểm định '],
    [/giảthuyết/gi, 'giả thuyết '],
    [/tiêuchuẩn/gi, 'tiêu chuẩn '],
    [/đồngthời/gi, 'đồng thời ']
  ];
  for (const [re, rep] of phrases) {
    res = res.replace(re, rep);
  }
  res = res.replace(/,\s*,/g, ',');
  res = res.replace(/[ \t]{2,}/g, ' ');
  return res;
}

/**
 * Auto-fix LaTeX syntax errors, swallowed control characters, Unicode minus, escaped dollars (\$), missing closing braces, and un-delimited LaTeX commands.
 */
export function sanitizeAndFixMathText(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';
  let text = fixStuckVietnameseMathWords(rawText.trim());

  // Chống lỗi hiển thị "undefined" hoặc "null"
  if (text === 'undefined' || text === 'null') {
    return '';
  }
  text = text.replace(/:\s*undefined\b/gi, ': ');
  text = text.replace(/\bundefined\b/gi, '');

  // 0. Thu gọn các chuỗi lặp dấu $ (ví dụ $$$ hoặc $$$$) thành dấu $ hợp lệ
  text = text.replace(/\${3,}/g, '$');

  // A. Khắc phục lỗi dính chữ (Sticky text):
  // - Tách dòng và khoảng cách rõ ràng trước Bước / Câu / Bài / Phần
  text = text.replace(/(?<!\n)\s*(?:[.]\s*)?(\b(?:Bước|Bài|Câu|Phần|Ví dụ)\s*\d+\s*:)/gi, '\n\n$1 ');

  // - Xóa dấu chấm thừa bị kẹt trước Bước (ví dụ ".$$ .Bước 2" hoặc ".Bước 2" -> "Bước 2")
  text = text.replace(/(?:^|\n)\s*\.\s*(\b(?:Bước|Bài|Câu|Phần)\s*\d+)/gi, '\n$1');

  // - Tự động giãn cách sau dấu phẩy, chấm phẩy nếu bị dính chữ (ví dụ: "i,kỳ vọng" -> "i, kỳ vọng")
  text = text.replace(/([,;])([A-ZÀ-Ỹa-zà-ỹ])/gu, '$1 $2');

  // - Tự động giãn cách sau dấu hai chấm nếu bị dính chữ (ví dụ: "Ví dụ:Tính" -> "Ví dụ: Tính"), bỏ qua URL
  text = text.replace(/(?<!https?|ftp):([A-ZÀ-Ỹa-zà-ỹ0-9])/gu, ': $1');

  // - Tự động giãn cách sau dấu đóng ngoặc đơn nếu dính chữ (ví dụ: "(X)là" -> "(X) là")
  text = text.replace(/\)([A-ZÀ-Ỹa-zà-ỹ])/gu, ') $1');

  // - Tự động giãn cách sau dấu chấm câu nếu bị dính chữ trước chữ hoa (ví dụ: "5.Ta có" -> "5. Ta có", bảo toàn 3.14 hay 0.05)
  text = text.replace(/\.([A-ZÀ-Ỹ])/gu, '. $1');

  // - Tự động thêm khoảng cách giữa công thức $...$ và từ tiếng Việt dính sát vào nó
  text = text.replace(/(\$[^\$\n]+\$)([A-ZÀ-Ỹa-zà-ỹ])/gu, '$1 $2');
  text = text.replace(/([A-ZÀ-Ỹa-zà-ỹ])(\$[^\$\n]+\$)/gu, '$1 $2');

  // B. GIẢI CỨU VĂN BẢN TIẾNG VIỆT BỊ BỌC NHẦM TRONG DẤU $:
  // Nếu một cặp $...$ chứa nhiều từ tiếng Việt có dấu (ví dụ "$Bước 2: Với mỗi dự án...$"),
  // KaTeX sẽ nuốt hết khoảng trắng và in nghiêng chữ. Phải gỡ bỏ dấu $ bao ngoài và chỉ giữ lại $ cho công thức thực sự.
  text = text.replace(/(?<!\$)\$([^\$\n]+?)\$(?!\$)/g, (match, inner) => {
    // Nếu khối math chứa tiếng Việt có dấu cách (chắc chắn là câu/đoạn văn bị bọc nhầm)
    if (/[À-ỹ]/.test(inner) && /\s+[A-Za-zÀ-ỹ]/.test(inner)) {
      // Đưa các công thức toán bên trong thành cặp $ riêng
      let rescued = inner
        .replace(/(E\([A-Za-z0-9_]+\)\s*=\s*[^,;.\n]+)/g, '$$$1$$')
        .replace(/((?:\\text\{Var\}|Var)\([A-Za-z0-9_]+\)\s*=\s*[^,;.\n]+)/g, '$$$1$$')
        .replace(/(\\sigma\([A-Za-z0-9_]+\)\s*=\s*\\sqrt\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, '$$$1$$');
      return rescued;
    }
    return match;
  });

  // C. Khắc phục triệt để lỗi gõ nhầm `=/sqrt`, `=/\sqrt`, `/sqrt`, `\sqrt Var(X)`
  text = text.replace(/([=+\-*/(,])\s*\/\s*\\?sqrt\b/gi, '$1 \\sqrt');
  text = text.replace(/(^|[\s(])\/\s*\\?sqrt\b/gi, '$1\\sqrt');

  // Chuẩn hóa \sqrt(...) thành \sqrt{...}
  text = text.replace(/\\sqrt\s*\(([^)]+)\)/g, '\\sqrt{$1}');

  // Chuẩn hóa \sqrt Var(X) hoặc \sqrt{Var(X)} thành \sqrt{\text{Var}(X)}
  text = text.replace(/\\sqrt\s*\{?\s*(?:\\text\{)?Var\}?\s*\(([^)]+)\)\s*\}?/gi, '\\sqrt{\\text{Var}($1)}');

  // Chuẩn hóa \sqrt trần không có ngoặc: ví dụ \sqrt X -> \sqrt{X}
  text = text.replace(/\\sqrt\s+([A-Za-z0-9_]+)(?![a-zA-Z0-9_{])/g, '\\sqrt{$1}');

  // Chuẩn hóa nếu có \sigma(X) = \sqrt{\text{Var}(X)} đứng trần ngoài dấu $
  text = text.replace(/(?<!\$)\s*(\\sigma\s*\([^)]+\)\s*=\s*\\sqrt\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})\s*(?!\$)/g, ' $$$1$$ ');

  // 1. Chuẩn hóa các công thức toán xác suất dạng pseudo-code sang KaTeX inline math chuẩn ($...$)
  text = text.replace(/(?<!\$)\bE\(X\)\s*=\s*E\(X_A\)\s*\+\s*E\(X_B\)\s*\+\s*E\(X_C\)\b(?!\$)/g, '$E(X) = E(X_A) + E(X_B) + E(X_C)$');
  text = text.replace(/(?<!\$)\bE\(X_i\)\s*=\s*p_i\s*[*·\u00B7]\s*r_i\b(?!\$)/g, '$E(X_i) = p_i \\cdot r_i$');
  text = text.replace(/(?<!\$)\b(?:\\text\{Var\}|Var)\(X\)\s*=\s*(?:\\text\{Var\}|Var)\(X_A\)\s*\+\s*(?:\\text\{Var\}|Var)\(X_B\)\s*\+\s*(?:\\text\{Var\}|Var)\(X_C\)\b(?!\$)/g, '$\\text{Var}(X) = \\text{Var}(X_A) + \\text{Var}(X_B) + \\text{Var}(X_C)$');
  text = text.replace(/(?<!\$)\bf\s*=\s*m\s*\/\s*n\b(?!\$)/g, '$f = \\frac{m}{n}$');

  // Khôi phục các lệnh LaTeX nếu bị JSON nuốt ký tự điều khiển (\f, \b, \t, \r)
  text = text
    .replace(/\x08(ar|eta|inom|egin|mathbf)/g, '\\b$1')
    .replace(/\x0c(rac|orall)/g, '\\f$1')
    .replace(/\t(imes|ext|heta|au|o|frac|rightarrow)/g, '\\t$1')
    .replace(/\r(ight|ho|angle)/g, '\\r$1');

  // Chuẩn hóa dấu trừ Unicode (−) về dấu trừ toán học (-)
  text = text.replace(/−/g, '-');

  // SỬA LỖI \$ LÀM VỠ CÔNG THỨC Ở BẢN ĐỒ TƯ DUY:
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
  // - Nếu chuỗi ĐÃ CÓ SẴN dấu $ hoặc \( hoặc \[, TUYỆT ĐỐI KHÔNG tự ý bọc thêm dấu $ nữa.
  // Cân bằng ngoặc { } bên trong các khối math đã delimit ($$ trước, sau đó là $)
  const hasDelimiters = /(\$|\\\(|\\\[)/.test(text);
  if (hasDelimiters) {
    let balanced = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, inner) => '$$' + balanceBraces(inner) + '$$');
    balanced = balanced.replace(/(?<!\$)\$([^$\n]+?)\$(?!\$)/g, (_, inner) => '$' + balanceBraces(inner) + '$');
    return balanced;
  }

  // - Chỉ khi chuỗi là MỘT CÔNG THỨC TOÁN TRẦN ĐƠN LẺ KHÔNG CHỨA TIẾNG VIỆT (ví dụ "\frac{a}{b}" hoặc "\int_0^1 x dx") thì mới bọc $...$.
  // Nếu là đoạn văn tiếng Việt có chứa công thức trần bên trong thì KHÔNG bọc $ toàn bộ chuỗi (để parseMathSegments tự bóc tách từng công thức mà không làm dính chữ văn bản).
  const isPureMathFormula = !/[À-ỹ]/.test(text) && /^(\s*(\\[a-zA-Z]+|[0-9a-zA-Z_()=+\-*/^.]+\s*=\s*\\[a-zA-Z]+))/i.test(text);
  if (isPureMathFormula) {
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

  // 1. Gỡ bỏ toàn bộ dấu bao quanh ($...$, $$...$$, \(...\), \[...\]) vì KaTeX renderToString nhận chuỗi thuần
  while (/^\s*(\${1,2}|\\\[|\\\()/.test(cleaned) && /(\${1,2}|\\\]|\\\))\s*$/.test(cleaned)) {
    cleaned = cleaned
      .replace(/^\s*(\${1,2}|\\\[|\\\()/, '')
      .replace(/(\${1,2}|\\\]|\\\))\s*$/, '')
      .trim();
  }
  // Gỡ bỏ các dấu $ đơn lẻ còn sót ở đầu hoặc đuôi
  cleaned = cleaned.replace(/^\${1,2}/, '').replace(/\${1,2}$/, '').trim();

  // 2. Thoát dấu % bên trong công thức KaTeX (trong LaTeX, % là ghi chú dẫn tới mất phần còn lại)
  cleaned = cleaned.replace(/(?<!\\)%/g, '\\%');

  // 3. Khắc phục lỗi gõ nhầm `=/sqrt` hoặc `=/\sqrt` hoặc `/sqrt` hoặc `\sqrt Var(X)`
  cleaned = cleaned
    .replace(/([=+\-*/(,])\s*\/\s*\\?sqrt\b/gi, '$1 \\sqrt')
    .replace(/(^|[\s(])\/\s*\\?sqrt\b/gi, '$1\\sqrt')
    .replace(/\\sqrt\s*\(([^)]+)\)/g, '\\sqrt{$1}')
    .replace(/\\sqrt\s*\{?\s*(?:\\text\{)?Var\}?\s*\(([^)]+)\)\s*\}?/gi, '\\sqrt{\\text{Var}($1)}')
    .replace(/\\sqrt\s+([A-Za-z0-9_]+)(?![a-zA-Z0-9_{])/g, '\\sqrt{$1}')
    .replace(/(?<!\\)\bsqrt\s*\(/g, '\\sqrt(');

  // 4. Chuyển đổi các ký tự toán học Unicode về lệnh LaTeX chuẩn
  cleaned = cleaned
    .replace(/≤/g, '\\le ')
    .replace(/≥/g, '\\ge ')
    .replace(/≠/g, '\\ne ')
    .replace(/≈/g, '\\approx ')
    .replace(/±/g, '\\pm ')
    .replace(/×/g, '\\times ')
    .replace(/·/g, '\\cdot ')
    .replace(/∞/g, '\\infty ')
    .replace(/√/g, '\\sqrt ');

  // 5. Chuẩn hóa các ký tự Hy Lạp Unicode thường gặp trong XSTK
  cleaned = cleaned
    .replace(/μ/g, '\\mu ')
    .replace(/σ/g, '\\sigma ')
    .replace(/α/g, '\\alpha ')
    .replace(/β/g, '\\beta ')
    .replace(/λ/g, '\\lambda ')
    .replace(/θ/g, '\\theta ')
    .replace(/ε|ϵ/g, '\\varepsilon ')
    .replace(/Φ/g, '\\Phi ')
    .replace(/φ/g, '\\phi ')
    .replace(/π/g, '\\pi ')
    .replace(/χ/g, '\\chi ')
    .replace(/Ω/g, '\\Omega ')
    .replace(/δ/g, '\\delta ');

  // 6. Chuẩn hóa toán tử thống kê sang \text{...}
  cleaned = cleaned
    .replace(/(?<!\\text\{)Var\(/g, '\\text{Var}(')
    .replace(/(?<!\\text\{)Cov\(/g, '\\text{Cov}(')
    .replace(/(?<!\\text\{)Mod\(/g, '\\text{Mod}(')
    .replace(/(?<!\\text\{)Med\(/g, '\\text{Med}(');

  // 7. Chuẩn hóa lệnh \sqrt chưa có ngoặc nhọn
  cleaned = cleaned.replace(/\\sqrt\s+([A-Za-z0-9_()]+)(?![a-zA-Z0-9_{])/g, '\\sqrt{$1}');

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
  if (!mathStr || typeof mathStr !== 'string') return '';
  const trimmed = mathStr.trim();
  if (trimmed === 'undefined' || trimmed === 'null' || trimmed === '\\undefined') return '';
  try {
    const clean = cleanLatexString(trimmed);
    if (!clean || clean === 'undefined' || clean === 'null' || clean === '\\undefined') return '';
    const rendered = katex.renderToString(clean, {
      displayMode: isBlock,
      throwOnError: false,
      strict: false,
    });
    // Nếu KaTeX gặp lỗi cú pháp và trả về span đỏ katex-error, thử gỡ dấu câu cuối câu hoặc hiển thị font toán đẹp mắt
    if (rendered.includes('katex-error') || rendered.includes('color:#cc0000')) {
      const strippedPunct = clean.replace(/[.,;:]$/, '').trim();
      if (strippedPunct !== clean) {
        const retry = katex.renderToString(strippedPunct, {
          displayMode: isBlock,
          throwOnError: false,
          strict: false,
        });
        if (!retry.includes('katex-error') && !retry.includes('color:#cc0000')) {
          return retry + clean.slice(-1);
        }
      }
      return `<span class="font-mono text-cyan-300 font-semibold">${clean}</span>`;
    }
    return rendered;
  } catch (err) {
    // Fallback an toàn khi có lỗi ngoại lệ
    return `<span class="font-mono text-cyan-300 font-semibold">${cleanLatexString(mathStr)}</span>`;
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
        className={`my-3 overflow-x-auto text-center py-3.5 px-5 bg-slate-950/90 rounded-2xl border-2 border-cyan-500/40 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-base sm:text-lg font-mono ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`inline-block mx-0.5 font-mono text-cyan-300 font-semibold align-middle text-sm sm:text-base ${className}`}
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
 * Trích xuất an toàn một lệnh LaTeX trần cùng đầy đủ tham số ngoặc nhọn { }, ngoặc vuông [ ],
 * hỗ trợ lồng nhau nhiều cấp (ví dụ \sqrt{\text{Var}(X)} hoặc \frac{\sum (x-\mu)^2}{n})
 */
function extractLatexCommandWithArgs(text: string, startIndex: number): { math: string; endIndex: number } | null {
  if (text[startIndex] !== '\\') return null;
  const cmdMatch = text.slice(startIndex).match(/^\\[a-zA-Z]+/);
  if (!cmdMatch) return null;

  let pos = startIndex + cmdMatch[0].length;

  while (pos < text.length) {
    let tempPos = pos;
    while (tempPos < text.length && (text[tempPos] === ' ' || text[tempPos] === '\t')) {
      tempPos++;
    }

    if (tempPos < text.length && (text[tempPos] === '{' || text[tempPos] === '[')) {
      const openChar = text[tempPos];
      const closeChar = openChar === '{' ? '}' : ']';
      let depth = 1;
      let scanPos = tempPos + 1;
      while (scanPos < text.length && depth > 0) {
        if (text[scanPos] === openChar && text[scanPos - 1] !== '\\') depth++;
        else if (text[scanPos] === closeChar && text[scanPos - 1] !== '\\') depth--;
        scanPos++;
      }
      if (depth === 0) {
        pos = scanPos;
        continue;
      }
    }

    if (pos < text.length && (text[pos] === '_' || text[pos] === '^')) {
      pos++;
      if (pos < text.length && text[pos] === '{') {
        let depth = 1;
        pos++;
        while (pos < text.length && depth > 0) {
          if (text[pos] === '{' && text[pos - 1] !== '\\') depth++;
          else if (text[pos] === '}' && text[pos - 1] !== '\\') depth--;
          pos++;
        }
      } else if (pos < text.length && /[a-zA-Z0-9]/.test(text[pos])) {
        pos++;
      }
      continue;
    }

    if (tempPos < text.length && text[tempPos] === '(') {
      let depth = 1;
      let scanPos = tempPos + 1;
      while (scanPos < text.length && depth > 0) {
        if (text[scanPos] === '(' && text[scanPos - 1] !== '\\') depth++;
        else if (text[scanPos] === ')' && text[scanPos - 1] !== '\\') depth--;
        scanPos++;
      }
      if (depth === 0) {
        pos = scanPos;
        continue;
      }
    }

    break;
  }

  return {
    math: text.slice(startIndex, pos),
    endIndex: pos,
  };
}

/**
 * Quét các phân đoạn văn bản thường (không có $) để phát hiện công thức LaTeX trần
 */
function parseNakedLatexInTextSegment(text: string): MathSegment[] {
  const segments: MathSegment[] = [];
  if (!text) return segments;

  if (!text.includes('\\')) {
    return [{ type: 'text', content: text }];
  }

  const regex = /(?:(?<![a-zA-ZÀ-ỹ])(?:(?:\\[a-zA-Z]+|[A-Za-z](?:_[A-Za-z0-9]+)?)(?:\([A-Za-z0-9_]+\))?\s*=\s*)?\\(?:frac|tfrac|cfrac|sqrt|sum|prod|int|iint|iiint|oint|lim|mu|sigma|alpha|beta|gamma|lambda|theta|phi|Phi|epsilon|Delta|delta|omega|Omega|pi|rho|tau|chi|dots|ldots|cdots|cdot|times|pm|le|ge|leq|geq|ne|neq|approx|sim|infty|to|rightarrow|Rightarrow|leftarrow|implies|iff|hat|bar|vec|mathbf|mathbb|text)\b)/gu;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    if (matchStart > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, matchStart),
      });
    }

    const fullMatchStr = match[0];
    const slashIdx = fullMatchStr.indexOf('\\');
    const lhs = fullMatchStr.slice(0, slashIdx);
    const cmdStartInText = matchStart + slashIdx;

    const extracted = extractLatexCommandWithArgs(text, cmdStartInText);
    if (extracted) {
      let formula = lhs + extracted.math;
      let finalEndIndex = extracted.endIndex;

      while (finalEndIndex < text.length) {
        const chainMatch = text.slice(finalEndIndex).match(/^\s*([+\-*/=·]|\\cdot|\\times|\\approx|\\le|\\ge|\\ne|\\sim)\s*/);
        if (!chainMatch) break;

        const nextStart = finalEndIndex + chainMatch[0].length;
        if (nextStart < text.length && text[nextStart] === '\\') {
          const nextExtracted = extractLatexCommandWithArgs(text, nextStart);
          if (nextExtracted) {
            formula += text.slice(finalEndIndex, nextExtracted.endIndex);
            finalEndIndex = nextExtracted.endIndex;
            continue;
          }
        }

        const symbolMatch = text.slice(nextStart).match(/^[a-zA-Z0-9_().%]+(?:\^[0-9]+)?/);
        if (symbolMatch) {
          formula += text.slice(finalEndIndex, nextStart + symbolMatch[0].length);
          finalEndIndex = nextStart + symbolMatch[0].length;
          continue;
        }
        break;
      }

      segments.push({
        type: 'math',
        content: formula,
        isBlock: false,
        html: renderKatexSafe(formula, false),
      });

      lastIndex = finalEndIndex;
      regex.lastIndex = finalEndIndex;
    } else {
      segments.push({
        type: 'text',
        content: text.slice(matchStart, matchStart + match[0].length),
      });
      lastIndex = matchStart + match[0].length;
    }
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Phân tích cú pháp chuỗi văn bản hỗn hợp (tiếng Việt & công thức toán học KaTeX).
 * Ưu tiên các khối chuẩn ($$...$$, \[...\], \(...\), $...$), sau đó quét an toàn công thức trần.
 */
export function parseMathSegments(text: string): MathSegment[] {
  if (!text) return [];
  const sanitizedText = sanitizeAndFixMathText(text);

  const delimiterPattern = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|(?<!\\)\$([^\$\n]+?)(?<!\\)\$|\\\(.*?\\\))/g;

  const segments: MathSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = delimiterPattern.exec(sanitizedText)) !== null) {
    if (match.index > lastIndex) {
      const textChunk = sanitizedText.slice(lastIndex, match.index);
      segments.push(...parseNakedLatexInTextSegment(textChunk));
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
    } else if (raw.startsWith('\\(') && raw.endsWith('\\)')) {
      isBlock = false;
      mathContent = raw.slice(2, -2);
    } else if (raw.startsWith('$') && raw.endsWith('$')) {
      isBlock = false;
      mathContent = raw.slice(1, -1);
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
    const textChunk = sanitizedText.slice(lastIndex);
    segments.push(...parseNakedLatexInTextSegment(textChunk));
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
            className="my-3 text-center overflow-x-auto py-2.5 px-3 text-cyan-200 text-base sm:text-lg font-mono"
            dangerouslySetInnerHTML={{ __html: seg.html || seg.content }}
          />
        );
      }
      return (
        <span
          key={idx}
          className="inline-block mx-0.5 text-cyan-300 font-mono font-medium align-middle text-sm sm:text-base"
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
