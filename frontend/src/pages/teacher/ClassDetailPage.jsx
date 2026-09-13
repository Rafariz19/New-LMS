import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Users,
  CheckSquare,
  Upload,
  Download,
  Plus,
  Edit2,
  Trash2,
  Award,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { materialService } from '../../api/materialService';
import { assignmentService } from '../../api/assignmentService';
import { submissionService } from '../../api/submissionService';
import { enrollmentService } from '../../api/enrollmentService';
import { classService } from '../../api/classService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Table from '../../components/common/Table';
import FileUploadInput from '../../components/common/FileUploadInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function ClassDetailPage() {
  const { id: classId } = useParams();
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'assignments' | 'students' | 'submissions'
  const [classInfo, setClassInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tab 1: Materials State
  const [materials, setMaterials] = useState([]);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialFile, setMaterialFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Tab 2: Assignments State
  const [assignments, setAssignments] = useState([]);
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDeadline, setAssignmentDeadline] = useState('');
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);

  // Tab 3: Enrolled Students State
  const [students, setStudents] = useState([]);

  // Tab 4: Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');
  const [isSavingGrade, setIsSavingGrade] = useState(false);

  // Fetch Class Metadata
  const fetchClassInfo = async () => {
    try {
      const res = await classService.getClasses();
      const current = (res.data || []).find((c) => String(c.id) === String(classId));
      if (current) setClassInfo(current);
    } catch (err) {
      console.error('Error finding class:', err);
    }
  };

  // Fetch Materials
  const fetchMaterials = async () => {
    try {
      const data = await materialService.getClassMaterials(classId);
      setMaterials(data || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  // Fetch Assignments
  const fetchAssignments = async () => {
    try {
      const res = await assignmentService.getTeacherAssignments(classId);
      setAssignments(res.data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  // Fetch Enrolled Students
  const fetchStudents = async () => {
    try {
      const res = await enrollmentService.getClassStudents(classId);
      setStudents(res.data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  // Fetch Submissions
  const fetchSubmissions = async () => {
    try {
      const res = await submissionService.getTeacherSubmissions(classId);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchClassInfo(),
        fetchMaterials(),
        fetchAssignments(),
        fetchStudents(),
        fetchSubmissions(),
      ]);
      setIsLoading(false);
    };
    initData();
  }, [classId]);

  // Handle Material Upload
  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!materialFile) {
      toast.error('Silakan pilih berkas materi terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', materialFile);
      if (materialTitle.trim()) {
        formData.append('title', materialTitle.trim());
      }

      await materialService.uploadMaterial(classId, formData);
      toast.success('Materi berhasil diunggah!');
      setIsUploadOpen(false);
      setMaterialTitle('');
      setMaterialFile(null);
      fetchMaterials();
    } catch (err) {
      console.error('Error uploading material:', err);
      const msg = err.response?.data?.message || 'Gagal mengunggah materi.';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Download Material
  const handleDownloadMaterial = async (filename, title) => {
    try {
      toast.loading('Mengunduh berkas materi...', { id: 'download-mat' });
      await materialService.downloadMaterial(filename, title || filename);
      toast.success('Berkas berhasil diunduh!', { id: 'download-mat' });
    } catch (err) {
      console.error('Error downloading material:', err);
      toast.error('Gagal mengunduh berkas materi.', { id: 'download-mat' });
    }
  };

  // Handle Assignment Create / Update
  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentTitle.trim() || !assignmentDeadline) {
      toast.error('Judul dan batas waktu pengumpulan tugas wajib diisi!');
      return;
    }

    // Format datetime to MySQL 'YYYY-MM-DD HH:mm:ss'
    const formattedDeadline = assignmentDeadline.replace('T', ' ') + (assignmentDeadline.length <= 16 ? ':00' : '');

    setIsSavingAssignment(true);
    try {
      if (editingAssignment) {
        await assignmentService.updateAssignment(editingAssignment.id, {
          title: assignmentTitle.trim(),
          deadline: formattedDeadline,
        });
        toast.success('Tugas berhasil diperbarui!');
      } else {
        await assignmentService.createAssignment(classId, {
          title: assignmentTitle.trim(),
          deadline: formattedDeadline,
        });
        toast.success('Tugas baru berhasil dibuat!');
      }
      setIsAssignmentOpen(false);
      setEditingAssignment(null);
      setAssignmentTitle('');
      setAssignmentDeadline('');
      fetchAssignments();
    } catch (err) {
      console.error('Error saving assignment:', err);
      toast.error(err.response?.data?.message || 'Gagal menyimpan tugas.');
    } finally {
      setIsSavingAssignment(false);
    }
  };

  const handleOpenEditAssignment = (assign) => {
    setEditingAssignment(assign);
    setAssignmentTitle(assign.title);
    // Convert to datetime-local string
    const d = new Date(assign.deadline);
    const dateStr = d.toISOString().slice(0, 16);
    setAssignmentDeadline(dateStr);
    setIsAssignmentOpen(true);
  };

  const handleDeleteAssignment = async (assignId) => {
    if (!window.confirm('Yakin ingin menghapus tugas ini beserta seluruh pengumpulan tugas siswa?')) return;
    try {
      await assignmentService.deleteAssignment(assignId);
      toast.success('Tugas berhasil dihapus.');
      fetchAssignments();
    } catch (err) {
      console.error('Error deleting assignment:', err);
      toast.error('Gagal menghapus tugas.');
    }
  };

  // Handle Grading
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
      toast.success('Nilai dan umpan balik berhasil disimpan!');
      setGradingSubmission(null);
      fetchSubmissions();
    } catch (err) {
      console.error('Error grading submission:', err);
      toast.error(err.response?.data?.message || 'Gagal menyimpan nilai.');
    } finally {
      setIsSavingGrade(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat ruang kelas..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Class Header */}
      <div>
        <Link
          to="/teacher/classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-primary mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Daftar Kelas
        </Link>
        <div className="bg-surface rounded-2xl p-6 border border-slate-200/80 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Ruang Kelas #{classId}</span>
            </div>
            <h2 className="text-2xl font-bold text-textPrimary tracking-tight mt-1">
              {classInfo?.name || `Kelas #${classId}`}
            </h2>
            <p className="text-xs text-textSecondary mt-0.5">Pengampu: {classInfo?.teacher_name || 'Guru'}</p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'materials' && (
              <Button variant="primary" icon={Upload} onClick={() => setIsUploadOpen(true)}>
                Upload Materi
              </Button>
            )}
            {activeTab === 'assignments' && (
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => {
                  setEditingAssignment(null);
                  setAssignmentTitle('');
                  setAssignmentDeadline('');
                  setIsAssignmentOpen(true);
                }}
              >
                Buat Tugas Baru
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'materials'
              ? 'border-primary text-primary'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Materi Pembelajaran ({materials.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'assignments'
              ? 'border-primary text-primary'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tugas & Deadline ({assignments.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'students'
              ? 'border-primary text-primary'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Siswa Terdaftar ({students.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('submissions')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${
            activeTab === 'submissions'
              ? 'border-primary text-primary'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Pengumpulan & Penilaian ({submissions.length})</span>
        </button>
      </div>

      {/* Tab 1: Materials */}
      {activeTab === 'materials' && (
        <div>
          {materials.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-textPrimary">Belum Ada Materi</h3>
              <p className="text-sm text-textSecondary mt-1 max-w-sm mx-auto mb-6">
                Unggah dokumen PDF, presentasi, atau berkas modul pembelajaran untuk para siswa Anda.
              </p>
              <Button variant="primary" icon={Upload} onClick={() => setIsUploadOpen(true)}>
                Upload Materi Pertama
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((m) => (
                <Card key={m.material_id || m.id} hoverEffect className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5 overflow-hidden">
                    <div className="p-3 bg-indigo-50 text-primary rounded-xl flex-shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-textPrimary truncate">
                        {m.material_title || m.title || m.file_url}
                      </h4>
                      <p className="text-xs text-textSecondary truncate mt-0.5">Berkas: {m.file_url}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Diunggah: {m.uploaded_at ? new Date(m.uploaded_at).toLocaleString('id-ID') : '-'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Download}
                    onClick={() => handleDownloadMaterial(m.file_url, m.material_title)}
                  >
                    Unduh
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Assignments */}
      {activeTab === 'assignments' && (
        <div>
          {assignments.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-textPrimary">Belum Ada Tugas</h3>
              <p className="text-sm text-textSecondary mt-1 max-w-sm mx-auto mb-6">
                Buat tugas baru lengkap dengan instruksi dan batas waktu pengumpulan tugas.
              </p>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => {
                  setEditingAssignment(null);
                  setAssignmentTitle('');
                  setAssignmentDeadline('');
                  setIsAssignmentOpen(true);
                }}
              >
                Buat Tugas Baru
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assign) => {
                const isOverdue = new Date(assign.deadline) < new Date();
                return (
                  <Card key={assign.id} hoverEffect className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-textPrimary">{assign.title}</h4>
                        <Badge variant={isOverdue ? 'error' : 'warning'}>
                          {isOverdue ? 'Deadline Berakhir' : 'Aktif'}
                        </Badge>
                      </div>
                      <p className="text-xs text-textSecondary flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Batas Waktu: {new Date(assign.deadline).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit2}
                        onClick={() => handleOpenEditAssignment(assign)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        className="text-error hover:bg-rose-50"
                        onClick={() => handleDeleteAssignment(assign.id)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Enrolled Students */}
      {activeTab === 'students' && (
        <Card>
          <Table
            columns={[
              { header: 'NIM', accessor: 'nim', className: 'font-mono text-xs font-semibold' },
              {
                header: 'Nama Siswa',
                accessor: 'name',
                render: (s) => (
                  <div>
                    <p className="font-semibold text-textPrimary">{s.name}</p>
                    <p className="text-xs text-textSecondary">{s.email}</p>
                  </div>
                ),
              },
              { header: 'Jurusan', accessor: 'jurusan' },
              {
                header: 'Tanggal Bergabung',
                accessor: 'enrolled_at',
                render: (s) => (
                  <span className="text-xs text-textSecondary">
                    {s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString('id-ID') : '-'}
                  </span>
                ),
              },
            ]}
            data={students}
            emptyMessage="Belum ada siswa yang mendaftar di kelas ini."
          />
        </Card>
      )}

      {/* Tab 4: Submissions & Grading */}
      {activeTab === 'submissions' && (
        <Card>
          <Table
            columns={[
              {
                header: 'Nama Siswa',
                accessor: 'student_name',
                render: (sub) => (
                  <div>
                    <p className="font-semibold text-textPrimary">{sub.student_name}</p>
                    <p className="text-[11px] text-textSecondary">ID Siswa: #{sub.student_id}</p>
                  </div>
                ),
              },
              {
                header: 'Waktu Kumpul',
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
            ]}
            data={submissions}
            emptyMessage="Belum ada siswa yang mengumpulkan tugas di kelas ini."
          />
        </Card>
      )}

      {/* Modal Upload Material */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Unggah Materi Pembelajaran"
        description="Pilih berkas dokumen (PDF, Word, Excel, Gambar) untuk dibagikan ke siswa."
      >
        <form onSubmit={handleUploadMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Judul Materi (Opsional)
            </label>
            <input
              type="text"
              value={materialTitle}
              onChange={(e) => setMaterialTitle(e.target.value)}
              placeholder="Contoh: Modul 1 - Pengenalan Graf"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
            />
          </div>

          <FileUploadInput
            label="Berkas Materi"
            file={materialFile}
            onChange={setMaterialFile}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isUploading}>
              Unggah Sekarang
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Buat / Edit Assignment */}
      <Modal
        isOpen={isAssignmentOpen}
        onClose={() => setIsAssignmentOpen(false)}
        title={editingAssignment ? 'Edit Tugas' : 'Buat Tugas Baru'}
      >
        <form onSubmit={handleSaveAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Judul Tugas
            </label>
            <input
              type="text"
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              placeholder="Contoh: Tugas 1: Implementasi Binary Tree"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Batas Waktu Pengumpulan (Deadline)
            </label>
            <input
              type="datetime-local"
              value={assignmentDeadline}
              onChange={(e) => setAssignmentDeadline(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setIsAssignmentOpen(false)} disabled={isSavingAssignment}>
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSavingAssignment}>
              {editingAssignment ? 'Perbarui Tugas' : 'Buat Tugas'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Grading */}
      <Modal
        isOpen={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
        title="Penilaian Pengumpulan Tugas"
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
              Nilai Angka (Rentang: 0 - 100)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={gradeValue}
              onChange={(e) => setGradeValue(e.target.value)}
              placeholder="Contoh: 85.5"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-textPrimary uppercase tracking-wider mb-1.5">
              Catatan Evaluasi / Feedback Guru
            </label>
            <textarea
              rows={3}
              value={feedbackValue}
              onChange={(e) => setFeedbackValue(e.target.value)}
              placeholder="Tuliskan umpan balik atau saran perbaikan untuk siswa..."
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
