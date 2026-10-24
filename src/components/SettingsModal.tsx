import React, { useState, useEffect } from 'react';
import {
  Settings,
  Moon,
  Sun,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  getSavedModel,
  setSavedModel,
} from '../utils/apiHelper';
import { UserProfile } from '../types/xstk';
import { MASCOT_CATALOG, getMascotById } from '../data/mascotCatalog';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (updated: Partial<UserProfile>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  onToggleDarkMode,
  userProfile,
  onUpdateProfile,
}) => {
  const [bgMusicVol, setBgMusicVol] = useState(50);
  const [sfxVol, setSfxVol] = useState(80);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  // Server-side API Key Status (Render environment)
  const [hasServerKey, setHasServerKey] = useState<boolean | null>(null);
  const [keyCount, setKeyCount] = useState(0);

  // Connection Test Status
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedModel(getSavedModel());
      setTestStatus('idle');
      setTestMessage('');

      // Fetch server API key status
      fetch('/api/settings/get-api-key-status')
        .then((res) => res.json())
        .then((data) => {
          setHasServerKey(Boolean(data?.hasKey));
          setKeyCount(data?.keyCount || 0);
        })
        .catch(() => {
          setHasServerKey(false);
          setKeyCount(0);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Đang kiểm tra kết nối với Máy Chủ AI...');

    try {
      const response = await fetch('/api/tutor/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setTestStatus('success');
        setTestMessage(data.message || 'Kết nối Google Gemini AI thành công!');
      } else {
        setTestStatus('error');
        setTestMessage(data.error || 'Không thể kết nối AI.');
      }
    } catch {
      setTestStatus('error');
      setTestMessage('Không thể kết nối máy chủ. Vui lòng đảm bảo server đang chạy!');
    }
  };

  const handleSaveSettings = () => {
    setSavedModel(selectedModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 font-black text-white text-base">
            <span className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/40">
              <Settings className="w-5 h-5" />
            </span>
            <span>CÀI ĐẶT HỆ THỐNG &amp; TRÍ TUỆ NHÂN TẠO (AI)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini AI Server-Managed Hosting & Model Configuration */}
        <div className="bg-slate-950 border border-cyan-500/30 p-4 rounded-2xl space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-xs">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>MÁY CHỦ AI CHÍNH THỨC (SERVER-HOSTED GEMINI)</span>
            </div>
            {hasServerKey ? (
              <span className="text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{keyCount > 1 ? `Đã Sẵn Sàng (${keyCount} Key Pool)` : 'Đã Sẵn Sàng'}</span>
              </span>
            ) : hasServerKey === false ? (
              <span className="text-[10px] font-black bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>Chờ Render Config</span>
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400">Đang kiểm tra...</span>
            )}
          </div>

          {/* Publisher Notice Banner */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-white text-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>API Key do Nhà Phát Hành quản lý trên Render Cloud</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
              Hệ thống tích hợp khóa API Gemini của nhà phát triển trực tiếp trên máy chủ. Người học và giảng viên có thể sử dụng toàn bộ tính năng phân tích, giải toán Socratic và thi thử <strong>hoàn toàn miễn phí</strong> mà không cần tạo hay dán mã API Key cá nhân.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-1 text-xs pt-1">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mô Hình AI XSTK (Gemini Intelligence Engine):</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setTestStatus('idle');
              }}
              className="w-full p-2.5 rounded-xl border border-cyan-500/30 bg-slate-900 text-white text-xs font-semibold outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng: Siêu tốc &amp; Suy luận toán học chuẩn xác)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Siêu Trí Tuệ: Lập luận 4 bước George Pólya &amp; Giải bài khó)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Thế hệ mới 2.0 ổn định)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (Hạn mức cao)</option>
            </select>
          </div>

          {/* Test Connection Button & Status */}
          <div className="pt-1 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="w-full py-2.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {testStatus === 'testing' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang kiểm tra kết nối với Máy Chủ AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kiểm Tra Kết Nối AI ({selectedModel})</span>
                </>
              )}
            </button>

            {testStatus === 'success' && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="leading-tight">{testMessage}</span>
              </div>
            )}

            {testStatus === 'error' && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-300 font-medium flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="leading-tight">{testMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Audio & Volume Settings */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
          <h4 className="font-bold text-xs text-slate-300">Âm Lượng &amp; Hiệu Ứng Âm Thanh</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Nhạc nền học tập (Lofi / Pomodoro)</span>
              <span>{bgMusicVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={bgMusicVol}
              onChange={(e) => setBgMusicVol(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Hiệu ứng âm thanh chúc mừng (SFX)</span>
              <span>{sfxVol}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={sfxVol}
              onChange={(e) => setSfxVol(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
            />
          </div>
        </div>

        {/* Mascot Companion Selection */}
        {userProfile && onUpdateProfile && (
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐾</span>
                <div>
                  <h4 className="font-bold text-xs text-white">Linh Vật Đồng Hành (10 Loài)</h4>
                  <p className="text-[11px] text-slate-400">Chọn người bạn đồng hành cổ vũ bạn học tập</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
                {getMascotById(userProfile.equippedMascot?.species || 'penguin').name}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {MASCOT_CATALOG.map((m) => {
                const isSelected = (userProfile.equippedMascot?.species || 'penguin') === m.species;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      onUpdateProfile({
                        equippedMascot: {
                          ...userProfile.equippedMascot,
                          species: m.species,
                        },
                      });
                    }}
                    title={`${m.name} - ${m.role} (${m.personalityTag})`}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/30'
                        : 'bg-slate-900 border-slate-800 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-700/60 shadow-xs">
                      {m.imageUrl ? (
                        <img
                          src={m.imageUrl}
                          alt={m.name}
                          className="w-full h-full object-cover rounded-lg select-none"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      ) : (
                        <span className="text-xl">{m.emoji}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-white truncate max-w-full">{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Theme Settings */}
        <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-white">Chế độ giao diện</span>
            <p className="text-[11px] text-slate-400">Giao diện tối ưu độ tương phản phòng học</p>
          </div>
          <button
            onClick={onToggleDarkMode}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer border border-slate-700"
          >
            {isDarkMode ? <Moon className="w-4 h-4 text-cyan-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleSaveSettings}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
          >
            LƯU &amp; ÁP DỤNG CÀI ĐẶT
          </button>
        </div>
      </div>
    </div>
  );
};
