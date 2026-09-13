import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Users,
  Award,
  Search,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { role, logout, user } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Approval Guru', path: '/admin/teachers', icon: Users },
          { name: 'Daftar Kelas', path: '/admin/classes', icon: BookOpen },
        ];
      case 'teacher':
        return [
          { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
          { name: 'Kelas Saya', path: '/teacher/classes', icon: BookOpen },
          { name: 'Penilaian Tugas', path: '/teacher/grading', icon: CheckSquare },
        ];
      case 'student':
        return [
          { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
          { name: 'Kelas Saya', path: '/student/my-classes', icon: GraduationCap },
          { name: 'Eksplorasi Kelas', path: '/student/explore', icon: Search },
          { name: 'Riwayat Nilai', path: '/student/grades', icon: Award },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-surface border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Title */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-indigo-200">
              NL
            </div>
            <div>
              <span className="font-bold text-lg text-textPrimary tracking-tight">New-LMS</span>
              <span className="block text-[10px] uppercase font-semibold tracking-wider text-textSecondary">
                Portal {role}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin' || item.path === '/teacher' || item.path === '/student'}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm shadow-indigo-200 font-semibold'
                      : 'text-textSecondary hover:text-textPrimary hover:bg-slate-100/70'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Card & Logout in Sidebar Footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-xs overflow-hidden">
              {user?.avatar ? (
                <img
                  src={`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')}/uploads/${user.avatar}`}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-textPrimary truncate">{user?.name || 'Pengguna'}</p>
              <p className="text-[11px] text-textSecondary capitalize">{role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-error hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </aside>
    </>
  );
}
