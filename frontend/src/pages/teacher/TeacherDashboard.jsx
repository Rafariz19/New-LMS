import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { classService } from '../../api/classService';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function TeacherDashboard() {
  const { user, refreshProfile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const isApproved = user?.status === 'approved';

  useEffect(() => {
    refreshProfile();
    const fetchTeacherData = async () => {
      setIsLoading(true);
      try {
        const response = await classService.getClasses();
        setClasses(response.data || []);
      } catch (err) {
        console.error('Error fetching teacher classes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeacherData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Memuat dashboard guru..." />;
  }

  return (
    <div className="space-y-6">
      {/* Account Approval Warning Banner */}
      {!isApproved && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 text-warning mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-base">Akun Anda Sedang Menunggu Persetujuan Admin</h4>
              <Badge variant={user?.status || 'pending'}>
                {user?.status?.toUpperCase() || 'PENDING'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
              Status akun Anda saat ini adalah <strong>{user?.status || 'pending'}</strong>. Sesuai kebijakan keamanan sistem, Anda baru dapat membuat kelas, membagikan materi, dan memberikan tugas kepada siswa setelah akun diverifikasi oleh Administrator.
            </p>
          </div>
        </div>
      )}

      {/* Teacher Profile Banner */}
      <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-textPrimary tracking-tight">
              Selamat Datang, {user?.name}
            </h2>
            <Badge variant={isApproved ? 'approved' : 'pending'}>
              {isApproved ? 'Guru Terverifikasi' : 'Menunggu Approval'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-textSecondary">
            Kelola kegiatan belajar mengajar, materi perkuliahan, dan evaluasi tugas siswa Anda di sini.
          </p>
        </div>

        <div>
          <Link to="/teacher/classes">
            <Button
              variant="primary"
              size="md"
              icon={PlusCircle}
              disabled={!isApproved}
              title={!isApproved ? 'Akun Anda belum disetujui oleh admin' : 'Buat Kelas'}
            >
              Kelola & Buat Kelas
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card hoverEffect className="border-l-4 border-l-primary">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                Kelas yang Diampu
              </p>
              <h4 className="text-2xl font-bold text-textPrimary mt-1.5">{classes.length}</h4>
              <p className="text-[11px] text-textSecondary mt-1">Ruang kelas aktif</p>
            </div>
            <div className="p-3 bg-indigo-50 text-primary rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card hoverEffect className="border-l-4 border-l-success">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                Status Verifikasi
              </p>
              <h4 className="text-2xl font-bold text-textPrimary mt-1.5 capitalize">
                {user?.status || 'Pending'}
              </h4>
              <p className="text-[11px] text-success font-medium mt-1">
                {isApproved ? 'Hak akses penuh' : 'Dibatasi'}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-success rounded-xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card hoverEffect className="border-l-4 border-l-secondary">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                Penilaian Tugas
              </p>
              <h4 className="text-sm font-semibold text-textPrimary mt-2">Pemberian Nilai</h4>
              <Link
                to="/teacher/grading"
                className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1 mt-1"
              >
                Buka ruang penilaian <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3 bg-indigo-50 text-secondary rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Classes Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-textPrimary">Daftar Kelas Saya</h3>
          <Link
            to="/teacher/classes"
            className="text-xs font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1"
          >
            Lihat semua kelas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {classes.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-textPrimary">Belum ada kelas yang dibuat</p>
            <p className="text-xs text-textSecondary mt-1 max-w-sm mx-auto mb-4">
              {isApproved
                ? 'Buat kelas pertama Anda dan bagikan kode akses kelas kepada para siswa.'
                : 'Setelah akun disetujui admin, Anda dapat mulai menambahkan kelas di sini.'}
            </p>
            {isApproved && (
              <Link to="/teacher/classes">
                <Button variant="primary" size="sm" icon={PlusCircle}>
                  Buat Kelas Sekarang
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.slice(0, 6).map((cls) => (
              <Card key={cls.id} hoverEffect className="p-5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-primary flex items-center justify-center font-bold text-sm mb-3">
                    {cls.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-base text-textPrimary line-clamp-1">{cls.name}</h4>
                  <p className="text-xs text-textSecondary mt-1">ID Kelas: #{cls.id}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-textSecondary">Pengampu: {cls.teacher_name}</span>
                  <Link
                    to={`/teacher/classes/${cls.id}`}
                    className="text-xs font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1"
                  >
                    Buka Kelas <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
