import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, KeyRound, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { classService } from '../../api/classService';
import { enrollmentService } from '../../api/enrollmentService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function ExploreClassesPage() {
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Enroll modal states
  const [selectedClass, setSelectedClass] = useState(null);
  const [enrollCode, setEnrollCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchClasses = async () => {
    setIsLoading(true);
    try {
      const res = await classService.getClasses();
      setClasses(res.data || []);
    } catch (err) {
      console.error('Error fetching classes for student:', err);
      toast.error('Gagal memuat daftar kelas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleOpenEnroll = (cls) => {
    setSelectedClass(cls);
    setEnrollCode('');
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!enrollCode.trim()) {
      toast.error('Silakan masukkan kode pendaftaran kelas!');
      return;
    }

    setIsSubmitting(true);
    try {
      await enrollmentService.enroll({
        name: selectedClass.name,
        code: enrollCode.trim(),
      });
      toast.success(`Berhasil mendaftar ke kelas "${selectedClass.name}"!`);
      const enrolledClassId = selectedClass.id;
      setSelectedClass(null);
      setEnrollCode('');
      // Refresh list
      await fetchClasses();
      // Opsi redirect langsung ke ruang kelas
      navigate(`/student/class/${enrolledClassId}`);
    } catch (err) {
      console.error('Error enrolling:', err);
      const msg = err.response?.data?.message || 'Kode pendaftaran kelas salah atau kelas tidak ditemukan.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredClasses = classes.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return <LoadingSpinner text="Mencari seluruh kelas yang tersedia..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Eksplorasi Ruang Kelas</h2>
          <p className="text-sm text-textSecondary mt-0.5">
            Cari kelas mata kuliah Anda dan masukkan kode akses yang diberikan oleh guru/dosen pengampu.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari mata kuliah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-textPrimary">Tidak Ada Kelas Ditemukan</h3>
          <p className="text-sm text-textSecondary mt-1">
            Coba gunakan kata kunci pencarian yang lain.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((cls) => {
            const isEnrolled = cls.is_enrolled === 1;
            return (
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
                    <Badge variant={isEnrolled ? 'success' : 'neutral'}>
                      {isEnrolled ? 'Sudah Terdaftar' : 'Tersedia'}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-textPrimary group-hover:text-primary transition-colors line-clamp-1">
                    {cls.name}
                  </h3>
                  <p className="text-xs text-textSecondary mt-1">ID Kelas: #{cls.id}</p>
                </div>

                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  {isEnrolled ? (
                    <Link
                      to={`/student/class/${cls.id}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                    >
                      <span>Buka Kelas Saya</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={KeyRound}
                      className="w-full font-semibold"
                      onClick={() => handleOpenEnroll(cls)}
                    >
                      Daftar (Enroll Kelas)
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Enroll */}
      <Modal
        isOpen={!!selectedClass}
        onClose={() => setSelectedClass(null)}
        title="Daftar ke Ruang Kelas"
        description="Masukkan kode akses pendaftaran untuk bergabung ke kelas ini."
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Nama Kelas
            </label>
            <input
              type="text"
              value={selectedClass?.name || ''}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-semibold text-textPrimary cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Kode Akses Kelas (Diberikan oleh Guru)
            </label>
            <input
              type="text"
              value={enrollCode}
              onChange={(e) => setEnrollCode(e.target.value)}
              placeholder="Contoh: SDA2026"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all font-mono"
            />
            <p className="text-[11px] text-textSecondary mt-1">
              Mintalah kode pendaftaran kelas kepada guru/dosen pengampu Anda.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setSelectedClass(null)} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Konfirmasi & Bergabung
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
