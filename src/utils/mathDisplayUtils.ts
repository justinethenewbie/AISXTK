import katex from 'katex';

/**
 * Clean and convert raw mathematical input (such as "int(0, 2, 3*x^2)", "int(-inf, +inf, ...)",
 * "sqrt(2*pi)", "Phi(1.96)", "e^(x)", "sum(1, 10, x^2)") into standard KaTeX notation.
 */
export function convertRawMathToTex(raw: string): string {
  if (!raw || !raw.trim()) return '0';
  let s = raw.trim();

  // If already standard LaTeX formula
  if (s.startsWith('\\int') || s.startsWith('\\frac') || s.startsWith('\\sum')) {
    return s;
  }

  // 1. Definite integral with 3 args: int(a, b, f(x))
  // Handles nested expressions by matching outer int(...)
  s = s.replace(/int\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(.+)\s*\)$/g, (_m, a, b, f) => {
    return `\\int_{${cleanLimit(a)}}^{${cleanLimit(b)}} ${cleanExpr(f)} \\, dx`;
  });

  // Partial integral while typing: int(a, b, f
  s = s.replace(/int\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*(.*)$/g, (_m, a, b, f) => {
    return `\\int_{${cleanLimit(a)}}^{${cleanLimit(b)}} ${cleanExpr(f)} \\, dx`;
  });

  // Open integral tag: int(a, or int(
  s = s.replace(/int\s*\(\s*([^,]+)\s*,\s*$/g, (_m, a) => `\\int_{${cleanLimit(a)}} `);
  s = s.replace(/int\s*\(\s*$/g, '\\int ');

  // Summation: sum(a, b, f(x))
  s = s.replace(/sum\s*\(\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/g, (_m, a, b, f) => {
    return `\\sum_{x=${a.trim()}}^{${b.trim()}} ${cleanExpr(f)}`;
  });

  return cleanExpr(s);

  function cleanLimit(lim: string): string {
    const l = lim.trim();
    if (l === '-inf') return '-\\infty';
    if (l === '+inf') return '+\\infty';
    if (l === 'inf') return '\\infty';
    return cleanExpr(l);
  }

  function cleanExpr(expr: string): string {
    if (!expr) return '';
    let res = expr;

    // Square root: sqrt(expr)
    res = res.replace(/sqrt\s*\(([^)]+)\)/g, (_m, inner) => `\\sqrt{${cleanExpr(inner)}}`);

    // Cumulative Normal Distribution: Phi(z) or P(Z <= z)
    res = res.replace(/Phi\s*\(([^)]+)\)/g, (_m, z) => `\\Phi(${cleanExpr(z)})`);

    // Combinatorics: nCr(n, k) and nPr(n, k)
    res = res.replace(/nCr\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/g, (_m, n, k) => `C_{${n.trim()}}^{${k.trim()}}`);
    res = res.replace(/nPr\s*\(\s*([^,]+)\s*,\s*([^)]+)\s*\)/g, (_m, n, k) => `A_{${n.trim()}}^{${k.trim()}}`);

    // Exponential: e^(...) or e^x
    res = res.replace(/e\^\(([^)]+)\)/g, (_m, p) => `e^{${cleanExpr(p)}}`);
    res = res.replace(/e\^([0-9a-zA-Z\-+]+)/g, (_m, p) => `e^{${p}}`);

    // General Powers: (...)^2 or x^2
    res = res.replace(/\^([0-9a-zA-Z]+)/g, '^{$1}');

    // Infinity symbols
    res = res.replace(/-inf\b/g, '-\\infty')
             .replace(/\+inf\b/g, '+\\infty')
             .replace(/\binf\b/g, '\\infty');

    // Fractions: (a)/(b)
    res = res.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, (_m, num, den) => `\\frac{${cleanExpr(num)}}{${cleanExpr(den)}}`);

    // Multiplication: 3*x -> 3x, 3*5 -> 3 \cdot 5
    res = res.replace(/([0-9])\s*\*\s*([a-zA-Z])/g, '$1$2');
    res = res.replace(/([a-zA-Z0-9])\s*\*\s*([a-zA-Z0-9])/g, '$1 \\cdot $2');
    res = res.replace(/\s*\*\s*/g, ' \\cdot ');

    // Pi and Greek symbols
    res = res.replace(/\bpi\b/g, '\\pi')
             .replace(/\bmu\b/g, '\\mu')
             .replace(/\bsigma\b/g, '\\sigma')
             .replace(/\blambda\b/g, '\\lambda')
             .replace(/\balpha\b/g, '\\alpha')
             .replace(/\bbeta\b/g, '\\beta');

    return res;
  }
}

/**
 * Safely render raw math or LaTeX string into KaTeX HTML string
 */
export function renderRawMathToKatexHtml(raw: string, isBlock = false): string {
  try {
    const tex = convertRawMathToTex(raw);
    return katex.renderToString(tex, {
      displayMode: isBlock,
      throwOnError: false,
      strict: false,
    });
  } catch (err) {
    return `<span class="font-mono">${raw}</span>`;
  }
}
