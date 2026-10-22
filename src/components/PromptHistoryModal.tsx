import React, { useState, useEffect } from 'react';
import {
  FileCode,
  X,
  Download,
  Copy,
  Check,
  Printer,
  Sparkles,
  Layers,
  ChevronRight,
  Code2,
  BookOpen,
  Cpu,
  Calculator,
  Palette,
  Database,
  ExternalLink,
  ShieldCheck,
  Zap,
  RotateCw,
  Cloud,
} from 'lucide-react';
import { PROMPTS_HISTORY_DATA, PromptStepItem, syncPromptsWithServer } from '../data/promptHistoryData';
import { exportPromptsToPdf, exportPromptsToWord } from '../utils/exportUtils';
import { uploadToGoogleDrive, getAccessToken, googleSignIn } from '../services/googleDriveService';

interface PromptHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptHistoryModal: React.FC<PromptHistoryModalProps> = ({ isOpen, onClose }) => {
  const [promptsList, setPromptsList] = useState<PromptStepItem[]>(PROMPTS_HISTORY_DATA);
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);
  const [driveUploadSuccess, setDriveUploadSuccess] = useState<string | null>(null);

  // Auto-sync prompts in background whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      syncPromptsWithServer().then((synced) => {
        if (Array.isArray(synced) && synced.length > 0) {
          setPromptsList(synced);
        }
      }).catch((err) => {
        console.warn('Error auto-syncing prompts:', err);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalPhases = promptsList.length;

  const filteredPrompts =
    selectedPhase === 'all'
      ? promptsList
      : promptsList.filter((p) => p.stepNumber === selectedPhase);

  const handleSaveToDrive = async () => {
    setIsUploadingToDrive(true);
    setDriveUploadSuccess(null);
    try {
      let token = await getAccessToken();
      if (!token) {
        const signinRes = await googleSignIn();
        token = signinRes?.accessToken || null;
      }
      if (!token) {
        throw new Error('Vui lòng cấp quyền Google Drive để lưu tệp');
      }

      let content = `# TỔNG HỢP TOÀN BỘ PROMPTS & KIẾN TRÚC HỆ THỐNG EDT - AI TUTOR XÁC SUẤT THỐNG KÊ\n\n`;
      content += `> Xuất tự động từ ứng dụng EDT lúc ${new Date().toLocaleString('vi-VN')}\n\n`;
      promptsList.forEach((item) => {
        content += `## GIAI ĐOẠN ${item.stepNumber}: ${item.phaseTitle}\n`;
        content += `**Chuyên mục:** ${item.category}\n`;
        content += `**Mục tiêu:** ${item.goal}\n\n`;
        content += `### 1. User Prompt (Câu lệnh người dùng):\n\`\`\`text\n${item.fullPromptText}\n\`\`\`\n\n`;
        if (item.systemInstructionsPrompt) {
          content += `### 2. System Instructions:\n\`\`\`text\n${item.systemInstructionsPrompt}\n\`\`\`\n\n`;
        }
        content += `### 3. Kỹ thuật triển khai:\n`;
        item.technicalImplementation.forEach((t) => {
          content += `- ${t}\n`;
        });
        content += `\n### 4. Thành phần bàn giao:\n`;
        item.keyOutputs.forEach((o) => {
          content += `- ${o}\n`;
        });
        content += `\n---\n\n`;
      });

      const fileName = `EDT_So_Tay_Prompt_${new Date().toISOString().substring(0, 10)}.md`;
      const res = await uploadToGoogleDrive(fileName, content, 'text/markdown');
      setDriveUploadSuccess(res.webViewLink || 'Đã lưu thành công!');
      setTimeout(() => setDriveUploadSuccess(null), 6000);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu lên Google Drive');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  const handleCopySinglePrompt = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllPrompts = () => {
    let fullMarkdown = `# TỔNG HỢP TOÀN BỘ PROMPTS & KIẾN TRÚC HỆ THỐNG EDT - AI TUTOR XÁC SUẤT THỐNG KÊ\n\n`;
    fullMarkdown += `> Trình tự hệ thống gồm ${totalPhases} giai đoạn xây dựng từ con số 0 đến ứng dụng hoàn chỉnh.\n\n`;

    promptsList.forEach((item) => {
      fullMarkdown += `## GIAI ĐOẠN ${item.stepNumber}: ${item.phaseTitle}\n`;
      fullMarkdown += `**Chuyên mục:** ${item.category}\n`;
      fullMarkdown += `**Mục tiêu:** ${item.goal}\n\n`;
      fullMarkdown += `### 1. User Prompt (Câu lệnh người dùng):\n\`\`\`text\n${item.fullPromptText}\n\`\`\`\n\n`;
      if (item.systemInstructionsPrompt) {
        fullMarkdown += `### 2. System Instructions (Chỉ dẫn hệ thống):\n\`\`\`text\n${item.systemInstructionsPrompt}\n\`\`\`\n\n`;
      }
      fullMarkdown += `### 3. Triển khai kỹ thuật trọng tâm:\n`;
      item.technicalImplementation.forEach((t) => {
        fullMarkdown += `- ${t}\n`;
      });
      fullMarkdown += `\n### 4. Thành phần bàn giao:\n`;
      item.keyOutputs.forEach((o) => {
        fullMarkdown += `- ${o}\n`;
      });
      fullMarkdown += `\n---\n\n`;
    });

    navigator.clipboard.writeText(fullMarkdown);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const getPhaseIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Layers className="w-4 h-4 text-cyan-400" />;
      case 2:
        return <Cpu className="w-4 h-4 text-emerald-400" />;
      case 3:
        return <Calculator className="w-4 h-4 text-cyan-300" />;
      case 4:
        return <Printer className="w-4 h-4 text-teal-400" />;
      case 5:
        return <Palette className="w-4 h-4 text-pink-400" />;
      case 6:
        return <Database className="w-4 h-4 text-purple-400" />;
      case 7:
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 8:
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 9:
        return <RotateCw className="w-4 h-4 text-cyan-400" />;
      default:
        return <Code2 className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-500/25 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-400 to-emerald-400 text-slate-950 rounded-2xl font-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Tổng Hợp Toàn Bộ Prompt & Kiến Trúc Ứng Dụng EDT
                </h2>
                <span className="px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black rounded-full uppercase tracking-wider">
                  Auto-Synced v3.0 ({totalPhases} Giai đoạn)
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Toàn bộ prompt gốc, trình tự {totalPhases} giai đoạn kỹ thuật & tính năng xuất file PDF/Word in ấn chuẩn A4.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export PDF Button */}
            <button
              onClick={() => exportPromptsToPdf(promptsList)}
              className="py-2 px-3.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
              title="Xuất ra file PDF hoặc In ngay (Chuẩn khổ A4 đầy đủ prompt)"
            >
              <Printer className="w-4 h-4 text-slate-950" />
              <span>Xuất File PDF (A4)</span>
            </button>

            {/* Export Word Button */}
            <button
              onClick={() => exportPromptsToWord(promptsList)}
              className="py-2 px-3.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Tải tài liệu Word .doc"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Xuất Word (.doc)</span>
            </button>

            {/* Copy All Button */}
            <button
              onClick={handleCopyAllPrompts}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Sao chép toàn bộ định dạng Markdown"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAll ? 'Đã chép toàn bộ!' : 'Copy All'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Phase Filter Tabs */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedPhase('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedPhase === 'all'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
            }`}
          >
            Tất cả {totalPhases} Giai Đoạn (Full)
          </button>
          {promptsList.map((p) => {
            const isSelected = selectedPhase === p.stepNumber;
            return (
              <button
                key={p.stepNumber}
                onClick={() => setSelectedPhase(p.stepNumber)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {getPhaseIcon(p.stepNumber)}
                <span>Giai đoạn {p.stepNumber}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Quick Notice Banner */}
          <div className="p-4 bg-cyan-950/40 border-2 border-cyan-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </span>
              <div>
                <p className="font-black text-white text-sm">
                  Lộ Trình Hệ Thống Tái Lập Ứng Dụng EDT Hoàn Chỉnh ({totalPhases} Giai Đoạn)
                </p>
                <p className="text-slate-200 mt-0.5">
                  Tự động đồng bộ các prompt mới từ Google AI Studio. Gửi từng câu lệnh User Prompt theo trình tự từ Giai đoạn 1 đến Giai đoạn {totalPhases} để tái lập 100% ứng dụng.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportPromptsToPdf(promptsList)}
                className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>In / Lưu PDF Ngay ({totalPhases} Bước)</span>
              </button>
            </div>
          </div>

          {/* Prompt Cards List */}
          <div className="space-y-6">
            {filteredPrompts.map((item, idx) => (
              <div
                key={item.stepNumber}
                className="bg-slate-900 border-2 border-cyan-500/30 rounded-3xl overflow-hidden shadow-lg transition-all hover:border-cyan-500/50"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 bg-slate-950/90 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-black text-xs">
                      #{item.stepNumber}
                    </span>
                    <div>
                      <h3 className="font-black text-white text-base">
                        Giai Đoạn {item.stepNumber}: {item.phaseTitle}
                      </h3>
                      <p className="text-xs text-cyan-300 font-mono font-medium">
                        {item.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopySinglePrompt(item.fullPromptText, idx)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIndex === idx ? 'Đã sao chép!' : 'Chép Prompt'}</span>
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-4 text-xs">
                  {/* Goal */}
                  <div>
                    <span className="font-black text-cyan-300 uppercase tracking-wider text-[11px] block mb-1">
                      🎯 Mục tiêu cốt lõi:
                    </span>
                    <p className="text-slate-100 font-medium leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                      {item.goal}
                    </p>
                  </div>

                  {/* Full User Prompt Box */}
                  <div>
                    <span className="font-black text-cyan-300 uppercase tracking-wider text-[11px] block mb-1">
                      💬 Câu lệnh Prompt người dùng (User Prompt đầy đủ):
                    </span>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-cyan-500/30 font-mono text-cyan-200 whitespace-pre-wrap leading-relaxed text-[11px] max-h-72 overflow-y-auto selection:bg-cyan-500 selection:text-black">
                      {item.fullPromptText}
                    </div>
                  </div>

                  {/* System Instruction if exists */}
                  {item.systemInstructionsPrompt && (
                    <div>
                      <span className="font-black text-emerald-300 uppercase tracking-wider text-[11px] block mb-1">
                        ⚙️ Chỉ dẫn hệ thống (System Prompt / Persona AI):
                      </span>
                      <div className="p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-500/40 text-emerald-200 font-medium leading-relaxed">
                        {item.systemInstructionsPrompt}
                      </div>
                    </div>
                  )}

                  {/* Technical Implementation */}
                  <div>
                    <span className="font-black text-slate-200 uppercase tracking-wider text-[11px] block mb-1.5">
                      🛠️ Triển khai kỹ thuật trọng tâm:
                    </span>
                    <ul className="space-y-1.5 pl-4 list-disc text-slate-300 font-medium">
                      {item.technicalImplementation.map((tech, tIdx) => (
                        <li key={tIdx} className="leading-relaxed">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deliverable Outputs */}
                  <div>
                    <span className="font-black text-slate-200 uppercase tracking-wider text-[11px] block mb-1.5">
                      📦 Thành phần & Sản phẩm bàn giao:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {item.keyOutputs.map((out, oIdx) => (
                        <span
                          key={oIdx}
                          className="px-2.5 py-1 bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 rounded-lg font-semibold text-[11px]"
                        >
                          ✓ {out}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-slate-400 font-medium">
            <span>Tổng số: </span>
            <strong className="text-cyan-400">{totalPhases} Giai Đoạn Hoàn Chỉnh</strong>
            <span> • Đầy đủ tất cả prompt người dùng và kỹ thuật tái lập EDT</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToDrive}
              disabled={isUploadingToDrive}
              className="py-2 px-3.5 bg-blue-950 hover:bg-blue-900 border border-blue-500/50 hover:border-blue-400 text-blue-200 hover:text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(59,130,246,0.3)]"
              title="Lưu sổ tay câu lệnh lên Google Drive cá nhân"
            >
              <Cloud className={`w-3.5 h-3.5 text-blue-400 ${isUploadingToDrive ? 'animate-spin' : ''}`} />
              <span>{isUploadingToDrive ? 'Đang tải lên Drive...' : 'Lưu Lên Google Drive'}</span>
            </button>

            <button
              onClick={() => exportPromptsToPdf(promptsList)}
              className="py-2 px-4 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black rounded-xl text-xs shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Xuất Toàn Bộ Ra PDF (In A4)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
