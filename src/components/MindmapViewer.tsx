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
  GitBranch,
  LayoutGrid,
} from 'lucide-react';
import { MathFormula, MathText } from './MathFormula';
import { CHAPTERS_DATA } from '../data/curriculumData';
import { CHAPTER_1_MINDMAP, ALL_PRESET_CHAPTER_MINDMAPS } from '../data/mindmapCatalog';
import { aiFetch } from '../utils/apiHelper';
import { uploadToGoogleDrive, getAccessToken } from '../services/googleDriveService';

export interface MindmapSubItem {
  id?: string;
  label: string;
  content?: string;
  formula?: string;
  subList?: string[];
}

export interface MindmapNode {
  id: string;
  title: string;
  detail?: string;
  formula?: string;
  examTip?: string;
  subItems?: MindmapSubItem[];
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
  { label: '🎲 Bài 1: Xác Suất & Công Thức Cơ Bản', topic: 'Bài 1: Xác Suất và Công Thức Tính Xác Suất', chapterId: 1 },
  { label: '📊 Bài 2: Biến Rời Rạc & Nhị Thức, Poisson', topic: 'Bài 2: Biến Ngẫu Nhiên Rời Rạc & Các Quy Luật Phân Phối', chapterId: 2 },
  { label: '📈 Bài 3: Phân Phối Chuẩn Gauss & Laplace', topic: 'Bài 3: Biến Liên Tục & Phân Phối Chuẩn Gauss', chapterId: 3 },
  { label: '🔍 Bài 5: Ước Lượng Khoảng Tin Cậy', topic: 'Bài 5: Ước Lượng Khoảng Tin Cậy Thống Kê', chapterId: 5 },
  { label: '⚖️ Bài 6: Kiểm Định Giả Thuyết Thống Kê', topic: 'Kiểm định giả thuyết thống kê Z-test & t-test' },
  { label: '📐 Bài 7: Hồi Quy Tuyến Tính & Pearson', topic: 'Hồi quy tuyến tính & Hệ số tương quan Pearson' },
];

// Color theme presets
const COLOR_THEMES = [
  { id: 'cyberpunk', name: 'Cyan Cyberpunk', border: 'border-cyan-500/50', glow: 'shadow-[0_0_30px_rgba(6,182,212,0.2)]', accent: 'cyan' },
  { id: 'emerald', name: 'Emerald Forest', border: 'border-emerald-500/50', glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]', accent: 'emerald' },
  { id: 'purple', name: 'Nebula Violet', border: 'border-purple-500/50', glow: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]', accent: 'purple' },
  { id: 'ocean', name: 'Deep Ocean Blue', border: 'border-blue-500/50', glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]', accent: 'blue' },
];

