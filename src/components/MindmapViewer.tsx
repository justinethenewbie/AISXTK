import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Map,
  Sparkles,
  Download,
  Share2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  Cloud,
  FileText,
  Printer,
  Calculator,
  Lightbulb,
  BookOpen,
  Zap,
  Layers,
  Palette,
  ExternalLink,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { MathFormula, MathText } from './MathFormula';
import { CHAPTERS_DATA } from '../data/curriculumData';
import { aiFetch } from '../utils/apiHelper';
import { uploadToGoogleDrive, getAccessToken } from '../services/googleDriveService';

export interface MindmapNode {
  id: string;
  title: string;
  detail?: string;
  formula?: string;
  examTip?: string;
}

export interface MindmapBranch {
  id: string;
  title: string;
  badge: string;
  color: string;
  children: MindmapNode[];
}

export interface MindmapData {
  id: string;
  title: string;
  summary: string;
  category: string;
  casioShortcut?: string;
  goldenRules?: string[];
  branches: MindmapBranch[];
}

// Quick presets for fast one-click creation
const QUICK_PRESETS = [
  { label: '🎲 Công Thức Bayes & Toàn Phần', topic: 'Công thức Bayes & Xác suất toàn phần' },
  { label: '📊 Biến Ngẫu Nhiên & Nhị Thức', topic: 'Biến ngẫu nhiên rời rạc & Phân phối Nhị thức, Poisson' },
  { label: '📈 Phân Phối Chuẩn & CLT', topic: 'Phân phối Chuẩn Gauss & Định lý giới hạn trung tâm' },
  { label: '🔍 Khoảng Tin Cậy & Kiểm Định', topic: 'Ước lượng khoảng tin cậy & Kiểm định giả thuyết thống kê' },
  { label: '📐 Hồi Quy & Hệ Số Pearson', topic: 'Hồi quy tuyến tính & Hệ số tương quan Pearson' },
  { label: '∫ Tích Phân & Hàm Mật Độ', topic: 'Tích phân suy rộng & Hàm mật độ xác suất biến liên tục' },
];

// Color theme presets
const COLOR_THEMES = [
  { id: 'cyberpunk', name: 'Cyan Cyberpunk', border: 'border-cyan-500/50', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.2)]', accent: 'cyan' },
  { id: 'emerald', name: 'Emerald Forest', border: 'border-emerald-500/50', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]', accent: 'emerald' },
  { id: 'purple', name: 'Nebula Violet', border: 'border-purple-500/50', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]', accent: 'purple' },
  { id: 'ocean', name: 'Deep Ocean Blue', border: 'border-blue-500/50', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]', accent: 'blue' },
];

