import { aiFetch } from './apiHelper';

/**
 * Mathematical Speech & Natural Language Normalizer for Probability & Statistics (XSTK)
 * Translates spoken Vietnamese math expressions, colloquial phonetics, and casual speech into precise KaTeX symbols
 */

export interface SpokenMathAnalysis {
  latexFormula: string;
  deductionFormula?: string;
  fullLatexDisplay: string;
  meaning: string;
  variables: Array<{ symbol: string; desc: string }>;
  casioTip?: string;
}

/**
 * Checks if raw transcript contains mathematical or statistical phrasing
 */
export function hasMathematicalTerms(rawText: string): boolean {
  if (!rawText) return false;
  const lower = rawText.toLowerCase();
  const mathKeywords = [
    'xác suất', 'đại lượng', 'thống kê', 'công thức', 'alpha', 'an pha',
    'beta', 'bê ta', 'sigma', 'xích ma', 'muy', 'kỳ vọng', 'phương sai',
    'độ lệch chuẩn', 'căn bậc', 'chia cho', 'nhân', 'bình phương',
    'tổ hợp', 'chỉnh hợp', 'bernoulli', 'bayes', 'student', 'laplace',
    'khoảng tin cậy', 'độ tin cậy', 'bằng', 'nằm trong đoạn', 'nhỏ hơn', 'lớn hơn'
  ];
  return mathKeywords.some((kw) => lower.includes(kw));
}

