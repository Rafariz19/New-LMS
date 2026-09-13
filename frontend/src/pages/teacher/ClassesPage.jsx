import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  ArrowRight,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { classService } from '../../api/classService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({ name: '', code: '' });
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isApproved = user?.status === 'approved';

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const res = await classService.getClasses();
      setClasses(res.data || []);
    } catch (err) {
      console.error('Error fetching classes:', err);
      toast.error('Gagal memuat daftar kelas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.code.trim()) {
      toast.error('Nama kelas dan kode akses kelas wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      await classService.createClass({
        name: createForm.name.trim(),
        code: createForm.code.trim(),
      });
      toast.success('Kelas berhasil dibuat!');
      setCreateForm({ name: '', code: '' });
      setIsCreateOpen(false);
      fetchClasses();
    } catch (err) {
      console.error('Error creating class:', err);
      const msg = err.response?.data?.message || 'Gagal membuat kelas.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (cls, e) => {
    e.stopPropagation();
    setSelectedClass(cls);
    setEditName(cls.name);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Nama kelas tidak boleh kosong!');
      return;
    }

    setIsSubmitting(true);
    try {
      await classService.updateClass(selectedClass.id, { name: editName.trim() });
      toast.success('Nama kelas berhasil diperbarui!');
      setIsEditOpen(false);
      setSelectedClass(null);
      fetchClasses();
    } catch (err) {
      console.error('Error updating class:', err);
      toast.error('Gagal memperbarui kelas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (cls, e) => {
    e.stopPropagation();
    setSelectedClass(cls);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedClass) return;
    setIsSubmitting(true);
    try {
      await classService.deleteClass(selectedClass.id);
      toast.success('Kelas dan seluruh entitas di dalamnya berhasil dihapus.');
      setIsDeleteOpen(false);
      setSelectedClass(null);
      fetchClasses();
    } catch (err) {
      console.error('Error deleting class:', err);
      toast.error('Gagal menghapus kelas.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat daftar kelas..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Manajemen Ruang Kelas</h2>
          <p className="text-sm text-textSecondary mt-0.5">
            Kelola kelas yang Anda ampu, bagikan kode kelas ke siswa, dan atur modul perkuliahan.
          </p>
        </div>

        <div>
          <Button
            variant="primary"
            icon={Plus}
            disabled={!isApproved}
            onClick={() => setIsCreateOpen(true)}
            title={!isApproved ? 'Akun Anda belum disetujui admin' : 'Buat Kelas'}
          >
            Buat Kelas Baru
          </Button>
        </div>
      </div>

      {/* Grid of Classes */}
      {classes.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-textPrimary">Belum Ada Kelas yang Dibuat</h3>
          <p className="text-sm text-textSecondary mt-1 max-w-sm mx-auto mb-6">
            {isApproved
              ? 'Mulai buat ruang kelas pertama Anda dan atur materi serta tugas pembelajaran.'
              : 'Akun Anda berstatus pending. Tunggu persetujuan admin untuk mulai membuat kelas.'}
          </p>
          {isApproved && (
            <Button variant="primary" icon={Plus} onClick={() => setIsCreateOpen(true)}>
              Buat Kelas Baru
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card
              key={cls.id}
              hoverEffect
              className="flex flex-col justify-between overflow-hidden border border-slate-200/80 group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center font-bold text-base">
                    {cls.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(cls, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-indigo-50 transition-colors"
                      title="Edit Nama Kelas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleOpenDelete(cls, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-error hover:bg-rose-50 transition-colors"
                      title="Hapus Kelas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-textPrimary group-hover:text-primary transition-colors line-clamp-1">
                  {cls.name}
                </h3>
                <p className="text-xs text-textSecondary mt-1">ID Kelas: #{cls.id}</p>

                <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center gap-2.5 text-xs text-textSecondary">
                  <KeyRound className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">Kode Akses Terenkripsi (Bcrypt)</span>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-textSecondary">Pengampu: {cls.teacher_name}</span>
                <Link
                  to={`/teacher/classes/${cls.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
                >
                  <span>Buka Kelas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Buat Kelas */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Buat Kelas Baru"
        description="Masukkan nama mata kuliah dan kode pendaftaran kelas untuk siswa."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Nama Kelas / Mata Pelajaran
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              placeholder="Contoh: Struktur Data & Algoritma"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Kode Akses Kelas (Enrollment Code)
            </label>
            <input
              type="text"
              value={createForm.code}
              onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
              placeholder="Contoh: SDA2026"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all font-mono"
            />
            <p className="text-[11px] text-textSecondary mt-1">
              Catatan: Kode kelas ini akan disimpan terenkripsi. Bagikan kode ini kepada siswa Anda agar mereka dapat bergabung.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={() => setIsCreateOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Simpan & Buat Kelas
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Edit Nama Kelas */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Ubah Nama Kelas"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Nama Kelas Baru
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Perbarui Nama
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Hapus Kelas */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Konfirmasi Hapus Kelas"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-error mt-0.5" />
            <div>
              <p className="font-bold text-sm text-error">Peringatan Penghapusan Cascade</p>
              <p className="mt-1">
                Menghapus kelas <strong>"{selectedClass?.name}"</strong> akan menghapus secara permanen seluruh data pendaftaran siswa, modul materi, tugas, dan pengumpulan tugas (submission) yang terkait.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleDeleteSubmit} isLoading={isSubmitting}>
              Ya, Hapus Kelas Ini
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