export const MindmapViewer: React.FC = () => {
  // Input state
  const [topicInput, setTopicInput] = useState('Công thức Bayes & Xác suất toàn phần');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);

  // Active theme
  const [activeTheme, setActiveTheme] = useState(COLOR_THEMES[0]);

  // Mindmap data state
  const [mindmap, setMindmap] = useState<MindmapData | null>(null);

  // Interactive UI state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [collapsedBranches, setCollapsedBranches] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Custom User Notes (Personalization)
  const [customNotes, setCustomNotes] = useState<Array<{ id: string; branchId: string; text: string }>>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedBranchForNote, setSelectedBranchForNote] = useState<string>('b1');

  // Export status notifications
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveResultLink, setDriveResultLink] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mindmapCanvasRef = useRef<HTMLDivElement | null>(null);

  // Generate or load initial mindmap on mount
  useEffect(() => {
    generateMindmap('Công thức Bayes & Xác suất toàn phần');
  }, []);

  const showToast = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  /**
   * Main Process: Generate mindmap from topic
   */
  const generateMindmap = async (targetTopic: string) => {
    const cleanTopic = targetTopic.trim();
    if (!cleanTopic) return;

    setIsGenerating(true);
    setDriveResultLink(null);

    try {
      const response = await aiFetch('/api/tutor/generate-mindmap', {
        method: 'POST',
        body: JSON.stringify({
          topic: cleanTopic,
          depth: 'standard',
        }),
      });

      const resJson = await response.json();
      if (resJson && resJson.data && resJson.data.branches) {
        setMindmap(resJson.data);
        // Reset collapsed state so all branches are visible
        setCollapsedBranches({});
        showToast(resJson.isAiGenerated ? '✨ Đã kiến tạo Sơ Đồ Tư Duy AI siêu tốc!' : 'Đã tải cấu trúc sơ đồ tư duy tiêu chuẩn!');
      } else {
        throw new Error('Dữ liệu sơ đồ không hợp lệ');
      }
    } catch (err: any) {
      console.warn('Lỗi khi tạo sơ đồ tư duy:', err);
      // Fallback: Create from chapters data or default template
      const fallback = createFallbackFromChapter(cleanTopic);
      setMindmap(fallback);
      showToast('Đã mở sơ đồ tư duy mẫu dự phòng!');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle Enter key or Submit button
   */
  const handleTriggerGenerate = () => {
    if (topicInput.trim()) {
      generateMindmap(topicInput.trim());
    }
  };

  /**
   * Quick Chapter Switcher
   */
  const handleSelectChapter = (chapterId: number) => {
    setSelectedChapterId(chapterId);
    const chap = CHAPTERS_DATA.find((c) => c.id === chapterId);
    if (chap) {
      setTopicInput(`Chương ${chap.id}: ${chap.title}`);
      generateMindmap(`Chương ${chap.id}: ${chap.title}`);
    }
  };

  /**
   * Helper fallback builder when offline
   */
  const createFallbackFromChapter = (topic: string): MindmapData => {
    return {
      id: `map-${Date.now()}`,
      title: topic,
      summary: `Hệ thống hóa toàn diện các khối kiến thức cốt lõi, công thức KaTeX và phương pháp xử lý cho chuyên đề ${topic}.`,
      category: 'Xác Suất Thống Kê Chuẩn Đại Học',
      casioShortcut: 'Bấm MENU -> 7 (Phân phối xác suất) hoặc MENU -> 6 (Thống kê) trên Casio fx-580VN X',
      goldenRules: [
        'Phân biệt rõ biến ngẫu nhiên rời rạc (tổng xích ma) và biến ngẫu nhiên liên tục (tích phân).',
        'Tổng xác suất trên toàn miền luôn bằng 1 ($P(\\Omega) = 1$).',
        'Sử dụng phương pháp biến cố đối lập khi gặp cụm từ "ít nhất một".'
      ],
      branches: [
        {
          id: 'b1',
          title: '1. Khái Niệm & Định Nghĩa Cốt Lõi',
          badge: 'Lý thuyết',
          color: '#06b6d4',
          children: [
            {
              id: 'b1-1',
              title: 'Mô hình hóa biến cố / Biến ngẫu nhiên',
              detail: 'Xác định rõ không gian mẫu $\\Omega$, các biến cố nguyên nhân $A_i$ và biến cố kết quả $B$.',
              formula: 'P(\\Omega) = 1, \\quad 0 \\le P(A) \\le 1',
              examTip: 'Luôn gọi tên biến ngẫu nhiên và đơn vị đo lường ở dòng đầu tiên của bài làm.'
            },
            {
              id: 'b1-2',
              title: 'Hệ biến cố đầy đủ',
              detail: 'Tập hợp các biến cố xung khắc từng đôi và có hợp bằng toàn bộ không gian mẫu.',
              formula: '\\sum_{i=1}^{n} P(A_i) = 1',
              examTip: 'Đọc kỹ đề bài để chắc chắn các trường hợp đã vét cạn 100% khả năng.'
            }
          ]
        },
        {
          id: 'b2',
          title: '2. Công Thức Trọng Tâm & KaTeX',
          badge: 'Công thức',
          color: '#10b981',
          children: [
            {
              id: 'b2-1',
              title: 'Công thức Xác Suất Toàn Phần',
              detail: 'Tính xác suất kết quả thông qua trung bình gia quyền của các nguyên nhân.',
              formula: 'P(B) = \\sum_{i=1}^{n} P(A_i) \\cdot P(B|A_i)',
              examTip: 'Vẽ sơ đồ cây 2 tầng để tránh nhầm lẫn giữa các nhánh.'
            },
            {
              id: 'b2-2',
              title: 'Công thức Bayes (Xác suất hậu nghiệm)',
              detail: 'Cập nhật xác suất của giả thiết $A_k$ khi đã biết trước kết quả $B$ đã xảy ra.',
              formula: 'P(A_k|B) = \\frac{P(A_k)P(B|A_k)}{P(B)}',
              examTip: 'Tử số của công thức Bayes luôn là một trong các số hạng ở mẫu số!'
            }
          ]
        },
        {
          id: 'b3',
          title: '3. Phương Pháp Giải & Dấu Hiệu',
          badge: 'Phương pháp',
          color: '#38bdf8',
          children: [
            {
              id: 'b3-1',
              title: 'Quy trình 4 bước chuẩn George Pólya',
              detail: '1. Tóm tắt giả thiết -> 2. Chọn mô hình định lý -> 3. Thế số & tính toán -> 4. Kết luận ý nghĩa.',
              formula: 'P(A|B) = \\frac{P(AB)}{P(B)}',
              examTip: 'Trình bày theo từng bước rõ ràng để ăn trọn điểm các ý phụ.'
            },
            {
              id: 'b3-2',
              title: 'Dấu hiệu nhận biết bài toán điều kiện',
              detail: 'Xuất hiện cụm từ: "biết rằng...", "trong số những người...", "với điều kiện là...".',
              formula: 'P(B) > 0',
              examTip: 'Tránh nhầm lẫn giữa xác suất có điều kiện $P(A|B)$ và xác suất giao $P(AB)$.'
            }
          ]
        },
        {
          id: 'b4',
          title: '4. Mẹo Casio fx-580VN X & Phòng Thi',
          badge: 'Mẹo Casio',
          color: '#f59e0b',
          children: [
            {
              id: 'b4-1',
              title: 'Lưu mẫu số vào biến nhớ M',
              detail: 'Tính mẫu số $P(B)$ trước rồi bấm STO -> M, sau đó lấy từng tử số chia M để ra kết quả nhanh.',
              formula: '\\text{Mẫu số} \\rightarrow \\mathbf{STO} \\; M',
              examTip: 'Giảm 70% nguy cơ bấm sai ngoặc đơn khi biểu thức phân số quá dài.'
            },
            {
              id: 'b4-2',
              title: 'Kiểm tra tính hợp lý của đáp số',
              detail: 'Xác suất tính ra bắt buộc phải nằm trong đoạn $[0; 1]$.',
              formula: '0 \\le P \\le 1',
              examTip: 'Nếu máy tính hiện kết quả lớn hơn 1 hoặc có số âm, bạn đã nhầm lẫn thứ tự biến cố!'
            }
          ]
        },
        {
          id: 'b5',
          title: '5. Ứng Dụng Ngân Hàng & Thực Tế',
          badge: 'Ứng dụng',
          color: '#a855f7',
          children: [
            {
              id: 'b5-1',
              title: 'Thẩm định rủi ro tín dụng ngân hàng',
              detail: 'Đánh giá xác suất khách hàng vỡ nợ khi có lịch sử chậm trả nợ CIC.',
              formula: 'P(\\text{Vỡ nợ}|\\text{CIC Xấu})',
              examTip: 'Mô hình chấm điểm tín dụng (Credit Scoring) của mọi ngân hàng thương mại.'
            },
            {
              id: 'b5-2',
              title: 'Kiểm tra sàng lọc y tế (Dương tính giả)',
              detail: 'Đo lường xác suất thực sự mắc bệnh khi kết quả test nhanh dương tính.',
              formula: 'P(\\text{Bệnh}|+) \\ll 100\\%',
              examTip: 'Khi tỷ lệ bệnh trong cộng đồng rất thấp, độ đặc hiệu cao là yếu tố quyết định.'
            }
          ]
        }
      ]
    };
  };

  /**
   * Toggle collapse for branch
   */
  const toggleCollapse = (branchId: string) => {
    setCollapsedBranches((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  /**
   * Expand all / Collapse all
   */
  const handleToggleAll = (expand: boolean) => {
    if (!mindmap) return;
    const newState: Record<string, boolean> = {};
    mindmap.branches.forEach((b) => {
      newState[b.id] = !expand;
    });
    setCollapsedBranches(newState);
  };

  /**
   * Add custom note / user personalized node
   */
  const handleAddCustomNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: `custom-${Date.now()}`,
      branchId: selectedBranchForNote,
      text: newNoteText.trim(),
    };
    setCustomNotes((prev) => [...prev, newNote]);
    setNewNoteText('');
    showToast('Đã gắn thêm nút ghi chú cá nhân vào sơ đồ!');
  };

  /**
   * Remove custom note
   */
  const handleRemoveNote = (id: string) => {
    setCustomNotes((prev) => prev.filter((n) => n.id !== id));
  };

  /**
   * Copy Markdown Outline
   */
  const handleCopyMarkdown = () => {
    if (!mindmap) return;
    let md = `# SƠ ĐỒ TƯ DUY: ${mindmap.title}\n\n`;
    md += `> ${mindmap.summary}\n\n`;
    md += `**Chuyên mục:** ${mindmap.category}\n\n`;

    if (mindmap.casioShortcut) {
      md += `### 🧮 Phím tắt Casio fx-580VN X:\n${mindmap.casioShortcut}\n\n`;
    }

    if (mindmap.goldenRules && mindmap.goldenRules.length > 0) {
      md += `### 🌟 Quy tắc vàng cần nhớ:\n`;
      mindmap.goldenRules.forEach((rule, idx) => {
        md += `${idx + 1}. ${rule}\n`;
      });
      md += `\n`;
    }

    mindmap.branches.forEach((b) => {
      md += `## ${b.title} [${b.badge}]\n`;
      b.children.forEach((c) => {
        md += `- **${c.title}**\n`;
        if (c.detail) md += `  - Diễn giải: ${c.detail}\n`;
        if (c.formula) md += `  - Công thức: $${c.formula}$\n`;
        if (c.examTip) md += `  - Mẹo thi: ${c.examTip}\n`;
      });
      // Include user notes
      const branchNotes = customNotes.filter((n) => n.branchId === b.id);
      if (branchNotes.length > 0) {
        md += `  - *Ghi chú cá nhân:*\n`;
        branchNotes.forEach((n) => {
          md += `    - 📌 ${n.text}\n`;
        });
      }
      md += `\n`;
    });

    navigator.clipboard.writeText(md);
    showToast('📋 Đã sao chép dàn bài Sơ đồ tư duy dạng Markdown!');
  };

  /**
   * Export to PDF / Print View
   */
  const handlePrintPDF = () => {
    window.print();
  };

  /**
   * Save directly to Google Drive
   */
  const handleSaveToDrive = async () => {
    if (!mindmap) return;
    setIsSavingToDrive(true);
    setDriveResultLink(null);

    try {
      const fileName = `So_Do_Tu_Duy_${mindmap.title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_')}_${Date.now()}.md`;
      
      let md = `# SƠ ĐỒ TƯ DUY XSTK: ${mindmap.title}\n`;
      md += `Ngày tạo: ${new Date().toLocaleString('vi-VN')}\n`;
      md += `Tóm lược: ${mindmap.summary}\n\n`;
      md += `--- HƯỚNG DẪN CASIO FX-580VN X ---\n${mindmap.casioShortcut || ''}\n\n`;
      
      mindmap.branches.forEach((b) => {
        md += `## ${b.title} (${b.badge})\n`;
        b.children.forEach((c) => {
          md += `### ${c.title}\n`;
          if (c.detail) md += `${c.detail}\n`;
          if (c.formula) md += `Công thức KaTeX: $${c.formula}$\n`;
          if (c.examTip) md += `Mẹo thi: ${c.examTip}\n`;
          md += `\n`;
        });
      });

      const res = await uploadToGoogleDrive(fileName, md, 'text/markdown');
      if (res && res.webViewLink) {
        setDriveResultLink(res.webViewLink);
      }
      showToast('☁️ Đã lưu Sơ đồ tư duy thành công lên Google Drive!');
    } catch (err: any) {
      console.error('Save to Drive error:', err);
      showToast(`Không thể lưu Drive: ${err?.message || 'Vui lòng kiểm tra quyền Google Drive'}`);
    } finally {
      setIsSavingToDrive(false);
    }
  };

  /**
   * Filter branches & children based on search query
   */
  const filteredBranches = useMemo(() => {
    if (!mindmap) return [];
    if (!searchQuery.trim()) return mindmap.branches;

    const q = searchQuery.toLowerCase().trim();
    return mindmap.branches.map((b) => {
      const matchesBranch = b.title.toLowerCase().includes(q) || b.badge.toLowerCase().includes(q);
      const filteredChildren = b.children.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.detail && c.detail.toLowerCase().includes(q)) ||
          (c.formula && c.formula.toLowerCase().includes(q)) ||
          (c.examTip && c.examTip.toLowerCase().includes(q))
      );
      return {
        ...b,
        isMatched: matchesBranch || filteredChildren.length > 0,
        children: matchesBranch ? b.children : filteredChildren,
      };
    });
  }, [mindmap, searchQuery]);

  return (
    <div
      ref={containerRef}
      className={`space-y-6 text-slate-100 transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''
      }`}
    >
      {/* Toast Notification */}
      {noticeMessage && (
        <div className="fixed top-20 right-6 z-50 bg-cyan-950 border-2 border-cyan-400 text-cyan-200 px-5 py-3 rounded-2xl shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* TOP CONTROL & HERO PANEL */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-2 border-cyan-500/40 p-6 rounded-3xl space-y-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] relative overflow-hidden">
        {/* Ambient glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs sm:text-sm tracking-wider uppercase">
              <Map className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>CÔNG CỤ KIẾN TẠO SƠ ĐỒ TƯ DUY TOÁN HỌC & XSTK SIÊU TỐC</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              Bản Đồ Tư Duy Phân Nhánh Thông Minh (AI Mindmap Engine)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Nhập bất kỳ chủ đề toán học nào để tạo sơ đồ tư duy phân nhánh trực quan, chuẩn KaTeX kèm mẹo Casio fx-580VN X trong 2-3 giây.
            </p>
          </div>

          {/* Preset Chapter Picker */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-400">Giáo trình 7 Chương:</span>
            <select
              value={selectedChapterId || ''}
              onChange={(e) => e.target.value && handleSelectChapter(Number(e.target.value))}
              className="p-2.5 rounded-xl border border-cyan-500/40 bg-slate-900 text-cyan-200 text-xs font-bold outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            >
              <option value="">Chọn chương chuẩn...</option>
              {CHAPTERS_DATA.map((c) => (
                <option key={c.id} value={c.id}>
                  Chương {c.id}: {c.shortTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* INPUT: Central Topic Input with Enter & Button */}
        <div className="space-y-3 pt-1">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTriggerGenerate()}
                placeholder="Nhập chủ đề chính của bạn ở đây... (ví dụ: Công thức Bayes, Phân phối Chuẩn, Khoảng tin cậy...)"
                disabled={isGenerating}
                className="w-full py-3.5 pl-4 pr-12 rounded-2xl border-2 border-cyan-500/50 bg-slate-950/90 text-white placeholder-slate-400 text-sm font-semibold outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40 shadow-inner transition-all"
              />
              {topicInput && (
                <button
                  onClick={() => setTopicInput('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={handleTriggerGenerate}
              disabled={isGenerating || !topicInput.trim()}
              className="py-3.5 px-6 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Đang Kiến Tạo Sơ Đồ...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>TẠO BẢN ĐỒ TƯ DUY</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-extrabold text-cyan-400 flex items-center gap-1 shrink-0">
              <Lightbulb className="w-3.5 h-3.5" /> Gợi ý chủ đề nhanh:
            </span>
            {QUICK_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopicInput(preset.topic);
                  generateMindmap(preset.topic);
                }}
                disabled={isGenerating}
                className="text-[11px] font-bold py-1 px-2.5 rounded-lg bg-slate-900/90 hover:bg-cyan-950 border border-cyan-500/30 hover:border-cyan-400 text-slate-200 hover:text-cyan-200 transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* INTERACTIVE TOOLBAR & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-2xl">
        {/* Search & Filter */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Lọc từ khóa trong các nhánh sơ đồ..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400 font-medium"
          />
        </div>

        {/* Canvas Zoom & View Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(70, prev - 15))}
            title="Thu nhỏ (-15%)"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-all"
          >
            <ZoomOut className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <span className="text-xs font-mono font-bold text-cyan-300 px-2">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel((prev) => Math.min(150, prev + 15))}
            title="Phóng to (+15%)"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-all"
          >
            <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={() => setZoomLevel(100)}
            title="Đặt lại góc nhìn 100%"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Expand/Collapse All */}
          <button
            onClick={() => handleToggleAll(true)}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            Mở Tất Cả
          </button>
          <button
            onClick={() => handleToggleAll(false)}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            Thu Gọn
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Thu nhỏ giao diện' : 'Toàn màn hình'}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>

        {/* Export & Sync Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Copy Markdown */}
          <button
            onClick={handleCopyMarkdown}
            className="py-1.5 px-3 bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 text-cyan-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chép Markdown</span>
          </button>

          {/* Print A4 / Export PDF */}
          <button
            onClick={handlePrintPDF}
            className="py-1.5 px-3 bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>In PDF A4</span>
          </button>

          {/* Save to Google Drive */}
          <button
            onClick={handleSaveToDrive}
            disabled={isSavingToDrive}
            className="py-1.5 px-3 bg-blue-950 hover:bg-blue-900 border border-blue-500/50 text-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(59,130,246,0.3)]"
          >
            <Cloud className={`w-3.5 h-3.5 text-blue-400 ${isSavingToDrive ? 'animate-bounce' : ''}`} />
            <span>{isSavingToDrive ? 'Đang lưu Drive...' : 'Lưu Google Drive'}</span>
          </button>

          {driveResultLink && (
            <a
              href={driveResultLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-1 px-2.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <span>Xem trên Drive</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* MINDMAP CANVAS CONTAINER */}
      <div
        ref={mindmapCanvasRef}
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
        className="transition-transform duration-200 space-y-8"
      >
        {mindmap ? (
          <div className="space-y-8">
            {/* CENTRAL ROOT NODE */}
            <div className="flex justify-center">
              <div className="max-w-2xl w-full bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border-2 border-cyan-400 p-6 rounded-3xl shadow-[0_0_35px_rgba(6,182,212,0.3)] text-center space-y-3 relative group">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-black tracking-wide">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{mindmap.category}</span>
                </div>
                <h1 className="text-xl sm:text-3xl font-black text-white tracking-wide drop-shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                  {mindmap.title}
                </h1>
                <p className="text-xs sm:text-sm text-cyan-100 font-medium leading-relaxed max-w-xl mx-auto">
                  {mindmap.summary}
                </p>

                {/* Vertical Connector Line from Root to Branches */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-cyan-400 to-transparent" />
              </div>
            </div>

            {/* BRANCHES GRID (Dynamic Responsive Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {filteredBranches.map((branch, branchIdx) => {
                const isCollapsed = collapsedBranches[branch.id];
                const branchCustomNotes = customNotes.filter((n) => n.branchId === branch.id);

                return (
                  <div
                    key={branch.id}
                    className="bg-slate-950/90 border-2 border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 space-y-4 shadow-xl transition-all relative flex flex-col justify-between"
                  >
                    {/* Branch Header */}
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: branch.color || '#06b6d4' }}
                          />
                          <h3 className="font-black text-white text-sm sm:text-base tracking-tight">
                            {branch.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span
                            className="px-2 py-0.5 rounded-lg text-[10px] font-black border"
                            style={{
                              borderColor: `${branch.color}60`,
                              backgroundColor: `${branch.color}15`,
                              color: branch.color,
                            }}
                          >
                            {branch.badge}
                          </span>

                          <button
                            onClick={() => toggleCollapse(branch.id)}
                            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
                            title={isCollapsed ? 'Mở rộng nhánh' : 'Thu gọn nhánh'}
                          >
                            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Children / Sub-nodes */}
                      {!isCollapsed && (
                        <div className="space-y-3.5 pt-3">
                          {branch.children.map((child) => (
                            <div
                              key={child.id}
                              className="bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/30 p-3.5 rounded-2xl space-y-2 transition-all group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-extrabold text-xs sm:text-sm text-cyan-200">
                                  {child.title}
                                </h4>
                              </div>

                              {child.detail && (
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                  <MathText text={child.detail} inline />
                                </p>
                              )}

                              {child.formula && (
                                <div className="pt-1">
                                  <MathFormula math={child.formula} block />
                                </div>
                              )}

                              {child.examTip && (
                                <div className="flex items-start gap-1.5 pt-1 text-[11px] font-medium text-amber-300 bg-amber-950/30 border border-amber-500/20 p-2 rounded-xl">
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                  <span>{child.examTip}</span>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Render Custom Notes for this branch */}
                          {branchCustomNotes.map((note) => (
                            <div
                              key={note.id}
                              className="bg-cyan-950/40 border border-cyan-500/40 p-2.5 rounded-xl flex items-start justify-between gap-2 text-xs text-cyan-100"
                            >
                              <div className="flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold shrink-0">📌</span>
                                <span className="font-medium">{note.text}</span>
                              </div>
                              <button
                                onClick={() => handleRemoveNote(note.id)}
                                className="text-slate-400 hover:text-red-400 p-0.5"
                                title="Xóa ghi chú"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom Branch Footer */}
                    <div className="pt-3 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>{branch.children.length} nội dung chi tiết</span>
                      <button
                        onClick={() => {
                          setSelectedBranchForNote(branch.id);
                          const el = document.getElementById('custom-note-input');
                          if (el) el.focus();
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Thêm ghi chú</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CASIO SHORTCUT & GOLDEN RULES HIGHLIGHT SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Casio fx-580VN X Box */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-amber-500/40 p-5 rounded-3xl space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                  <Calculator className="w-4 h-4 text-amber-400" />
                  <span>HƯỚNG DẪN BẤM MÁY CASIO FX-580VN X:</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-2xl border border-amber-500/20 text-amber-200 text-xs sm:text-sm font-mono font-bold leading-relaxed">
                  {mindmap.casioShortcut || 'Sử dụng phím MENU -> 7 (Phân phối xác suất) hoặc MENU -> 6 (Thống kê 1 biến).'}
                </div>
                <p className="text-[11px] text-slate-300">
                  ⚡ Mẹo phòng thi: Bấm máy tính nhanh giúp tiết kiệm 60% thời gian làm bài trắc nghiệm và kiểm tra lại bài tự luận.
                </p>
              </div>

              {/* Golden Rules Box */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-emerald-500/40 p-5 rounded-3xl space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>QUY TẮC VÀNG CẦN NHỚ NẰM LÒNG:</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
                  {(mindmap.goldenRules || [
                    'Luôn kiểm tra tổng xác suất không gian mẫu bằng 1.',
                    'Dùng công thức đối lập khi gặp từ khóa "ít nhất một".'
                  ]).map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span><MathText text={rule} inline /></span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* CUSTOM NOTE MAKER (Personalized User Node) */}
            <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-3xl space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-cyan-300 font-black text-xs sm:text-sm">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>CÁ NHÂN HÓA SƠ ĐỒ TƯ DUY: THÊM NÚT GHI CHÚ RIÊNG CHO BẠN</span>
                </div>
                <span className="text-[11px] text-slate-400">Ghi lại mẹo thi, bẫy sai sót hoặc công thức thầy cô dặn</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <select
                  value={selectedBranchForNote}
                  onChange={(e) => setSelectedBranchForNote(e.target.value)}
                  className="p-2.5 rounded-xl border border-cyan-500/30 bg-slate-950 text-cyan-200 text-xs font-bold outline-none focus:border-cyan-400"
                >
                  {mindmap.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      Gắn vào: {b.title}
                    </option>
                  ))}
                </select>

                <input
                  id="custom-note-input"
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomNote()}
                  placeholder="Nhập nội dung ghi chú cá nhân của bạn vào đây..."
                  className="flex-1 p-2.5 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400 font-medium"
                />

                <button
                  onClick={handleAddCustomNote}
                  disabled={!newNoteText.trim()}
                  className="py-2.5 px-4 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Nút Vào Sơ Đồ</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm text-slate-300 font-bold">Đang tải cấu trúc sơ đồ tư duy...</p>
          </div>
        )}
      </div>
    </div>
  );
};
