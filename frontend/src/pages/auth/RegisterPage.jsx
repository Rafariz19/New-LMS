import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserCheck, GraduationCap, ArrowLeft, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../api/authService';
import Button from '../../components/common/Button';

export default function RegisterPage() {
  const [role, setRole] = useState('student'); // 'student' | 'teacher'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    nim: '',
    jurusan: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMessage('Nama, email, dan password wajib diisi.');
      return;
    }

    if (role === 'student' && (!formData.nim.trim() || !formData.jurusan.trim())) {
      setErrorMessage('NIM dan Jurusan wajib diisi untuk pendaftaran Siswa/Mahasiswa.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role,
      };

      if (role === 'student') {
        payload.nim = formData.nim.trim();
        payload.jurusan = formData.jurusan.trim();
      }

      await authService.register(payload);
      toast.success(
        role === 'teacher'
          ? 'Registrasi Guru berhasil! Akun Anda sedang menunggu persetujuan Admin.'
          : 'Registrasi Siswa berhasil! Silakan login untuk memulai.'
      );
      navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
      let msg = 'Registrasi gagal. Silakan periksa kembali data Anda.';
      const backendError = err.response?.data?.error || '';
      const backendMsg = err.response?.data?.message || '';

      if (typeof backendError === 'string' && backendError.includes('Duplicate entry')) {
        if (backendError.includes('email')) {
          msg = 'Email ini sudah terdaftar di sistem! Silakan langsung login atau gunakan email lain.';
        } else if (backendError.includes('nim')) {
          msg = 'NIM ini sudah terdaftar untuk siswa lain.';
        } else {
          msg = `Data duplikat: ${backendError}`;
        }
      } else if (backendMsg && backendMsg !== 'DB error') {
        msg = backendMsg;
      } else if (backendError) {
        msg = typeof backendError === 'string' ? backendError : JSON.stringify(backendError);
      } else if (err.message) {
        msg = `Koneksi gagal: ${err.message}. Pastikan backend di port 5000 aktif.`;
      }

      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-lg shadow-indigo-200 mb-4">
          <span className="text-2xl font-black">NL</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
          Buat Akun Baru
        </h2>
        <p className="mt-2 text-sm text-textSecondary">
          Pilih peran Anda dan lengkapi data profil untuk mendaftar
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4">
        <div className="bg-surface py-8 px-6 sm:px-10 shadow-floating rounded-2xl border border-slate-200/80">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/80 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                role === 'student'
                  ? 'bg-surface text-primary shadow-subtle'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Siswa / Mahasiswa</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                role === 'teacher'
                  ? 'bg-surface text-primary shadow-subtle'
                  : 'text-textSecondary hover:text-textPrimary'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Guru / Dosen</span>
            </button>
          </div>

          {/* Teacher Warning Notice */}
          {role === 'teacher' && (
            <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-warning" />
              <div>
                <p className="font-semibold mb-0.5">Catatan Persetujuan Akun Guru</p>
                <p>
                  Setelah mendaftar, akun guru berstatus <span className="font-bold">pending</span> dan memerlukan verifikasi persetujuan oleh Administrator sebelum dapat membuat kelas, membagikan materi, atau memberi tugas.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-error font-medium">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative rounded-xl shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={role === 'teacher' ? 'Contoh: Ahmad Dani, M.Kom' : 'Contoh: Budi Santoso'}
                  required
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-textPrimary placeholder:text-slate-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
                Alamat Email
              </label>
              <div className="relative rounded-xl shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-textPrimary placeholder:text-slate-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
                Kata Sandi
              </label>
              <div className="relative rounded-xl shadow-subtle">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  required
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-textPrimary placeholder:text-slate-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Field Khusus Student: NIM & Jurusan */}
            {role === 'student' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
                    NIM / Nomor Siswa
                  </label>
                  <input
                    type="text"
                    name="nim"
                    value={formData.nim}
                    onChange={handleChange}
                    placeholder="Contoh: 2024001001"
                    required
                    className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-textPrimary placeholder:text-slate-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
                    Jurusan / Program Studi
                  </label>
                  <input
                    type="text"
                    name="jurusan"
                    value={formData.jurusan}
                    onChange={handleChange}
                    placeholder="Contoh: Teknik Informatika"
                    required
                    className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-textPrimary placeholder:text-slate-400 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-4"
            >
              Daftar Sebagai {role === 'student' ? 'Siswa' : 'Guru'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-textSecondary">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
