/**
 * Mathematical Speech & Natural Language Normalizer for Probability & Statistics (XSTK)
 * Translates spoken Vietnamese math expressions, colloquial phonetics, and casual speech into precise KaTeX symbols
 */

export function normalizeSpokenMath(rawText: string): string {
  if (!rawText) return '';

  let text = rawText;

  // 1. Specific Stats Hypothesis & Critical Values (high priority compound matches)
  const compoundReplacements: [RegExp, string][] = [
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
