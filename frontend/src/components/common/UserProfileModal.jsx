import React, { useState, useRef } from 'react';
import {
  Camera,
  User,
  Shield,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Clock,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Modal from './Modal';
import Button from './Button';
import Badge from './Badge';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user, role, updateProfileAvatar, refreshProfile } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image format
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type)) {
      toast.error('Format gambar harus JPG, JPEG, atau PNG.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto profil maksimal 5MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await updateProfileAvatar(selectedFile);
      toast.success('Foto profil berhasil diperbarui!');
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Failed to update avatar:', err);
      toast.error(err.response?.data?.message || 'Gagal memperbarui foto profil.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshProfile();
      toast.success('Data profil disinkronkan dari server!');
    } catch {
      toast.error('Gagal menyinkronkan profil.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Base API url for uploads
  const backendBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(
    /\/api\/?$/,
    ''
  );
  const currentAvatarUrl = user?.avatar ? `${backendBaseUrl}/uploads/${user.avatar}` : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detail Profil Pengguna" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* Avatar & Photo Upload Section */}
        <div className="flex flex-col items-center justify-center text-center">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-indigo-100 bg-indigo-50 shadow-md flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial letter if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-3xl font-extrabold text-primary">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>

            {/* Camera Overlay Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-white hover:bg-primary-hover shadow-lg transition-transform hover:scale-105"
              title="Ganti Foto Profil"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Pending Upload Buttons */}
          {selectedFile && (
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleUploadPhoto}
                isLoading={isUploading}
              >
                Simpan Foto
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelPreview}
                disabled={isUploading}
              >
                Batal
              </Button>
            </div>
          )}

          <h3 className="text-lg font-bold text-textPrimary mt-3">{user?.name || 'Pengguna'}</h3>
          <p className="text-xs text-textSecondary">{user?.email}</p>
        </div>

        {/* Profile Details from authcontroller.me */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
            <span className="text-textSecondary flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5 text-primary" /> Peran (Role)
            </span>
            <Badge variant={role === 'admin' ? 'primary' : role === 'teacher' ? 'approved' : 'secondary'} size="sm">
              {role?.toUpperCase()}
            </Badge>
          </div>

          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
            <span className="text-textSecondary flex items-center gap-1.5 font-medium">
              <User className="w-3.5 h-3.5 text-slate-400" /> ID Akun
            </span>
            <span className="font-mono font-semibold text-textPrimary">#{user?.id || '-'}</span>
          </div>

          {/* Role-Specific Information */}
          {role === 'student' && (
            <>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
                <span className="text-textSecondary flex items-center gap-1.5 font-medium">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> NIM
                </span>
                <span className="font-mono font-bold text-textPrimary">{user?.nim || '-'}</span>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
                <span className="text-textSecondary flex items-center gap-1.5 font-medium">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Jurusan
                </span>
                <span className="font-semibold text-textPrimary">{user?.jurusan || '-'}</span>
              </div>
            </>
          )}

          {role === 'teacher' && (
            <>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
                <span className="text-textSecondary flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Status Approval
                </span>
                <Badge variant={user?.status === 'approved' ? 'approved' : 'pending'} size="sm">
                  {user?.status?.toUpperCase() || 'PENDING'}
                </Badge>
              </div>
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
                <span className="text-textSecondary flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Waktu Verifikasi
                </span>
                <span className="text-textPrimary font-medium">
                  {user?.approved_at ? new Date(user.approved_at).toLocaleDateString('id-ID') : 'Belum diverifikasi'}
                </span>
              </div>
            </>
          )}

          {role === 'admin' && (
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 text-xs">
              <span className="text-textSecondary flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-primary" /> Tingkat Izin
              </span>
              <span className="text-xs font-semibold text-primary">Akses Penuh Administrator</span>
            </div>
          )}

          {user?.created_at && (
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-textSecondary flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Terdaftar Sejak
              </span>
              <span className="text-textSecondary font-medium">
                {new Date(user.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
            isLoading={isRefreshing}
          >
            Sinkronkan
          </Button>

          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
}
