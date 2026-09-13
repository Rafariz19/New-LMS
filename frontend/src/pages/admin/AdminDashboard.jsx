import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, BookOpen, CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { classService } from '../../api/classService';
import Card, { CardBody } from '../../components/common/Card';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingTeachers: 0,
    approvedTeachers: 0,
    rejectedTeachers: 0,
    totalClasses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        const [pendingRes, approvedRes, rejectedRes, classesRes] = await Promise.allSettled([
          adminService.getTeachers('pending'),
          adminService.getTeachers('approved'),
          adminService.getTeachers('rejected'),
          classService.getClasses(),
        ]);

        setStats({
          pendingTeachers: pendingRes.status === 'fulfilled' ? pendingRes.value.data?.length || 0 : 0,
          approvedTeachers: approvedRes.status === 'fulfilled' ? approvedRes.value.data?.length || 0 : 0,
          rejectedTeachers: rejectedRes.status === 'fulfilled' ? rejectedRes.value.data?.length || 0 : 0,
          totalClasses: classesRes.status === 'fulfilled' ? classesRes.value.data?.length || 0 : 0,
        });
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (isLoading) {
    return <LoadingSpinner text="Memuat statistik administrator..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 sm:p-8 text-white shadow-floating">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Panel Kendali Administrator</h2>
        <p className="mt-1.5 text-sm text-indigo-100 max-w-xl">
          Kelola verifikasi persetujuan akun guru dan pantau seluruh kelas yang terdaftar di New-LMS.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card hoverEffect className="border-l-4 border-l-warning">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                Guru Menunggu Approval
              </p>
              <h4 className="text-2xl font-bold text-textPrimary mt-1.5">{stats.pendingTeachers}</h4>
              <p className="text-[11px] text-warning font-medium mt-1">Perlu tindakan</p>
            </div>
            <div className="p-3 bg-amber-50 text-warning rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card hoverEffect className="border-l-4 border-l-success">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                Guru Terverifikasi
              </p>
              <h4 className="text-2xl font-bold text-textPrimary mt-1.5">{stats.approvedTeachers}</h4>
              <p className="text-[11px] text-success font-medium mt-1">Status aktif</p>
            </div>
            <div className="p-3 bg-emerald-50 text-success rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card hoverEffect className="border-l-4 border-l-error">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                Guru Ditolak
              </p>
              <h4 className="text-2xl font-bold text-textPrimary mt-1.5">{stats.rejectedTeachers}</h4>
              <p className="text-[11px] text-error font-medium mt-1">Tidak disetujui</p>
            </div>
            <div className="p-3 bg-rose-50 text-error rounded-xl">
              <XCircle className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card hoverEffect className="border-l-4 border-l-primary">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">
                Total Kelas
              </p>
              <h4 className="text-2xl font-bold text-textPrimary mt-1.5">{stats.totalClasses}</h4>
              <p className="text-[11px] text-primary font-medium mt-1">Terdaftar di sistem</p>
            </div>
            <div className="p-3 bg-indigo-50 text-primary rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card hoverEffect className="p-6 flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-xl bg-amber-50 text-amber-600 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-textPrimary">Kelola Verifikasi Guru</h3>
            <p className="text-sm text-textSecondary mt-1">
              Tinjau permohonan pendaftaran guru baru, setujui akun yang valid, atau tolak akun yang tidak memenuhi syarat.
            </p>
          </div>
          <div className="mt-6">
            <Link
              to="/admin/teachers"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              <span>Buka Manajemen Approval</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>

        <Card hoverEffect className="p-6 flex flex-col justify-between">
          <div>
            <div className="p-3 w-fit rounded-xl bg-indigo-50 text-primary mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-textPrimary">Monitoring Seluruh Kelas</h3>
            <p className="text-sm text-textSecondary mt-1">
              Pantau seluruh mata pelajaran dan kelas yang dibuat oleh para pengajar di platform New-LMS.
            </p>
          </div>
          <div className="mt-6">
            <Link
              to="/admin/classes"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover"
            >
              <span>Lihat Daftar Seluruh Kelas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
