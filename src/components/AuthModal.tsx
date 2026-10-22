import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Shield,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Database,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { AppUser } from '../types/xstk';
import { googleSignIn } from '../services/googleDriveService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  onLoginSuccess: (user: AppUser) => void;
  onOpenDevDatabase?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onOpenDevDatabase,
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'dev_portal'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('ĐH Bách Khoa TP.HCM');

  // Secret Developer Portal PIN
  const [adminPin, setAdminPin] = useState('');
  const [showPin, setShowPin] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Quick Demo: Sinh Vien & Giang Vien ONLY (Developer removed completely for security)
  const handleQuickDemo = async (role: 'sinh_vien' | 'giang_vien') => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ demoUserRole: role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Đăng nhập không thành công');
      }
    } catch (err) {
      setErrorMsg('Không thể kết nối máy chủ EDT');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-in / Workspace integration
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const result = await googleSignIn();
      if (result?.user) {
        // Register or login via server
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: result.user.email,
            fullName: result.user.displayName || 'Học viên Google',
            avatarUrl: result.user.photoURL,
          }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          onLoginSuccess(data.user);
          onClose();
        }
      }
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setErrorMsg(err.message || 'Không thể đăng nhập bằng tài khoản Google');
    } finally {
      setIsLoading(false);
    }
  };

  // Developer Secret Portal Verification (Default PIN: EDT@Admin2026)
  const handleVerifyDevPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin.trim()) {
      setErrorMsg('Vui lòng nhập Mã PIN Quản Trị Bí Mật!');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/developer-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPin: adminPin.trim() }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setSuccessMsg('Xác thực Mã PIN Thành Công! Đang mở khóa Kho Dữ Liệu...');
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
          if (onOpenDevDatabase) onOpenDevDatabase();
        }, 600);
      } else {
        setErrorMsg(data.error || 'Mã PIN Quản Trị không hợp lệ! Quyền bị từ chối.');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối khi xác thực quyền Nhà Phát Triển');
    } finally {
      setIsLoading(false);
    }
  };

  // Regular Login or Registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email!');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const endpoint = tab === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: tab === 'register' ? fullName : undefined,
          university: tab === 'register' ? university : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Có lỗi xảy ra khi xác thực');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối mạng, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl max-w-md w-full p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] relative overflow-hidden text-slate-100">
        {/* Glow corner accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/70 border border-cyan-500/40 rounded-full text-[11px] font-black text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HỆ THỐNG CƠ SỞ DỮ LIỆU BỀN VỮNG EDT</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {tab === 'login'
              ? 'Đăng Nhập Tài Khoản EDT'
              : tab === 'register'
              ? 'Đăng Ký Tài Khoản Học Tập'
              : 'Cổng Quản Trị Bí Mật (Developer Portal)'}
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            {tab === 'dev_portal'
              ? 'Dành riêng cho Nhà Phát Triển. Yêu cầu nhập Mã PIN để mở khóa Kho Dữ Liệu.'
              : 'Dữ liệu được lưu trữ bền vững vào users_database.json trên máy chủ.'}
          </p>
        </div>

        {/* Public Quick Demo: Sinh Vien & Giang Vien ONLY (Developer removed completely) */}
        {tab !== 'dev_portal' && (
          <div className="space-y-2 mb-4 p-3 bg-slate-950/80 rounded-2xl border border-cyan-500/30">
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
              <span>⚡ Đăng nhập nhanh (1-Click Demo):</span>
              <span className="text-[10px] text-slate-400">Sinh viên & Giảng viên</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('sinh_vien')}
                disabled={isLoading}
                className="p-2.5 bg-slate-800 hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-400 rounded-xl text-center group transition-all cursor-pointer"
              >
                <div className="text-base mb-1">🎓</div>
                <div className="text-[11px] font-bold text-white group-hover:text-cyan-300">Sinh Viên</div>
                <div className="text-[9px] text-slate-400 font-medium">Nguyễn Văn An</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('giang_vien')}
                disabled={isLoading}
                className="p-2.5 bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-400 rounded-xl text-center group transition-all cursor-pointer"
              >
                <div className="text-base mb-1">👨‍🏫</div>
                <div className="text-[11px] font-bold text-white group-hover:text-emerald-300">Giảng Viên</div>
                <div className="text-[9px] text-slate-400 font-medium">TS. Minh Đức</div>
              </button>
            </div>
          </div>
        )}

        {/* Google Workspace Sign-In Button */}
        {tab !== 'dev_portal' && (
          <div className="mb-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Đăng nhập với Google (Google Drive Sync)</span>
            </button>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tạo Tài Khoản Mới
          </button>
        </div>

        {/* Regular Login or Register Form */}
        {tab !== 'dev_portal' ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === 'register' && (
              <div>
                <label className="text-[11px] font-bold text-cyan-300 block mb-1">Họ và tên của bạn:</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: Lê Hoàng Long"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-cyan-300 block mb-1">Địa chỉ Email:</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@student.edu.vn"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-cyan-300 block mb-1">Mật khẩu:</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                />
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="text-[11px] font-bold text-cyan-300 block mb-1">Trường đại học:</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="Đại học Quốc Gia / Bách Khoa / Kinh Tế"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
                  />
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-2.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Đang lưu vào CSDL...' : tab === 'login' ? 'XÁC NHẬN ĐĂNG NHẬP' : 'LƯU TÀI KHOẢN VÀO CSDL'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          /* Secret Developer Portal Form (PIN Verification) */
          <form onSubmit={handleVerifyDevPin} className="space-y-4">
            <div className="p-3.5 bg-purple-950/60 rounded-2xl border border-purple-500/40 text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-purple-300">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>BẢO MẬT NHÀ PHÁT HÀNH (DEVELOPER PORTAL)</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Khu vực xác thực bảo mật dành riêng cho Nhà Phát Hành. Vui lòng nhập mã bảo mật để tiếp tục truy cập Kho Dữ Liệu.
              </p>
            </div>

            <div>
              <label className="text-[11px] font-black text-purple-300 block mb-1">
                <span>Mã bảo mật Nhà Phát Hành:</span>
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-purple-400 absolute left-3 top-3" />
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="Nhập mã bảo mật..."
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950 border-2 border-purple-500/50 rounded-xl text-white text-xs font-mono font-bold focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/60 rounded-xl text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg('');
                }}
                className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
              >
                <Shield className="w-4 h-4" />
                <span>{isLoading ? 'Đang kiểm tra...' : 'XÁC THỰC'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Secret Developer Portal Link Trigger (Discreet Security Entry) */}
        {tab !== 'dev_portal' && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Bạn là Quản trị viên hệ thống?</span>
            <button
              type="button"
              onClick={() => {
                setTab('dev_portal');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Cổng Nhà Phát Hành (Developer Portal) 🔒</span>
            </button>
          </div>
        )}

        {/* Developer shortcut only when authenticated */}
        {currentUser?.role === 'nha_phat_trien' && onOpenDevDatabase && (
          <div className="mt-3 pt-2 text-center">
            <button
              onClick={() => {
                onClose();
                onOpenDevDatabase();
              }}
              className="text-xs font-extrabold text-purple-300 hover:text-purple-200 flex items-center justify-center gap-1.5 mx-auto bg-purple-950/70 border border-purple-500/40 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <Database className="w-4 h-4 text-purple-400" />
              <span>Mở Kho Dữ Liệu Nhà Phát Triển (Đã Xác Thực)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
