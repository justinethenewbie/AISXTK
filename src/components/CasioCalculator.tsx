import React, { useState, useEffect } from 'react';
import {
  Calculator,
  HelpCircle,
  RefreshCw,
  Zap,
  BookOpen,
  Layers,
  Check,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Sigma,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { MathFormula } from './MathFormula';
import { aiFetch } from '../utils/apiHelper';
import { renderRawMathToKatexHtml } from '../utils/mathDisplayUtils';

export const CasioCalculator: React.FC = () => {
  // Giao diện vỏ máy: 'FX-580VN' (ClassWiz) hoặc 'FX-570VN' (Natural V.P.A.M.)
  const [modelType, setModelType] = useState<'FX-580VN' | 'FX-570VN'>('FX-580VN');

  // Chế độ tính năng:
  // 'COMP': Bàn phím Casio chuẩn & Tính toán biểu thức / Tích phân tự động
  // 'CONTINUOUS': Chuyên đề Biến ngẫu nhiên liên tục (Tìm k, E(X), Var(X), P(a < X < b))
  // 'FX570_DISTR': Phân phối chuẩn fx-570VN (P, Q, R, Giá trị tới hạn z-alpha, t-alpha)
  // 'STAT': Thống kê mẫu 1-Variable & Bảng tần số
  // 'DIST': Phân phối xác suất Casio fx-580VN (Normal, Binomial, Poisson)
  const [activeMode, setActiveMode] = useState<'COMP' | 'CONTINUOUS' | 'FX570_DISTR' | 'STAT' | 'DIST'>('COMP');

  // LCD Display State
  const [expression, setExpression] = useState('int(0, 2, 3*x^2)');
  const [displayResult, setDisplayResult] = useState('8');
  const [displayFraction, setDisplayFraction] = useState('8/1');
  const [displayDecimal, setDisplayDecimal] = useState('8.0000');
  const [isShowingFraction, setIsShowingFraction] = useState(false);
  const [lastAns, setLastAns] = useState(8);
  const [isShift, setIsShift] = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);

  // Continuous RV Dedicated Solver State
  const [continuousTaskType, setContinuousTaskType] = useState<'find_k' | 'prob_interval' | 'expectation_var' | 'cdf_fx' | 'general_int'>('find_k');
  const [densityFunction, setDensityFunction] = useState('k * x^2');
  const [boundA, setBoundA] = useState('0');
  const [boundB, setBoundB] = useState('2');
  const [probA, setProbA] = useState('1');
  const [probB, setProbB] = useState('2');
  const [isSolvingContinuous, setIsSolvingContinuous] = useState(false);
  const [continuousResult, setContinuousResult] = useState<any>({
    title: 'Tìm hằng số k để f(x) là hàm mật độ xác suất',
    step1: '\\int_{0}^{2} k x^2 \\, dx = 1',
    step2: 'F(x) = k \\int x^2 dx = k \\cdot \\frac{x^3}{3}',
    step3: 'k \\left[ \\frac{2^3}{3} - \\frac{0^3}{3} \\right] = k \\cdot \\frac{8}{3} = 1 \\implies k = \\frac{3}{8}',
    fraction: '3/8',
    decimal: '0.3750',
    summary: 'Hằng số chuẩn hóa: k = 3/8 = 0.3750',
    casioGuide: [
      'Bấm phím Tích phân ∫dx (dưới nút ALPHA)',
      'Nhập hàm số tạm bỏ k: X² (bấm ALPHA + X rồi x²)',
      'Nhập cận dưới: 0, cận trên: 2',
      'Bấm = nhận được 8/3. Suy ra k = 1 / (8/3) = 3/8 = 0.3750',
    ],
    infinityTip: 'LƯU Ý PHÒNG THI: Nếu cận là +∞ hãy thay bằng 10^9; nếu cận là -∞ thay bằng -10^9 để máy Casio fx-580VN X tính xấp xỉ chính xác.',
  });

  // FX-570VN Distr & Critical Values State
  const [fx570TValue, setFx570TValue] = useState('1.96');
  const [fx570XVal, setFx570XVal] = useState('65');
  const [fx570MeanVal, setFx570MeanVal] = useState('50');
  const [fx570SdVal, setFx570SdVal] = useState('10');
  const [alphaLevel, setAlphaLevel] = useState('0.05');

  // STAT Data State (Bảng tần số 1-Var)
  const [statRows, setStatRows] = useState<Array<{ x: string; freq: string }>>([
    { x: '10', freq: '2' },
    { x: '20', freq: '5' },
    { x: '30', freq: '8' },
    { x: '40', freq: '3' },
  ]);
  const [statSummary, setStatSummary] = useState<any>(null);

  // DIST Parameters State (FX-580VN)
  const [distType, setDistType] = useState<
    'normal_cd' | 'normal_pd' | 'inv_normal' | 'binom_pd' | 'binom_cd' | 'poisson_pd' | 'poisson_cd'
  >('normal_cd');
  const [distInputs, setDistInputs] = useState<Record<string, string>>({
    lower: '-1.96',
    upper: '1.96',
    mean: '0',
    sd: '1',
    area: '0.95',
    k: '3',
    n: '10',
    p: '0.5',
    lambda: '4',
  });
  const [distResult, setDistResult] = useState<number | null>(0.95);

  // Helper math algorithms
  const fact = (n: number): number => {
    if (n < 0) return 0;
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  };

  const nCr = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    return fact(n) / (fact(r) * fact(n - r));
  };

  const nPr = (n: number, r: number): number => {
    if (r < 0 || r > n) return 0;
    return fact(n) / fact(n - r);
  };

  const erf = (x: number): number => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-absX * absX);
    return sign * y;
  };

  const normCDF = (x: number, mean: number, sd: number): number => {
    return 0.5 * (1 + erf((x - mean) / (sd * Math.sqrt(2))));
  };

  const invNorm = (area: number, mean: number, sd: number): number => {
    if (area <= 0) return mean - 5 * sd;
    if (area >= 1) return mean + 5 * sd;

    const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
    const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
    const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];

    const q = area < 0.5 ? area : 1 - area;
    let z: number;

    if (q > 0.02425) {
      const r = q - 0.5;
      const r2 = r * r;
      z = (r * ((((a[0] * r2 + a[1]) * r2 + a[2]) * r2 + a[3]) * r2 + a[4]) * r2 + a[5]) /
          (((((b[0] * r2 + b[1]) * r2 + b[2]) * r2 + b[3]) * r2 + b[4]) * r2 + 1);
    } else {
      const r = Math.sqrt(-Math.log(q));
      z = (((((c[0] * r + c[1]) * r + c[2]) * r + c[3]) * r + c[4]) * r + c[5]) /
          ((((d[0] * r + d[1]) * r + d[2]) * r + d[3]) * r + 1);
      if (area < 0.5) z = -z;
    }
    return mean + z * sd;
  };

  // Keyboard button click handler
  const handleKeyClick = (key: string) => {
    if (key === 'AC') {
      setExpression('');
      setDisplayResult('0');
      setDisplayFraction('0');
      setDisplayDecimal('0.0000');
      setIsShift(false);
      setIsAlpha(false);
      return;
    }

    if (key === 'DEL') {
      setExpression((prev) => prev.slice(0, -1));
      return;
    }

    if (key === 'SHIFT') {
      setIsShift(!isShift);
      return;
    }

    if (key === 'ALPHA') {
      setIsAlpha(!isAlpha);
      return;
    }

    if (key === '=') {
      evaluateExpression();
      return;
    }

    if (key === 'Ans') {
      setExpression((prev) => prev + lastAns.toString());
      return;
    }

    // Insert key into expression
    setExpression((prev) => prev + key);
    setIsShift(false);
    setIsAlpha(false);
  };

  // Switch between fraction and decimal (S<=>D button)
  const toggleFractionDecimal = () => {
    if (isShowingFraction) {
      setDisplayResult(displayDecimal);
      setIsShowingFraction(false);
    } else {
      setDisplayResult(displayFraction);
      setIsShowingFraction(true);
    }
  };

  // Evaluate current expression (supports integrals, combinatorics, powers, etc.)
  const evaluateExpression = async () => {
    if (!expression.trim()) return;

    // If expression contains an integral "int(...)", send to dedicated calculus engine
    if (expression.includes('int(') || expression.includes('Phi(') || expression.includes('sum(')) {
      try {
        const response = await aiFetch('/api/tutor/solve-math', {
          method: 'POST',
          body: JSON.stringify({ rawInput: expression }),
        });
        const res = await response.json();
        if (res.success && res.data) {
          const d = res.data;
          setDisplayFraction(d.step4FinalFraction || '1');
          setDisplayDecimal(d.step4FinalDecimal || '1.0000');
          setDisplayResult(d.step4FinalDecimal || '1.0000');
          setIsShowingFraction(false);
          const num = parseFloat(d.step4FinalDecimal || '0');
          setLastAns(isNaN(num) ? 0 : num);

          // Update continuous result panel as well
          setContinuousResult({
            title: d.parsedTitle || 'Bài toán Tích phân & Biến ngẫu nhiên liên tục',
            step1: d.step1Rephrased || expression,
            step2: d.step2Antiderivative || 'Nguyên hàm F(x)...',
            step3: d.step3SubstituteLimits || 'Thế cận F(b) - F(a)...',
            fraction: d.step4FinalFraction || '---',
            decimal: d.step4FinalDecimal || '---',
            summary: d.step4Summary || '',
            casioGuide: d.casioGuide?.keySequence || [],
            infinityTip: d.casioGuide?.infinityNote || '',
          });
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Standard mathematical evaluation
    try {
      let expr = expression;

      // Combinatorics: 10C3 -> nCr(10, 3), 10P3 -> nPr(10, 3)
      expr = expr.replace(/(\d+)C(\d+)/g, (_, n, r) => nCr(parseInt(n), parseInt(r)).toString());
      expr = expr.replace(/(\d+)P(\d+)/g, (_, n, r) => nPr(parseInt(n), parseInt(r)).toString());

      // Factorial: 5! -> fact(5)
      expr = expr.replace(/(\d+)!/g, (_, n) => fact(parseInt(n)).toString());

      // Symbols
      expr = expr.replace(/×/g, '*').replace(/÷/g, '/');
      expr = expr.replace(/π/g, 'Math.PI').replace(/e/g, 'Math.E');
      expr = expr.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
      expr = expr.replace(/√(\d+)/g, 'Math.sqrt($1)');
      expr = expr.replace(/ln\(([^)]+)\)/g, 'Math.log($1)');
      expr = expr.replace(/log\(([^)]+)\)/g, 'Math.log10($1)');
      expr = expr.replace(/\^/g, '**');

      const fn = new Function(`return (${expr});`);
      const res = fn();
      const numRes = typeof res === 'number' && !isNaN(res) ? res : 0;

      const decStr = numRes.toFixed(4);
      setDisplayDecimal(decStr);
      setDisplayFraction(Number.isInteger(numRes) ? numRes.toString() : numRes.toFixed(6));
      setDisplayResult(decStr);
      setIsShowingFraction(false);
      setLastAns(numRes);
    } catch (err) {
      setDisplayResult('LỖI CÚ PHÁP (Syntax ERROR)');
    }
  };

  // Solve Continuous Random Variable Problem (Find k, Expectation, Variance, Probability)
  const handleSolveContinuousProblem = async () => {
    setIsSolvingContinuous(true);
    let rawQuery = '';

    if (continuousTaskType === 'find_k') {
      rawQuery = `Tìm hằng số k để f(x) = ${densityFunction} là hàm mật độ xác suất trên đoạn [${boundA}, ${boundB}]. Nghĩa là int(${boundA}, ${boundB}, ${densityFunction}) = 1.`;
    } else if (continuousTaskType === 'prob_interval') {
      rawQuery = `Biết f(x) = ${densityFunction} trên [${boundA}, ${boundB}]. Tính xác suất P(${probA} < X < ${probB}) = int(${probA}, ${probB}, ${densityFunction}).`;
    } else if (continuousTaskType === 'expectation_var') {
      rawQuery = `Biết f(x) = ${densityFunction} trên [${boundA}, ${boundB}]. Hãy tính Kỳ vọng E(X) = int(${boundA}, ${boundB}, x*(${densityFunction})) và Phương sai Var(X) = E(X^2) - [E(X)]^2.`;
    } else if (continuousTaskType === 'cdf_fx') {
      rawQuery = `Biết f(x) = ${densityFunction} trên [${boundA}, ${boundB}]. Hãy tìm hàm phân phối tích lũy F(x) = int(${boundA}, x, ${densityFunction}).`;
    } else {
      rawQuery = `Tính tích phân: int(${boundA}, ${boundB}, ${densityFunction}).`;
    }

    try {
      const response = await aiFetch('/api/tutor/solve-math', {
        method: 'POST',
        body: JSON.stringify({ rawInput: rawQuery }),
      });
      const res = await response.json();
      if (res.success && res.data) {
        const d = res.data;
        setContinuousResult({
          title: d.parsedTitle || 'Bài toán Biến ngẫu nhiên liên tục',
          step1: d.step1Rephrased || rawQuery,
          step2: d.step2Antiderivative || 'Tìm nguyên hàm F(x)...',
          step3: d.step3SubstituteLimits || 'Thế cận F(b) - F(a)...',
          fraction: d.step4FinalFraction || '---',
          decimal: d.step4FinalDecimal || '---',
          summary: d.step4Summary || '',
          casioGuide: d.casioGuide?.keySequence || [],
          infinityTip: d.casioGuide?.infinityNote || '',
        });

        // Sync with Casio LCD screen
        setDisplayFraction(d.step4FinalFraction || '---');
        setDisplayDecimal(d.step4FinalDecimal || '---');
        setDisplayResult(d.step4FinalDecimal || '---');
        setExpression(`int(${boundA}, ${boundB}, ${densityFunction})`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSolvingContinuous(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key >= '0' && e.key <= '9') {
        handleKeyClick(e.key);
      } else if (e.key === '+' || e.key === '-' || e.key === '(' || e.key === ')') {
        handleKeyClick(e.key);
      } else if (e.key === '*') {
        handleKeyClick('×');
      } else if (e.key === '/') {
        handleKeyClick('÷');
      } else if (e.key === '.' || e.key === ',') {
        handleKeyClick('.');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        evaluateExpression();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyClick('DEL');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleKeyClick('AC');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expression, lastAns]);

  // Classic FX-570VN Distr: P(t), Q(t), R(t)
  const calcFX570Distr = (type: 'P' | 'Q' | 'R') => {
    const t = parseFloat(fx570TValue);
    if (isNaN(t)) return;

    const pVal = normCDF(t, 0, 1);
    let res = 0;
    if (type === 'P') {
      res = pVal; // P(Z <= t)
      setDisplayResult(res.toFixed(5));
      setDisplayDecimal(res.toFixed(4));
      setExpression(`P(${t})`);
    } else if (type === 'Q') {
      res = Math.abs(pVal - 0.5); // P(0 <= Z <= t)
      setDisplayResult(res.toFixed(5));
      setDisplayDecimal(res.toFixed(4));
      setExpression(`Q(${t})`);
    } else if (type === 'R') {
      res = 1 - pVal; // P(Z >= t)
      setDisplayResult(res.toFixed(5));
      setDisplayDecimal(res.toFixed(4));
      setExpression(`R(${t})`);
    }
    setLastAns(res);
  };

  // Critical Value z-alpha / t-alpha calculator
  const calcCriticalZ = () => {
    const a = parseFloat(alphaLevel);
    if (isNaN(a) || a <= 0 || a >= 1) return;

    // z_(alpha/2) for two-tailed, z_alpha for one-tailed
    const zOneTail = invNorm(1 - a, 0, 1);
    const zTwoTail = invNorm(1 - a / 2, 0, 1);

    setDisplayResult(zTwoTail.toFixed(4));
    setDisplayDecimal(zTwoTail.toFixed(4));
    setDisplayFraction(`z_{${a}/2} = ${zTwoTail.toFixed(4)}`);
    setExpression(`z_{${a}/2} = ${zTwoTail.toFixed(4)} (2 phía) | z_{${a}} = ${zOneTail.toFixed(4)} (1 phía)`);
  };

  const calcFX570ZScore = () => {
    const x = parseFloat(fx570XVal);
    const m = parseFloat(fx570MeanVal);
    const s = parseFloat(fx570SdVal);
    if (isNaN(x) || isNaN(m) || isNaN(s) || s === 0) return;

    const z = (x - m) / s;
    setFx570TValue(z.toFixed(4));
    setDisplayResult(z.toFixed(4));
    setDisplayDecimal(z.toFixed(4));
    setExpression(`t = (${x} - ${m}) / ${s}`);
    setLastAns(z);
  };

  // STAT calculations
  const calculateStats = () => {
    let totalFreq = 0;
    let sumX = 0;
    let sumX2 = 0;
    const values: number[] = [];

    statRows.forEach((row) => {
      const x = parseFloat(row.x);
      const f = parseFloat(row.freq);
      if (!isNaN(x) && !isNaN(f) && f > 0) {
        totalFreq += f;
        sumX += x * f;
        sumX2 += x * x * f;
        for (let i = 0; i < f; i++) values.push(x);
      }
    });

    if (totalFreq === 0) return;

    const mean = sumX / totalFreq;
    const variancePop = sumX2 / totalFreq - mean * mean;
    const sdPop = Math.sqrt(Math.max(0, variancePop));

    const varianceSample = totalFreq > 1 ? (sumX2 - (sumX * sumX) / totalFreq) / (totalFreq - 1) : 0;
    const sdSample = Math.sqrt(Math.max(0, varianceSample));

    setStatSummary({
      n: totalFreq,
      mean: parseFloat(mean.toFixed(4)),
      sumX: parseFloat(sumX.toFixed(2)),
      sumX2: parseFloat(sumX2.toFixed(2)),
      varianceSample: parseFloat(varianceSample.toFixed(4)),
      sdSample: parseFloat(sdSample.toFixed(4)),
      variancePop: parseFloat(variancePop.toFixed(4)),
      sdPop: parseFloat(sdPop.toFixed(4)),
      minX: values.length > 0 ? Math.min(...values) : 0,
      maxX: values.length > 0 ? Math.max(...values) : 0,
    });
  };

  // DIST calculations (FX-580VN)
  const calculateDistribution = () => {
    if (distType === 'normal_cd') {
      const l = parseFloat(distInputs.lower || '-1.96');
      const u = parseFloat(distInputs.upper || '1.96');
      const m = parseFloat(distInputs.mean || '0');
      const s = parseFloat(distInputs.sd || '1');
      const res = normCDF(u, m, s) - normCDF(l, m, s);
      setDistResult(parseFloat(res.toFixed(5)));
    } else if (distType === 'normal_pd') {
      const x = parseFloat(distInputs.upper || '0');
      const m = parseFloat(distInputs.mean || '0');
      const s = parseFloat(distInputs.sd || '1');
      const res = (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - m, 2) / (2 * s * s));
      setDistResult(parseFloat(res.toFixed(5)));
    } else if (distType === 'inv_normal') {
      const area = parseFloat(distInputs.area || '0.95');
      const m = parseFloat(distInputs.mean || '0');
      const s = parseFloat(distInputs.sd || '1');
      const res = invNorm(area, m, s);
      setDistResult(parseFloat(res.toFixed(5)));
    } else if (distType === 'binom_pd') {
      const k = parseInt(distInputs.k || '3');
      const n = parseInt(distInputs.n || '10');
      const p = parseFloat(distInputs.p || '0.5');
      const res = nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
      setDistResult(parseFloat(res.toFixed(5)));
    } else if (distType === 'binom_cd') {
      const k = parseInt(distInputs.k || '3');
      const n = parseInt(distInputs.n || '10');
      const p = parseFloat(distInputs.p || '0.5');
      let cum = 0;
      for (let i = 0; i <= k; i++) cum += nCr(n, i) * Math.pow(p, i) * Math.pow(1 - p, n - i);
      setDistResult(parseFloat(cum.toFixed(5)));
    } else if (distType === 'poisson_pd') {
      const k = parseInt(distInputs.k || '2');
      const lam = parseFloat(distInputs.lambda || '4');
      const res = (Math.pow(lam, k) * Math.exp(-lam)) / fact(k);
      setDistResult(parseFloat(res.toFixed(5)));
    } else if (distType === 'poisson_cd') {
      const k = parseInt(distInputs.k || '2');
      const lam = parseFloat(distInputs.lambda || '4');
      let cum = 0;
      for (let i = 0; i <= k; i++) cum += (Math.pow(lam, i) * Math.exp(-lam)) / fact(i);
      setDistResult(parseFloat(cum.toFixed(5)));
    }
  };

  useEffect(() => {
    if (activeMode === 'STAT') calculateStats();
    if (activeMode === 'DIST') calculateDistribution();
  }, [activeMode, statRows, distType, distInputs]);

  return (
    <div className="space-y-6">
      {/* Top Banner - Neon Modern Styling */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-3 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30 font-black text-sm shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              🧮 CASIO PRO
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Máy Tính Xác Suất Thống Kê Toàn Diện</span>
                <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                  Rời Rạc & Liên Tục Tích Phân
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                100% Tiếng Việt • Giải tích phân xác định, tích phân suy rộng $\pm\infty$, tìm hằng số $k$, kỳ vọng $E(X)$, phương sai $Var(X)$ và bảng số liệu thống kê.
              </p>
            </div>
          </div>

          {/* Model Switcher & Standalone Full HTML Simulator Link */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/casio-simulator.html"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,255,157,0.4)] flex items-center gap-1.5 hover:scale-105 transition-all text-xs"
              title="Mở file HTML độc lập chứa đầy đủ bàn phím ảo MathLive và Nerdamer JS"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Mở Máy Tính Casio Độc Lập (Full HTML)</span>
            </a>

            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 px-2">Dòng máy:</span>
              <button
                onClick={() => setModelType('FX-580VN')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  modelType === 'FX-580VN'
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                fx-580VN X
              </button>
              <button
                onClick={() => setModelType('FX-570VN')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  modelType === 'FX-570VN'
                    ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                fx-570VN PLUS
              </button>
            </div>
          </div>
        </div>

        {/* 5 Main Feature Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveMode('COMP')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'COMP'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>1. BÀN PHÍM CASIO & TÍNH TOÁN (COMP)</span>
          </button>

          <button
            onClick={() => setActiveMode('CONTINUOUS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'CONTINUOUS'
                ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)] font-black'
                : 'bg-slate-800/90 text-emerald-300 hover:bg-slate-700 border border-emerald-500/40'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>2. BIẾN LIÊN TỤC & TÍCH PHÂN (TÌM k, E(X), Var(X))</span>
          </button>

          <button
            onClick={() => setActiveMode('FX570_DISTR')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'FX570_DISTR'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>3. PHÂN PHỐI CHUẨN P(t), Q(t), R(t) & z-alpha</span>
          </button>

          <button
            onClick={() => setActiveMode('STAT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'STAT'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>4. THỐNG KÊ 1-VAR (BẢNG TẦN SỐ)</span>
          </button>

          <button
            onClick={() => setActiveMode('DIST')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'DIST'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>5. PHÂN PHỐI FX-580 (NHỊ THỨC, POISSON)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Physical Casio Calculator Body (7 Cols) */}
        <div
          className={`lg:col-span-7 border-4 rounded-3xl p-5 shadow-2xl space-y-4 max-w-xl mx-auto w-full transition-all ${
            modelType === 'FX-570VN'
              ? 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-slate-500 shadow-[0_0_20px_rgba(100,116,139,0.3)]'
              : 'bg-slate-950 border-cyan-500/40 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
          }`}
        >
          {/* Brand & Model Header */}
          <div className="flex items-center justify-between text-slate-300 text-[10px] font-mono tracking-widest px-1">
            <span className="font-extrabold text-white tracking-widest text-sm">CASIO</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded text-[11px] ${
                modelType === 'FX-570VN'
                  ? 'bg-slate-600 text-amber-300 border border-slate-500'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              }`}
            >
              {modelType === 'FX-570VN' ? 'fx-570VN PLUS • NATURAL V.P.A.M.' : 'fx-580VN X • CLASSWIZ'}
            </span>
          </div>

          {/* LCD Screen Container */}
          <div
            className={`p-3.5 rounded-xl border-2 border-slate-900 shadow-inner font-mono min-h-[110px] flex flex-col justify-between select-none ${
              modelType === 'FX-570VN'
                ? 'bg-[#98a88a] text-slate-950'
                : 'bg-[#b6cca8] text-slate-950'
            }`}
          >
            {/* Status Indicators Line */}
            <div className="flex items-center justify-between text-[10px] border-b border-black/15 pb-1 font-bold">
              <div className="flex gap-2">
                <span className={isShift ? 'bg-black text-white px-1 rounded' : 'opacity-30'}>SHIFT</span>
                <span className={isAlpha ? 'bg-black text-white px-1 rounded' : 'opacity-30'}>ALPHA</span>
                <span className="opacity-90">D</span>
                <span className="opacity-90">MATH</span>
                <span className="bg-black/10 px-1 rounded">{activeMode}</span>
              </div>
              <span className="text-[10px] font-black text-slate-800">
                NATURAL TEXTBOOK DISPLAY (KaTeX)
              </span>
            </div>

            {/* Natural Textbook Display Line (Hiển thị ký hiệu toán học chuẩn KaTeX) */}
            <div className="min-h-[46px] flex items-center justify-end overflow-x-auto whitespace-nowrap py-1 px-1 font-bold text-slate-950">
              <div
                className="text-base sm:text-lg font-mono text-slate-950 tracking-wide inline-block"
                dangerouslySetInnerHTML={{ __html: renderRawMathToKatexHtml(expression || '0', false) }}
              />
            </div>

            {/* Expression Raw Sub-Line */}
            <div className="text-right text-[10px] tracking-wider overflow-x-auto whitespace-nowrap text-slate-700/80 font-mono">
              [Phím nhập: {expression || '0'}]
            </div>

            {/* Main Result Line with Parallel Fraction & Decimal Indicator */}
            <div className="flex items-baseline justify-between border-t border-black/10 pt-1">
              <div className="text-[10px] font-bold text-slate-700">
                {isShowingFraction ? 'DẠNG PHÂN SỐ' : 'DẠNG THẬP PHÂN'}
              </div>
              <div className="text-right text-2xl font-black tracking-tight overflow-x-auto whitespace-nowrap text-slate-950">
                = {displayResult}
              </div>
            </div>
          </div>

          {/* 3 SPECIAL FUNCTION BUTTON GROUPS (VIRTUAL KEYPAD) */}
          <div className="space-y-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
            {/* Group 1: Continuous Calculus Buttons */}
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                ⚡ Nhóm Giải Tích & Biến Liên Tục:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleKeyClick('int(')}
                  className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                  title="Tích phân xác định int(a, b, f(x))"
                >
                  ∫dx
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('int(-inf, +inf, ')}
                  className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                  title="Tích phân suy rộng int(-inf, +inf, f(x))"
                >
                  ∫₋∞⁺∞
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('+inf')}
                  className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                  title="Dương vô cực (+inf)"
                >
                  +∞
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('-inf')}
                  className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                  title="Âm vô cực (-inf)"
                >
                  -∞
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('/')}
                  className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                  title="Phân số a/b"
                >
                  a/b
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('^')}
                  className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                  title="Số mũ x^y"
                >
                  xʸ
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('sqrt(')}
                  className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                  title="Căn bậc hai sqrt(x)"
                >
                  √x
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('e^(')}
                  className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                  title="Hằng số e mũ x: e^(x)"
                >
                  eˣ
                </button>
              </div>
            </div>

            {/* Group 2: Combinatorics & Discrete */}
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                🎲 Nhóm Tổ Hợp & Rời Rạc:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleKeyClick('C')}
                  className="p-2 bg-amber-950/70 hover:bg-amber-900 text-amber-300 font-bold rounded-lg border border-amber-800/80 text-center"
                  title="Tổ hợp nCr (VD: 10C3)"
                >
                  nCr
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('P')}
                  className="p-2 bg-amber-950/70 hover:bg-amber-900 text-amber-300 font-bold rounded-lg border border-amber-800/80 text-center"
                  title="Chỉnh hợp nPr (VD: 10P3)"
                >
                  nPr
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('!')}
                  className="p-2 bg-amber-950/70 hover:bg-amber-900 text-amber-300 font-bold rounded-lg border border-amber-800/80 text-center"
                  title="Giai thừa x!"
                >
                  x!
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('sum(')}
                  className="p-2 bg-amber-950/70 hover:bg-amber-900 text-amber-300 font-bold rounded-lg border border-amber-800/80 text-center"
                  title="Tổng xích-ma sum(a, b, f(x))"
                >
                  Σ (Sigma)
                </button>
              </div>
            </div>

            {/* Group 3: Distribution & Statistics */}
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                📊 Nhóm Phân Phối & Thống Kê:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleKeyClick('Phi(')}
                  className="p-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/80 text-center"
                  title="Hàm phân phối chuẩn tắc tích lũy Phi(z)"
                >
                  Φ(z)
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('P(X <= ')}
                  className="p-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/80 text-center"
                  title="Xác suất tích lũy P(X <= x)"
                >
                  P(X ≤ x)
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('E(X) = int(')}
                  className="p-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/80 text-center"
                  title="Kỳ vọng E(X) = int(a, b, x*f(x))"
                >
                  E(X)
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('Var(X) = ')}
                  className="p-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/80 text-center"
                  title="Phương sai Var(X) = E(X^2) - [E(X)]^2"
                >
                  Var(X)
                </button>
                <button
                  type="button"
                  onClick={() => handleKeyClick('sigma = ')}
                  className="p-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/80 text-center"
                  title="Độ lệch chuẩn sigma"
                >
                  σ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMode('FX570_DISTR');
                    calcCriticalZ();
                  }}
                  className="p-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/80 text-center"
                  title="Tra giá trị tới hạn z-alpha"
                >
                  z_α
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('FX570_DISTR')}
                  className="p-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/80 text-center"
                  title="Tra giá trị tới hạn Student t-alpha"
                >
                  t_α
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('STAT')}
                  className="p-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/80 text-center"
                  title="Tính Trung bình mẫu x-bar"
                >
                  x̄ (Mean)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('STAT')}
                  className="p-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/80 text-center"
                  title="Tính Phương sai mẫu s^2"
                >
                  s² (Var)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('STAT')}
                  className="p-2 bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 font-bold rounded-lg border border-emerald-800/80 text-center"
                  title="Tính Độ lệch chuẩn mẫu s"
                >
                  s (StdDev)
                </button>
              </div>
            </div>
          </div>

          {/* Standard Casio Control Keys */}
          <div className="grid grid-cols-5 gap-2 text-[11px] font-bold text-center">
            <button
              onClick={() => handleKeyClick('SHIFT')}
              className={`py-2 rounded-lg border transition-all ${
                isShift ? 'bg-amber-400 text-black' : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              SHIFT
            </button>
            <button
              onClick={() => handleKeyClick('ALPHA')}
              className={`py-2 rounded-lg border transition-all ${
                isAlpha ? 'bg-rose-400 text-black' : 'bg-rose-700 hover:bg-rose-600 text-white'
              }`}
            >
              ALPHA
            </button>
            <button
              onClick={() => {
                setActiveMode((prev) => (prev === 'COMP' ? 'CONTINUOUS' : prev === 'CONTINUOUS' ? 'FX570_DISTR' : 'COMP'));
              }}
              className="py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 font-bold"
            >
              CHẾ ĐỘ
            </button>
            <button
              onClick={() => handleKeyClick('DEL')}
              className="py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-lg border border-rose-900 font-bold"
            >
              XÓA (DEL)
            </button>
            <button
              onClick={() => handleKeyClick('AC')}
              className="py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg border border-red-700 font-bold"
            >
              XÓA HẾT (AC)
            </button>
          </div>

          {/* Numeric Keypad & Operators */}
          <div className="grid grid-cols-5 gap-1.5 text-sm font-bold text-slate-100">
            {/* Row 1 */}
            <button onClick={() => handleKeyClick('7')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">7</button>
            <button onClick={() => handleKeyClick('8')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">8</button>
            <button onClick={() => handleKeyClick('9')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">9</button>
            <button onClick={() => handleKeyClick('÷')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-cyan-400">÷</button>
            <button onClick={() => handleKeyClick('x')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-amber-300 font-mono">X</button>

            {/* Row 2 */}
            <button onClick={() => handleKeyClick('4')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">4</button>
            <button onClick={() => handleKeyClick('5')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">5</button>
            <button onClick={() => handleKeyClick('6')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">6</button>
            <button onClick={() => handleKeyClick('×')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-cyan-400">×</button>
            <button onClick={() => handleKeyClick('(')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl">(</button>

            {/* Row 3 */}
            <button onClick={() => handleKeyClick('1')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">1</button>
            <button onClick={() => handleKeyClick('2')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">2</button>
            <button onClick={() => handleKeyClick('3')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">3</button>
            <button onClick={() => handleKeyClick('-')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-cyan-400">-</button>
            <button onClick={() => handleKeyClick(')')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl">)</button>

            {/* Row 4 */}
            <button onClick={() => handleKeyClick('0')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">0</button>
            <button onClick={() => handleKeyClick('.')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">.</button>
            <button onClick={toggleFractionDecimal} className="p-3 bg-cyan-700 hover:bg-cyan-600 rounded-xl text-xs text-white" title="Chuyển đổi phân số <=> thập phân">
              {'S<=>D'}
            </button>
            <button onClick={() => handleKeyClick('+')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-cyan-400">+</button>
            <button
              onClick={() => handleKeyClick('=')}
              className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl text-white font-black shadow-lg"
            >
              =
            </button>
          </div>
        </div>

        {/* Right Info & Continuous Engine Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* TAB 2: DEDICATED CONTINUOUS RANDOM VARIABLE SOLVER */}
          {activeMode === 'CONTINUOUS' && (
            <div className="bg-slate-900 border-2 border-amber-400/50 p-5 rounded-3xl space-y-4 shadow-xl text-xs text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Chuyên Đề Biến Ngẫu Nhiên Liên Tục (Tích Phân)</span>
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded font-bold">
                  Giải Tự Động 4 Bước
                </span>
              </div>

              {/* Task Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 text-[11px]">Chọn dạng bài toán cần giải:</label>
                <select
                  value={continuousTaskType}
                  onChange={(e) => setContinuousTaskType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-bold text-xs outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="find_k">1. Tìm hằng số k để f(x) là hàm mật độ xác suất</option>
                  <option value="prob_interval">2. Tính xác suất trong khoảng P(a &lt; X &lt; b)</option>
                  <option value="expectation_var">3. Tính Kỳ vọng E(X) và Phương sai Var(X)</option>
                  <option value="cdf_fx">4. Tìm hàm phân phối tích lũy F(x)</option>
                  <option value="general_int">5. Tính Tích phân xác định / Suy rộng bất kỳ</option>
                </select>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 p-3 bg-slate-950/70 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">
                    Hàm số f(x) (dùng biến x và hằng số k nếu có):
                  </label>
                  <input
                    type="text"
                    value={densityFunction}
                    onChange={(e) => setDensityFunction(e.target.value)}
                    placeholder="VD: k * x^2 hoặc 2*e^(-2*x) hoặc 3*x^(-4)"
                    className="w-full p-2 rounded-xl border border-slate-700 bg-slate-800 text-amber-300 font-mono font-bold text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-cyan-300 font-bold block mb-1">
                      Cận dưới a (nhập số hoặc -inf):
                    </label>
                    <input
                      type="text"
                      value={boundA}
                      onChange={(e) => setBoundA(e.target.value)}
                      placeholder="0 hoặc -inf"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono font-bold text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-cyan-300 font-bold block mb-1">
                      Cận trên b (nhập số hoặc +inf):
                    </label>
                    <input
                      type="text"
                      value={boundB}
                      onChange={(e) => setBoundB(e.target.value)}
                      placeholder="2 hoặc +inf"
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-950 text-white font-mono font-bold text-xs focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                {continuousTaskType === 'prob_interval' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                    <div>
                      <label className="text-[11px] text-cyan-300 font-bold block mb-1">Khoảng tính P: Cận dưới</label>
                      <input
                        type="text"
                        value={probA}
                        onChange={(e) => setProbA(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-cyan-300 font-bold block mb-1">Khoảng tính P: Cận trên</label>
                      <input
                        type="text"
                        value={probB}
                        onChange={(e) => setProbB(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSolveContinuousProblem}
                  disabled={isSolvingContinuous}
                  className="w-full py-3 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all text-xs flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>{isSolvingContinuous ? 'Đang giải tích phân 4 bước...' : 'GIẢI CHI TIẾT 4 BƯỚC & XUẤT 2 DẠNG KẾT QUẢ'}</span>
                </button>
              </div>

              {/* 4-Step Solution View */}
              {continuousResult && (
                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-slate-950 rounded-2xl border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] space-y-2.5">
                    <span className="font-black text-cyan-300 text-xs sm:text-sm block">
                      📌 {continuousResult.title}
                    </span>

                    <div className="space-y-2 text-xs leading-relaxed">
                      <div>
                        <strong className="text-cyan-400 block font-bold">Bước 1 (Đề bài KaTeX):</strong>
                        <div className="py-1 text-cyan-200">
                          <MathFormula math={continuousResult.step1} />
                        </div>
                      </div>
                      <div>
                        <strong className="text-cyan-400 block font-bold">Bước 2 (Tìm nguyên hàm):</strong>
                        <p className="text-slate-100 font-semibold">{continuousResult.step2}</p>
                      </div>
                      <div>
                        <strong className="text-cyan-400 block font-bold">Bước 3 (Thế cận/lim):</strong>
                        <p className="text-slate-100 font-semibold">{continuousResult.step3}</p>
                      </div>
                    </div>

                    {/* Step 4 Parallel Dual Format */}
                    <div className="p-3 bg-emerald-950/50 border border-emerald-500/50 rounded-xl space-y-1">
                      <span className="text-[11px] text-emerald-300 font-black block uppercase tracking-wider">
                        Bước 4: Kết quả song song (Phân số tối giản & Thập phân 4 chữ số)
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-center pt-1">
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-emerald-500/40">
                          <span className="text-[10px] text-slate-300 block font-bold">Phân số tối giản</span>
                          <span className="text-base font-black font-mono text-emerald-300">{continuousResult.fraction}</span>
                        </div>
                        <div className="bg-slate-900 p-2.5 rounded-lg border border-emerald-500/40">
                          <span className="text-[10px] text-slate-300 block font-bold">Thập phân (4 chữ số)</span>
                          <span className="text-base font-black font-mono text-cyan-300">{continuousResult.decimal}</span>
                        </div>
                      </div>
                    </div>

                    {/* Casio Exam Guide */}
                    {continuousResult.casioGuide && continuousResult.casioGuide.length > 0 && (
                      <div className="p-3 bg-slate-900 border border-cyan-500/40 rounded-xl text-xs space-y-1.5 text-slate-100">
                        <strong className="text-cyan-300 block font-black">💡 Cách bấm máy Casio fx-580VN X trong phòng thi:</strong>
                        <ul className="list-disc list-inside space-y-1 font-medium">
                          {continuousResult.casioGuide.map((step: string, sIdx: number) => (
                            <li key={sIdx}>{step}</li>
                          ))}
                        </ul>
                        {continuousResult.infinityTip && (
                          <div className="p-2 bg-cyan-950/80 rounded-lg border border-cyan-500/40 text-cyan-200 font-bold text-[11px] mt-1">
                            {continuousResult.infinityTip}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1: COMP HELPER */}
          {activeMode === 'COMP' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xs text-xs text-slate-300">
              <h3 className="font-extrabold text-cyan-400 flex items-center gap-1.5 text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Hướng Dẫn Bấm Máy & Ký Hiệu Xác Suất</span>
              </h3>
              <p className="text-slate-400 leading-relaxed">
                Bạn có thể bấm trực tiếp bàn phím máy tính trên màn hình hoặc gõ từ bàn phím máy tính:
              </p>
              <ul className="space-y-2 text-slate-300">
                <li>• <strong>Tích phân xác định:</strong> Bấm <kbd className="bg-cyan-950 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-800">∫dx</kbd> hoặc gõ <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">int(0, 2, 3*x^2)</code> rồi bấm <kbd className="text-cyan-400 font-bold">=</kbd>.</li>
                <li>• <strong>Tổ hợp nCr:</strong> Bấm số n -&gt; bấm nCr -&gt; bấm số r (VD: <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">10C3</code> để tính <MathFormula math="C_{10}^3 = 120" />).</li>
                <li>• <strong>Công thức Bernoulli:</strong> <code className="bg-slate-800 px-1 py-0.5 rounded text-cyan-300">10C3 × 0.5^3 × 0.5^7</code> rồi bấm <kbd className="text-cyan-400 font-bold">=</kbd>.</li>
                <li>• <strong>Chuyển đổi phân số ⇔ thập phân:</strong> Bấm phím <kbd className="bg-cyan-700 text-white px-1.5 py-0.5 rounded font-bold">{'S<=>D'}</kbd> để hiển thị giữa phân số tối giản và số thập phân 4 chữ số.</li>
              </ul>
            </div>
          )}

          {/* TAB 3: FX-570VN DISTR & CRITICAL VALUES */}
          {activeMode === 'FX570_DISTR' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xs text-xs text-slate-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Phân Phối Chuẩn & Tra Giá Trị Tới Hạn (DISTR)</span>
                </h3>
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded border border-cyan-500/30">
                  Chuẩn hóa Z
                </span>
              </div>

              {/* Critical Value Lookup (z-alpha and t-alpha) */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-cyan-500/30 space-y-2">
                <span className="font-bold text-cyan-300 text-[11px] block">
                  🔍 Tra ngược giá trị tới hạn chuẩn tắc z_α:
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-400 block mb-0.5">Mức ý nghĩa α</label>
                    <select
                      value={alphaLevel}
                      onChange={(e) => setAlphaLevel(e.target.value)}
                      className="w-full p-1.5 border rounded-lg bg-slate-800 text-xs font-bold text-white"
                    >
                      <option value="0.05">α = 0.05 (Độ tin cậy 95%)</option>
                      <option value="0.01">α = 0.01 (Độ tin cậy 99%)</option>
                      <option value="0.02">α = 0.02 (Độ tin cậy 98%)</option>
                      <option value="0.10">α = 0.10 (Độ tin cậy 90%)</option>
                    </select>
                  </div>
                  <button
                    onClick={calcCriticalZ}
                    className="mt-4 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-black font-extrabold rounded-lg text-xs"
                  >
                    Tra z_α
                  </button>
                </div>
              </div>

              {/* Conversion from X, Mean, SD to t */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-slate-300 text-[11px] block">
                  Chức năng chuẩn hóa: <MathFormula math="t = \frac{X - \mu}{\sigma}" />
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Giá trị X</label>
                    <input
                      type="number"
                      value={fx570XVal}
                      onChange={(e) => setFx570XVal(e.target.value)}
                      className="w-full p-1.5 border rounded bg-slate-800 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Kỳ vọng μ</label>
                    <input
                      type="number"
                      value={fx570MeanVal}
                      onChange={(e) => setFx570MeanVal(e.target.value)}
                      className="w-full p-1.5 border rounded bg-slate-800 text-xs font-semibold text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Độ lệch σ</label>
                    <input
                      type="number"
                      value={fx570SdVal}
                      onChange={(e) => setFx570SdVal(e.target.value)}
                      className="w-full p-1.5 border rounded bg-slate-800 text-xs font-semibold text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={calcFX570ZScore}
                  className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-[11px]"
                >
                  Tính giá trị t = (X - μ) / σ
                </button>
              </div>

              {/* Input t */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">
                  Giá trị biến chuẩn hóa t (hoặc z):
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={fx570TValue}
                  onChange={(e) => setFx570TValue(e.target.value)}
                  className="w-full p-2 border border-slate-700 rounded-xl bg-slate-800 text-xs font-bold text-cyan-300"
                />
              </div>

              {/* 3 Distr Buttons: P(t), Q(t), R(t) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => calcFX570Distr('P')}
                  className="p-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-center transition-all shadow"
                >
                  <span className="block text-xs">1: P(t)</span>
                  <span className="text-[10px] opacity-90 font-mono">P(Z ≤ t)</span>
                </button>

                <button
                  onClick={() => calcFX570Distr('Q')}
                  className="p-2.5 bg-cyan-700 hover:bg-cyan-600 text-white rounded-xl font-bold text-center transition-all shadow"
                >
                  <span className="block text-xs">2: Q(t)</span>
                  <span className="text-[10px] opacity-90 font-mono">P(0 ≤ Z ≤ t)</span>
                </button>

                <button
                  onClick={() => calcFX570Distr('R')}
                  className="p-2.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded-xl font-bold text-center transition-all shadow"
                >
                  <span className="block text-xs">3: R(t)</span>
                  <span className="text-[10px] opacity-90 font-mono">P(Z ≥ t)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: STAT 1-VAR (BẢNG TẦN SỐ) */}
          {activeMode === 'STAT' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3 shadow-xs text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm">
                  Bảng Nhập Liệu Thống Kê (1-Variable)
                </h3>
                <button
                  onClick={() => setStatRows([...statRows, { x: '', freq: '1' }])}
                  className="px-2.5 py-1 bg-cyan-500 text-black rounded-lg font-bold text-[10px]"
                >
                  + Thêm dòng
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-800 rounded-xl p-2 bg-slate-950">
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-1">
                  <span>Giá trị đại diện (x_i)</span>
                  <span>Tần số (n_i)</span>
                </div>
                {statRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={row.x}
                      onChange={(e) => {
                        const next = [...statRows];
                        next[idx].x = e.target.value;
                        setStatRows(next);
                      }}
                      placeholder="x_i"
                      className="p-1.5 border border-slate-700 rounded bg-slate-800 text-xs text-white"
                    />
                    <input
                      type="number"
                      value={row.freq}
                      onChange={(e) => {
                        const next = [...statRows];
                        next[idx].freq = e.target.value;
                        setStatRows(next);
                      }}
                      placeholder="n_i"
                      className="p-1.5 border border-slate-700 rounded bg-slate-800 text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              {statSummary && (
                <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30 space-y-1.5 text-xs">
                  <p className="font-bold text-cyan-400">📊 Kết quả đọc từ Casio 1-Variable Calc:</p>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[11px] text-slate-300">
                    <p>Cỡ mẫu (n): <strong className="text-white">{statSummary.n}</strong></p>
                    <p>Trung bình (<MathFormula math="\bar{x}" />): <strong className="text-cyan-300">{statSummary.mean}</strong></p>
                    <p>Phương sai mẫu (<MathFormula math="s^2" />): <strong className="text-emerald-300">{statSummary.varianceSample}</strong></p>
                    <p>Độ lệch mẫu (<MathFormula math="s_x" />): <strong className="text-emerald-300">{statSummary.sdSample}</strong></p>
                    <p>Tổng <MathFormula math="\sum x" />: <strong className="text-white">{statSummary.sumX}</strong></p>
                    <p>Tổng <MathFormula math="\sum x^2" />: <strong className="text-white">{statSummary.sumX2}</strong></p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: DIST (FX-580VN) */}
          {activeMode === 'DIST' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xs text-xs text-slate-300">
              <h3 className="font-bold text-white text-sm">
                Phân Phối Xác Suất Nâng Cao (MENU 7: DIST)
              </h3>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'normal_cd', label: '1: Normal CD (Tích lũy)' },
                  { id: 'normal_pd', label: '2: Normal PD (Mật độ)' },
                  { id: 'inv_normal', label: '3: Inverse Normal' },
                  { id: 'binom_pd', label: '4: Binomial PD (Nhị thức)' },
                  { id: 'binom_cd', label: '5: Binomial CD' },
                  { id: 'poisson_pd', label: '6: Poisson PD' },
                  { id: 'poisson_cd', label: '7: Poisson CD' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDistType(item.id as any)}
                    className={`p-2 rounded-lg text-left font-semibold transition-colors ${
                      distType === item.id
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {distResult !== null && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-center">
                  <span className="text-[11px] text-emerald-300 font-bold">Kết quả xác suất tính toán:</span>
                  <div className="text-2xl font-mono font-black text-emerald-400 mt-0.5">
                    {distResult}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
