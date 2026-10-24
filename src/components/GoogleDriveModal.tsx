import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  ExternalLink,
  Upload,
  RefreshCw,
  Folder,
  FileText,
  AlertCircle,
  HardDrive,
  LogOut,
  Trash2,
  Search,
  FolderPlus,
  FileUp,
  ShieldAlert,
} from 'lucide-react';
import {
  auth,
  googleSignIn,
  googleLogout,
  getAccessToken,
  uploadToGoogleDrive,
  listDriveStudyFiles,
  deleteDriveFile,
  createDriveFolder,
  getDriveStorageQuota,
  DriveFileItem,
  DriveStorageQuota,
} from '../services/googleDriveService';
import { User } from 'firebase/auth';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({ isOpen, onClose }) => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [hasToken, setHasToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [quota, setQuota] = useState<DriveStorageQuota | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string; link?: string } | null>(null);

  // Destructive Action Confirmation State (Mandatory Requirement)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick custom upload state
  const [isCustomUploadOpen, setIsCustomUploadOpen] = useState(false);
  const [customFileName, setCustomFileName] = useState('');
  const [customFileContent, setCustomFileContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      checkAuthAndFetchFiles();
    }
  }, [isOpen]);

  const checkAuthAndFetchFiles = async () => {
    const token = await getAccessToken();
    const currentUser = auth.currentUser;
    setUser(currentUser);
    setHasToken(!!token);

    if (token) {
      await loadFiles();
      loadQuota();
    }
  };

  const loadQuota = async () => {
    const q = await getDriveStorageQuota();
    if (q) setQuota(q);
  };

  const loadFiles = async (query = searchQuery) => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const files = await listDriveStudyFiles(query);
      setDriveFiles(files);
    } catch (err: any) {
      console.warn('Load files error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setHasToken(true);
        setStatusMsg({ type: 'success', text: 'Đã kết nối thành công với Google Drive!' });
        await loadFiles();
        loadQuota();
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Không thể kết nối với tài khoản Google' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await googleLogout();
    setUser(null);
    setHasToken(false);
    setDriveFiles([]);
    setQuota(null);
    setStatusMsg({ type: 'success', text: 'Đã ngắt kết nối Google Drive an toàn.' });
  };

  const handleCreateDedicatedFolder = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const folder = await createDriveFolder('AI Classroom Study App - Tài Liệu & Đề Thi');
      setStatusMsg({
        type: 'success',
        text: `Đã tạo thư mục "${folder.name}" trên Google Drive của bạn!`,
      });
      await loadFiles();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi khi tạo thư mục trên Drive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupPromptsToDrive = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const ledgerRes = await fetch('/api/prompts/history');
      const ledgerData = await ledgerRes.json();
      const content = JSON.stringify(ledgerData.prompts || [], null, 2);
      const filename = `AI_Classroom_Prompt_Ledger_${new Date().toISOString().substring(0, 10)}.json`;

      const uploadRes = await uploadToGoogleDrive(filename, content, 'application/json');
      setStatusMsg({
        type: 'success',
        text: `Đã sao lưu "${filename}" thành công lên Google Drive!`,
        link: uploadRes.webViewLink,
      });
      await loadFiles();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi khi sao lưu lên Google Drive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupProgressToDrive = async () => {
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const userRes = await fetch('/api/dev/users');
      const userData = await userRes.json();
      const content = JSON.stringify(userData, null, 2);
      const filename = `AI_Classroom_Study_Database_Backup_${new Date().toISOString().substring(0, 10)}.json`;

      const uploadRes = await uploadToGoogleDrive(filename, content, 'application/json');
      setStatusMsg({
        type: 'success',
        text: `Đã lưu trữ "${filename}" thành công lên Google Drive!`,
        link: uploadRes.webViewLink,
      });
      await loadFiles();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi khi lưu trữ lên Google Drive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFileName.trim() || !customFileContent.trim()) return;

    setIsLoading(true);
    setStatusMsg(null);
    try {
      const finalName = customFileName.includes('.') ? customFileName : `${customFileName}.txt`;
      const uploadRes = await uploadToGoogleDrive(finalName, customFileContent, 'text/plain');
      setStatusMsg({
        type: 'success',
        text: `Đã tải lên tệp "${finalName}" thành công vào Google Drive!`,
        link: uploadRes.webViewLink,
      });
      setCustomFileName('');
      setCustomFileContent('');
      setIsCustomUploadOpen(false);
      await loadFiles();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Lỗi khi tải tệp lên Drive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Explicit confirmation before deleting a file (MANDATORY per Workspace skill guidelines)
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setStatusMsg({
        type: 'success',
        text: `Đã xóa tệp "${fileToDelete.name}" khỏi Google Drive.`,
      });
      setFileToDelete(null);
      await loadFiles();
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Lỗi khi xóa tệp khỏi Google Drive.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '';
    const b = parseInt(bytes, 10);
    if (isNaN(b)) return '';
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatQuota = (usageBytes?: string, limitBytes?: string) => {
    if (!usageBytes || !limitBytes) return null;
    const usage = parseInt(usageBytes, 10) / (1024 * 1024 * 1024);
    const limit = parseInt(limitBytes, 10) / (1024 * 1024 * 1024);
    const pct = Math.min(100, Math.round((usage / limit) * 100));
    return {
      usageText: `${usage.toFixed(2)} GB`,
      limitText: `${limit.toFixed(0)} GB`,
      percent: pct,
    };
  };

  if (!isOpen) return null;

  const quotaInfo = quota ? formatQuota(quota.usage, quota.limit) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.35)] relative overflow-hidden text-slate-100 max-h-[92vh] flex flex-col">
        {/* Glow corner accents */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded-full text-[11px] font-black text-cyan-300">
            <Cloud className="w-3.5 h-3.5" />
            <span>GOOGLE WORKSPACE DRIVE INTEGRATION</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Đồng Bộ & Lưu Trữ Google Drive</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Lưu đề thi, bài tập và lịch sử tổng hợp prompt trực tiếp vào Google Drive cá nhân của bạn.
          </p>
        </div>

        {/* Connection Box */}
        <div className="p-4 bg-slate-950/85 rounded-2xl border border-cyan-500/30 mb-4 space-y-3">
          {hasToken && user ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {user.photoURL && user.photoURL.startsWith('http') ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-10 h-10 rounded-full border-2 border-cyan-400 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{user.displayName || 'Tài khoản Google'}</span>
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/40 font-bold">
                        Đã kết nối
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Ngắt kết nối</span>
                </button>
              </div>

              {/* Storage Quota Bar */}
              {quotaInfo && (
                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-300 font-semibold">
                    <span className="flex items-center gap-1">
                      <HardDrive className="w-3 h-3 text-cyan-400" />
                      <span>Dung lượng Drive đã dùng:</span>
                    </span>
                    <span className="text-cyan-300 font-bold">
                      {quotaInfo.usageText} / {quotaInfo.limitText} ({quotaInfo.percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${quotaInfo.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-3 space-y-3">
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Kết nối với Google Drive để đồng bộ đề thi trắc nghiệm, bài tập tự luận và sổ prompt nghiên cứu của bạn an toàn trên đám mây.
              </p>
              {/* Official Google Sign-in Styled Button */}
              <button
                type="button"
                onClick={handleConnect}
                disabled={isLoading}
                className="inline-flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-xl text-xs shadow-[0_4px_15px_rgba(255,255,255,0.2)] transition-all cursor-pointer border border-slate-300 hover:scale-[1.02]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoading ? 'Đang mở cửa sổ đăng nhập...' : 'Sign in with Google (Kết nối Drive)'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <div
            className={`p-3 rounded-xl text-xs font-bold mb-3 flex items-center justify-between gap-2 shrink-0 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
            {statusMsg.link && (
              <a
                href={statusMsg.link}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-cyan-300 hover:text-white flex items-center gap-1 shrink-0"
              >
                <span>Xem trên Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {hasToken && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 shrink-0">
            <button
              onClick={handleBackupPromptsToDrive}
              disabled={isLoading}
              className="p-2.5 bg-slate-950 hover:bg-cyan-950/70 border border-cyan-500/40 hover:border-cyan-400 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-cyan-300 font-black text-xs mb-0.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Sao Lưu Prompts</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Toàn bộ prompt hệ thống
              </p>
            </button>

            <button
              onClick={handleBackupProgressToDrive}
              disabled={isLoading}
              className="p-2.5 bg-slate-950 hover:bg-emerald-950/70 border border-emerald-500/40 hover:border-emerald-400 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-emerald-300 font-black text-xs mb-0.5">
                <HardDrive className="w-3.5 h-3.5" />
                <span>Sao Lưu DB</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                users_database.json
              </p>
            </button>

            <button
              onClick={handleCreateDedicatedFolder}
              disabled={isLoading}
              className="p-2.5 bg-slate-950 hover:bg-purple-950/70 border border-purple-500/40 hover:border-purple-400 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-purple-300 font-black text-xs mb-0.5">
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Tạo Thư Mục</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Tạo folder AI Classroom trên Drive
              </p>
            </button>

            <button
              onClick={() => setIsCustomUploadOpen(!isCustomUploadOpen)}
              className="p-2.5 bg-slate-950 hover:bg-amber-950/70 border border-amber-500/40 hover:border-amber-400 rounded-xl text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs mb-0.5">
                <FileUp className="w-3.5 h-3.5" />
                <span>Tải Tệp Lên</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                Soạn ghi chú hoặc tệp mới
              </p>
            </button>
          </div>
        )}

        {/* Custom Upload Form (expandable) */}
        {isCustomUploadOpen && hasToken && (
          <form onSubmit={handleCustomUploadSubmit} className="p-3 bg-slate-950 rounded-2xl border border-amber-500/40 mb-3 space-y-2 shrink-0 animate-fade-in">
            <div className="text-xs font-bold text-amber-300 flex items-center justify-between">
              <span>Tải tài liệu tùy chỉnh lên Google Drive:</span>
              <button
                type="button"
                onClick={() => setIsCustomUploadOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Tên tệp (vd: Ghi_chu_XSTK_Chuong1.txt)"
              value={customFileName}
              onChange={(e) => setCustomFileName(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              required
            />
            <textarea
              placeholder="Nội dung ghi chú hoặc bài tập cần lưu lên Google Drive..."
              value={customFileContent}
              onChange={(e) => setCustomFileContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none"
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all cursor-pointer"
            >
              {isLoading ? 'Đang tải lên...' : 'Lưu Vào Google Drive'}
            </button>
          </form>
        )}

        {/* Drive Files List Header & Search */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Folder className="w-4 h-4 text-cyan-400" />
            <span>Tệp trên Google Drive:</span>
          </div>

          {hasToken && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm tệp..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    loadFiles(e.target.value);
                  }}
                  className="pl-7 pr-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 w-36 sm:w-44"
                />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
              </div>

              <button
                onClick={() => loadFiles()}
                disabled={isLoading}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-cyan-400 hover:text-white transition-colors cursor-pointer"
                title="Làm mới danh sách tệp"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Drive Files List Body */}
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[140px]">
          {!hasToken ? (
            <div className="text-center py-8 text-xs text-slate-400">
              Chưa kết nối Google Drive. Vui lòng bấm nút "Sign in with Google" phía trên để quản lý tệp của bạn.
            </div>
          ) : driveFiles.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 space-y-1">
              <div>Không tìm thấy tệp phù hợp trên Google Drive.</div>
              <div className="text-[11px] text-slate-500">
                Hãy bấm các nút sao lưu ở trên để đưa tài liệu lên Drive!
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {driveFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between text-xs transition-colors group"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="truncate">
                      <div className="font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                        {file.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span>
                          {file.modifiedTime
                            ? new Date(file.modifiedTime).toLocaleDateString('vi-VN')
                            : file.createdTime
                            ? new Date(file.createdTime).toLocaleDateString('vi-VN')
                            : 'Gần đây'}
                        </span>
                        {file.size && <span>• {formatFileSize(file.size)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 rounded-lg text-cyan-300 text-[11px] font-bold flex items-center gap-1"
                        title="Mở trong Google Drive"
                      >
                        <span>Mở</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    {/* Delete button triggering confirmation modal */}
                    <button
                      onClick={() => setFileToDelete(file)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa tệp khỏi Google Drive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explicit Confirmation Dialog for Delete (MANDATORY per Workspace Skill) */}
        {fileToDelete && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-slate-900 border-2 border-rose-500/60 rounded-2xl p-5 max-w-md w-full shadow-[0_0_30px_rgba(244,63,94,0.4)] text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">Xác Nhận Xóa Tệp Trên Google Drive</h3>
                <p className="text-xs text-slate-300">
                  Bạn có chắc chắn muốn xóa tệp <strong className="text-rose-300 font-bold">"{fileToDelete.name}"</strong> khỏi Google Drive không?
                </p>
                <p className="text-[11px] text-slate-400">
                  Thao tác này sẽ xóa tệp vĩnh viễn trên đám mây của bạn và không thể hoàn tác.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFileToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeleting ? 'Đang xóa...' : 'Xác Nhận Xóa'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
