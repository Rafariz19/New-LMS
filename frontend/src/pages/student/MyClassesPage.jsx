import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, LogOut, ArrowRight, PlusCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { classService } from '../../api/classService';
import { enrollmentService } from '../../api/enrollmentService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function MyClassesPage() {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Unenroll modal states
  const [unenrollClass, setUnenrollClass] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchMyClasses = async () => {
    setIsLoading(true);
    try {
      const res = await classService.getMyClasses();
      setClasses(res.data || []);
    } catch (err) {
      console.error('Error fetching student enrolled classes:', err);
      toast.error('Gagal memuat daftar kelas yang Anda ikuti.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const handleConfirmUnenroll = async () => {
    if (!unenrollClass) return;
    setIsProcessing(true);
    try {
      await enrollmentService.unenroll(unenrollClass.id);
      toast.success(`Anda telah keluar dari kelas "${unenrollClass.name}".`);
      setUnenrollClass(null);
      fetchMyClasses();
    } catch (err) {
      console.error('Error unenrolling from class:', err);
      toast.error(err.response?.data?.message || 'Gagal membatalkan pendaftaran kelas.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat kelas yang Anda ikuti..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Kelas yang Saya Ikuti</h2>
          <p className="text-sm text-textSecondary mt-0.5">
            Daftar ruang kelas aktif tempat Anda dapat mengakses materi dan mengumpulkan tugas.
          </p>
        </div>

        <div>
          <Link to="/student/explore">
            <Button variant="primary" icon={PlusCircle}>
              Tambah / Enroll Kelas Baru
            </Button>
          </Link>
        </div>
      </div>

      {classes.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-textPrimary">Belum Ada Kelas yang Diikuti</h3>
          <p className="text-sm text-textSecondary mt-1 max-w-sm mx-auto mb-6">
            Anda belum terdaftar di kelas manapun. Jelajahi katalog kelas dan masukkan kode enrollment untuk bergabung.
          </p>
          <Link to="/student/explore">
            <Button variant="primary" icon={PlusCircle}>
              Eksplorasi Kelas Sekarang
            </Button>
          </Link>
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
                  <button
                    type="button"
                    onClick={() => setUnenrollClass(cls)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-error hover:bg-rose-50 transition-colors"
                    title="Keluar dari Kelas (Unenroll)"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-textPrimary group-hover:text-primary transition-colors line-clamp-1">
                  {cls.name}
                </h3>
                <p className="text-xs text-textSecondary mt-1">ID Kelas: #{cls.id}</p>
              </div>

              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setUnenrollClass(cls)}
                  className="text-xs text-slate-400 hover:text-error hover:underline"
                >
                  Unenroll
                </button>
                <Link
                  to={`/student/class/${cls.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover"
                >
                  <span>Buka Ruang Kelas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Unenroll Confirmation Modal */}
      <Modal
        isOpen={!!unenrollClass}
        onClose={() => setUnenrollClass(null)}
        title="Konfirmasi Keluar dari Kelas"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-warning mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-950">Apakah Anda yakin?</p>
              <p className="mt-1">
                Anda akan keluar dari kelas <strong>"{unenrollClass?.name}"</strong>. Anda tidak akan dapat lagi mengakses materi atau mengumpulkan tugas di kelas ini kecuali mendaftar ulang menggunakan kode kelas.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setUnenrollClass(null)} disabled={isProcessing}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleConfirmUnenroll} isLoading={isProcessing}>
              Ya, Keluar dari Kelas
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
