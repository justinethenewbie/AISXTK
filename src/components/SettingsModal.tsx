import React, { useState, useEffect } from 'react';
import {
  Settings,
  Moon,
  Sun,
  X,
  Check,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import {
  getSavedModel,
  setSavedModel,
} from '../utils/apiHelper';
import { UserProfile, MascotSpecies } from '../types/xstk';
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

  // Dual API Key State
  const [apiKey, setApiKey] = useState('');
  const [apiKey2, setApiKey2] = useState('');
  const [isApiKeySaved, setIsApiKeySaved] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [maskedKey2, setMaskedKey2] = useState('');
  const [keyCount, setKeyCount] = useState(0);

  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiKey2, setShowApiKey2] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keySaveMessage, setKeySaveMessage] = useState('');

  // Connection Test Status
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedModel(getSavedModel());
      setTestStatus('idle');
      setTestMessage('');
      setKeySaveMessage('');

      // Fetch current API key status from server
      fetch('/api/settings/get-api-key-status')
        .then((res) => res.json())
        .then((data) => {
          if (data?.hasKey) {
            setIsApiKeySaved(true);
            setMaskedKey(data.maskedKey || '');
            setMaskedKey2(data.maskedKey2 || '');
            setKeyCount(data.keyCount || (data.maskedKey2 ? 2 : 1));
          } else {
            setIsApiKeySaved(false);
            setKeyCount(0);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveApiKey = async () => {
    if (!apiKey.trim() && !apiKey2.trim() && !maskedKey) return;
    setIsSavingKey(true);
    setKeySaveMessage('');

    try {
      const res = await fetch('/api/settings/save-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim() || maskedKey,
          apiKey2: apiKey2.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsApiKeySaved(true);
        setKeySaveMessage(data.message || '✅ Đã lưu Cặp API Key vào máy chủ!');
        if (apiKey.trim()) {
          setMaskedKey(`${apiKey.trim().slice(0, 6)}...${apiKey.trim().slice(-4)}`);
        }
        if (apiKey2.trim()) {
          setMaskedKey2(`${apiKey2.trim().slice(0, 6)}...${apiKey2.trim().slice(-4)}`);
        }
        setKeyCount(data.keyCount || (apiKey2.trim() ? 2 : 1));
        setApiKey('');
        setApiKey2('');
        // Automatically test connection
        handleTestConnection();
      } else {
        setKeySaveMessage(`❌ ${data.error || 'Lỗi khi lưu API Key'}`);
      }
    } catch {
      setKeySaveMessage('❌ Không thể gửi API Key tới server.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Đang kiểm tra kết nối với toàn bộ Pool API Key...');

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
    } catch (err: any) {
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
            <span>CÀI ĐẶT HỆ THỐNG & TRÍ TUỆ NHÂN TẠO (AI)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gemini AI Dual-Key Pool & Model Configuration */}
        <div className="bg-slate-950 border border-cyan-500/30 p-4 rounded-2xl space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-extrabold text-xs">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>HỒ CHỨA API KEY KÉP (DUAL KEY POOL - CHỐNG HẾT QUOTA)</span>
            </div>
            {keyCount > 1 && (
              <span className="text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full animate-pulse">
                ⚡ Đang dùng 2 Key (x2 Quota)
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
            Hệ thống hỗ trợ <strong>cài đặt cùng lúc 2 API Key</strong>. AI sẽ tự động phân phối tải và chuyển đổi dự phòng (Automatic Failover) ngay khi một key đạt giới hạn 429 Quota, giúp gia sư AI học tập và suy luận mượt mà 24/7!
          </p>

          {/* Key 1 Configuration */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-cyan-500/20 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Gemini API Key #1 (Chính):</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 hover:underline"
              >
                <span>Lấy Key từ Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {maskedKey && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <Check className="w-3 h-3" />
                <span>Key 1 đang lưu: <code>{maskedKey}</code></span>
              </div>
            )}

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={maskedKey ? 'Dán mã mới nếu muốn đổi Key 1 (AIzaSy...)' : 'Dán mã API Key 1 (AIzaSy...)'}
                className="w-full p-2 pr-8 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs font-mono outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showApiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Key 2 Configuration (Dual Key) */}
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900 border border-cyan-500/20 text-xs">
            <div className="flex items-center justify-between">
              <label className="text-slate-200 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Gemini API Key #2 (Dự phòng kép / Tăng hạn mức):</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Tùy chọn bổ sung</span>
            </div>

            {maskedKey2 && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <Check className="w-3 h-3" />
                <span>Key 2 đang lưu: <code>{maskedKey2}</code></span>
              </div>
            )}

            <div className="relative">
              <input
                type={showApiKey2 ? 'text' : 'password'}
                value={apiKey2}
                onChange={(e) => setApiKey2(e.target.value)}
                placeholder={maskedKey2 ? 'Dán mã mới nếu muốn đổi Key 2 (AIzaSy...)' : 'Dán mã API Key 2 dự phòng (AIzaSy...)'}
                className="w-full p-2 pr-8 rounded-lg border border-slate-700 bg-slate-950 text-white text-xs font-mono outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowApiKey2(!showApiKey2)}
                className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showApiKey2 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              💡 Lưu ý: Cả 2 Key phải được tạo từ Google AI Studio (bắt đầu bằng <code>AIzaSy...</code>).
            </p>
          </div>

          {/* Save Key Button */}
          <button
            type="button"
            onClick={handleSaveApiKey}
            disabled={(!apiKey.trim() && !apiKey2.trim()) || isSavingKey}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {isSavingKey ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang lưu API Key vào hệ thống...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                <span>LƯU CẢ 2 API KEY (KÍCH HOẠT DUAL POOL)</span>
              </>
            )}
          </button>

          {keySaveMessage && (
            <p className="text-xs text-cyan-300 font-bold text-center">{keySaveMessage}</p>
          )}

          {/* Model Selection */}
          <div className="space-y-1 text-xs pt-1">
            <label className="block text-slate-300 font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Mô Hình AI XSTK (Gemini Intelligence Model):</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                setTestStatus('idle');
              }}
              className="w-full p-2.5 rounded-xl border border-cyan-500/30 bg-slate-900 text-white text-xs font-semibold outline-none focus:border-cyan-400"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng: Siêu tốc &amp; Suy luận toán học chuẩn xác)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Siêu Trí Tuệ: Lập luận 4 bước George Pólya &amp; Giải bài toán khó)</option>
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
              className="w-full py-2 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {testStatus === 'testing' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang kiểm tra kết nối toàn bộ API Key...</span>
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
                {getMascotById(userProfile.equippedMascot?.species || 'owl').name}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {MASCOT_CATALOG.map((m) => {
                const isSelected = (userProfile.equippedMascot?.species || 'owl') === m.species;
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
                    <span className="text-2xl">{m.emoji}</span>
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