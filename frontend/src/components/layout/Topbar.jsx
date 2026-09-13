import React, { useState } from 'react';
import { Menu, LogOut, ShieldCheck, UserCheck, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../common/Badge';
import UserProfileModal from '../common/UserProfileModal';

export default function Topbar({ onMenuClick, title }) {
  const { user, role, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const backendBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(
    /\/api\/?$/,
    ''
  );
  const avatarUrl = user?.avatar ? `${backendBaseUrl}/uploads/${user.avatar}` : null;

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="primary" size="md">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Badge>
        );
      case 'teacher':
        return (
          <Badge variant={user?.status === 'approved' ? 'approved' : 'pending'} size="md">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Guru ({user?.status || 'Teacher'})</span>
          </Badge>
        );
      case 'student':
        return (
          <Badge variant="secondary" size="md">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Siswa {user?.nim ? `• ${user.nim}` : ''}</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="h-16 bg-surface border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Buka navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>
          {title && <h1 className="text-base sm:text-lg font-bold text-textPrimary tracking-tight">{title}</h1>}
        </div>

        <div className="flex items-center gap-4">
          {/* Role Badge */}
          <div className="hidden sm:block">{getRoleBadge()}</div>

          {/* User Info & Avatar (Clickable to open profile & avatar change) */}
          <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
            <button
              type="button"
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all text-left group focus:outline-none"
              title="Klik untuk melihat profil lengkap & ganti foto"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-textPrimary leading-tight group-hover:text-primary transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-textSecondary">{user?.email || ''}</p>
              </div>

              <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-200 text-primary font-semibold flex items-center justify-center text-sm overflow-hidden shadow-xs group-hover:border-primary transition-all">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
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
            </button>

            <button
              type="button"
              onClick={logout}
              title="Keluar"
              className="p-2 rounded-lg text-slate-400 hover:text-error hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Detail & Avatar Change Modal */}
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
