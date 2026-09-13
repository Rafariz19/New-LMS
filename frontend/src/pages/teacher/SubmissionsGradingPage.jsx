import React, { useState, useEffect } from 'react';
import { Award, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { classService } from '../../api/classService';
import { submissionService } from '../../api/submissionService';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function SubmissionsGradingPage() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

  // Grading modal
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');
  const [isSavingGrade, setIsSavingGrade] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const res = await classService.getClasses();
        const list = res.data || [];
        setClasses(list);
        if (list.length > 0) {
          setSelectedClassId(String(list[0].id));
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  const fetchSubmissions = async (classId) => {
    if (!classId) return;
    setIsLoadingSubmissions(true);
    try {
      const res = await submissionService.getTeacherSubmissions(classId);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Error fetching submissions for class:', err);
      toast.error('Gagal memuat daftar pengumpulan tugas.');
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchSubmissions(selectedClassId);
    }
  }, [selectedClassId]);

  const handleOpenGrading = (sub) => {
    setGradingSubmission(sub);
    setGradeValue(sub.grade !== null && sub.grade !== undefined ? sub.grade : '');
    setFeedbackValue(sub.feedback || '');
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    const num = parseFloat(gradeValue);
    if (isNaN(num) || num < 0 || num > 100) {
      toast.error('Nilai harus berupa angka antara 0 sampai 100!');
      return;
    }

    setIsSavingGrade(true);
    try {
      await submissionService.gradeSubmission(gradingSubmission.id, {
        grade: num,
        feedback: feedbackValue.trim(),
      });
      toast.success('Nilai dan feedback berhasil diperbarui!');
      setGradingSubmission(null);
      fetchSubmissions(selectedClassId);
    } catch (err) {
      console.error('Error saving grade:', err);
      toast.error(err.response?.data?.message || 'Gagal menyimpan nilai.');
    } finally {
      setIsSavingGrade(false);
    }
  };

  if (isLoadingClasses) {
    return <LoadingSpinner text="Memuat daftar kelas..." />;
  }

  const columns = [
    {
      header: 'Nama Siswa',
      accessor: 'student_name',
      render: (sub) => (
        <div>
          <p className="font-semibold text-textPrimary">{sub.student_name}</p>
          <p className="text-xs text-textSecondary">ID Siswa: #{sub.student_id}</p>
        </div>
      ),
    },
    {
      header: 'ID Tugas',
      accessor: 'assignment_id',
      render: (sub) => (
        <span className="text-xs font-semibold px-2 py-1 bg-slate-100 rounded-md text-textSecondary">
          Tugas #{sub.assignment_id}
        </span>
      ),
    },
    {
      header: 'Waktu Pengumpulan',
      accessor: 'submitted_at',
      render: (sub) => (
        <span className="text-xs text-textSecondary">
          {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString('id-ID') : '-'}
        </span>
      ),
    },
    {
      header: 'Berkas Tugas',
      accessor: 'file_url',
      render: (sub) => (
        <span className="text-xs font-mono text-primary bg-indigo-50 px-2 py-1 rounded-md max-w-xs truncate block" title={sub.file_url}>
          {sub.file_url}
        </span>
      ),
    },
    {
      header: 'Nilai',
      accessor: 'grade',
      render: (sub) => {
        if (sub.grade !== null && sub.grade !== undefined) {
          return (
            <span className="font-bold text-sm text-success font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {sub.grade}
            </span>
          );
        }
        return <Badge variant="warning">Belum Dinilai</Badge>;
      },
    },
    {
      header: 'Feedback',
      accessor: 'feedback',
      render: (sub) => (
        <p className="text-xs text-textSecondary line-clamp-1 italic max-w-xs">
          {sub.feedback || '-'}
        </p>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-right',
      render: (sub) => (
        <Button
          variant="primary"
          size="sm"
          icon={Award}
          onClick={() => handleOpenGrading(sub)}
        >
          {sub.grade !== null && sub.grade !== undefined ? 'Edit Nilai' : 'Beri Nilai'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-textPrimary">Review & Penilaian Tugas</h2>
          <p className="text-sm text-textSecondary mt-0.5">
            Pilih kelas dan berikan evaluasi serta nilai (0-100) kepada pengumpulan tugas siswa.
          </p>
        </div>

        {/* Class Selector Dropdown */}
        {classes.length > 0 && (
          <div className="w-full sm:w-72">
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1">
              Pilih Ruang Kelas
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (#{c.id})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {classes.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-textPrimary">Belum Ada Kelas</h3>
          <p className="text-sm text-textSecondary mt-1">
            Anda belum memiliki kelas aktif untuk dinilai.
          </p>
        </Card>
      ) : (
        <Card>
          <Table
            columns={columns}
            data={submissions}
            isLoading={isLoadingSubmissions}
            emptyMessage="Belum ada siswa yang mengumpulkan tugas pada kelas ini."
          />
        </Card>
      )}

      {/* Modal Grading */}
      <Modal
        isOpen={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
        title="Penilaian Tugas Siswa"
      >
        <form onSubmit={handleSaveGrade} className="space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="text-xs text-textSecondary">
              Siswa: <span className="font-bold text-textPrimary">{gradingSubmission?.student_name}</span>
            </p>
            <p className="text-xs text-textSecondary truncate">
              Berkas: <span className="font-mono text-primary">{gradingSubmission?.file_url}</span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Nilai Angka (0 - 100)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={gradeValue}
              onChange={(e) => setGradeValue(e.target.value)}
              placeholder="Contoh: 90"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Umpan Balik / Feedback
            </label>
            <textarea
              rows={3}
              value={feedbackValue}
              onChange={(e) => setFeedbackValue(e.target.value)}
              placeholder="Catatan evaluasi untuk siswa..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setGradingSubmission(null)} disabled={isSavingGrade}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSavingGrade}>
              Simpan Penilaian
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
