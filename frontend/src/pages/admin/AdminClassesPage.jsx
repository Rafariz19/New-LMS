import React, { useState, useEffect } from 'react';
import { BookOpen, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { classService } from '../../api/classService';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';

export default function AdminClassesPage() {
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const response = await classService.getClasses();
        setClasses(response.data || []);
      } catch (err) {
        console.error('Error fetching admin classes:', err);
        toast.error('Gagal mengambil daftar kelas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const filteredClasses = classes.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'ID Kelas',
      accessor: 'id',
      className: 'w-24 font-mono text-xs text-textSecondary',
    },
    {
      header: 'Nama Kelas / Pelajaran',
      accessor: 'name',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-50 text-primary">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-semibold text-textPrimary">{item.name}</span>
        </div>
      ),
    },
    {
      header: 'ID Guru Pengampu',
      accessor: 'teacher_id',
      render: (item) => (
        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-md text-textSecondary">
          ID: {item.teacher_id}
        </span>
      ),
    },
    {
      header: 'Hash Kode Akses',
      accessor: 'code',
      render: (item) => (
        <span className="text-xs font-mono text-slate-400 truncate max-w-xs block" title={item.code}>
          {item.code ? `${item.code.substring(0, 24)}... (Terenkripsi Bcrypt)` : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Seluruh Kelas di Sistem</h2>
          <p className="text-sm text-textSecondary mt-0.5">
            Daftar seluruh ruang kelas dan mata kuliah yang dibuat oleh para pengajar.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={filteredClasses}
          isLoading={isLoading}
          emptyMessage="Tidak ada kelas yang ditemukan."
        />
      </Card>
    </div>
  );
}