export function normalizeSpokenMath(rawText: string): string {
  if (!rawText) return '';

  // 0. Check if the speech matches a complete statistical theorem / confidence interval deduction
  const advanced = parseSpokenMathAdvanced(rawText);
  if (advanced && advanced.deductionFormula) {
    return `$${advanced.fullLatexDisplay}$`;
  }

  let text = rawText;

  // 0. Full Confidence Intervals & Complex Hypotheses (Exact spoken pattern matching)
  const fullSentenceMatches: [RegExp, string][] = [
    // Two-sided confidence interval for proportion p (Exact teacher speech example)
    [
      /(?:xác suất (?:để )?)?(?:đại lượng thống kê )?\(?\s*(?:f|ép)\s*(?:trừ|-)\s*(?:p|pê)\s*\)?\s*(?:chia cho|\/)\s*(?:căn bậc hai của|căn)\s*\(?\s*(?:p|pê)\s*(?:nhân|\*)\s*(?:q|quy)\s*(?:trên|\/)\s*n\s*\)?\s*(?:nằm trong đoạn|nằm giữa)\s*(?:từ )?\s*(?:trừ|-)\s*(?:z|dét)\s*(?:an\s*pha|alpha)\s*(?:trên|chia)\s*2\s*(?:đến|tới)\s*(?:z|dét)\s*(?:an\s*pha|alpha)\s*(?:trên|chia)\s*2\s*(?:là )?(?:bằng|=)\s*(?:1|một)\s*(?:trừ|-)\s*(?:an\s*pha|alpha)/gi,
      '$P \\left\\{ -z_{\\alpha/2} \\le \\frac{F - p}{\\sqrt{\\frac{pq}{n}}} \\le z_{\\alpha/2} \\right\\} = 1 - \\alpha \\quad \\Rightarrow \\quad P \\left\\{ F - z_{\\alpha/2} \\cdot \\sqrt{\\frac{pq}{n}} \\le p \\le F + z_{\\alpha/2} \\cdot \\sqrt{\\frac{pq}{n}} \\right\\} = 1 - \\alpha$'
    ],
    // Two-sided confidence interval for mean mu with known sigma
    [
      /(?:xác suất (?:để )?)?(?:đại lượng thống kê )?\(?\s*(?:x|ích)\s*(?:ngang|bar)\s*(?:trừ|-)\s*(?:muy|mu)\s*\)?\s*(?:chia cho|\/)\s*\(?\s*(?:sigma|xích ma)\s*(?:trên|\/)\s*(?:căn bậc hai của|căn)\s*n\s*\)?\s*(?:nằm trong đoạn|nằm giữa)\s*(?:từ )?\s*(?:trừ|-)\s*(?:z|dét)\s*(?:an\s*pha|alpha)\s*(?:trên|chia)\s*2\s*(?:đến|tới)\s*(?:z|dét)\s*(?:an\s*pha|alpha)\s*(?:trên|chia)\s*2\s*(?:là )?(?:bằng|=)\s*(?:1|một)\s*(?:trừ|-)\s*(?:an\s*pha|alpha)/gi,
      '$P \\left\\{ -z_{\\alpha/2} \\le \\frac{\\bar{X} - \\mu}{\\frac{\\sigma}{\\sqrt{n}}} \\le z_{\\alpha/2} \\right\\} = 1 - \\alpha \\quad \\Rightarrow \\quad P \\left\\{ \\bar{X} - z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}} \\le \\mu \\le \\bar{X} + z_{\\alpha/2} \\frac{\\sigma}{\\sqrt{n}} \\right\\} = 1 - \\alpha$'
    ],
    // Two-sided confidence interval for mean mu with unknown sigma (Student t)
    [
      /(?:xác suất (?:để )?)?(?:đại lượng thống kê )?\(?\s*(?:x|ích)\s*(?:ngang|bar)\s*(?:trừ|-)\s*(?:muy|mu)\s*\)?\s*(?:chia cho|\/)\s*\(?\s*s\s*(?:trên|\/)\s*(?:căn bậc hai của|căn)\s*n\s*\)?\s*(?:nằm trong đoạn|nằm giữa)\s*(?:từ )?\s*(?:trừ|-)\s*(?:t|tê)\s*(?:an\s*pha|alpha)\s*(?:trên|chia)\s*2\s*(?:đến|tới)\s*(?:t|tê)\s*(?:an\s*pha|alpha)\s*(?:trên|chia)\s*2\s*(?:là )?(?:bằng|=)\s*(?:1|một)\s*(?:trừ|-)\s*(?:an\s*pha|alpha)/gi,
      '$P \\left\\{ -t_{\\alpha/2}^{(n-1)} \\le \\frac{\\bar{X} - \\mu}{\\frac{s}{\\sqrt{n}}} \\le t_{\\alpha/2}^{(n-1)} \\right\\} = 1 - \\alpha \\quad \\Rightarrow \\quad P \\left\\{ \\bar{X} - t_{\\alpha/2}^{(n-1)} \\frac{s}{\\sqrt{n}} \\le \\mu \\le \\bar{X} + t_{\\alpha/2}^{(n-1)} \\frac{s}{\\sqrt{n}} \\right\\} = 1 - \\alpha$'
    ],
    // Addition theorem: P(A + B) = P(A) + P(B) - P(AB)
    [
      /xác suất (?:của )?(?:a|a lớn)\s*(?:hợp|cộng|\+)\s*(?:b|b lớn)\s*(?:bằng|=)\s*(?:p|xác suất)?\s*\(?a\)?\s*(?:cộng|\+)\s*(?:p|xác suất)?\s*\(?b\)?\s*(?:trừ|-)\s*(?:p|xác suất)?\s*\(?a\s*(?:giao|nhân)?\s*b\)?/gi,
      '$P(A \\cup B) = P(A) + P(B) - P(AB)$'
    ],
    // Bayes theorem
    [
      /xác suất (?:của )?h_?i\s*(?:với điều kiện|khi biết)\s*a\s*(?:bằng|=)\s*p\(h_?i\)\s*nhân\s*p\(a\/h_?i\)\s*chia\s*(?:cho )?(?:p\(a\)|tổng)/gi,
      '$P(H_i / A) = \\frac{P(H_i) \\cdot P(A / H_i)}{\\sum_{j=1}^n P(H_j) \\cdot P(A / H_j)}$'
    ]
  ];

  for (const [pattern, replacement] of fullSentenceMatches) {
    if (pattern.test(text)) {
      return text.replace(pattern, replacement);
    }
  }

  // 1. Specific Stats Hypothesis & Critical Values (high priority compound matches)
  const compoundReplacements: [RegExp, string][] = [
    // Sub-formula: (F - p) / sqrt(pq / n)
    [
      /\(?\s*(?:f|ép)\s*(?:trừ|-)\s*(?:p|pê)\s*\)?\s*(?:chia cho|\/)\s*(?:căn bậc hai của|căn)\s*\(?\s*(?:p|pê)\s*(?:nhân|\*)\s*(?:q|quy)\s*(?:trên|\/)\s*n\s*\)?/gi,
      '$\\frac{F - p}{\\sqrt{\\frac{pq}{n}}}$'
    ],
    // Sub-formula: sqrt(pq / n)
    [
      /(?:căn bậc hai của|căn)\s*\(?\s*(?:p|pê)\s*(?:nhân|\*)\s*(?:q|quy)\s*(?:trên|\/)\s*n\s*\)?/gi,
      '$\\sqrt{\\frac{pq}{n}}$'
    ],
    // Sub-formula: sigma / sqrt(n)
    [
      /\(?\s*(?:sigma|xích ma)\s*(?:chia cho|trên|\/)\s*(?:căn bậc hai của|căn)\s*n\s*\)?/gi,
      '$\\frac{\\sigma}{\\sqrt{n}}$'
    ],
    // Sub-formula: s / sqrt(n)
    [
      /\(?\s*s\s*(?:chia cho|trên|\/)\s*(?:căn bậc hai của|căn)\s*n\s*\)?/gi,
      '$\\frac{s}{\\sqrt{n}}$'
    ],
    // Critical value fractions with minus sign
    [/(?:trừ|-)\s*(?:z|dét)\s*(?:an\s*pha|alpha)\s*(?:trên|chia)\s*2\b/gi, '$-z_{\\alpha/2}$'],
    [/(?:trừ|-)\s*(?:t|tê)\s*(?:an\s*pha|alpha)\s*(?:trên|chia)\s*2\b/gi, '$-t_{\\alpha/2}$'],
    // Critical value fractions
    [/\b(z|dét)\s*(?:an\s*pha|alpha)\s*(?:trên|chia)\s*2\b/gi, '$z_{\\alpha/2}$'],
    [/\b(t|tê)\s*(?:an\s*pha|alpha)\s*(?:trên|chia)\s*2\b/gi, '$t_{\\alpha/2}$'],
    [/\b(z|dét)\s*(?:an\s*pha|alpha)\b/gi, '$z_{\\alpha}$'],
    [/\b(t|tê)\s*(?:an\s*pha|alpha)\b/gi, '$t_{\\alpha}$'],
    [/\b(chi|khi|xi)\s*bình(?:\s*phương)?\s*(?:an\s*pha|alpha)\b/gi, '$\\chi^2_{\\alpha}$'],
    [/\b(chi|khi|xi)\s*bình(?:\s*phương)?\b/gi, '$\\chi^2$'],

    // Test statistics & critical regions
    [/\b(z|dét)\s*(?:quan\s*sát|qs)\b/gi, '$Z_{qs}$'],
    [/\b(t|tê)\s*(?:quan\s*sát|qs)\b/gi, '$t_{qs}$'],
    [/\b(f|ép)\s*(?:quan\s*sát|qs)\b/gi, '$F_{qs}$'],
    [/\b(chi|khi)\s*(?:quan\s*sát|qs)\b/gi, '$\\chi^2_{qs}$'],
    [/\b(?:miền bác bỏ\s*)?(?:w|vê|v)\s*(?:an\s*pha|alpha)\b/gi, '$W_{\\alpha}$'],
    [/\b(?:p\s*value|pi\s*va\s*liu|p\s*va\s*lu|giá trị\s*p)\b/gi, '$p\\text{-value}$'],

    // Hypotheses H0 and H1
    [/\b(?:giả thuyết\s*)?(?:hát\s*không|h\s*không|h\s*0|hát\s*0|hát\s*ô)\b/gi, '$H_0$'],
    [/\b(?:đối thuyết\s*)?(?:hát\s*một|h\s*một|h\s*1|hát\s*1)\b/gi, '$H_1$'],

    // Estimators & sample parameters
    [/(?:trung bình mẫu\s*)?(?:x|ích)\s*(?:ngang|gạch ngang|bar)(?![a-zA-Z0-9])/gi, '$\\bar{x}$'],
    [/(?:phương sai mẫu hiệu chỉnh\s*)?s\s*(?:bình(?:\s*phương)?|mũ\s*2)(?![a-zA-Z0-9])/gi, '$s^2$'],
    [/(?:phương sai mẫu chưa hiệu chỉnh\s*)?(?:s|ép)\s*(?:mũ|nón)\s*(?:bình|mũ\s*2)(?![a-zA-Z0-9])/gi, '$\\hat{s}^2$'],
    [/(?:độ lệch chuẩn mẫu hiệu chỉnh\s*)?s(?![a-zA-Z0-9])/gi, '$s$'],
    [/(?:độ lệch chuẩn\s*)?(?:s\s*x|s_x)\b/gi, '$s_x$'],
    [/(?:phương sai\s*)?(?:s\s*bình\s*x|s\s*mũ\s*2\s*x|s_x\s*bình)\b/gi, '$s_x^2$'],
    [/(?:phương sai tổng thể\s*)?(?:sigma\s*bình\s*x|xích\s*ma\s*bình\s*x)\b/gi, '$\\sigma_x^2$'],
    [/(?:tỷ lệ mẫu\s*)?(?:p|pê)\s*(?:mũ|nón|hat)(?![a-zA-Z0-9])/gi, '$\\hat{p}$'],
    [/(?:giá trị kiểm định\s*)?(?:p|pê)\s*(?:không|0|ô)(?![a-zA-Z0-9])/gi, '$p_0$'],
    [/(?:kỳ vọng chuẩn\s*)?(?:muy|mu)\s*(?:không|0|ô)(?![a-zA-Z0-9])/gi, '$\\mu_0$'],
    [/(?:độ tin cậy\s*)?1\s*(?:trừ|-)\s*(?:an\s*pha|alpha)(?![a-zA-Z0-9])/gi, '$1 - \\alpha$'],
    [/(?:sai số biên|độ chính xác)\s*(?:ép\s*si\s*lon|epsilon)(?![a-zA-Z0-9])/gi, '$\\varepsilon$'],
    [/(?<!\\)\b(?:ép\s*si\s*lon|epsilon)\b/gi, '$\\varepsilon$'],

    // Sums in statistics
    [/\b(?:tổng\s*)?(?:n\s*i\s*x\s*i\s*bình|n_i\s*x_i\s*bình)\b/gi, '$\\sum n_i x_i^2$'],
    [/\b(?:tổng\s*)?(?:n\s*i\s*x\s*i|n_i\s*x_i)\b/gi, '$\\sum n_i x_i$'],
    [/\b(?:tổng\s*)?(?:n\s*i|n_i)\b/gi, '$\\sum n_i$'],
    [/\b(?:tổng\s*)?(?:x\s*i|x_i)\b/gi, '$\\sum x_i$'],
    [/\b(?:giá trị đại diện\s*)?(?:x\s*i|x_i|ích\s*i)\b/gi, '$x_i$'],
    [/\b(?:tần số\s*)?(?:n\s*i|n_i|en\s*nờ\s*i)\b/gi, '$n_i$'],
    [/\b(?:bậc tự do\s*)?(?:n\s*trừ\s*1|n\s*-\s*1)\b/gi, '$n - 1$'],

    // Expectations and Variances
    [/\b(?:kỳ vọng|kì vọng)\s*(?:e\s*của\s*x|e\s*x|ex)\b/gi, '$E(X)$'],
    [/\b(?:phương sai\s*)?(?:var\s*của\s*x|var\s*x|v\s*x)\b/gi, '$Var(X)$'],
    [/\b(?:độ lệch chuẩn\s*)?(?:sigma|xích\s*ma)\s*của\s*x\b/gi, '$\\sigma(X)$'],
    [/\b(?:hàm mật độ\s*)?f\s*(?:nhỏ\s*)?của\s*x\b/gi, '$f(x)$'],
    [/\b(?:hàm phân phối\s*)?f\s*(?:lớn|hoa)\s*của\s*x\b/gi, '$F(x)$'],
    [/\b(?:hàm\s*)?(?:phi|phi\s*lớn)\s*của\s*z\b/gi, '$\\Phi(z)$'],
    [/\b(?:hàm\s*)?(?:phi|phi\s*lớn)\s*của\s*u\b/gi, '$\\Phi(u)$'],
    [/\b(?:hàm\s*)?(?:phi|phi\s*lớn)\s*của\s*x\b/gi, '$\\Phi(x)$'],
  ];

  for (const [pattern, replacement] of compoundReplacements) {
    text = text.replace(pattern, () => replacement);
  }

  // 2. Distributions
  text = text.replace(
    /\bphân phối nhị thức\s*b\s*(\d+)\s*([0-9.,]+)\b/gi,
    (_m, n, p) => `phân phối Nhị thức $B(${n}, ${p})$`
  );
  text = text.replace(
    /\bphân phối poisson\s*(?:lamda|lambda)?\s*([0-9.,]+)\b/gi,
    (_m, l) => `phân phối Poisson $P(\\lambda = ${l})$`
  );
  text = text.replace(
    /\bphân phối chuẩn\s*n\s*([0-9.,]+)\s*([0-9.,]+)\b/gi,
    (_m, mu, s2) => `phân phối Chuẩn $N(\\mu = ${mu}, \\sigma^2 = ${s2})$`
  );

  // 3. Greek & Stats Symbols (Spoken -> KaTeX) - strictly guarded against LaTeX commands
  const symbolReplacements: [RegExp, string][] = [
    [/(?<!\\)\b(số pi|ký hiệu pi|kí hiệu pi|chữ pi|\bpi\b)/gi, '$\\pi$'],
    [/(?<!\\)\b(kỳ vọng muy|kỳ vọng mu|\bmuy\b|\bmu\b)\b/gi, '$\\mu$'],
    [/(?<!\\)\b(phương sai sigma bình|sigma bình phương|sigma bình|xích ma bình)\b/gi, '$\\sigma^2$'],
    [/(?<!\\)\b(độ lệch chuẩn sigma|\bsigma\b|\bxích ma\b)\b/gi, '$\\sigma$'],
    [/(?<!\\)\b(mức ý nghĩa alpha|\balpha\b|\ban pha\b)\b/gi, '$\\alpha$'],
    [/(?<!\\)\b(\bbeta\b|\bbê ta\b)\b/gi, '$\\beta$'],
    [/(?<!\\)\b(\blamda\b|\blambda\b|\blam đa\b)\b/gi, '$\\lambda$'],
    [/(?<!\\)\b(\btheta\b|\bthê ta\b)\b/gi, '$\\theta$'],
    [/\b(cộng trừ|cộng hoặc trừ)\b/gi, '$\\pm$'],
    [/\b(dương vô cùng|dương vô cực)\b/gi, '$+\\infty$'],
    [/\b(âm vô cùng|âm vô cực)\b/gi, '$-\\infty$'],
    [/(?<!\\)\b(vô cùng|vô cực)\b/gi, '$\\infty$'],
    [/\b(tổng xích ma|tổng sigma)\b/gi, '$\\sum$'],
    [/\b(tích pi lớn)\b/gi, '$\\prod$'],
    [/\b(suy ra|kéo theo)\b/gi, '$\\Rightarrow$'],
    [/\b(tương đương|khi và chỉ khi)\b/gi, '$\\Leftrightarrow$'],
    [/\b(lớn hơn hoặc bằng)\b/gi, '$\\ge$'],
    [/\b(nhỏ hơn hoặc bằng|bé hơn hoặc bằng)\b/gi, '$\\le$'],
    [/\b(khác biệt|không bằng|\bkhác\b)\b/gi, '$\\ne$'],
    [/\b(xấp xỉ bằng|gần bằng)\b/gi, '$\\approx$'],
  ];

  // 4. Probabilistic notation replacements
  const probReplacements: [RegExp, string][] = [
    [/\bxác suất (?:của )?biến cố ([A-Z])\b/gi, '$P($1)$'],
    [/\bxác suất P của ([A-Z])\b/gi, '$P($1)$'],
    [/\bP của ([A-Z])\b/gi, '$P($1)$'],
    [/\bP\(([A-Z])\)\s*giao\s*([A-Z])\b/gi, '$P($1 \\cap $2)$'],
    [/\bP\(([A-Z])\)\s*hợp\s*([A-Z])\b/gi, '$P($1 \\cup $2)$'],
    [/\bP\(([A-Z])\)\s*với điều kiện\s*([A-Z])\b/gi, '$P($1|$2)$'],
    [/\bP của ([A-Z])\s*với điều kiện\s*([A-Z])\b/gi, '$P($1|$2)$'],
    [/(?<!\\)\bkhông gian mẫu omega\b/gi, '$\\Omega$'],
    [/(?<!\\)\bomega\b/gi, '$\\Omega$'],
  ];

  // 5. Complex formulas & operators
  // Tổ hợp / chỉnh hợp: "tổ hợp chập 3 của 10" -> C_{10}^3
  text = text.replace(
    /tổ hợp chập ([0-9]+) của ([0-9]+)/gi,
    (_m, k, n) => ` $C_{${n}}^{${k}}$ `
  );
  text = text.replace(
    /chỉnh hợp chập ([0-9]+) của ([0-9]+)/gi,
    (_m, k, n) => ` $A_{${n}}^{${k}}$ `
  );

  // Phân số: "phân số 3 trên 8" hoặc "3 phần 8"
  text = text.replace(
    /(?:phân số )?([0-9]+) (?:trên|phần) ([0-9]+)/gi,
    (_m, a, b) => ` $\\frac{${a}}{${b}}$ `
  );

  // Căn thức: "căn bậc hai của n" hoặc "căn n"
  text = text.replace(
    /căn (?:bậc hai )?(?:của )?([a-zA-Z0-9]+)/gi,
    (_m, v) => ` $\\sqrt{${v}}$ `
  );

  // Lũy thừa: "x bình phương" hoặc "x bình"
  text = text.replace(/\b([a-zA-Z]) bình(?: phương)?\b/gi, ' $1^2 ');
  text = text.replace(/\b([a-zA-Z]) lập phương\b/gi, ' $1^3 ');
  text = text.replace(/\b([a-zA-Z]) mũ ([0-9]+)\b/gi, ' $1^{$2} ');

  // Tích phân: "tích phân từ 0 đến 1 của x^2 dx"
  text = text.replace(
    /tích phân từ ([0-9a-zA-Z\-\\+]+) đến ([0-9a-zA-Z\-\\+]+)(?: của (.+?)(?: d([a-z]))?)?(?=[,.]|$)/gi,
    (_match, a, b, f, varName) => {
      const v = varName || 'x';
      const func = f ? f.trim() : '';
      return ` $\\int_{${a}}^{${b}} ${func} \\, d${v}$ `;
    }
  );

  // Apply symbol replacements
  for (const [pattern, replacement] of symbolReplacements) {
    text = text.replace(pattern, () => replacement);
  }

  // Apply probability replacements
  for (const [pattern, replacement] of probReplacements) {
    text = text.replace(pattern, () => replacement);
  }

  // Decimal comma to dot in spoken numbers: "50 phẩy 05" -> "50.05"
  text = text.replace(/(\d+)\s*(?:phẩy|chấm)\s*(\d+)/gi, '$1.$2');

  // Tidy up consecutive spaces and malformed $$
  text = text.replace(/\$\s*\$/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Advanced Semantic Parser for Spoken Math:
 * Extracts variables, critical values, and bidirectional algebraic deductions (e.g., standard inequality => confidence interval)
 */
export function parseSpokenMathAdvanced(spokenText: string): SpokenMathAnalysis {
  const lower = (spokenText || '').toLowerCase().trim();

  // 1. Two-sided confidence interval for proportion p (Matches teacher handwritten example)
  if (
    (lower.includes('f trừ p') || lower.includes('f - p') || lower.includes('p nhân q') || lower.includes('pq/n') || lower.includes('tỷ lệ')) &&
    (lower.includes('z') || lower.includes('alpha') || lower.includes('an pha') || lower.includes('đoạn từ') || lower.includes('nằm trong'))
  ) {
    return {
      latexFormula: `P\\left\\{ -z_{\\alpha/2} \\le \\frac{F - p}{\\sqrt{\\frac{pq}{n}}} \\le z_{\\alpha/2} \\right\\} = 1 - \\alpha`,
      deductionFormula: `P\\left\\{ F - z_{\\alpha/2} \\cdot \\sqrt{\\frac{pq}{n}} \\le p \\le F + z_{\\alpha/2} \\cdot \\sqrt{\\frac{pq}{n}} \\right\\} = 1 - \\alpha`,
      fullLatexDisplay: `P\\left\\{ -z_{\\alpha/2} \\le \\frac{F - p}{\\sqrt{\\frac{pq}{n}}} \\le z_{\\alpha/2} \\right\\} = 1 - \\alpha \\quad \\Rightarrow \\quad P\\left\\{ F - z_{\\alpha/2} \\cdot \\sqrt{\\frac{pq}{n}} \\le p \\le F + z_{\\alpha/2} \\cdot \\sqrt{\\frac{pq}{n}} \\right\\} = 1 - \\alpha`,
      meaning: `Khoảng ước lượng tin cậy đối xứng cho tỷ lệ tổng thể p với độ tin cậy 1 - \\alpha (áp dụng khi cỡ mẫu lớn n >= 30).`,
      variables: [
        { symbol: 'p', desc: 'Tỷ lệ cá thể mang đặc tính A trong tổng thể (cần ước lượng)' },
        { symbol: 'F', desc: 'Tỷ lệ mẫu quan sát được (F = m/n)' },
        { symbol: 'q', desc: 'Tỷ lệ đối lập (q = 1 - p hoặc xấp xỉ 1 - F)' },
        { symbol: 'n', desc: 'Kích thước mẫu khảo sát' },
        { symbol: 'z_{\\alpha/2}', desc: 'Giá trị tới hạn chuẩn tra từ bảng phân phối chuẩn Laplace' },
        { symbol: '1 - \\alpha', desc: 'Độ tin cậy của ước lượng (thường 90%, 95%, 99%)' }
      ],
      casioTip: 'Tìm z_{alpha/2}: Bấm MENU 7 -> 3 (Inverse Normal) -> nhập Area = 1 - alpha/2, sigma = 1, mu = 0.'
    };
  }

  // 2. Two-sided confidence interval for mean mu with known sigma
  if (
    (lower.includes('x ngang trừ') || lower.includes('muy') || lower.includes('sigma trên căn')) &&
    (lower.includes('z') || lower.includes('alpha') || lower.includes('khoảng') || lower.includes('đoạn'))
  ) {
    return {
      latexFormula: `P\\left\\{ -z_{\\alpha/2} \\le \\frac{\\bar{X} - \\mu}{\\frac{\\sigma}{\\sqrt{n}}} \\le z_{\\alpha/2} \\right\\} = 1 - \\alpha`,
      deductionFormula: `P\\left\\{ \\bar{X} - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} \\le \\mu \\le \\bar{X} + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} \\right\\} = 1 - \\alpha`,
      fullLatexDisplay: `P\\left\\{ -z_{\\alpha/2} \\le \\frac{\\bar{X} - \\mu}{\\frac{\\sigma}{\\sqrt{n}}} \\le z_{\\alpha/2} \\right\\} = 1 - \\alpha \\quad \\Rightarrow \\quad P\\left\\{ \\bar{X} - z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} \\le \\mu \\le \\bar{X} + z_{\\alpha/2}\\frac{\\sigma}{\\sqrt{n}} \\right\\} = 1 - \\alpha`,
      meaning: `Khoảng ước lượng tin cậy đối xứng cho kỳ vọng toán \\mu khi đã biết độ lệch chuẩn tổng thể \\sigma.`,
      variables: [
        { symbol: '\\mu', desc: 'Kỳ vọng toán của tổng thể (cần ước lượng)' },
        { symbol: '\\bar{X}', desc: 'Trung bình mẫu quan sát được' },
        { symbol: '\\sigma', desc: 'Độ lệch chuẩn tổng thể (đã cho)' },
        { symbol: 'n', desc: 'Kích thước mẫu quan sát' },
        { symbol: 'z_{\\alpha/2}', desc: 'Giá trị tới hạn chuẩn phân vị alpha/2' }
      ],
      casioTip: 'Bấm MENU 6 -> 1 để nhập mẫu và lấy x_bar; tính sai số epsilon = z * sigma / sqrt(n).'
    };
  }

  // 3. Two-sided confidence interval for mean mu with unknown sigma (Student t)
  if (
    (lower.includes('student') || lower.includes('t alpha') || lower.includes('tê an pha')) &&
    (lower.includes('s trên căn') || lower.includes('x ngang'))
  ) {
    return {
      latexFormula: `P\\left\\{ -t_{\\alpha/2}^{(n-1)} \\le \\frac{\\bar{X} - \\mu}{\\frac{s}{\\sqrt{n}}} \\le t_{\\alpha/2}^{(n-1)} \\right\\} = 1 - \\alpha`,
      deductionFormula: `P\\left\\{ \\bar{X} - t_{\\alpha/2}^{(n-1)}\\frac{s}{\\sqrt{n}} \\le \\mu \\le \\bar{X} + t_{\\alpha/2}^{(n-1)}\\frac{s}{\\sqrt{n}} \\right\\} = 1 - \\alpha`,
      fullLatexDisplay: `P\\left\\{ -t_{\\alpha/2}^{(n-1)} \\le \\frac{\\bar{X} - \\mu}{\\frac{s}{\\sqrt{n}}} \\le t_{\\alpha/2}^{(n-1)} \\right\\} = 1 - \\alpha \\quad \\Rightarrow \\quad P\\left\\{ \\bar{X} - t_{\\alpha/2}^{(n-1)}\\frac{s}{\\sqrt{n}} \\le \\mu \\le \\bar{X} + t_{\\alpha/2}^{(n-1)}\\frac{s}{\\sqrt{n}} \\right\\} = 1 - \\alpha`,
      meaning: `Khoảng ước lượng tin cậy cho kỳ vọng \\mu khi chưa biết phương sai tổng thể (mẫu nhỏ n < 30).`,
      variables: [
        { symbol: 's', desc: 'Độ lệch chuẩn mẫu hiệu chỉnh' },
        { symbol: 'n - 1', desc: 'Bậc tự do của phân phối Student' }
      ],
      casioTip: 'Bấm MENU 6 -> 1 để lấy x_bar và s_x; tra bảng phân phối Student t(n-1; alpha/2).'
    };
  }

  // 4. Default normalized fallback
  const rawNormalized = normalizeSpokenMath(spokenText);
  return {
    latexFormula: rawNormalized,
    deductionFormula: '',
    fullLatexDisplay: rawNormalized,
    meaning: 'Biểu thức toán học nhận diện từ giọng nói người dùng.',
    variables: [],
    casioTip: 'Bấm MENU -> 7 để tính xác suất hoặc MENU -> 6 cho bảng số liệu thống kê.'
  };
}

/**
 * Call Server-side AI Speech-to-Math engine powered by user's Gemini API Key
 */
export async function convertVoiceToMathAI(
  spokenText: string,
  context?: string
): Promise<{ success: boolean; data: SpokenMathAnalysis; isAiGenerated?: boolean }> {
  try {
    const res = await aiFetch('/api/tutor/speech-to-math', {
      method: 'POST',
      body: JSON.stringify({
        spokenText,
        context: context || 'Xác suất Thống kê Đại học & Kinh tế (XSTK)',
      }),
    });
    const json = await res.json();
    if (json.success && json.data) {
      return json;
    }
  } catch (err) {
    console.warn('AI speech-to-math fetch error, using local math speech parser:', err);
  }

  // Safe fallback to advanced local parser
  return {
    success: true,
    data: parseSpokenMathAdvanced(spokenText),
    isAiGenerated: false,
  };
}

/**
 * Chuyển đổi mã LaTeX, công thức toán và văn bản Markdown sang phát âm tiếng Việt chuẩn mực sư phạm
 * Giọng đọc nói chậm rãi, rõ ràng từng biến số, ký hiệu Hy Lạp, phân số, căn thức và dấu bất đẳng thức.
 */
export function latexToSpokenVietnamese(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Dọn dẹp cấu trúc Markdown
  text = text.replace(/```[\s\S]*?```/g, ''); // Bỏ code blocks
  text = text.replace(/^#{1,6}\s+/gm, ''); // Bỏ tiêu đề markdown #
  text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Bỏ in đậm
  text = text.replace(/\*(.*?)\*/g, '$1'); // Bỏ in nghiêng
  text = text.replace(/`([^`]+)`/g, '$1'); // Bỏ backtick
  text = text.replace(/^[-*•]\s+/gm, ', '); // Dấu gạch đầu dòng -> ngắt nghỉ câu

  // 2. Chuyển đổi các công thức khối $$...$$ và nội dòng $...$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_m, eq) => ` ${convertFormulaToPhonetics(eq)} `);
  text = text.replace(/\$([^\$]+)\$/g, (_m, eq) => ` ${convertFormulaToPhonetics(eq)} `);

  // 3. Nếu vẫn còn sót các ký hiệu LaTeX ngoài dấu $
  text = convertFormulaToPhonetics(text);

  // 4. Chuẩn hóa khoảng trắng và dấu ngắt câu để giọng đọc tự nhiên
  text = text.replace(/\$/g, '');
  text = text.replace(/\\/g, ' ');
  text = text.replace(/[{}]/g, ' ');
  text = text.replace(/\s+/g, ' ');
  text = text.replace(/,\s*,/g, ',');
  text = text.replace(/\.\s*\./g, '.');

  return text.trim();
}

/**
 * Phiên âm một biểu thức toán học LaTeX sang phát âm tiếng Việt
 */
function convertFormulaToPhonetics(formula: string): string {
  if (!formula) return '';
  let f = formula;

  // 1. Dọn dẹp dấu bao bọc \\left và \\right trước để tránh xung đột với \\le
  f = f.replace(/\\left\\{/g, '{').replace(/\\right\\}/g, '}');
  f = f.replace(/\\left[\(\[\.]?/g, '').replace(/\\right[\)\]\.]?/g, '');
  f = f.replace(/\\quad|\\;|\\,|\\!/g, ' ');

  // 2. Các phép suy diễn & quan hệ
  f = f.replace(/\\Rightarrow|\\implies/gi, ', suy ra, ');
  f = f.replace(/\\Leftrightarrow|\\iff/gi, ', tương đương, ');
  f = f.replace(/\\approx/gi, ' xấp xỉ bằng ');
  f = f.replace(/\\sim/gi, ' tuân theo phân phối ');
  f = f.replace(/\\in/gi, ' thuộc ');

  // 3. Phân số và căn thức lồng nhau: Xử lý từ tầng trong ra tầng ngoài (innermost to outermost)
  for (let iter = 0; iter < 5; iter++) {
    const prev = f;
    f = f.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, (_m, a, b) => 'phân số ' + a + ' trên ' + b);
    f = f.replace(/\\sqrt\{([^{}]+)\}/g, (_m, a) => 'căn bậc hai của ' + a);
    f = f.replace(/\\sqrt\[([^{}]+)\]\{([^{}]+)\}/g, (_m, a, b) => 'căn bậc ' + a + ' của ' + b);
    if (f === prev) break;
  }

  // 4. Giá trị tới hạn thống kê
  f = f.replace(/(?:-|trừ\s*)z_\{?\\alpha\/2\}?/gi, ' trừ dét an pha trên hai ');
  f = f.replace(/z_\{?\\alpha\/2\}?/gi, ' dét an pha trên hai ');
  f = f.replace(/z_\{?\\alpha\}?/gi, ' dét an pha ');
  f = f.replace(/(?:-|trừ\s*)t_\{?\\alpha\/2\}?(?:\^\{?\([nN0-9- ]+\)\}?)?/gi, ' trừ tê an pha trên hai ');
  f = f.replace(/t_\{?\\alpha\/2\}?(?:\^\{?\([nN0-9- ]+\)\}?)?/gi, ' tê an pha trên hai ');
  f = f.replace(/t_\{?\\alpha\}?/gi, ' tê an pha ');
  f = f.replace(/\\chi\^2_\{?\\alpha\}?/gi, ' khi bình phương an pha ');
  f = f.replace(/\\chi\^2/gi, ' khi bình phương ');

  // 5. Cấu trúc xác suất & khoảng tin cậy hai phía
  f = f.replace(/P\s*\{\s*([^}]+?)\s*\}\s*=\s*1\s*-\s*\\alpha/gi, 'Xác suất để $1 bằng một trừ an pha');
  f = f.replace(/P\s*\{\s*([^}]+?)\s*\}/gi, 'Xác suất để $1');

  // 6. Toán tử so sánh & phép toán
  f = f.replace(/\\le/gi, ' nhỏ hơn hoặc bằng ');
  f = f.replace(/\\ge/gi, ' lớn hơn hoặc bằng ');
  f = f.replace(/\\ne/gi, ' khác ');
  f = f.replace(/\\pm/gi, ' cộng trừ ');
  f = f.replace(/\\cdot|\\times/gi, ' nhân ');

  // 7. Ký hiệu xác suất & biến cố
  f = f.replace(/P\(([A-Z])\s*\\cap\s*([A-Z])\)/gi, 'P của $1 giao $2');
  f = f.replace(/P\(([A-Z])\s*\\cup\s*([A-Z])\)/gi, 'P của $1 hợp $2');
  f = f.replace(/P\(([A-Z])\s*[\/|]\s*([A-Z])\)/gi, 'xác suất của $1 với điều kiện $2');
  f = f.replace(/P\(([A-Z])\)/gi, 'xác suất của biến cố $1');
  f = f.replace(/P\(([a-zA-Z0-9+\-=<>\s]+)\)/gi, 'xác suất của $1');

  // 8. Đại lượng thống kê & tham số
  f = f.replace(/\\bar\{?[xX]\}?/gi, 'X gạch ngang');
  f = f.replace(/\\hat\{?[pP]\}?/gi, 'p mũ');
  f = f.replace(/\\hat\{?[sS]\}?\^2/gi, 'phương sai mũ s bình phương');
  f = f.replace(/s\^2/gi, 's bình phương');
  f = f.replace(/\\sigma\^2/gi, 'xích ma bình phương');
  f = f.replace(/\\sigma/gi, 'độ lệch chuẩn xích ma');
  f = f.replace(/\\mu_0/gi, 'muy không');
  f = f.replace(/\\mu/gi, 'kỳ vọng muy');
  f = f.replace(/1\s*-\s*\\alpha/gi, ' một trừ an pha ');
  f = f.replace(/\\alpha/gi, ' an pha ');
  f = f.replace(/\\beta/gi, ' bê ta ');
  f = f.replace(/\\lambda/gi, ' lam đa ');
  f = f.replace(/\\Omega/gi, ' không gian mẫu ô mê ga ');
  f = f.replace(/\\emptyset/gi, ' tập rỗng ');
  f = f.replace(/\\sum/gi, ' tổng xích ma ');
  f = f.replace(/\\prod/gi, ' tích pi ');
  f = f.replace(/\\int/gi, ' tích phân ');
  f = f.replace(/\\infty/gi, ' vô cực ');

  // 9. Dấu bằng và dọn dẹp
  f = f.replace(/=/g, ' bằng ');
  f = f.replace(/[{}]/g, ' ');
  f = f.replace(/\\/g, ' ');
  f = f.replace(/\s+/g, ' ').trim();

  return f;
}

/**
 * Đọc thành tiếng văn bản toán học với phong cách giọng trầm ấm, chậm rãi, chuẩn xác từng ký hiệu
 */
export function speakVietnameseMath(
  text: string,
  callbacks?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis không được hỗ trợ trong môi trường này.');
    return null;
  }

  // Dừng mọi giọng đọc đang chạy dở
  window.speechSynthesis.cancel();

  const spokenText = latexToSpokenVietnamese(text);
  if (!spokenText.trim()) return null;

  const utterance = new SpeechSynthesisUtterance(spokenText);
  utterance.lang = 'vi-VN';
  // Tốc độ 0.88 để phát âm chậm rãi, rõ ràng từng ký hiệu toán học
  utterance.rate = 0.88;
  // Độ cao 0.95 để giọng nói trầm ấm, truyền cảm
  utterance.pitch = 0.95;

  // Tự động tìm giọng đọc tiếng Việt tự nhiên nhất
  const voices = window.speechSynthesis.getVoices();
  const viVoice =
    voices.find(
      (v) =>
        v.lang.startsWith('vi') &&
        (v.name.includes('Natural') ||
          v.name.includes('HoaiMy') ||
          v.name.includes('NamMinh') ||
          v.name.includes('Google') ||
          v.name.includes('Vietnam'))
    ) || voices.find((v) => v.lang.startsWith('vi'));

  if (viVoice) {
    utterance.voice = viVoice;
  }

  if (callbacks?.onStart) utterance.onstart = callbacks.onStart;
  if (callbacks?.onEnd) utterance.onend = callbacks.onEnd;
  if (callbacks?.onError) utterance.onerror = callbacks.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}

/**
 * Dừng phát âm thanh
 */
export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
