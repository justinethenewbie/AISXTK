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
  Cpu,
  ArrowDownCircle,
  FileText,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { MathFormula } from './MathFormula';
import { aiFetch } from '../utils/apiHelper';
import { renderRawMathToKatexHtml } from '../utils/mathDisplayUtils';
import { HubExamCheatSheetModal } from './HubExamCheatSheetModal';

export const CasioCalculator: React.FC = () => {
  // Giao diện vỏ máy mô phỏng thực tế
  const [modelType, setModelType] = useState<'FX-580VN' | 'FX-570VN'>('FX-580VN');

  // Chế độ tính năng chọn lọc cho XSTK:
  // 'COMP': MENU 1 - Tính toán cơ bản, phân số, tổ hợp nCr, chỉnh hợp nPr, giai thừa n!, tích phân xác định ∫dx
  // 'EQUATION': MENU 9 - Giải hệ phương trình 2 ẩn (MENU 9 1 2) & PT bậc 2 (MENU 9 2 2) tìm tham số hàm mật độ
  // 'STAT': MENU 6 - Thống kê 1-Variable & Bảng tần số + Kỳ vọng/Phương sai biến rời rạc & Hồi quy tuyến tính
  // 'DIST': MENU 7 - Phân phối xác suất (Normal PD/CD, Inverse Normal, Binomial PD/CD, Poisson PD/CD)
  // 'CONTINUOUS': Chuyên đề Biến ngẫu nhiên liên tục (Tìm k tự động 4 bước, E(X), Var(X), P(a < X < b))
  // 'KEY_GUIDE': Cẩm nang bấm phím ngoài đời thực theo hướng dẫn thi HUB
  const [activeMode, setActiveMode] = useState<'COMP' | 'EQUATION' | 'STAT' | 'DIST' | 'CONTINUOUS' | 'KEY_GUIDE'>('COMP');

  // State mở Modal Tờ phao thi HUB (CamScanner)
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);

  // LCD Display State
  const [expression, setExpression] = useState('int(0, 2, 3*x^2)');
  const [displayResult, setDisplayResult] = useState('8');
  const [displayFraction, setDisplayFraction] = useState('8/1');
  const [displayDecimal, setDisplayDecimal] = useState('8.0000');
  const [isShowingFraction, setIsShowingFraction] = useState(false);
  const [lastAns, setLastAns] = useState(8);
  const [isShift, setIsShift] = useState(false);
  const [isAlpha, setIsAlpha] = useState(false);

  // EQUATION SOLVER STATE (MENU 9)
  // Hệ 2 phương trình: a1*x + b1*y = c1; a2*x + b2*y = c2
  const [eqMode, setEqMode] = useState<'system_2x2' | 'poly_deg2'>('system_2x2');
  const [eqA1, setEqA1] = useState('2');
  const [eqB1, setEqB1] = useState('2');
  const [eqC1, setEqC1] = useState('1');
  const [eqA2, setEqA2] = useState('2.6667');
  const [eqB2, setEqB2] = useState('2');
  const [eqC2, setEqC2] = useState('1.1667');
  const [eqResult, setEqResult] = useState<{ x: string; y: string } | null>({ x: '0.2500 (1/4)', y: '0.2500 (1/4)' });

  // PT bậc 2: a*x^2 + b*x + c = 0
  const [quadA, setQuadA] = useState('1');
  const [quadB, setQuadB] = useState('2');
  const [quadC, setQuadC] = useState('-4');
  const [quadResult, setQuadResult] = useState<{ x1: string; x2: string } | null>({ x1: '1.2361 (-1+√5)', x2: '-3.2361 (loại)' });

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
      'Bấm [MENU] [1] (COMP)',
      'Bấm phím Tích phân [∫dx] (dưới nút ALPHA)',
      'Nhập hàm bỏ k: X² (bấm ALPHA + X rồi x²)',
      'Nhập cận dưới: 0, cận trên: 2',
      'Bấm [=] nhận được 8/3. Suy ra k = 1 / (8/3) = 3/8 = 0.3750',
    ],
    infinityTip: 'LƯU Ý PHÒNG THI: Nếu cận là +∞ hãy nhập 10^9 hoặc 1×10^99; nếu là -∞ hãy nhập -10^9 hoặc -1×10^99.',
  });

  // STAT Data State (MENU 6: 1-Variable & 2-Variable Regression)
  const [statSubMode, setStatSubMode] = useState<'1-var' | 'discrete_rv' | 'regression'>('1-var');
  const [statRows, setStatRows] = useState<Array<{ x: string; freq: string }>>([
    { x: '25', freq: '12' },
    { x: '35', freq: '28' },
    { x: '45', freq: '35' },
    { x: '55', freq: '18' },
    { x: '65', freq: '7' },
  ]);
  const [statSummary, setStatSummary] = useState<any>(null);

  // Regression Data State (y = a + bx)
  const [regRows, setRegRows] = useState<Array<{ x: string; y: string }>>([
    { x: '1', y: '2' },
    { x: '2', y: '5' },
    { x: '3', y: '7' },
    { x: '4', y: '8' },
    { x: '5', y: '11' },
  ]);
  const [regSummary, setRegSummary] = useState<any>(null);

  // DIST Parameters State (MENU 7: FX-580VN)
  const [distType, setDistType] = useState<
    'normal_cd' | 'normal_pd' | 'inv_normal' | 'binom_pd' | 'binom_cd' | 'poisson_pd' | 'poisson_cd'
  >('normal_cd');
  const [distInputs, setDistInputs] = useState<Record<string, string>>({
    lower: '26',
    upper: '1000000',
    mean: '24',
    sd: '2',
    area: '0.05',
    k: '3',
    n: '10',
    p: '0.5',
    lambda: '4',
  });
  const [distResult, setDistResult] = useState<number | null>(0.15866);

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

  // Evaluate current expression
  const evaluateExpression = async () => {
    if (!expression.trim()) return;

    // Dedicated calculus engine for integrals
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
      expr = expr.replace(/(\d+)C(\d+)/g, (_, n, r) => nCr(parseInt(n), parseInt(r)).toString());
      expr = expr.replace(/(\d+)P(\d+)/g, (_, n, r) => nPr(parseInt(n), parseInt(r)).toString());
      expr = expr.replace(/(\d+)!/g, (_, n) => fact(parseInt(n)).toString());
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

  // Solve Equation Solver 2x2 (MENU 9 1 2)
  const handleSolve2x2 = () => {
    const a1 = parseFloat(eqA1);
    const b1 = parseFloat(eqB1);
    const c1 = parseFloat(eqC1);
    const a2 = parseFloat(eqA2);
    const b2 = parseFloat(eqB2);
    const c2 = parseFloat(eqC2);

    const D = a1 * b2 - a2 * b1;
    const Dx = c1 * b2 - c2 * b1;
    const Dy = a1 * c2 - a2 * c1;

    if (Math.abs(D) < 1e-9) {
      setEqResult({ x: 'Vô nghiệm hoặc vô số nghiệm', y: '---' });
    } else {
      const x = Dx / D;
      const y = Dy / D;
      setEqResult({
        x: `${x.toFixed(4)}`,
        y: `${y.toFixed(4)}`,
      });
      setDisplayResult(`x=${x.toFixed(4)}, y=${y.toFixed(4)}`);
    }
  };

  // Solve Quadratic Equation (MENU 9 2 2)
  const handleSolveQuad = () => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);

    if (a === 0) {
      if (b !== 0) {
        const x = -c / b;
        setQuadResult({ x1: x.toFixed(4), x2: 'Nghiệm đơn bậc 1' });
      }
      return;
    }

    const delta = b * b - 4 * a * c;
    if (delta < 0) {
      setQuadResult({ x1: 'Vô nghiệm thực (No Real Roots)', x2: '---' });
    } else {
      const x1 = (-b + Math.sqrt(delta)) / (2 * a);
      const x2 = (-b - Math.sqrt(delta)) / (2 * a);
      setQuadResult({
        x1: x1.toFixed(4),
        x2: x2.toFixed(4),
      });
      setDisplayResult(`x1=${x1.toFixed(4)}, x2=${x2.toFixed(4)}`);
    }
  };

  // Solve Continuous Random Variable Problem
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

  // STAT calculations (MENU 6: 1-Variable)
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

  // Regression calculations (MENU 6 2: y = a + bx)
  const calculateRegression = () => {
    let n = 0;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;
    let sumY2 = 0;

    regRows.forEach((row) => {
      const x = parseFloat(row.x);
      const y = parseFloat(row.y);
      if (!isNaN(x) && !isNaN(y)) {
        n++;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumX2 += x * x;
        sumY2 += y * y;
      }
    });

    if (n < 2) return;

    const denom = n * sumX2 - sumX * sumX;
    if (Math.abs(denom) < 1e-9) return;

    const b = (n * sumXY - sumX * sumY) / denom;
    const a = (sumY - b * sumX) / n;

    const denomR = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    const r = denomR !== 0 ? (n * sumXY - sumX * sumY) / denomR : 0;

    setRegSummary({
      n,
      a: parseFloat(a.toFixed(4)),
      b: parseFloat(b.toFixed(4)),
      r: parseFloat(r.toFixed(4)),
      r2: parseFloat((r * r).toFixed(4)),
    });
  };

  // DIST calculations (MENU 7: FX-580VN)
  const calculateDistribution = () => {
    if (distType === 'normal_cd') {
      const l = parseFloat(distInputs.lower || '26');
      const u = parseFloat(distInputs.upper || '1000000');
      const m = parseFloat(distInputs.mean || '24');
      const s = parseFloat(distInputs.sd || '2');
      const res = normCDF(u, m, s) - normCDF(l, m, s);
      setDistResult(parseFloat(res.toFixed(5)));
    } else if (distType === 'normal_pd') {
      const x = parseFloat(distInputs.upper || '24');
      const m = parseFloat(distInputs.mean || '24');
      const s = parseFloat(distInputs.sd || '2');
      const res = (1 / (s * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - m, 2) / (2 * s * s));
      setDistResult(parseFloat(res.toFixed(5)));
    } else if (distType === 'inv_normal') {
      const area = parseFloat(distInputs.area || '0.05');
      const m = parseFloat(distInputs.mean || '24');
      const s = parseFloat(distInputs.sd || '2');
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
    if (activeMode === 'STAT') {
      if (statSubMode === 'regression') calculateRegression();
      else calculateStats();
    }
    if (activeMode === 'DIST') calculateDistribution();
  }, [activeMode, statSubMode, statRows, regRows, distType, distInputs]);

  return (
    <div className="space-y-6">
      {/* Top Banner - Neon Modern Styling */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border-2 border-cyan-500/40 p-5 sm:p-6 rounded-3xl space-y-3 shadow-[0_0_25px_rgba(6,182,212,0.15)] relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30 font-black text-sm shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              🧮 CASIO FX-580
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  Giả Lập Máy Tính Casio fx-580VN X Chuẩn Phòng Thi
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  ClassWiz Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Chuyên biệt Xác suất Thống kê HUB • Bấm máy thực chiến ngoài đời • Rút gọn chức năng thừa, tập trung MENU 1, 6, 7, 9.
              </p>
            </div>
          </div>

          {/* Quick Actions: Open CamScanner Cheat Sheet & Model Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsCheatSheetOpen(true)}
              className="px-3.5 py-2 rounded-xl font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)] flex items-center gap-1.5 transition-all text-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>📜 Mở Tờ Công Thức HUB (CamScanner)</span>
            </button>

            <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-2xl border border-slate-700 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 px-2">Vỏ máy:</span>
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

        {/* 6 Essential Modes Tailored for Probability & Statistics */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveMode('COMP')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'COMP'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>MENU 1: TÍNH TOÁN (COMP)</span>
          </button>

          <button
            onClick={() => setActiveMode('EQUATION')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'EQUATION'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>MENU 9: HỆ PHƯƠNG TRÌNH & BẬC 2</span>
          </button>

          <button
            onClick={() => setActiveMode('STAT')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'STAT'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>MENU 6: THỐNG KÊ (STAT 1-VAR & HỒI QUY)</span>
          </button>

          <button
            onClick={() => setActiveMode('DIST')}
            className={`px-3 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeMode === 'DIST'
                ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>MENU 7: PHÂN PHỐI (CHUẨN, NHỊ THỨC, POISSON)</span>
          </button>

          <button
            onClick={() => setActiveMode('CONTINUOUS')}
            className={`px-3 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeMode === 'CONTINUOUS'
                ? 'bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-slate-800/90 text-emerald-300 hover:bg-slate-700 border border-emerald-500/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>BIẾN LIÊN TỤC & TÍCH PHÂN 4 BƯỚC</span>
          </button>

          <button
            onClick={() => setActiveMode('KEY_GUIDE')}
            className={`px-3 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeMode === 'KEY_GUIDE'
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-slate-800/90 text-amber-300 hover:bg-slate-700 border border-amber-500/40'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>CẨM NANG BẤM PHÍM PHÒNG THI</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
              modelType === 'FX-570VN' ? 'bg-[#98a88a] text-slate-950' : 'bg-[#b6cca8] text-slate-950'
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
                NATURAL TEXTBOOK DISPLAY
              </span>
            </div>

            {/* Natural Textbook Display Line (Hiển thị ký hiệu toán học KaTeX) */}
            <div className="min-h-[46px] flex items-center justify-end overflow-x-auto whitespace-nowrap py-1 px-1 font-bold text-slate-950">
              <div
                className="text-base sm:text-lg font-mono text-slate-950 tracking-wide inline-block"
                dangerouslySetInnerHTML={{ __html: renderRawMathToKatexHtml(expression || '0', false) }}
              />
            </div>

            {/* Expression Raw Sub-Line */}
            <div className="text-right text-[10px] tracking-wider overflow-x-auto whitespace-nowrap text-slate-700/80 font-mono">
              [Phím: {expression || '0'}]
            </div>

            {/* Main Result Line with Parallel Fraction & Decimal Indicator */}
            <div className="flex items-baseline justify-between border-t border-black/10 pt-1">
              <div className="text-[10px] font-bold text-slate-700">
                {isShowingFraction ? 'DẠNG PHÂN SỐ' : 'DẠNG THẬP PHÂN (4 CHỮ SỐ)'}
              </div>
              <div className="text-right text-2xl font-black tracking-tight overflow-x-auto whitespace-nowrap text-slate-950">
                = {displayResult}
              </div>
            </div>
          </div>

          {/* D-PAD DIRECTION KEYS & FUNCTION CONTROLS */}
          <div className="grid grid-cols-5 gap-2 text-[11px] font-bold text-center">
            <button
              onClick={() => handleKeyClick('SHIFT')}
              className={`py-2 rounded-lg border transition-all ${
                isShift ? 'bg-amber-400 text-black font-black' : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              SHIFT
            </button>
            <button
              onClick={() => handleKeyClick('ALPHA')}
              className={`py-2 rounded-lg border transition-all ${
                isAlpha ? 'bg-rose-400 text-black font-black' : 'bg-rose-700 hover:bg-rose-600 text-white'
              }`}
            >
              ALPHA
            </button>
            <button
              onClick={() => {
                setActiveMode((prev) =>
                  prev === 'COMP' ? 'EQUATION' : prev === 'EQUATION' ? 'STAT' : prev === 'STAT' ? 'DIST' : 'COMP'
                );
              }}
              className="py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 font-bold"
              title="Chuyển chế độ MENU"
            >
              MENU
            </button>
            <button
              onClick={() => handleKeyClick('DEL')}
              className="py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-lg border border-rose-900 font-bold"
            >
              DEL
            </button>
            <button
              onClick={() => handleKeyClick('AC')}
              className="py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg border border-red-700 font-bold"
            >
              AC (BẬT)
            </button>
          </div>

          {/* SPECIAL FUNCTION BUTTON ROW (TAILORED FOR XSTK) */}
          <div className="space-y-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 text-xs">
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
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
                onClick={() => handleKeyClick('/')}
                className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                title="Phân số"
              >
                a/b
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('sqrt(')}
                className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                title="Căn bậc hai √x"
              >
                √x
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('^2')}
                className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                title="Bình phương x²"
              >
                x²
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('^')}
                className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                title="Lũy thừa x^y"
              >
                xʸ
              </button>
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
                onClick={() => handleKeyClick('e^(')}
                className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                title="Hàm mũ e^x"
              >
                eˣ
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('ln(')}
                className="p-2 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 font-bold rounded-lg border border-cyan-800/80 text-center"
                title="Logarit tự nhiên ln(x)"
              >
                ln
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('x')}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-lg border border-slate-700 text-center font-mono"
                title="Biến số X"
              >
                X
              </button>
              <button
                type="button"
                onClick={() => handleKeyClick('sum(')}
                className="p-2 bg-amber-950/70 hover:bg-amber-900 text-amber-300 font-bold rounded-lg border border-amber-800/80 text-center"
                title="Tổng Sigma"
              >
                Σ
              </button>
            </div>
          </div>

          {/* Numeric Keypad & Operators */}
          <div className="grid grid-cols-5 gap-1.5 text-sm font-bold text-slate-100">
            {/* Row 1 */}
            <button onClick={() => handleKeyClick('7')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">7</button>
            <button onClick={() => handleKeyClick('8')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">8</button>
            <button onClick={() => handleKeyClick('9')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">9</button>
            <button onClick={() => handleKeyClick('÷')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-cyan-400">÷</button>
            <button onClick={() => handleKeyClick('(')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl">(</button>

            {/* Row 2 */}
            <button onClick={() => handleKeyClick('4')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">4</button>
            <button onClick={() => handleKeyClick('5')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">5</button>
            <button onClick={() => handleKeyClick('6')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">6</button>
            <button onClick={() => handleKeyClick('×')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-cyan-400">×</button>
            <button onClick={() => handleKeyClick(')')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl">)</button>

            {/* Row 3 */}
            <button onClick={() => handleKeyClick('1')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">1</button>
            <button onClick={() => handleKeyClick('2')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">2</button>
            <button onClick={() => handleKeyClick('3')} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl">3</button>
            <button onClick={() => handleKeyClick('-')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-cyan-400">-</button>
            <button onClick={() => handleKeyClick('Ans')} className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-amber-300 text-xs font-mono">Ans</button>

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

        {/* Right Info & Functional Modes Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* TAB: MENU 9 - EQUATION SOLVER (HỆ & PHƯƠNG TRÌNH) */}
          {activeMode === 'EQUATION' && (
            <div className="bg-slate-900 border-2 border-cyan-500/40 p-5 rounded-3xl space-y-4 shadow-xl text-xs text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-cyan-300 text-sm flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Bộ Giải Phương Trình & Hệ PT (MENU 9)</span>
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                  ClassWiz 9-1-2
                </span>
              </div>

              {/* Equation Subtype Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEqMode('system_2x2')}
                  className={`p-2.5 rounded-xl font-bold transition-all text-center ${
                    eqMode === 'system_2x2'
                      ? 'bg-cyan-500 text-black shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  1. Hệ 2 ẩn (MENU 9 1 2)
                </button>
                <button
                  onClick={() => setEqMode('poly_deg2')}
                  className={`p-2.5 rounded-xl font-bold transition-all text-center ${
                    eqMode === 'poly_deg2'
                      ? 'bg-cyan-500 text-black shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  2. PT Bậc 2 (MENU 9 2 2)
                </button>
              </div>

              {/* Sub-mode 1: 2x2 System */}
              {eqMode === 'system_2x2' ? (
                <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <div className="space-y-1">
                    <span className="font-bold text-amber-300 block text-xs">
                      Ứng dụng XSTK: Tìm 2 tham số $a, b$ của hàm mật độ $f(x) = ax + b$
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Từ điều kiện $\int f(x)dx = 1$ và $E(X) = \int x f(x)dx = \mu$, ta có hệ:
                    </p>
                  </div>

                  {/* Inputs Row 1: a1*x + b1*y = c1 */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-slate-400 font-mono font-semibold">Phương trình 1: a₁X + b₁Y = c₁</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={eqA1}
                        onChange={(e) => setEqA1(e.target.value)}
                        placeholder="a1"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono text-xs font-bold text-cyan-300"
                      />
                      <input
                        type="text"
                        value={eqB1}
                        onChange={(e) => setEqB1(e.target.value)}
                        placeholder="b1"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono text-xs font-bold text-cyan-300"
                      />
                      <input
                        type="text"
                        value={eqC1}
                        onChange={(e) => setEqC1(e.target.value)}
                        placeholder="c1"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono text-xs font-bold text-amber-300"
                      />
                    </div>
                  </div>

                  {/* Inputs Row 2: a2*x + b2*y = c2 */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-slate-400 font-mono font-semibold">Phương trình 2: a₂X + b₂Y = c₂</span>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={eqA2}
                        onChange={(e) => setEqA2(e.target.value)}
                        placeholder="a2"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono text-xs font-bold text-cyan-300"
                      />
                      <input
                        type="text"
                        value={eqB2}
                        onChange={(e) => setEqB2(e.target.value)}
                        placeholder="b2"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono text-xs font-bold text-cyan-300"
                      />
                      <input
                        type="text"
                        value={eqC2}
                        onChange={(e) => setEqC2(e.target.value)}
                        placeholder="c2"
                        className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono text-xs font-bold text-amber-300"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSolve2x2}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow transition-all hover:scale-[1.01]"
                  >
                    BẤM GIẢI HỆ (MENU 9 1 2)
                  </button>

                  {eqResult && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/40 text-center space-y-1 font-mono">
                      <span className="text-[10px] text-slate-400 font-sans block">Kết quả nghiệm từ Casio fx-580:</span>
                      <div className="grid grid-cols-2 gap-2 text-sm font-black text-cyan-300 pt-1">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          X (hoặc a) = <span className="text-white">{eqResult.x}</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          Y (hoặc b) = <span className="text-white">{eqResult.y}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
                  <div className="space-y-1">
                    <span className="font-bold text-amber-300 block text-xs">
                      Ứng dụng XSTK: Tìm Trung vị Median $F(M) = 0.5$ hoặc Mode cực trị
                    </span>
                    <p className="text-[11px] text-slate-400">
                      Phương trình dạng: $aX^2 + bX + c = 0$
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Hệ số a</label>
                      <input
                        type="text"
                        value={quadA}
                        onChange={(e) => setQuadA(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono font-bold text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Hệ số b</label>
                      <input
                        type="text"
                        value={quadB}
                        onChange={(e) => setQuadB(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono font-bold text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Hệ số c</label>
                      <input
                        type="text"
                        value={quadC}
                        onChange={(e) => setQuadC(e.target.value)}
                        className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-center font-mono font-bold text-white text-xs"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSolveQuad}
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow transition-all hover:scale-[1.01]"
                  >
                    BẤM GIẢI BẬC 2 (MENU 9 2 2)
                  </button>

                  {quadResult && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/40 text-center space-y-1 font-mono">
                      <span className="text-[10px] text-slate-400 font-sans block">Nghiệm x₁ và x₂:</span>
                      <div className="grid grid-cols-2 gap-2 text-sm font-black text-cyan-300 pt-1">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          x₁ = <span className="text-white">{quadResult.x1}</span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                          x₂ = <span className="text-white">{quadResult.x2}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: CONTINUOUS RANDOM VARIABLE SOLVER */}
          {activeMode === 'CONTINUOUS' && (
            <div className="bg-slate-900 border-2 border-emerald-400/50 p-5 rounded-3xl space-y-4 shadow-xl text-xs text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-emerald-300 text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Chuyên Đề Biến Liên Tục & Tích Phân Tự Động</span>
                </h3>
                <span className="text-[10px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded font-bold">
                  Câu 2 Đề Thi HUB
                </span>
              </div>

              {/* Task Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-300 text-[11px]">Dạng bài tập biến liên tục:</label>
                <select
                  value={continuousTaskType}
                  onChange={(e) => setContinuousTaskType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white font-bold text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="find_k">1. Tìm hằng số k để f(x) là hàm mật độ xác suất (int = 1)</option>
                  <option value="prob_interval">2. Tính xác suất P(a &lt; X &lt; b)</option>
                  <option value="expectation_var">3. Tính Kỳ vọng E(X) và Phương sai Var(X)</option>
                  <option value="cdf_fx">4. Tìm hàm phân phối tích lũy F(x)</option>
                  <option value="general_int">5. Tính Tích phân xác định / Suy rộng bất kỳ</option>
                </select>
              </div>

              {/* Input Fields */}
              <div className="space-y-3 p-3 bg-slate-950/70 rounded-2xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold block mb-1">
                    Hàm f(x) (nhập biểu thức chứa x và k nếu có):
                  </label>
                  <input
                    type="text"
                    value={densityFunction}
                    onChange={(e) => setDensityFunction(e.target.value)}
                    placeholder="VD: k * x^2 hoặc k*(x^2 - x) hoặc 2*e^(-2*x)"
                    className="w-full p-2 rounded-xl border border-slate-700 bg-slate-800 text-emerald-300 font-mono font-bold text-xs"
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
                      <label className="text-[11px] text-cyan-300 font-bold block mb-1">Cận dưới P:</label>
                      <input
                        type="text"
                        value={probA}
                        onChange={(e) => setProbA(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-700 bg-slate-950 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-cyan-300 font-bold block mb-1">Cận trên P:</label>
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
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: MENU 6 - STAT 1-VAR & LINEAR REGRESSION */}
          {activeMode === 'STAT' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl text-xs text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-cyan-300 text-sm flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                  <span>Bảng Nhập Thống Kê (MENU 6)</span>
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                  ClassWiz 6-1
                </span>
              </div>

              {/* Sub-modes selector: 1-Var vs Discrete RV vs Linear Regression */}
              <div className="grid grid-cols-3 gap-1.5 text-center font-bold">
                <button
                  onClick={() => setStatSubMode('1-var')}
                  className={`p-2 rounded-xl transition-all ${
                    statSubMode === '1-var'
                      ? 'bg-cyan-500 text-black shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  1. Mẫu 1-Biến (x̄, s)
                </button>
                <button
                  onClick={() => setStatSubMode('discrete_rv')}
                  className={`p-2 rounded-xl transition-all ${
                    statSubMode === 'discrete_rv'
                      ? 'bg-amber-400 text-black shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  2. Biến Rời Rạc (E, Var)
                </button>
                <button
                  onClick={() => setStatSubMode('regression')}
                  className={`p-2 rounded-xl transition-all ${
                    statSubMode === 'regression'
                      ? 'bg-emerald-400 text-black shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  3. Hồi Quy y=a+bx
                </button>
              </div>

              {/* Step Guide for physical Casio setup */}
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                <strong className="text-cyan-400 block font-bold mb-0.5">Phím bấm ngoài đời để mở cột tần số:</strong>
                <code>[SHIFT] [MENU] [▼] [3] (Thống kê) [1] (Bật Tần số / Frequency ON)</code>
              </div>

              {/* Data Table */}
              {statSubMode !== 'regression' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 text-xs">
                      {statSubMode === 'discrete_rv' ? 'Nhập giá trị x_i và xác suất p_i (hoặc nhân 100):' : 'Bảng ghép nhóm (x_i: trung điểm, f_i: tần số):'}
                    </span>
                    <button
                      onClick={() => setStatRows([...statRows, { x: '', freq: '1' }])}
                      className="px-2.5 py-1 bg-cyan-500 text-black rounded-lg font-bold text-[10px]"
                    >
                      + Thêm dòng
                    </button>
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1 border border-slate-800 rounded-xl p-2 bg-slate-950 font-mono">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-1">
                      <span>x_i</span>
                      <span>{statSubMode === 'discrete_rv' ? 'FREQ (p_i × 100)' : 'FREQ (n_i)'}</span>
                    </div>
                    {statRows.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={row.x}
                          onChange={(e) => {
                            const next = [...statRows];
                            next[idx].x = e.target.value;
                            setStatRows(next);
                          }}
                          placeholder="x"
                          className="p-1.5 border border-slate-700 rounded bg-slate-800 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={row.freq}
                          onChange={(e) => {
                            const next = [...statRows];
                            next[idx].freq = e.target.value;
                            setStatRows(next);
                          }}
                          placeholder="freq"
                          className="p-1.5 border border-slate-700 rounded bg-slate-800 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>

                  {statSummary && (
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-cyan-500/40 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                        <strong className="text-cyan-300 font-bold">
                          {statSubMode === 'discrete_rv' ? '📊 Đọc Kết Quả Biến Ngẫu Nhiên Rời Rạc:' : '📊 Kết quả màn hình Casio [OPTN 2]:'}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">Cỡ mẫu n = {statSummary.n}</span>
                      </div>

                      {statSubMode === 'discrete_rv' ? (
                        <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                          <div className="p-2 bg-slate-900 rounded-lg border border-amber-500/40">
                            <span className="text-[10px] text-slate-400 block font-sans">Kỳ vọng E(X) = x̄</span>
                            <span className="text-base font-black text-amber-300">{statSummary.mean}</span>
                          </div>
                          <div className="p-2 bg-slate-900 rounded-lg border border-emerald-500/40">
                            <span className="text-[10px] text-slate-400 block font-sans">Phương sai Var(X) = σ²_x (KHÔNG lấy s²_x!)</span>
                            <span className="text-base font-black text-emerald-300">{statSummary.variancePop}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px] text-slate-300">
                          <p>Trung bình (<MathFormula math="\bar{x}" />): <strong className="text-cyan-300">{statSummary.mean}</strong></p>
                          <p>Độ lệch mẫu (<MathFormula math="s_x" />): <strong className="text-emerald-300">{statSummary.sdSample}</strong></p>
                          <p>Phương sai mẫu (<MathFormula math="s^2_x" />): <strong className="text-emerald-300">{statSummary.varianceSample}</strong></p>
                          <p>Phương sai dân số (<MathFormula math="\sigma^2_x" />): <strong className="text-slate-400">{statSummary.variancePop}</strong></p>
                          <p>Tổng <MathFormula math="\sum x" />: <strong className="text-white">{statSummary.sumX}</strong></p>
                          <p>Tổng <MathFormula math="\sum x^2" />: <strong className="text-white">{statSummary.sumX2}</strong></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 text-xs">Bảng hồi quy 2 biến (x_i, y_i):</span>
                    <button
                      onClick={() => setRegRows([...regRows, { x: '', y: '' }])}
                      className="px-2.5 py-1 bg-emerald-400 text-black rounded-lg font-bold text-[10px]"
                    >
                      + Thêm cặp (x, y)
                    </button>
                  </div>

                  <div className="max-h-44 overflow-y-auto space-y-1 border border-slate-800 rounded-xl p-2 bg-slate-950 font-mono">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-400 border-b border-slate-800 pb-1">
                      <span>x_i</span>
                      <span>y_i</span>
                    </div>
                    {regRows.map((row, idx) => (
                      <div key={idx} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={row.x}
                          onChange={(e) => {
                            const next = [...regRows];
                            next[idx].x = e.target.value;
                            setRegRows(next);
                          }}
                          placeholder="x"
                          className="p-1.5 border border-slate-700 rounded bg-slate-800 text-xs text-white"
                        />
                        <input
                          type="text"
                          value={row.y}
                          onChange={(e) => {
                            const next = [...regRows];
                            next[idx].y = e.target.value;
                            setRegRows(next);
                          }}
                          placeholder="y"
                          className="p-1.5 border border-slate-700 rounded bg-slate-800 text-xs text-white"
                        />
                      </div>
                    ))}
                  </div>

                  {regSummary && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-1.5 text-xs font-mono">
                      <strong className="text-emerald-300 font-bold block font-sans">
                        📊 Kết quả Hồi quy tuyến tính (y = a + bx):
                      </strong>
                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <p>Hệ số chặn (a): <strong className="text-white">{regSummary.a}</strong></p>
                        <p>Hệ số góc (b): <strong className="text-cyan-300">{regSummary.b}</strong></p>
                        <p>Hệ số tương quan (r): <strong className="text-emerald-300">{regSummary.r}</strong></p>
                        <p>Hệ số xác định (r²): <strong className="text-emerald-300">{regSummary.r2}</strong></p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB: MENU 7 - DISTRIBUTION (PHÂN PHỐI XÁC SUẤT) */}
          {activeMode === 'DIST' && (
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl text-xs text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-cyan-300 text-sm flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>Phân Phối Xác Suất (MENU 7: DIST)</span>
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono font-bold">
                  ClassWiz 7
                </span>
              </div>

              {/* Sub-modes for MENU 7 - Toàn bộ tên phân phối được Việt hóa chuẩn mực */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  {
                    id: 'normal_cd',
                    title: 'Xác suất phân phối chuẩn tích lũy',
                    casioCode: '2: Normal CD',
                    formula: 'P(a ≤ X ≤ b)',
                    desc: 'Tính xác suất biến ngẫu nhiên liên tục rơi vào khoảng [a, b]',
                    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-950/50',
                  },
                  {
                    id: 'inv_normal',
                    title: 'Phân vị nghịch đảo phân phối chuẩn',
                    casioCode: '3: Inverse Normal',
                    formula: 'P(X ≤ x₀) = Area ⇒ x₀',
                    desc: 'Tìm giá trị x₀ tương ứng mức diện tích (bài toán bảo hành, định mức)',
                    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-950/50',
                  },
                  {
                    id: 'normal_pd',
                    title: 'Mật độ phân phối chuẩn',
                    casioCode: '1: Normal PD',
                    formula: 'f(x)',
                    desc: 'Tính tung độ hàm mật độ xác suất Gauss tại điểm x',
                    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-950/50',
                  },
                  {
                    id: 'binom_pd',
                    title: 'Xác suất phân phối nhị thức',
                    casioCode: '4: Binomial PD',
                    formula: 'P(X = k)',
                    desc: 'Xác suất xảy ra chính xác k lần thành công trong n phép thử độc lập',
                    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-950/50',
                  },
                  {
                    id: 'binom_cd',
                    title: 'Xác suất tích lũy phân phối nhị thức',
                    casioCode: '▼1: Binomial CD',
                    formula: 'P(X ≤ k)',
                    desc: 'Xác suất xảy ra tối đa k lần thành công (cộng dồn từ 0 đến k)',
                    badgeColor: 'border-teal-500/40 text-teal-300 bg-teal-950/50',
                  },
                  {
                    id: 'poisson_pd',
                    title: 'Xác suất phân phối Poisson',
                    casioCode: '▼2: Poisson PD',
                    formula: 'P(X = k)',
                    desc: 'Xác suất xuất hiện đúng k biến cố với tham số trung bình λ',
                    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-950/50',
                  },
                  {
                    id: 'poisson_cd',
                    title: 'Xác suất tích lũy phân phối Poisson',
                    casioCode: '▼3: Poisson CD',
                    formula: 'P(X ≤ k)',
                    desc: 'Xác suất xuất hiện tối đa k biến cố (cộng dồn từ 0 đến k)',
                    badgeColor: 'border-orange-500/40 text-orange-300 bg-orange-950/50',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDistType(item.id as any)}
                    className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between gap-1.5 ${
                      distType === item.id
                        ? 'bg-gradient-to-r from-cyan-950/80 to-slate-900 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-xs font-bold leading-snug ${distType === item.id ? 'text-cyan-300 font-black' : 'text-slate-100'}`}>
                        {item.title}
                      </span>
                      <span className={`shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                        {item.casioCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-800/70 text-[11px]">
                      <span className="font-mono text-cyan-400 font-semibold">{item.formula}</span>
                      <span className="text-[10px] text-slate-400 truncate text-right max-w-[190px]" title={item.desc}>
                        {item.desc}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Parameters Inputs */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-slate-200">
                      Tham số đầu vào máy tính Casio:
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    fx-580VN X Menu 7
                  </span>
                </div>

                {distType.startsWith('normal') || distType === 'inv_normal' ? (
                  <div className="space-y-3">
                    {distType === 'normal_cd' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Cận dưới (Lower - Cận nhỏ nhất):
                          </label>
                          <input
                            type="text"
                            value={distInputs.lower}
                            onChange={(e) => setDistInputs({ ...distInputs, lower: e.target.value })}
                            placeholder="VD: 26 (hoặc -10^9 nếu -∞)"
                            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 mt-0.5 block">Nếu đề cho X &gt; a thì cận trên là 10⁹</span>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-300 block mb-1">
                            Cận trên (Upper - Cận lớn nhất):
                          </label>
                          <input
                            type="text"
                            value={distInputs.upper}
                            onChange={(e) => setDistInputs({ ...distInputs, upper: e.target.value })}
                            placeholder="VD: 1000000 (hoặc 10^9 nếu +∞)"
                            className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                          />
                          <span className="text-[10px] text-slate-500 mt-0.5 block">Nếu đề cho X &lt; b thì cận dưới là -10⁹</span>
                        </div>
                      </div>
                    )}

                    {distType === 'normal_pd' && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Điểm tính mật độ (x):
                        </label>
                        <input
                          type="text"
                          value={distInputs.upper}
                          onChange={(e) => setDistInputs({ ...distInputs, upper: e.target.value })}
                          placeholder="VD: 24"
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Tính tung độ hàm f(x) tại giá trị x</span>
                      </div>
                    )}

                    {distType === 'inv_normal' && (
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Diện tích / Xác suất tích lũy (Area = P(X ≤ x₀)):
                        </label>
                        <input
                          type="text"
                          value={distInputs.area}
                          onChange={(e) => setDistInputs({ ...distInputs, area: e.target.value })}
                          placeholder="VD: 0.05 (tương ứng 5%)"
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Phần diện tích đuôi bên trái của phân phối chuẩn</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Độ lệch chuẩn σ (Sigma &gt; 0):
                        </label>
                        <input
                          type="text"
                          value={distInputs.sd}
                          onChange={(e) => setDistInputs({ ...distInputs, sd: e.target.value })}
                          placeholder="VD: 2 (Nếu đề cho σ²=4 thì nhập √4 = 2)"
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-amber-400/90 mt-0.5 block">⚠️ Bẫy HUB: Đề cho σ² phải khai căn lấy σ!</span>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Kỳ vọng μ (Mean / Giá trị trung bình):
                        </label>
                        <input
                          type="text"
                          value={distInputs.mean}
                          onChange={(e) => setDistInputs({ ...distInputs, mean: e.target.value })}
                          placeholder="VD: 24"
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : distType.startsWith('binom') ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          {distType === 'binom_pd' ? 'Số lần thành công (k):' : 'Số lần tối đa (k):'}
                        </label>
                        <input
                          type="text"
                          value={distInputs.k}
                          onChange={(e) => setDistInputs({ ...distInputs, k: e.target.value })}
                          placeholder="VD: 3"
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">{distType === 'binom_pd' ? 'Đúng k lần' : 'Tối đa k lần (≤ k)'}</span>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Tổng số phép thử (n):
                        </label>
                        <input
                          type="text"
                          value={distInputs.n}
                          onChange={(e) => setDistInputs({ ...distInputs, n: e.target.value })}
                          placeholder="VD: 10"
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Số phép thử Bernoulli</span>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Xác suất mỗi lần (p):
                        </label>
                        <input
                          type="text"
                          value={distInputs.p}
                          onChange={(e) => setDistInputs({ ...distInputs, p: e.target.value })}
                          placeholder="VD: 0.5"
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">0 ≤ p ≤ 1</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          {distType === 'poisson_pd' ? 'Số lần biến cố xảy ra (k):' : 'Số lần biến cố tối đa (k):'}
                        </label>
                        <input
                          type="text"
                          value={distInputs.k}
                          onChange={(e) => setDistInputs({ ...distInputs, k: e.target.value })}
                          placeholder="VD: 2"
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">
                          {distType === 'poisson_pd' ? 'Đúng k biến cố: P(X = k)' : 'Tối đa k biến cố: P(X ≤ k)'}
                        </span>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-300 block mb-1">
                          Tham số trung bình λ (Lambda):
                        </label>
                        <input
                          type="text"
                          value={distInputs.lambda}
                          onChange={(e) => setDistInputs({ ...distInputs, lambda: e.target.value })}
                          placeholder="VD: 4"
                          className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-white focus:border-cyan-400 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Kỳ vọng E(X) = λ = Var(X)</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Kết quả tính toán & Hướng dẫn bấm máy thực tế */}
                {distResult !== null && (
                  <div className="p-4 bg-gradient-to-r from-emerald-950/60 to-slate-950 border-2 border-emerald-500/50 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-300 font-extrabold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Kết quả xác suất tính toán:</span>
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-700/50 font-bold">
                        {(distResult * 100).toFixed(3)}%
                      </span>
                    </div>

                    <div className="text-3xl font-mono font-black text-emerald-400 tracking-wider">
                      {distResult}
                    </div>

                    {/* Công thức toán học tương ứng */}
                    <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono text-slate-200">
                      {distType === 'poisson_pd' && (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans mb-1">Công thức phân phối Poisson:</span>
                          <MathFormula math={`P(X = ${distInputs.k || 'k'}) = \\frac{${distInputs.lambda || '\\lambda'}^{${distInputs.k || 'k'}} \\cdot e^{-${distInputs.lambda || '\\lambda'}}}{${distInputs.k || 'k'}!} \\approx ${distResult}`} />
                        </div>
                      )}
                      {distType === 'poisson_cd' && (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans mb-1">Công thức Poisson tích lũy:</span>
                          <MathFormula math={`P(X \\le ${distInputs.k || 'k'}) = \\sum_{i=0}^{${distInputs.k || 'k'}} \\frac{${distInputs.lambda || '\\lambda'}^i \\cdot e^{-${distInputs.lambda || '\\lambda'}}}{i!} \\approx ${distResult}`} />
                        </div>
                      )}
                      {distType === 'normal_cd' && (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans mb-1">Công thức xác suất phân phối chuẩn:</span>
                          <MathFormula math={`P(${distInputs.lower} \\le X \\le ${distInputs.upper}) = \\Phi\\left(\\frac{${distInputs.upper} - ${distInputs.mean}}{${distInputs.sd}}\\right) - \\Phi\\left(\\frac{${distInputs.lower} - ${distInputs.mean}}{${distInputs.sd}}\\right) \\approx ${distResult}`} />
                        </div>
                      )}
                      {distType === 'inv_normal' && (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans mb-1">Công thức nghịch đảo phân phối chuẩn:</span>
                          <MathFormula math={`P(X \\le x_0) = ${distInputs.area} \\implies x_0 \\approx ${distResult}`} />
                        </div>
                      )}
                      {distType === 'normal_pd' && (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans mb-1">Hàm mật độ Gauss:</span>
                          <MathFormula math={`f(${distInputs.upper}) = \\frac{1}{${distInputs.sd}\\sqrt{2\\pi}} e^{-\\frac{(${distInputs.upper}-${distInputs.mean})^2}{2(${distInputs.sd})^2}} \\approx ${distResult}`} />
                        </div>
                      )}
                      {distType === 'binom_pd' && (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans mb-1">Công thức Bernoulli:</span>
                          <MathFormula math={`P(X = ${distInputs.k}) = C_{${distInputs.n}}^{${distInputs.k}} \\cdot (${distInputs.p})^{${distInputs.k}} \\cdot (1 - ${distInputs.p})^{${Math.max(0, Number(distInputs.n || 0) - Number(distInputs.k || 0))}} \\approx ${distResult}`} />
                        </div>
                      )}
                      {distType === 'binom_cd' && (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-sans mb-1">Công thức tích lũy nhị thức:</span>
                          <MathFormula math={`P(X \\le ${distInputs.k}) = \\sum_{i=0}^{${distInputs.k}} C_{${distInputs.n}}^i \\cdot (${distInputs.p})^i \\cdot (1 - ${distInputs.p})^{${distInputs.n} - i} \\approx ${distResult}`} />
                        </div>
                      )}
                    </div>

                    {/* Trình tự phím bấm Casio fx-580VN X */}
                    <div className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-amber-300">
                      <span className="font-bold text-amber-400 block font-sans mb-0.5">
                        ⌨️ Trình tự bấm phím thực tế trên Casio fx-580VN X:
                      </span>
                      {distType === 'poisson_pd' && (
                        <span>Bấm <code>[MENU] [7] [▼] [2]</code> (Poisson PD) &rarr; Bấm <code>[1]</code> (Variable) &rarr; Nhập x = <strong>{distInputs.k}</strong>, &lambda; = <strong>{distInputs.lambda}</strong> &rarr; Bấm <code>[=]</code></span>
                      )}
                      {distType === 'poisson_cd' && (
                        <span>Bấm <code>[MENU] [7] [▼] [3]</code> (Poisson CD) &rarr; Bấm <code>[1]</code> (Variable) &rarr; Nhập x = <strong>{distInputs.k}</strong>, &lambda; = <strong>{distInputs.lambda}</strong> &rarr; Bấm <code>[=]</code></span>
                      )}
                      {distType === 'normal_cd' && (
                        <span>Bấm <code>[MENU] [7] [2]</code> (Normal CD) &rarr; Nhập Lower = <strong>{distInputs.lower}</strong>, Upper = <strong>{distInputs.upper}</strong>, &sigma; = <strong>{distInputs.sd}</strong>, &mu; = <strong>{distInputs.mean}</strong> &rarr; Bấm <code>[=]</code></span>
                      )}
                      {distType === 'inv_normal' && (
                        <span>Bấm <code>[MENU] [7] [3]</code> (Inverse Normal) &rarr; Nhập Area = <strong>{distInputs.area}</strong>, &sigma; = <strong>{distInputs.sd}</strong>, &mu; = <strong>{distInputs.mean}</strong> &rarr; Bấm <code>[=]</code></span>
                      )}
                      {distType === 'normal_pd' && (
                        <span>Bấm <code>[MENU] [7] [1]</code> (Normal PD) &rarr; Nhập x = <strong>{distInputs.upper}</strong>, &sigma; = <strong>{distInputs.sd}</strong>, &mu; = <strong>{distInputs.mean}</strong> &rarr; Bấm <code>[=]</code></span>
                      )}
                      {distType === 'binom_pd' && (
                        <span>Bấm <code>[MENU] [7] [4]</code> (Binomial PD) &rarr; Bấm <code>[1]</code> (Variable) &rarr; Nhập x = <strong>{distInputs.k}</strong>, N = <strong>{distInputs.n}</strong>, p = <strong>{distInputs.p}</strong> &rarr; Bấm <code>[=]</code></span>
                      )}
                      {distType === 'binom_cd' && (
                        <span>Bấm <code>[MENU] [7] [▼] [1]</code> (Binomial CD) &rarr; Bấm <code>[1]</code> (Variable) &rarr; Nhập x = <strong>{distInputs.k}</strong>, N = <strong>{distInputs.n}</strong>, p = <strong>{distInputs.p}</strong> &rarr; Bấm <code>[=]</code></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CẨM NANG BẤM PHÍM THỰC CHIẾN NGOÀI ĐỜI THỰC */}
          {(activeMode === 'KEY_GUIDE' || activeMode === 'COMP') && (
            <div className="bg-slate-900 border-2 border-amber-400/40 p-5 rounded-3xl space-y-4 shadow-xl text-xs text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="font-extrabold text-amber-300 text-sm flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Cẩm Nang Bấm Phím Thực Chiến Phòng Thi (Casio 580 & 570)</span>
                </h3>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                  Bỏ Túi 2026
                </span>
              </div>

              <div className="space-y-3">
                {/* Mục 1: Thống kê 1 biến */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
                  <strong className="text-cyan-300 block font-bold">1. Thống kê mẫu ghép nhóm (Câu 4 Đề Thi HUB):</strong>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    <li>• <strong>fx-580VN X:</strong> <code>[SHIFT] [MENU] [▼] [3] [1]</code> (Bật tần số) &rarr; <code>[MENU] [6] [1]</code> &rarr; Nhập x_i, n_i &rarr; <code>[AC]</code> &rarr; <code>[OPTN] [2]</code>.</li>
                    <li>• <strong>fx-570VN PLUS:</strong> <code>[SHIFT] [MODE] [▼] [4] [1]</code> &rarr; <code>[MODE] [3] [1]</code> &rarr; Nhập số &rarr; <code>[AC]</code> &rarr; <code>[SHIFT] [1] [4]</code>.</li>
                    <li>• <strong>Lấy chỉ số:</strong> x̄ (Trung bình), s_x (Độ lệch mẫu hiệu chỉnh để thế vào Z_qs), s_x² (Phương sai mẫu).</li>
                  </ul>
                </div>

                {/* Mục 2: Biến liên tục */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
                  <strong className="text-emerald-300 block font-bold">2. Biến liên tục & Tích phân (Câu 2 Đề Thi HUB):</strong>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    <li>• Bấm phím <code>[∫dx]</code> để tính tích phân xác định.</li>
                    <li>• Khi cận là vô cực: Thay +∞ bằng <code>10^9</code> (hoặc 1×10^99); -∞ bằng <code>-10^9</code>.</li>
                    <li>• Giải hệ 2 tham số: <code>[MENU] [9] [1] [2]</code>.</li>
                  </ul>
                </div>

                {/* Mục 3: Phân phối chuẩn */}
                <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
                  <strong className="text-amber-300 block font-bold">3. Phân phối Chuẩn & Tra ngược (Câu 3 Đề Thi HUB):</strong>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    <li>• <strong>fx-580VN X:</strong> <code>[MENU] [7] [2]</code> (Normal CD) với Lower, Upper, $\sigma, \mu$.</li>
                    <li>• <strong>Tìm mức bảo hành:</strong> <code>[MENU] [7] [3]</code> (Inverse Normal) nhập Area, $\sigma, \mu$.</li>
                    <li>• <strong>fx-570VN PLUS:</strong> <code>[MODE] [3] [1]</code> $\to$ <code>[AC]</code> $\to$ <code>[SHIFT] [1] [5] [1]</code> để bấm $P(t)$.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Official HUB Exam Cheat Sheet Modal (CamScanner) */}
      <HubExamCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
};
