import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Generate dynamic title if not explicitly passed
  const getPageTitle = () => {
    if (title) return title;
    const path = location.pathname;
    if (path.includes('/admin/teachers')) return 'Manajemen Approval Guru';
    if (path.includes('/admin/classes')) return 'Daftar Seluruh Kelas';
    if (path === '/admin') return 'Dashboard Administrator';

    if (path.includes('/teacher/classes/')) return 'Detail & Pengelolaan Kelas';
    if (path.includes('/teacher/classes')) return 'Manajemen Kelas';
    if (path.includes('/teacher/grading')) return 'Review & Penilaian Tugas';
    if (path === '/teacher') return 'Dashboard Guru';

    if (path.includes('/student/class/')) return 'Ruang Kelas Pembelajaran';
    if (path.includes('/student/my-classes')) return 'Kelas yang Diikuti';
    if (path.includes('/student/explore')) return 'Eksplorasi & Pendaftaran Kelas';
    if (path.includes('/student/grades')) return 'Riwayat Nilai & Umpan Balik';
    if (path === '/student') return 'Dashboard Mahasiswa/Siswa';

    return 'New-LMS Dashboard';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Left Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={getPageTitle()} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
