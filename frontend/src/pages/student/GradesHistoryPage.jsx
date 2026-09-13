import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { submissionService } from '../../api/submissionService';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function GradesHistoryPage() {
  const [submissions, setSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMySubmissions = async () => {
      setIsLoading(true);
      try {
        const res = await submissionService.getMyAllSubmissions();
        setSubmissions(res.data || []);
      } catch (err) {
        console.error('Error fetching submissions history:', err);
        toast.error('Gagal memuat riwayat nilai tugas.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMySubmissions();
  }, []);

  const filteredSubmissions = submissions.filter((s) =>
    (s.assignment_title || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Judul Tugas',
      accessor: 'assignment_title',
      render: (s) => (
        <div>
          <p className="font-semibold text-textPrimary">{s.assignment_title || `Tugas #${s.assignment_id}`}</p>
          <p className="text-xs text-textSecondary font-mono mt-0.5">Berkas: {s.file_url}</p>
        </div>
      ),
    },
    {
      header: 'Waktu Pengumpulan',
      accessor: 'submitted_at',
      render: (s) => (
        <span className="text-xs text-textSecondary">
          {s.submitted_at ? new Date(s.submitted_at).toLocaleString('id-ID') : '-'}
        </span>
      ),
    },
    {
      header: 'Nilai Angka',
      accessor: 'grade',
      render: (s) => {
        if (s.grade !== null && s.grade !== undefined) {
          const num = parseFloat(s.grade);
          return (
            <span
              className={`font-mono font-bold text-sm px-2.5 py-1 rounded-md border ${
                num >= 75
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : num >= 60
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {s.grade}
            </span>
          );
        }
        return <Badge variant="warning">Belum Dinilai</Badge>;
      },
    },
    {
      header: 'Catatan Guru / Feedback',
      accessor: 'feedback',
      render: (s) => (
        <p className="text-xs text-textSecondary italic max-w-sm">
          {s.feedback || <span className="text-slate-400 not-italic">-</span>}
        </p>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingSpinner text="Memuat riwayat pengumpulan & nilai tugas..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Riwayat Nilai & Evaluasi</h2>
          <p className="text-sm text-textSecondary mt-0.5">
            Daftar seluruh tugas yang pernah Anda serahkan beserta evaluasi dan nilai dari pengajar.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul tugas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          data={filteredSubmissions}
          emptyMessage="Anda belum pernah mengumpulkan tugas di kelas manapun."
        />
      </Card>
    </div>
  );
}