export const MindmapViewer: React.FC = () => {
  // View mode: 'tree' (Sơ đồ nhánh cây kiểu Thầy dạy) vs 'cards' (Khối thẻ lưới chi tiết)
  const [viewMode, setViewMode] = useState<'tree' | 'cards'>('tree');

  // Input state - Mặc định mở ngay Bài 1 chuẩn theo thiết kế của Thầy
  const [topicInput, setTopicInput] = useState('Bài 1: Xác Suất và Công Thức Tính Xác Suất');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(1);

  // Active theme
  const [activeTheme, setActiveTheme] = useState(COLOR_THEMES[0]);

  // Mindmap data state - Khởi tạo ngay lập tức với sơ đồ đa tầng Bài 1
  const [mindmap, setMindmap] = useState<MindmapData | null>(CHAPTER_1_MINDMAP);

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

    // Kiểm tra nếu là các bài có sẵn trong kho chuẩn hóa
    const lower = cleanTopic.toLowerCase();
    if (lower.includes('bài 1') || lower.includes('chương 1') || (lower.includes('xác suất') && lower.includes('công thức'))) {
      setMindmap(CHAPTER_1_MINDMAP);
      setCollapsedBranches({});
      showToast('Đã mở sơ đồ tư duy Bài 1 chuẩn hóa giáo trình!');
      return;
    }
    if (lower.includes('bài 2') || lower.includes('chương 2') || lower.includes('rời rạc') || lower.includes('nhị thức')) {
      setMindmap(ALL_PRESET_CHAPTER_MINDMAPS[2]);
      setCollapsedBranches({});
      showToast('Đã mở sơ đồ tư duy Bài 2 chuẩn hóa giáo trình!');
      return;
    }
    if (lower.includes('bài 3') || lower.includes('chương 3') || lower.includes('chuẩn') || lower.includes('gauss')) {
      setMindmap(ALL_PRESET_CHAPTER_MINDMAPS[3]);
      setCollapsedBranches({});
      showToast('Đã mở sơ đồ tư duy Bài 3 chuẩn hóa giáo trình!');
      return;
    }
    if (lower.includes('bài 5') || lower.includes('chương 5') || lower.includes('ước lượng')) {
      setMindmap(ALL_PRESET_CHAPTER_MINDMAPS[5]);
      setCollapsedBranches({});
      showToast('Đã mở sơ đồ tư duy Bài 5 chuẩn hóa giáo trình!');
      return;
    }

    setIsGenerating(true);
    setDriveResultLink(null);

    try {
      const response = await aiFetch('/api/tutor/generate-mindmap', {
        method: 'POST',
        body: JSON.stringify({
          topic: cleanTopic,
          depth: 'deep',
        }),
      });

      const resJson = await response.json();
      if (resJson && resJson.data && resJson.data.branches) {
        setMindmap(resJson.data);
        setCollapsedBranches({});
        showToast(resJson.isAiGenerated ? '✨ Đã kiến tạo Sơ Đồ Tư Duy AI đa tầng sâu sắc!' : 'Đã tải cấu trúc sơ đồ tư duy tiêu chuẩn!');
      } else {
        throw new Error('Dữ liệu sơ đồ không hợp lệ');
      }
    } catch (err: any) {
      console.warn('Lỗi khi tạo sơ đồ tư duy:', err);
      // Fallback: Create from chapters data
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
    if (ALL_PRESET_CHAPTER_MINDMAPS[chapterId]) {
      const preset = ALL_PRESET_CHAPTER_MINDMAPS[chapterId];
      setMindmap(preset);
      setTopicInput(preset.title);
      setCollapsedBranches({});
      showToast(`Đã mở sơ đồ tư duy phân nhánh: ${preset.title}!`);
      return;
    }
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
          badge: 'Khái niệm',
          color: '#2563eb',
          children: [
            {
              id: 'b1-1',
              title: '1.1. Bản chất hiện tượng ngẫu nhiên',
              detail: `Khái niệm và mô hình toán học chuẩn xác cho hiện tượng trong ${topic}.`,
            }
          ]
        },
        {
          id: 'b2',
          title: '2. Các công thức tính toán',
          badge: 'Công thức',
          color: '#ea580c',
          children: [
            {
              id: 'b2-1',
              title: '2.1. Công thức trọng tâm',
              formula: 'P(A) = \\frac{m}{n}',
              detail: 'Điều kiện áp dụng công thức trong đề thi.'
            }
          ]
        }
      ]
    };
  };

  /**
   * Toggle branch collapse
   */
  const toggleCollapse = (branchId: string) => {
    setCollapsedBranches((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  /**
   * Expand all or collapse all branches
   */
  const handleToggleAll = (expand: boolean) => {
    if (!mindmap) return;
    const newState: Record<string, boolean> = {};
    if (!expand) {
      mindmap.branches.forEach((b) => {
        newState[b.id] = true;
      });
    }
    setCollapsedBranches(newState);
  };

  /**
   * Add Custom Note to selected branch
   */
  const handleAddCustomNote = () => {
    if (!newNoteText.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      branchId: selectedBranchForNote,
      text: newNoteText.trim(),
    };
    setCustomNotes((prev) => [...prev, newNote]);
    setNewNoteText('');
    showToast('Đã thêm ghi chú cá nhân hóa vào nhánh sơ đồ!');
  };

  /**
   * Remove Custom Note
   */
  const handleRemoveNote = (noteId: string) => {
    setCustomNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  /**
   * Export to Markdown string
   */
  const handleCopyMarkdown = () => {
    if (!mindmap) return;
    let md = `# SƠ ĐỒ TƯ DUY XSTK: ${mindmap.title}\n`;
    md += `> ${mindmap.summary}\n\n`;
    md += `### Hướng dẫn Casio fx-580VN X:\n${mindmap.casioShortcut || ''}\n\n`;
    
    if (mindmap.goldenRules && mindmap.goldenRules.length > 0) {
      md += `### Quy tắc vàng:\n`;
      mindmap.goldenRules.forEach((r) => (md += `- ${r}\n`));
      md += `\n`;
    }

    mindmap.branches.forEach((b) => {
      md += `## ${b.title} [${b.badge}]\n`;
      b.children.forEach((c) => {
        md += `### ${c.title}\n`;
        if (c.detail) md += `${c.detail}\n\n`;
        if (c.formula) md += `$$${c.formula}$$\n\n`;
        if (c.subItems && c.subItems.length > 0) {
          c.subItems.forEach((sub) => {
            md += `* **${sub.label}**: ${sub.content || ''}\n`;
            if (sub.formula) md += `  $$${sub.formula}$$\n`;
            if (sub.subList && sub.subList.length > 0) {
              sub.subList.forEach((li) => (md += `  - ${li}\n`));
            }
          });
          md += `\n`;
        }
        if (c.examTip) md += `> **Mẹo thi**: ${c.examTip}\n\n`;
      });
    });

    navigator.clipboard.writeText(md);
    showToast('📋 Đã sao chép toàn bộ nội dung Sơ đồ tư duy dạng Markdown!');
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
          if (c.subItems && c.subItems.length > 0) {
            c.subItems.forEach((sub) => {
              md += `- ${sub.label}: ${sub.content || ''}\n`;
            });
          }
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
          (c.examTip && c.examTip.toLowerCase().includes(q)) ||
          (c.subItems && c.subItems.some((s) => s.label.toLowerCase().includes(q) || (s.content && s.content.toLowerCase().includes(q))))
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
              <span>HỆ THỐNG SƠ ĐỒ TƯ DUY TOÁN HỌC & XSTK PHÂN CẤP ĐA TẦNG</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              Bản Đồ Tư Duy Khái Niệm, Bản Chất & Công Thức Chuẩn Sư Phạm
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-3xl">
              Hệ thống hóa sâu sắc định nghĩa, phép thử, biến cố, công thức KaTeX và ký hiệu toán học theo đúng cấu trúc cây phân nhánh trực quan của Giảng viên.
            </p>
          </div>

          {/* View Mode Switcher Pill */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border-2 border-cyan-500/40 shrink-0 shadow-lg">
            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>Sơ Đồ Cây Vươn Ngang (Kiểu Thầy Dạy)</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Khối Thẻ Chi Tiết</span>
            </button>
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
                placeholder="Nhập bất kỳ chủ đề xác suất nào... (ví dụ: Bài 1: Xác suất cơ bản, Phân phối Chuẩn, Ước lượng khoảng...)"
                disabled={isGenerating}
                className="w-full py-3.5 pl-4 pr-12 rounded-2xl border-2 border-cyan-500/50 bg-slate-950/90 text-white placeholder-slate-400 text-sm font-semibold outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-400/40 shadow-inner transition-all"
              />
              {topicInput && (
                <button
                  onClick={() => setTopicInput('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold bg-slate-800 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
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
                  <span>Đang Kiến Tạo Sơ Đồ Phân Nhánh...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>TẠO SƠ ĐỒ TƯ DUY</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Buttons for 7 Chapters */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-extrabold text-cyan-400 flex items-center gap-1 shrink-0">
              <Lightbulb className="w-3.5 h-3.5" /> Bộ giáo trình 7 Bài chuẩn HUB:
            </span>
            {QUICK_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTopicInput(preset.topic);
                  if (preset.chapterId) {
                    handleSelectChapter(preset.chapterId);
                  } else {
                    generateMindmap(preset.topic);
                  }
                }}
                disabled={isGenerating}
                className={`text-[11px] font-bold py-1.5 px-3 rounded-xl border transition-all cursor-pointer ${
                  topicInput.includes(preset.label.split(':')[0])
                    ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
                    : 'bg-slate-900/90 hover:bg-cyan-950 border-cyan-500/30 hover:border-cyan-400 text-slate-200 hover:text-cyan-200'
                }`}
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
            placeholder="Lọc từ khóa (phép thử, biến cố, Bayes, Bernoulli...)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-cyan-500/30 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400 font-medium"
          />
        </div>

        {/* Canvas Zoom & View Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setZoomLevel((prev) => Math.max(60, prev - 15))}
            title="Thu nhỏ (-15%)"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <span className="text-xs font-mono font-bold text-cyan-300 px-2">{zoomLevel}%</span>
          <button
            onClick={() => setZoomLevel((prev) => Math.min(160, prev + 15))}
            title="Phóng to (+15%)"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
          </button>
          <button
            onClick={() => setZoomLevel(100)}
            title="Đặt lại góc nhìn 100%"
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Expand/Collapse All */}
          <button
            onClick={() => handleToggleAll(true)}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Mở Tất Cả
          </button>
          <button
            onClick={() => handleToggleAll(false)}
            className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Thu Gọn
          </button>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Thu nhỏ giao diện' : 'Toàn màn hình'}
            className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-cyan-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>

        {/* Export & Sync Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="py-1.5 px-3 bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 text-cyan-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chép Markdown</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="py-1.5 px-3 bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>In PDF A4</span>
          </button>

          <button
            onClick={handleSaveToDrive}
            disabled={isSavingToDrive}
            className="py-1.5 px-3 bg-blue-950 hover:bg-blue-900 border border-blue-500/50 text-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(59,130,246,0.3)] cursor-pointer"
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
        className="transition-transform duration-200"
      >
        {mindmap ? (
          <div className="space-y-8">
            {/* VIEW MODE 1: HORIZONTAL TREE MINDMAP (CHUẨN ĐỒ HỌA CỦA THẦY GIÁO) */}
            {viewMode === 'tree' ? (
              <div className="overflow-x-auto p-4 sm:p-8 bg-slate-950/80 rounded-3xl border-2 border-slate-800 shadow-2xl min-w-full">
                <div className="flex items-start gap-10 sm:gap-14 min-w-max pb-8 pt-4">
                  {/* CỘT 0: ROOT NODE TRUNG TÂM BÊN TRÁI (Khối chữ nhật đứng bo tròn viền xanh dương nổi bật) */}
                  <div className="w-60 sm:w-68 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-4 border-blue-500 shadow-[0_0_35px_rgba(37,99,235,0.4)] flex flex-col items-center justify-center text-center space-y-3 shrink-0 self-center sticky left-0 z-20">
                    <div className="px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/50 text-blue-300 text-[11px] font-black uppercase tracking-wider">
                      {mindmap.category || 'XÁC SUẤT THỐNG KÊ'}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase font-sans tracking-wide">
                      {mindmap.title}
                    </h1>
                    {mindmap.summary && (
                      <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-4">
                        {mindmap.summary}
                      </p>
                    )}
                  </div>

                  {/* CỘT 1, 2, 3: CÁC NHÁNH LỚN VƯƠN SANG PHẢI VỚI ĐƯỜNG NỐI CONG MỀM MẠI */}
                  <div className="flex flex-col gap-10 flex-1">
                    {filteredBranches.map((branch) => {
                      const isCollapsed = collapsedBranches[branch.id];
                      return (
                        <div key={branch.id} className="flex items-start gap-6 sm:gap-8 relative">
                          {/* KHỐI NHÁNH CẤP 1 (Level 1 Branch Box) */}
                          <div
                            className="px-5 py-3.5 rounded-2xl border-2 font-black text-sm shrink-0 shadow-lg text-white flex items-center gap-2 self-start mt-2 transition-transform hover:scale-105"
                            style={{
                              borderColor: branch.color || '#2563eb',
                              backgroundColor: `${branch.color}18`,
                              boxShadow: `0 0 25px ${branch.color}35`,
                            }}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: branch.color || '#2563eb' }}
                            />
                            <span>{branch.title}</span>
                            <button
                              onClick={() => toggleCollapse(branch.id)}
                              className="ml-1 p-1 hover:bg-black/30 rounded-lg text-slate-300"
                              title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                            >
                              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* CỘT TIỂU MỤC CẤP 2 & HỘP ĐỊNH NGHĨA CẤP 3 */}
                          {!isCollapsed && (
                            <div
                              className="flex flex-col gap-5 flex-1 pl-5 border-l-3 relative transition-all"
                              style={{ borderColor: `${branch.color}70` }}
                            >
                              {branch.children.map((child) => (
                                <div
                                  key={child.id}
                                  className="flex flex-col xl:flex-row items-start gap-4 p-4.5 rounded-2xl bg-slate-900/90 border transition-all hover:bg-slate-900/100 shadow-xl group max-w-3xl"
                                  style={{ borderColor: `${branch.color}40` }}
                                >
                                  {/* CẤP 2: NHÃN TIỂU MỤC (ví dụ: 1.1. Xác suất là gì?, 1.2. Các khái niệm liên quan...) */}
                                  <div
                                    className="shrink-0 px-4 py-2 rounded-xl border-2 font-black text-xs sm:text-sm text-white shadow-md self-start"
                                    style={{
                                      borderColor: `${branch.color}80`,
                                      backgroundColor: `${branch.color}20`,
                                    }}
                                  >
                                    {child.title}
                                  </div>

                                  {/* CẤP 3: HỘP ĐỊNH NGHĨA KHÁI NIỆM & CÔNG THỨC CHI TIẾT */}
                                  <div className="flex-1 space-y-3 text-xs text-slate-200">
                                    {child.detail && (
                                      <p className="leading-relaxed font-sans text-sm text-slate-100">
                                        <MathText text={child.detail} />
                                      </p>
                                    )}

                                    {child.formula && (
                                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center font-mono text-cyan-300 overflow-x-auto shadow-inner text-sm">
                                        <MathFormula math={child.formula} block />
                                      </div>
                                    )}

                                    {/* Sub-items phân nhánh (Phép thử, Biến cố chắc chắn, không thể, ngẫu nhiên, cổ điển, thống kê) */}
                                    {child.subItems && child.subItems.length > 0 && (
                                      <div className="space-y-3 pt-1">
                                        {child.subItems.map((sub, sIdx) => (
                                          <div
                                            key={sIdx}
                                            className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2 shadow-sm"
                                          >
                                            <div className="font-black text-cyan-300 flex items-center gap-2 text-xs sm:text-sm">
                                              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
                                              <MathText text={sub.label} inline />
                                            </div>
                                            {sub.content && (
                                              <p className="text-slate-300 leading-relaxed font-sans text-xs sm:text-sm pl-4">
                                                <MathText text={sub.content} />
                                              </p>
                                            )}
                                            {sub.formula && (
                                              <div className="pt-1 text-center font-mono text-emerald-300">
                                                <MathFormula math={sub.formula} block />
                                              </div>
                                            )}
                                            {sub.subList && sub.subList.length > 0 && (
                                              <div className="space-y-1.5 pl-4 border-l-2 border-emerald-500/50 mt-2">
                                                {sub.subList.map((li, lIdx) => (
                                                  <div key={lIdx} className="text-xs sm:text-sm text-slate-200 font-medium">
                                                    <MathText text={li} inline />
                                                  </div>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {child.examTip && (
                                      <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs font-medium flex items-start gap-2">
                                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                                        <span><MathText text={child.examTip} inline /></span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* VIEW MODE 2: KHỐI THẺ BẢNG LƯỚI CHUYÊN SÂU (CARDS GRID VIEW) */
              <div className="space-y-8">
                {/* Central Header Card */}
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
                  </div>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                  {filteredBranches.map((branch) => {
                    const isCollapsed = collapsedBranches[branch.id];
                    return (
                      <div
                        key={branch.id}
                        className="bg-slate-950/90 border-2 border-slate-800 hover:border-cyan-500/50 rounded-3xl p-5 space-y-4 shadow-xl transition-all relative flex flex-col justify-between"
                      >
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
                          </div>

                          {!isCollapsed && (
                            <div className="space-y-3.5 pt-3">
                              {branch.children.map((child) => (
                                <div
                                  key={child.id}
                                  className="bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/30 p-3.5 rounded-2xl space-y-2 transition-all group"
                                >
                                  <h4 className="font-extrabold text-xs sm:text-sm text-cyan-200">
                                    {child.title}
                                  </h4>
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
                                  {child.subItems && child.subItems.length > 0 && (
                                    <div className="space-y-2 pt-1 border-t border-slate-800/80">
                                      {child.subItems.map((sub, sIdx) => (
                                        <div key={sIdx} className="text-xs space-y-1">
                                          <div className="font-bold text-cyan-300"><MathText text={sub.label} inline /></div>
                                          {sub.content && <div className="text-slate-300 pl-2"><MathText text={sub.content} inline /></div>}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span>{branch.children.length} nội dung chi tiết</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
