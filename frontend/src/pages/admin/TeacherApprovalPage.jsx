import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '../../api/adminService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

export default function TeacherApprovalPage() {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTeachers = async (status) => {
    setIsLoading(true);
    try {
      const response = await adminService.getTeachers(status);
      setTeachers(response.data || []);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      toast.error('Gagal mengambil daftar guru.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers(activeTab);
  }, [activeTab]);

  const handleOpenActionModal = (teacher, type) => {
    setSelectedTeacher(teacher);
    setActionType(type);
  };

  const handleCloseModal = () => {
    setSelectedTeacher(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedTeacher || !actionType) return;
    setIsProcessing(true);
    try {
      if (actionType === 'approve') {
        await adminService.approveTeacher(selectedTeacher.id);
        toast.success(`Akun guru "${selectedTeacher.name}" berhasil disetujui!`);
      } else {
        await adminService.rejectTeacher(selectedTeacher.id);
        toast.success(`Akun guru "${selectedTeacher.name}" telah ditolak.`);
      }
      handleCloseModal();
      // Muat ulang data
      fetchTeachers(activeTab);
    } catch (err) {
      console.error('Error processing teacher approval:', err);
      const msg = err.response?.data?.message || 'Gagal memproses permohonan guru.';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    {
      header: 'ID',
      accessor: 'id',
      className: 'w-16 font-mono text-xs text-textSecondary',
    },
    {
      header: 'Nama Guru',
      accessor: 'name',
      render: (item) => (
        <div>
          <p className="font-semibold text-textPrimary">{item.name}</p>
          <p className="text-xs text-textSecondary">{item.email}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (item) => <Badge variant={item.status}>{item.status.toUpperCase()}</Badge>,
    },
    {
      header: 'Waktu Verifikasi',
      accessor: 'approved_at',
      render: (item) => (
        <span className="text-xs text-textSecondary">
          {item.approved_at ? new Date(item.approved_at).toLocaleString('id-ID') : '-'}
        </span>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-right',
      render: (item) => {
        if (item.status === 'pending') {
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="success"
                size="sm"
                icon={CheckCircle2}
                onClick={() => handleOpenActionModal(item, 'approve')}
              >
                Setujui
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={XCircle}
                onClick={() => handleOpenActionModal(item, 'reject')}
              >
                Tolak
              </Button>
            </div>
          );
        }
        return <span className="text-xs text-slate-400 italic">Telah Diproses</span>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Persetujuan & Verifikasi Guru</h2>
          <p className="text-sm text-textSecondary mt-0.5">
            Setujui pendaftaran pengajar agar mereka dapat membuat kelas dan tugas di LMS.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'pending'
              ? 'border-warning text-amber-700'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Menunggu Approval</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('approved')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'approved'
              ? 'border-success text-emerald-700'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Disetujui (Approved)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'rejected'
              ? 'border-error text-rose-700'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Ditolak (Rejected)</span>
        </button>
      </div>

      {/* Table Data */}
      <Card>
        <Table
          columns={columns}
          data={teachers}
          isLoading={isLoading}
          emptyMessage={`Tidak ada guru dengan status "${activeTab}".`}
        />
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedTeacher}
        onClose={handleCloseModal}
        title={actionType === 'approve' ? 'Konfirmasi Persetujuan Guru' : 'Konfirmasi Penolakan Guru'}
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs text-textSecondary font-medium">Nama Guru:</p>
            <p className="text-sm font-bold text-textPrimary">{selectedTeacher?.name}</p>
            <p className="text-xs text-textSecondary mt-1">Email: {selectedTeacher?.email}</p>
          </div>

          <p className="text-sm text-textSecondary">
            {actionType === 'approve'
              ? 'Apakah Anda yakin ingin menyetujui akun guru ini? Setelah disetujui, guru dapat langsung login dan membuat kelas.'
              : 'Apakah Anda yakin ingin menolak pendaftaran akun guru ini? Guru tidak akan dapat membuat kelas atau mengunggah materi.'}
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={handleCloseModal} disabled={isProcessing}>
              Batal
            </Button>
            <Button
              variant={actionType === 'approve' ? 'success' : 'danger'}
              onClick={handleConfirmAction}
              isLoading={isProcessing}
            >
              {actionType === 'approve' ? 'Ya, Setujui Akun' : 'Ya, Tolak Akun'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
