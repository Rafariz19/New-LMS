import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Award,
  Search,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { classService } from '../../api/classService';
import { submissionService } from '../../api/submissionService';
import Card, { CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [myClasses, setMyClasses] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [classesRes, subsRes] = await Promise.allSettled([
          classService.getMyClasses(),
          submissionService.getMyAllSubmissions(),
        ]);

        if (classesRes.status === 'fulfilled') {
          setMyClasses(classesRes.value.data || []);
        }
        if (subsRes.status === 'fulfilled') {
          setMySubmissions(subsRes.value.data || []);
        }
      } catch (err) {
        console.error('Error fetching student dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Memuat beranda mahasiswa..." />;
  }

  return (
    <div className="space-y-6">
      {/* Student Welcome Profile Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 sm:p-8 text-white shadow-floating flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-200">
            Portal Mahasiswa / Siswa
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
            Halo, {user?.name || 'Mahasiswa'}!
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs sm:text-sm text-indigo-100">
            {user?.nim && (
              <span className="bg-white/15 px-3 py-1 rounded-full font-mono">
                NIM: {user.nim}
              </span>
            )}
            {user?.jurusan && (
              <span className="bg-white/15 px-3 py-1 rounded-full">
                Jurusan: {user.jurusan}
              </span>
            )}
            <span className="bg-white/15 px-3 py-1 rounded-full">{user?.email}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/student/explore">
            <Button
              variant="outline"
              className="bg-white text-primary hover:bg-slate-50 border-transparent font-semibold"
              icon={Search}
            >
              Cari & Enroll Kelas
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card hoverEffect className="border-l-4 border-l-primary">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                Kelas yang Diikuti
              </p>
              <h4 className="text-2xl font-bold text-textPrimary mt-1.5">{myClasses.length}</h4>
              <p className="text-[11px] text-primary font-medium mt-1">Terdaftar aktif</p>
            </div>
            <div className="p-3 bg-indigo-50 text-primary rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card hoverEffect className="border-l-4 border-l-success">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                Tugas Terkumpul
              </p>
              <h4 className="text-2xl font-bold text-textPrimary mt-1.5">{mySubmissions.length}</h4>
              <p className="text-[11px] text-success font-medium mt-1">Sudah diserahkan</p>
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
                Transkrip Nilai
              </p>
              <h4 className="text-sm font-semibold text-textPrimary mt-2">Cek Evaluasi Guru</h4>
              <Link
                to="/student/grades"
                className="text-[11px] text-primary hover:underline font-medium inline-flex items-center gap-1 mt-1"
              >
                Lihat riwayat nilai <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-3 bg-indigo-50 text-secondary rounded-xl">
              <Award className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Enrolled Classes Quick Access */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-textPrimary">Kelas Saya yang Sedang Berjalan</h3>
          <Link
            to="/student/my-classes"
            className="text-xs font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1"
          >
            Lihat semua kelas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {myClasses.length === 0 ? (
          <Card className="p-10 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-textPrimary">Belum Mengikuti Kelas Apapun</h4>
            <p className="text-sm text-textSecondary mt-1 max-w-sm mx-auto mb-5">
              Jelajahi daftar kelas yang tersedia dan masukkan kode pendaftaran dari guru Anda untuk bergabung.
            </p>
            <Link to="/student/explore">
              <Button variant="primary" size="sm" icon={Search}>
                Cari & Masuk Kelas
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myClasses.slice(0, 6).map((cls) => (
              <Card key={cls.id} hoverEffect className="p-5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-primary flex items-center justify-center font-bold text-sm mb-3">
                    {cls.name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-base text-textPrimary line-clamp-1">{cls.name}</h4>
                  <p className="text-xs text-textSecondary mt-1">ID Kelas: #{cls.id}</p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Badge variant="enrolled" size="sm">
                    Ter-enroll
                  </Badge>
                  <Link
                    to={`/student/class/${cls.id}`}
                    className="text-xs font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1"
                  >
                    Buka Materi & Tugas <ArrowRight className="w-3 h-3" />
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
