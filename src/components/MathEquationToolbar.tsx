import React, { useState } from 'react';
import { WordEquationRibbon, WORD_11_STRUCTURES, WORD_SYMBOLS_GALLERY, QUICK_XSTK_BAR, SYMBOL_CATEGORIES } from './WordEquationRibbon';
import { renderKatexSafe } from './MathFormula';
import { Sigma, ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react';

export interface MathEquationToolbarProps {
  onInsert: (formulaLatex: string) => void;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export const MathEquationToolbar: React.FC<MathEquationToolbarProps> = ({
  onInsert,
  collapsible = true,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeTab, setActiveTab] = useState<'ribbon' | 'structures' | 'symbols'>('ribbon');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStructureId, setSelectedStructureId] = useState<string>('fraction');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSymbols = WORD_SYMBOLS_GALLERY.filter((s) => {
    const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.latex.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-2xl overflow-visible shadow-[0_0_20px_rgba(6,182,212,0.15)] select-none">
      {/* Header bar */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/40">
            <Sigma className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>BẢNG EQUATION MICROSOFT WORD (WYSIWYG)</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 font-mono">
                11 Cấu Trúc + Ký Hiệu
              </span>
            </h4>
          </div>
        </div>

        {collapsible && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="py-1 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>{isExpanded ? 'Thu Gọn' : 'Mở Bảng'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('ribbon')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ribbon'
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              Trình Soạn Thảo Đầy Đủ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('structures')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'structures'
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              11 Cấu Trúc Word
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('symbols')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'symbols'
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              Kho Ký Hiệu Toán Học
            </button>
          </div>

          {activeTab === 'ribbon' && (
            <WordEquationRibbon
              placeholder="Gõ lời giải tại đây... Nhấn π Equation để chèn công thức vào ô vuông."
              submitButtonText="GỬI CÔNG THỨC"
              showSendButton={false}
              onSendToAI={(fullText) => onInsert(fullText)}
            />
          )}

          {activeTab === 'structures' && (
            <div className="space-y-3">
              {/* Structure Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {WORD_11_STRUCTURES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStructureId(s.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      selectedStructureId === s.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-400'
                    }`}
                  >
                    <span>{s.iconName}</span> <span className="ml-1">{s.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Items for selected structure */}
              {(() => {
                const cur = WORD_11_STRUCTURES.find((s) => s.id === selectedStructureId);
                if (!cur) return null;
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {cur.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onInsert(item.latex)}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-400 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer shadow-sm group"
                      >
                        <span
                          className="text-base font-mono text-cyan-200 group-hover:scale-105 transition-transform"
                          dangerouslySetInnerHTML={{ __html: renderKatexSafe(item.preview) }}
                        />
                        <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 truncate max-w-full font-medium">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === 'symbols' && (
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm ký hiệu (vd: alpha, sigma, muy, chi, kỳ vọng, phương sai, p-value...)"
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 outline-none focus:border-cyan-400 font-medium"
                />
              </div>

              {/* Category selector pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {SYMBOL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all border ${
                      selectedCategory === cat.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-sm'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-500/40'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-12 gap-1.5 max-h-48 overflow-y-auto pr-1">
                {filteredSymbols.map((sym, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onInsert(sym.latex)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-cyan-500/20 text-slate-100 hover:text-cyan-300 text-sm font-serif font-bold border border-slate-800 text-center transition-all cursor-pointer group"
                    title={`${sym.name} (${sym.latex})`}
                  >
                    <span className="group-hover:scale-115 transition-transform">{sym.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
