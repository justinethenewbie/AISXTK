import React, { useState, useEffect } from 'react';
import {
  Database,
  X,
  Search,
  UserPlus,
  Download,
  Trash2,
  Edit2,
  RefreshCw,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Activity,
  Award,
} from 'lucide-react';
import { AppUser, DevDatabaseStats } from '../types/xstk';
import { getLocalDateString } from '../utils/streakManager';

interface DeveloperDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
}

export const DeveloperDatabaseModal: React.FC<DeveloperDatabaseModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState<DevDatabaseStats>({
    totalUsers: 0,
    activeToday: 0,
    totalExercisesSolved: 0,
    averageGpa: 0,
    storageUsageMb: 14.8,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<'all' | 'sinh_vien' | 'giang_vien' | 'nha_phat_trien'>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState<AppUser | null>(null);

  // Form state for adding user
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'sinh_vien' | 'giang_vien' | 'nha_phat_trien'>('sinh_vien');
  const [newUniversity, setNewUniversity] = useState('ĐH Bách Khoa TP.HCM');
  const [newGpa, setNewGpa] = useState('3.8');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/dev/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Lỗi tải kho dữ liệu developer:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newEmail) return;

    try {
      const res = await fetch('/api/dev/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newFullName,
          email: newEmail,
          role: newRole,
          university: newUniversity,
          gpa: parseFloat(newGpa) || 3.5,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddUserModal(false);
        setNewFullName('');
        setNewEmail('');
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${name}" khỏi kho dữ liệu?`)) return;

    try {
      const res = await fetch(`/api/dev/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export full DB to JSON
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `AI_Classroom_User_Database_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'HoVaTen', 'Email', 'VaiTro', 'TruongDaiHoc', 'MSSV', 'GPA', 'CapDo', 'XP', 'SoBaiTapGiai', 'TiLeDung', 'NgayTao'];
    const rows = users.map((u) => [
      u.id,
      `"${u.fullName}"`,
      u.email,
      u.role,
      `"${u.university}"`,
      u.studentId,
      u.gpa,
      u.level,
      u.exp,
      u.exercisesSolved,
      `${u.accuracyRate}%`,
      `"${u.createdAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AI_Classroom_User_Database_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.studentId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl w-full max-w-6xl h-[92vh] flex flex-col shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-cyan-500/25 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-cyan-500 text-slate-950 rounded-2xl font-black shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  Kho Dữ Liệu Người Dùng (Dành Riêng Nhà Phát Triển)
                </h2>
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black rounded-full uppercase tracking-wider">
                  Dev Database Vault
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Hệ thống quản trị CSDL người dùng AI Classroom • Theo dõi tiến độ học tập, bài giải và quyền truy cập.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Làm mới CSDL"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Database Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-5 border-b border-slate-800 bg-slate-950/40 shrink-0">
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">Tổng Người Dùng</span>
            <div className="text-2xl font-black text-white mt-1">{stats.totalUsers}</div>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Đã xác thực
            </span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">Online Hôm Nay</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{stats.activeToday}</div>
            <span className="text-[10px] text-slate-300 font-medium mt-0.5 block">Đang hoạt động</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block">Bài Tập Đã Giải</span>
            <div className="text-2xl font-black text-purple-400 mt-1">{stats.totalExercisesSolved}</div>
            <span className="text-[10px] text-slate-300 font-medium mt-0.5 block">MCQ & Tự luận</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">GPA Trung Bình</span>
            <div className="text-2xl font-black text-amber-300 mt-1">{stats.averageGpa.toFixed(2)}</div>
            <span className="text-[10px] text-slate-300 font-medium mt-0.5 block">Thang điểm 4.0</span>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-700 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Dung Lượng CSDL</span>
            <div className="text-2xl font-black text-cyan-300 mt-1">{stats.storageUsageMb} MB</div>
            <span className="text-[10px] text-emerald-400 font-semibold mt-0.5 block">Ổn định 99.9%</span>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative min-w-[260px] flex-1 max-w-md">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, email, trường hoặc MSSV..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-medium placeholder-slate-400 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setSelectedRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRoleFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Tất cả ({users.length})
              </button>
              <button
                onClick={() => setSelectedRoleFilter('sinh_vien')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRoleFilter === 'sinh_vien'
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sinh viên
              </button>
              <button
                onClick={() => setSelectedRoleFilter('giang_vien')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRoleFilter === 'giang_vien'
                    ? 'bg-emerald-500 text-slate-950 font-black shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Giảng viên
              </button>
              <button
                onClick={() => setSelectedRoleFilter('nha_phat_trien')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRoleFilter === 'nha_phat_trien'
                    ? 'bg-purple-500 text-white font-black shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Developer
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Tài Khoản</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Xuất file CSV báo cáo người dùng"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Xuất CSV</span>
            </button>

            <button
              onClick={handleExportJson}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Xuất file JSON sao lưu CSDL"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Backup JSON</span>
            </button>
          </div>
        </div>

        {/* Main Users Table */}
        <div className="flex-1 overflow-auto p-4">
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/70">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-cyan-300 font-extrabold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Người Dùng</th>
                  <th className="py-3 px-4">Email & MSSV</th>
                  <th className="py-3 px-4">Trường & Lớp</th>
                  <th className="py-3 px-4">Vai Trò</th>
                  <th className="py-3 px-4">GPA / Cấp độ</th>
                  <th className="py-3 px-4">Bài Tập Đã Giải</th>
                  <th className="py-3 px-4">Hoạt Động</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                      Không tìm thấy người dùng phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u.avatarUrl && (u.avatarUrl.startsWith('http') || u.avatarUrl.startsWith('data:')) ? (
                            <img
                              src={u.avatarUrl}
                              alt={u.fullName}
                              className="w-9 h-9 rounded-full object-cover border-2 border-cyan-400/50 shadow-xs"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-cyan-950 border-2 border-cyan-400/50 flex items-center justify-center text-base">
                              {u.avatarUrl || '👨‍🎓'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-white text-sm">{u.fullName}</div>
                            <div className="text-[10px] text-cyan-400 font-mono">{u.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Student ID */}
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-medium">{u.email}</div>
                        <div className="text-[10px] text-slate-400 font-mono">MSSV: {u.studentId}</div>
                      </td>

                      {/* School & Class */}
                      <td className="py-3 px-4">
                        <div className="text-white font-semibold">{u.university}</div>
                        <div className="text-[10px] text-slate-400">{u.classGroup}</div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide inline-flex items-center gap-1 ${
                            u.role === 'nha_phat_trien'
                              ? 'bg-purple-950 text-purple-300 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                              : u.role === 'giang_vien'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {u.role === 'nha_phat_trien' ? '💻 Developer' : u.role === 'giang_vien' ? '👨‍🏫 Giảng Viên' : '🎓 Sinh Viên'}
                        </span>
                      </td>

                      {/* GPA & Level */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-black font-mono">
                            GPA {u.gpa}
                          </span>
                          <span className="text-[10px] text-cyan-300 font-bold">
                            Lv.{u.level} ({u.exp} XP)
                          </span>
                        </div>
                      </td>

                      {/* Exercises Solved */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{u.exercisesSolved} bài</div>
                        <div className="text-[10px] text-emerald-400 font-semibold">Đúng {u.accuracyRate}%</div>
                      </td>

                      {/* Last Active */}
                      <td className="py-3 px-4">
                        <div className="text-slate-300 text-[11px]">{u.lastActive}</div>
                        <div className="text-[9px] text-slate-500">{u.studyHours}h tích lũy</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedUserDetail(u)}
                            className="p-1.5 bg-slate-800 hover:bg-cyan-950 text-cyan-300 border border-slate-700 hover:border-cyan-400 rounded-lg transition-colors text-[11px] font-bold"
                            title="Xem chi tiết hoạt động"
                          >
                            <Activity className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 border border-slate-700 hover:border-rose-400 rounded-lg transition-colors text-[11px]"
                            title="Xóa người dùng"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add New User */}
        {showAddUserModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border-2 border-cyan-400/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-black text-white text-base flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-cyan-400" />
                  <span>Thêm Người Dùng Vào Kho Dữ Liệu</span>
                </h3>
                <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-cyan-300 block mb-1">Họ và tên:</label>
                  <input
                    type="text"
                    required
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Nguyễn Thành Nam"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-400 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-cyan-300 block mb-1">Email sinh viên / giảng viên:</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nam.nguyen@student.edu.vn"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-cyan-300 block mb-1">Vai trò:</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as any)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-400 font-medium"
                    >
                      <option value="sinh_vien">Sinh viên</option>
                      <option value="giang_vien">Giảng viên</option>
                      <option value="nha_phat_trien">Developer</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-cyan-300 block mb-1">GPA ban đầu:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={newGpa}
                      onChange={(e) => setNewGpa(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-400 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-cyan-300 block mb-1">Trường đại học:</label>
                  <input
                    type="text"
                    value={newUniversity}
                    onChange={(e) => setNewUniversity(e.target.value)}
                    placeholder="ĐH Bách Khoa / KHTN / Kinh Tế"
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-cyan-400 font-medium"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                  >
                    Lưu Tài Khoản
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View User Detail & Activity Log */}
        {selectedUserDetail && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-slate-900 border-2 border-cyan-400/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  {selectedUserDetail.avatarUrl && (selectedUserDetail.avatarUrl.startsWith('http') || selectedUserDetail.avatarUrl.startsWith('data:')) ? (
                    <img
                      src={selectedUserDetail.avatarUrl}
                      alt={selectedUserDetail.fullName}
                      className="w-10 h-10 rounded-full object-cover border border-cyan-400"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-xl">
                      {selectedUserDetail.avatarUrl || '👨‍🎓'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white text-sm">{selectedUserDetail.fullName}</h3>
                    <p className="text-[11px] text-cyan-400 font-mono">{selectedUserDetail.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUserDetail(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Cấp Độ</span>
                  <span className="font-black text-cyan-300">Level {selectedUserDetail.level}</span>
                </div>
                {(() => {
                  const todayStr = getLocalDateString();
                  const isStudiedToday = Boolean(selectedUserDetail.lastStudyDate && selectedUserDetail.lastStudyDate === todayStr);
                  return (
                    <div className={`p-2.5 rounded-xl border ${isStudiedToday ? 'bg-amber-950/30 border-amber-500/40' : 'bg-slate-950 border-slate-800'}`}>
                      <span className="text-[10px] text-slate-400 block">Chuỗi Học</span>
                      <span className={`font-black flex items-center justify-center gap-1 ${isStudiedToday ? 'text-amber-300' : 'text-slate-400'}`}>
                        {selectedUserDetail.streakDays} ngày
                        {isStudiedToday ? '🔥' : '⏳'}
                      </span>
                    </div>
                  );
                })()}
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Bài Giải</span>
                  <span className="font-black text-emerald-300">{selectedUserDetail.exercisesSolved} bài</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-cyan-300 block">Nhật ký hoạt động gần đây:</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedUserDetail.recentActivity?.length > 0 ? (
                    selectedUserDetail.recentActivity.map((act, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                        <div className="flex items-center justify-between font-bold text-white">
                          <span>{act.action}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{act.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-0.5">{act.detail}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-400 text-xs text-center py-4">Chưa có nhật ký ghi nhận</div>
                  )}
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
