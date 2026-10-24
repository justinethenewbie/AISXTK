import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  X,
  Search,
  BookOpen,
  HelpCircle,
  Sparkles,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { MathFormula } from './MathFormula';

interface HubExamCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'laplace' | 'formulas' | 'traps';
}

const COMMON_Z_VALUES = [
  { gamma: '90%', alpha: '0.10', alphaHalf: '0.05', zAlpha: '1.645', phiVal: '0.4500', note: 'Độ tin cậy 90% (z_0.05 = 1.645)' },
  { gamma: '95%', alpha: '0.05', alphaHalf: '0.025', zAlpha: '1.960', phiVal: '0.4750', note: 'Độ tin cậy 95% (z_0.025 = 1.960 - Phổ biến nhất)' },
  { gamma: '98%', alpha: '0.02', alphaHalf: '0.01', zAlpha: '2.330', phiVal: '0.4900', note: 'Độ tin cậy 98% (z_0.01 = 2.330)' },
  { gamma: '99%', alpha: '0.01', alphaHalf: '0.005', zAlpha: '2.580', phiVal: '0.4950', note: 'Độ tin cậy 99% (z_0.005 = 2.580)' },
];

export const HubExamCheatSheetModal: React.FC<HubExamCheatSheetModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'formulas',
}) => {
  const [activeTab, setActiveTab] = useState<'formulas' | 'laplace' | 'traps'>(initialTab);
  const [searchZ, setSearchZ] = useState<string>('1.96');

  if (!isOpen) return null;

  const calculateLaplacePhi = (zNum: number): number => {
    if (isNaN(zNum)) return 0;
    const absZ = Math.abs(zNum);
    if (absZ >= 4.0) return 0.5;

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const x = absZ / Math.SQRT2;
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
    const phi = 0.5 * y;
    return zNum < 0 ? -phi : phi;
  };

  const parsedZ = parseFloat(searchZ);
  const currentPhi = !isNaN(parsedZ) ? calculateLaplacePhi(parsedZ) : null;
  const casioNormCD = currentPhi !== null ? currentPhi + 0.5 : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0 relative overflow-hidden">
          {/* Subtle Campus Backdrop */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-15 pointer-events-none filter blur-[1px]"
            style={{ backgroundImage: `url('/assets/hub-campus.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/40 font-black text-lg shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              📜
            </div>
            <div>
              <div className="flex items-center gap-2 relative z-10">
                <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                  ĐƯỢC PHÉP MANG VÀO PHÒNG THI HUB
                </span>
                <span className="text-[10px] font-mono text-cyan-400 font-bold">2026 EDITION</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>Tờ Công Thức Xác Suất Thống Kê & Bảng Laplace</span>
                <span className="text-xs text-slate-400 font-normal hidden sm:inline">(Bộ Môn Toán Kinh Tế HUB)</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="In tờ công thức chuẩn để mang vào phòng thi"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">In Tờ Phao Thi</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-slate-950/50 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'formulas'
                ? 'bg-slate-900 text-cyan-300 border-t-2 border-x-2 border-cyan-500/50 font-black shadow-[0_-4px_10px_rgba(6,182,212,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Trang 2: Các Công Thức Phòng Thi HUB</span>
          </button>

          <button
            onClick={() => setActiveTab('laplace')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'laplace'
                ? 'bg-slate-900 text-cyan-300 border-t-2 border-x-2 border-cyan-500/50 font-black shadow-[0_-4px_10px_rgba(6,182,212,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4 text-emerald-400" />
            <span>Trang 1: Bảng Số Phụ Lục 2 (Laplace Φ(z))</span>
          </button>

          <button
            onClick={() => setActiveTab('traps')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'traps'
                ? 'bg-slate-900 text-amber-300 border-t-2 border-x-2 border-amber-500/50 font-black shadow-[0_-4px_10px_rgba(245,158,11,0.15)]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>7 Bẫy Phòng Thi Hay Mắc Nhất</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs sm:text-sm">
          {/* TAB 1: CÁC CÔNG THỨC CHÍNH THỨC */}
          {activeTab === 'formulas' && (
            <div className="space-y-6">
              {/* Alert Note */}
              <div className="p-3.5 bg-cyan-950/50 border border-cyan-500/40 rounded-2xl flex items-start gap-3 text-cyan-200 text-xs">
                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-black mb-0.5">Quy chế phòng thi HUB:</strong>
                  Thí sinh chỉ được mang duy nhất tờ tài liệu này (in 2 mặt) cùng máy tính cầm tay (Casio fx-580VN X hoặc fx-570VN Plus) vào phòng thi. Không được ghi chép thêm chữ viết tay vào tờ tài liệu.
                </div>
              </div>

              {/* Phần 1: Xác Suất Cơ Bản & Biến Ngẫu Nhiên */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="text-base font-extrabold text-cyan-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <span className="text-cyan-400">I.</span>
                  <span>XÁC SUẤT CƠ BẢN VÀ BIẾN NGẪU NHIÊN</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Công thức cộng & nhân */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-amber-300 block text-xs">1. Công thức Cộng & Nhân Xác Suất:</span>
                    <ul className="space-y-1 text-slate-300 text-xs leading-relaxed">
                      <li>• <strong>Cộng 2 biến cố:</strong> <MathFormula math="P(A + B) = P(A) + P(B) - P(AB)" /></li>
                      <li>• <em>Nếu xung khắc (<MathFormula math="AB = \emptyset" />):</em> <MathFormula math="P(A + B) = P(A) + P(B)" /></li>
                      <li>• <strong>Nhân xác suất:</strong> <MathFormula math="P(AB) = P(A) \cdot P(B|A) = P(B) \cdot P(A|B)" /></li>
                      <li>• <em>Nếu độc lập:</em> <MathFormula math="P(AB) = P(A) \cdot P(B)" /></li>
                    </ul>
                  </div>

                  {/* Xác suất đầy đủ & Bayes */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-emerald-300 block text-xs">2. Xác Suất Đầy Đủ & Bayes (Câu 1 Đề Thi):</span>
                    <div className="space-y-1 text-slate-300 text-xs">
                      <p>• <strong>Hệ đầy đủ:</strong> <MathFormula math="\sum_{i=1}^n P(H_i) = 1" /></p>
                      <p>• <strong>Xác suất đầy đủ:</strong> <MathFormula math="P(A) = \sum_{i=1}^n P(H_i) \cdot P(A|H_i)" /></p>
                      <p>• <strong>Công thức Bayes:</strong> <MathFormula math="P(H_i|A) = \frac{P(H_i) \cdot P(A|H_i)}{P(A)}" /></p>
                    </div>
                  </div>

                  {/* Công thức Bernoulli */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-cyan-300 block text-xs">3. Công thức Bernoulli:</span>
                    <p className="text-slate-300 text-xs">
                      <MathFormula math="P_n(k) = C_n^k p^k (1-p)^{n-k} = C_n^k p^k q^{n-k}" /> với <MathFormula math="q = 1 - p" />.
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Kỳ vọng <MathFormula math="E(X) = n \cdot p" />; Phương sai <MathFormula math="\text{Var}(X) = n \cdot p \cdot (1-p)" />.
                    </p>
                  </div>

                  {/* Biến ngẫu nhiên liên tục */}
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-purple-300 block text-xs">4. Biến Ngẫu Nhiên Liên Tục (Câu 2 Đề Thi):</span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      <li>• <strong>Chuẩn hóa:</strong> <MathFormula math="\int_{-\infty}^{+\infty} f(x) dx = 1" /></li>
                      <li>• <strong>Xác suất khoảng:</strong> <MathFormula math="P(a < X < b) = \int_a^b f(x) dx" /></li>
                      <li>• <strong>Kỳ vọng:</strong> <MathFormula math="E(X) = \int_{-\infty}^{+\infty} x \cdot f(x) dx" /></li>
                      <li>• <strong>Phương sai:</strong> <MathFormula math="\text{Var}(X) = \int_{-\infty}^{+\infty} x^2 f(x) dx - [E(X)]^2" /></li>
                      <li>• <strong>Trung vị (Median):</strong> <MathFormula math="\int_{-\infty}^M f(x) dx = 0.5" /></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Phần 2: Thống Kê Mẫu & Ước Lượng Khoảng */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="text-base font-extrabold text-cyan-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <span className="text-cyan-400">II.</span>
                  <span>THỐNG KÊ MẪU & KHOẢNG TIN CẬY ĐỐI XỨNG</span>
                </h3>

                <div className="space-y-3">
                  {/* Khoảng tin cậy cho Trung bình */}
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-cyan-300 font-bold text-xs uppercase tracking-wider">
                        1. Khoảng tin cậy cho Kỳ vọng / Trung bình μ:
                      </strong>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono">
                        Trọng tâm 4.5đ đề thi
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-400 font-semibold block text-[11px]">TH1: Đã biết phương sai</span>
                        <div className="font-mono text-cyan-200">
                          <MathFormula math="\left(\bar{x} - z_{\alpha/2} \frac{\sigma}{\sqrt{n}}, \, \bar{x} + z_{\alpha/2} \frac{\sigma}{\sqrt{n}}\right)" />
                        </div>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded-lg border border-cyan-500/50 space-y-1">
                        <span className="text-emerald-400 font-black block text-[11px]">TH2: Chưa biết σ², mẫu lớn n ≥ 30 (HUB hay ra nhất)</span>
                        <div className="font-mono text-emerald-300">
                          <MathFormula math="\left(\bar{x} - z_{\alpha/2} \frac{s}{\sqrt{n}}, \, \bar{x} + z_{\alpha/2} \frac{s}{\sqrt{n}}\right)" />
                        </div>
                        <p className="text-[10px] text-slate-400">s là độ lệch mẫu hiệu chỉnh đọc từ Casio s_x.</p>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-400 font-semibold block text-[11px]">TH3: Chưa biết σ², mẫu nhỏ n &lt; 30</span>
                        <div className="font-mono text-cyan-200">
                          <MathFormula math="\left(\bar{x} - t_{\alpha/2}^{(n-1)} \frac{s}{\sqrt{n}}, \, \bar{x} + t_{\alpha/2}^{(n-1)} \frac{s}{\sqrt{n}}\right)" />
                        </div>
                        <p className="text-[10px] text-slate-400">Tra phân phối Student t bậc tự do n - 1.</p>
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-lg text-amber-200 text-xs">
                      <strong>Công thức xác định cỡ mẫu tối thiểu:</strong> Với sai số cho phép <MathFormula math="\varepsilon_0" />, ta có:
                      <div className="font-mono font-bold text-center py-1 text-sm text-white">
                        <MathFormula math="n \ge \frac{z_{\alpha/2}^2 \cdot s^2}{\varepsilon_0^2}" />
                      </div>
                      <em>* Lưu ý: Luôn làm tròn lên số nguyên tiếp theo (ví dụ: 197.02 → 198). Nếu đề hỏi "khảo sát thêm", phải trừ đi cỡ mẫu n ban đầu!</em>
                    </div>
                  </div>

                  {/* Khoảng tin cậy cho Tỷ lệ */}
                  <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                    <strong className="text-emerald-300 font-bold text-xs uppercase tracking-wider block">
                      2. Khoảng tin cậy cho Tỷ lệ p:
                    </strong>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-400 font-semibold block text-[11px]">Khoảng tin cậy đối xứng:</span>
                        <div className="font-mono text-emerald-300">
                          <MathFormula math="\left(f - z_{\alpha/2} \sqrt{\frac{f(1-f)}{n}}, \, f + z_{\alpha/2} \sqrt{\frac{f(1-f)}{n}}\right)" />
                        </div>
                        <p className="text-[10px] text-slate-400">Với f = m / n là tỷ lệ mẫu khảo sát.</p>
                      </div>

                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                        <span className="text-slate-400 font-semibold block text-[11px]">Cỡ mẫu tối thiểu cho tỷ lệ:</span>
                        <div className="font-mono text-white">
                          <MathFormula math="n \ge \frac{z_{\alpha/2}^2 \cdot f(1-f)}{\varepsilon_0^2}" />
                        </div>
                        <p className="text-[10px] text-slate-400">Nếu chưa biết f, lấy trường hợp xấu nhất f(1-f) = 0.25.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phần 3: Kiểm Định Giả Thuyết Thống Kê */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="text-base font-extrabold text-cyan-300 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <span className="text-cyan-400">III.</span>
                  <span>KIỂM ĐỊNH GIẢ THUYẾT THỐNG KÊ (TIÊU CHUẨN Z_qs & MIỀN BÁC BỎ)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Kiểm định Trung bình */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-amber-300 block">1. Kiểm định Trung bình:</span>
                    <div className="font-mono text-white bg-slate-950 p-2 rounded border border-slate-800 text-center">
                      <MathFormula math="Z_{qs} = \frac{\bar{x} - \mu_0}{\frac{s}{\sqrt{n}}} \quad (n \ge 30)" />
                    </div>
                    <div className="space-y-1 text-slate-300 text-[11px]">
                      <p>• Hai phía (H₁: μ ≠ μ₀): Bác bỏ H₀ nếu |Z_qs| &gt; z_(α/2)</p>
                      <p>• Phía phải (H₁: μ &gt; μ₀): Bác bỏ H₀ nếu Z_qs &gt; z_α</p>
                      <p>• Phía trái (H₁: μ &lt; μ₀): Bác bỏ H₀ nếu Z_qs &lt; -z_α</p>
                    </div>
                  </div>

                  {/* Kiểm định Tỷ lệ */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-emerald-300 block">2. Kiểm định Tỷ lệ:</span>
                    <div className="font-mono text-white bg-slate-950 p-2 rounded border border-slate-800 text-center">
                      <MathFormula math="Z_{qs} = \frac{f - p_0}{\sqrt{\frac{p_0(1-p_0)}{n}}}" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      * Chú ý mẫu số dùng p₀ của giả thiết H₀, không dùng f mẫu!
                    </p>
                  </div>

                  {/* So sánh 2 Trung bình */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-cyan-300 block">3. So sánh 2 Trung bình:</span>
                    <div className="font-mono text-white bg-slate-950 p-2 rounded border border-slate-800 text-center">
                      <MathFormula math="Z_{qs} = \frac{\bar{x}_1 - \bar{x}_2}{\sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}}}" />
                    </div>
                  </div>

                  {/* So sánh 2 Tỷ lệ */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <span className="font-bold text-purple-300 block">4. So sánh 2 Tỷ lệ:</span>
                    <div className="font-mono text-white bg-slate-950 p-2 rounded border border-slate-800 text-center">
                      <MathFormula math="Z_{qs} = \frac{f_1 - f_2}{\sqrt{\bar{f}(1-\bar{f})\left(\frac{1}{n_1} + \frac{1}{n_2}\right)}}" />
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Với tỷ lệ chung gộp 2 mẫu: <MathFormula math="\bar{f} = \frac{m_1 + m_2}{n_1 + n_2}" />.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BẢNG SỐ LAPLACE PHỤ LỤC 2 */}
          {activeTab === 'laplace' && (
            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/30 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                    <span>Hàm Laplace Quy Ước Của Bộ Môn Toán Kinh Tế HUB:</span>
                  </h3>
                  <div className="text-[11px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    <MathFormula math="\Phi(z) = \frac{1}{\sqrt{2\pi}} \int_0^z e^{-t^2/2} dt" />
                  </div>
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p>• <strong>Đối xứng qua gốc tọa độ:</strong> <MathFormula math="\Phi(-z) = -\Phi(z)" />.</p>
                  <p>• <strong>Tiệm cận vô cùng:</strong> <MathFormula math="\Phi(+\infty) = 0.5" />; <MathFormula math="\Phi(-\infty) = -0.5" />.</p>
                  <p>• <strong>Quy tắc tra giá trị tới hạn z-alpha:</strong> <MathFormula math="\Phi(z_\alpha) = 0.5 - \alpha" />.</p>
                  <p className="text-amber-300 font-medium">
                    ⚡ <strong>KHÁC BIỆT VỚI CASIO FX-580:</strong> Máy Casio [MENU 7 2] tính tích phân từ -∞ đến z nên kết quả Casio lớn hơn bảng HUB đúng 0.5: Casio(z) = 0.5 + Φ(z).
                  </p>
                </div>
              </div>

              {/* Tra cứu nhanh giá trị z */}
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-bold text-slate-200 text-xs block">
                  🔍 Tra cứu nhanh giá trị z bất kỳ:
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-700">
                    <label className="text-xs text-slate-400 font-bold">Nhập z:</label>
                    <input
                      type="text"
                      value={searchZ}
                      onChange={(e) => setSearchZ(e.target.value)}
                      placeholder="1.96"
                      className="w-24 bg-transparent font-mono font-bold text-cyan-300 outline-none text-sm"
                    />
                  </div>

                  {currentPhi !== null && (
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 px-3 py-1.5 rounded-xl">
                        Bảng HUB: <strong>Φ({searchZ}) = {currentPhi.toFixed(4)}</strong>
                      </span>
                      <span className="bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 px-3 py-1.5 rounded-xl">
                        Casio 580 [NormCD]: <strong>{casioNormCD?.toFixed(4)}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bảng Các Giá Trị Tới Hạn Thường Gặp */}
              <div className="space-y-2">
                <span className="font-bold text-cyan-300 text-xs uppercase tracking-wider block">
                  ⭐ 4 Giá Trị Tới Hạn Chuẩn Tắc Bắt Buộc Phải Nhớ Khi Đi Thi:
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-800 rounded-xl overflow-hidden text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-mono">
                        <th className="p-3">Độ tin cậy (1 - α)</th>
                        <th className="p-3">Mức ý nghĩa (α)</th>
                        <th className="p-3">α / 2 (2 phía)</th>
                        <th className="p-3 font-bold text-cyan-300">Giá trị tới hạn z</th>
                        <th className="p-3 font-bold text-emerald-300">Giá trị Φ(z) trong Bảng HUB</th>
                        <th className="p-3">Ghi chú thực chiến</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {COMMON_Z_VALUES.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-white">{item.gamma}</td>
                          <td className="p-3">{item.alpha}</td>
                          <td className="p-3">{item.alphaHalf}</td>
                          <td className="p-3 font-black text-cyan-300 text-sm">{item.zAlpha}</td>
                          <td className="p-3 font-black text-emerald-400">{item.phiVal}</td>
                          <td className="p-3 text-slate-400 font-sans text-[11px]">{item.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bảng Laplace Trích Đoạn Phụ Lục 2 */}
              <div className="space-y-2 pt-2">
                <span className="font-bold text-slate-300 text-xs block">
                  📖 Bảng Số Phụ Lục 2 Chi Tiết (z từ 0.00 đến 3.09):
                </span>
                <div className="max-h-64 overflow-y-auto border border-slate-800 rounded-xl bg-slate-950 text-[11px] font-mono">
                  <table className="w-full text-center border-collapse">
                    <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-cyan-300">
                      <tr>
                        <th className="p-2 border-r border-slate-800">z</th>
                        <th className="p-2">0.00</th>
                        <th className="p-2">0.01</th>
                        <th className="p-2">0.02</th>
                        <th className="p-2">0.03</th>
                        <th className="p-2">0.04</th>
                        <th className="p-2">0.05</th>
                        <th className="p-2">0.06</th>
                        <th className="p-2">0.07</th>
                        <th className="p-2">0.08</th>
                        <th className="p-2">0.09</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {[0.0, 0.5, 1.0, 1.5, 1.6, 1.9, 2.0, 2.3, 2.5, 3.0].map((zRow) => (
                        <tr key={zRow} className="hover:bg-slate-800/40">
                          <td className="p-2 font-bold text-cyan-400 border-r border-slate-800 bg-slate-900/60">
                            {zRow.toFixed(1)}
                          </td>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => {
                            const exactZ = zRow + col * 0.01;
                            const phi = calculateLaplacePhi(exactZ);
                            const isMatched = Math.abs(exactZ - (parsedZ || -999)) < 0.005;
                            return (
                              <td
                                key={col}
                                className={`p-2 ${
                                  isMatched
                                    ? 'bg-cyan-500 text-slate-950 font-black rounded'
                                    : ''
                                }`}
                              >
                                {phi.toFixed(4)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 7 BẪY PHÒNG THI */}
          {activeTab === 'traps' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-2xl space-y-3">
                <h3 className="font-extrabold text-amber-300 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span>Tổng Hợp 7 Bẫy Phòng Thi Kinh Điển Mà Sinh Viên HUB Rất Dễ Bị Mất Điểm:</span>
                </h3>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <strong className="text-amber-400 block font-bold mb-1">
                      Bẫy 1: Quên căn bậc hai của phương sai σ² khi đề bài cho N(μ, σ²)
                    </strong>
                    <p className="text-slate-300">
                      Đề bài ghi X ~ N(25, 9) thì σ = √9 = 3. Nếu bạn bấm Casio nhập σ = 9 thì kết quả xác suất sai 100%!
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <strong className="text-amber-400 block font-bold mb-1">
                      Bẫy 2: Nhầm lẫn giữa độ lệch chuẩn mẫu hiệu chỉnh s_x và độ lệch dân số σ_x
                    </strong>
                    <p className="text-slate-300">
                      Khi bấm Casio [OPTN 2], máy hiện cả σ_x và s_x. Trong mọi bài toán Ước lượng và Kiểm định mẫu, BẮT BUỘC dùng s_x (phương sai s_x² chia cho n - 1).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <strong className="text-amber-400 block font-bold mb-1">
                      Bẫy 3: Cỡ mẫu tối thiểu - Quên làm tròn lên hoặc quên trừ cỡ mẫu cũ khi đề hỏi "THÊM"
                    </strong>
                    <p className="text-slate-300">
                      Tính ra n = 197.02 thì phải lấy n = 198 (luôn làm tròn lên trần). Nếu đề hỏi: "Cần điều tra THÊM bao nhiêu đơn vị", phải lấy 198 - 100 = 98 đơn vị.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <strong className="text-amber-400 block font-bold mb-1">
                      Bẫy 4: Nhầm lẫn giữa biến cố Xung khắc và Độc lập
                    </strong>
                    <p className="text-slate-300">
                      Nếu xung khắc thì P(AB) = 0 =&gt; P(A+B) = P(A) + P(B). Nếu độc lập thì P(AB) = P(A)P(B). Nhầm hai khái niệm này sẽ khiến câu 1 mất trọn 1.5 điểm!
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <strong className="text-amber-400 block font-bold mb-1">
                      Bẫy 5: Kiểm định tỷ lệ - Dùng sai tỷ lệ mẫu f thay vì p₀ ở mẫu số
                    </strong>
                    <p className="text-slate-300">
                      Công thức đúng: Z_qs = (f - p₀) / √(p₀(1-p₀)/n). Mẫu số phải dùng số p₀ trong giả thiết H₀, không được dùng f.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <strong className="text-amber-400 block font-bold mb-1">
                      Bẫy 6: Nhầm lẫn giữa kiểm định 2 phía và kiểm định 1 phía
                    </strong>
                    <p className="text-slate-300">
                      Đề hỏi "có tăng lên không" (&gt;) hoặc "có giảm đi không" (&lt;) là kiểm định 1 phía, phải tra z_α. Chỉ khi hỏi "có thay đổi không" (≠) mới là 2 phía (z_{'{α/2}'}).
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                    <strong className="text-amber-400 block font-bold mb-1">
                      Bẫy 7: Tìm hằng số k của biến liên tục - Quên điều kiện hàm mật độ f(x) ≥ 0
                    </strong>
                    <p className="text-slate-300">
                      Sau khi tính tích phân ∫ f(x)dx = 1 ra k, phải kiểm tra lại xem với k đó thì f(x) ≥ 0 với mọi x thuộc miền xác định hay không.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>Nguồn: Bộ Môn Toán Kinh Tế • Khoa Hệ Thống Thông Tin & KH Dữ Liệu HUB</span>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Tờ Phao Thi HUB Chuẩn</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Đóng Lại
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
