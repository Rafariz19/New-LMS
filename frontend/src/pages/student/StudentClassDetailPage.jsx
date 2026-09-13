import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Download,
  UploadCloud,
  Clock,
  FileCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { materialService } from '../../api/materialService';
import { assignmentService } from '../../api/assignmentService';
import { submissionService } from '../../api/submissionService';
import { classService } from '../../api/classService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import FileUploadInput from '../../components/common/FileUploadInput';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function StudentClassDetailPage() {
  const { id: classId } = useParams();
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'assignments'
  const [classInfo, setClassInfo] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissionsMap, setSubmissionsMap] = useState({}); // assignmentId -> submission object
  const [isLoading, setIsLoading] = useState(true);

  // Submit Modal States
  const [submitAssignment, setSubmitAssignment] = useState(null);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClassData = async () => {
    setIsLoading(true);
    try {
      // 1. Get class info
      const myClassesRes = await classService.getMyClasses();
      const current = (myClassesRes.data || []).find((c) => String(c.id) === String(classId));
      if (current) setClassInfo(current);

      // 2. Get materials
      const mats = await materialService.getClassMaterials(classId);
      setMaterials(mats || []);

      // 3. Get assignments
      const assignsRes = await assignmentService.getStudentAssignments(classId);
      const assignList = assignsRes.data || [];
      setAssignments(assignList);

      // 4. For each assignment, fetch student's submission
      const map = {};
      await Promise.all(
        assignList.map(async (assign) => {
          try {
            const subRes = await submissionService.getMySubmissionForAssignment(assign.id);
            if (subRes.data && subRes.data.length > 0) {
              map[assign.id] = subRes.data[0];
            }
          } catch (_err) {
            // Ignored if no submission yet
          }
        })
      );
      setSubmissionsMap(map);
    } catch (err) {
      console.error('Error fetching student class data:', err);
      toast.error('Gagal memuat data kelas.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
  }, [classId]);

  const handleDownloadMaterial = async (filename, title) => {
    try {
      toast.loading('Mengunduh materi...', { id: 'down-mat' });
      await materialService.downloadMaterial(filename, title || filename);
      toast.success('Materi berhasil diunduh!', { id: 'down-mat' });
    } catch (err) {
      console.error('Download error:', err);
      toast.error('Gagal mengunduh berkas materi.', { id: 'down-mat' });
    }
  };

  const handleOpenSubmit = (assign) => {
    setSubmitAssignment(assign);
    setSubmissionFile(null);
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionFile) {
      toast.error('Pilih berkas tugas Anda terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      // WAJIB: FormData field name adalah 'file_url' sesuai dokumentasi backend!
      const formData = new FormData();
      formData.append('file_url', submissionFile);

      await submissionService.submitAssignment(submitAssignment.id, formData);
      toast.success('Tugas berhasil dikumpulkan!');
      setSubmitAssignment(null);
      setSubmissionFile(null);

      // Refresh data
      fetchClassData();
    } catch (err) {
      console.error('Error submitting assignment:', err);
      const msg = err.response?.data?.message || 'Gagal mengumpulkan tugas.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Memuat ruang kelas & modul..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Class Banner */}
      <div>
        <Link
          to="/student/my-classes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-textSecondary hover:text-primary mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Kelas Saya
        </Link>
        <div className="bg-surface rounded-2xl p-6 border border-slate-200/80 shadow-subtle">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Ruang Kelas #{classId}</span>
          <h2 className="text-2xl font-bold text-textPrimary tracking-tight mt-1">
            {classInfo?.name || `Kelas #${classId}`}
          </h2>
          <p className="text-xs text-textSecondary mt-1">
            Akses seluruh berkas modul ajar dan kumpulkan berkas jawaban tugas Anda tepat waktu.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('materials')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'materials'
              ? 'border-primary text-primary'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Materi Kuliah ({materials.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('assignments')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'assignments'
              ? 'border-primary text-primary'
              : 'border-transparent text-textSecondary hover:text-textPrimary'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Tugas & Pengumpulan ({assignments.length})</span>
        </button>
      </div>

      {/* Tab 1: Materials */}
      {activeTab === 'materials' && (
        <div>
          {materials.length === 0 ? (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-textPrimary">Belum Ada Materi</h3>
              <p className="text-sm text-textSecondary mt-1 max-w-sm mx-auto">
                Guru/dosen belum mengunggah materi modul pembelajaran di kelas ini.
              </p>
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
                        Pengampu: {m.teacher_name || 'Dosen'} • Diunggah:{' '}
                        {m.uploaded_at ? new Date(m.uploaded_at).toLocaleDateString('id-ID') : '-'}
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
              <h3 className="text-base font-bold text-textPrimary">Tidak Ada Tugas Aktif</h3>
              <p className="text-sm text-textSecondary mt-1 max-w-sm mx-auto">
                Belum ada tugas yang diberikan oleh pengajar pada ruang kelas ini.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {assignments.map((assign) => {
                const submission = submissionsMap[assign.id];
                const isOverdue = new Date(assign.deadline) < new Date();
                const isSubmitted = !!submission;

                return (
                  <Card key={assign.id} className="p-6 overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-bold text-textPrimary">{assign.title}</h4>
                          <Badge variant={isSubmitted ? 'success' : isOverdue ? 'error' : 'warning'}>
                            {isSubmitted ? 'Sudah Dikumpulkan' : isOverdue ? 'Terlambat' : 'Belum Kumpul'}
                          </Badge>
                        </div>
                        <p className="text-xs text-textSecondary flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            Deadline:{' '}
                            {new Date(assign.deadline).toLocaleString('id-ID', {
                              dateStyle: 'full',
                              timeStyle: 'short',
                            })}
                          </span>
                        </p>
                      </div>

                      <div>
                        <Button
                          variant={isSubmitted ? 'outline' : 'primary'}
                          icon={UploadCloud}
                          onClick={() => handleOpenSubmit(assign)}
                        >
                          {isSubmitted ? 'Upload Ulang (Revisi)' : 'Kumpulkan Tugas'}
                        </Button>
                      </div>
                    </div>

                    {/* Submission Details Card if already submitted */}
                    {isSubmitted && (
                      <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span className="font-semibold text-textPrimary flex items-center gap-1.5">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            <span>Berkas Jawaban: <strong className="font-mono text-primary">{submission.file_url}</strong></span>
                          </span>
                          <span className="text-textSecondary">
                            Diserahkan pada:{' '}
                            {submission.submitted_at
                              ? new Date(submission.submitted_at).toLocaleString('id-ID')
                              : '-'}
                          </span>
                        </div>

                        {/* Grading Box */}
                        <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <span className="text-xs font-semibold text-textSecondary block">Status Penilaian:</span>
                            {submission.grade !== null && submission.grade !== undefined ? (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-lg font-extrabold text-success font-mono bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                                  {submission.grade} / 100
                                </span>
                                {submission.feedback && (
                                  <p className="text-xs text-textSecondary italic">
                                    Catatan Guru: "{submission.feedback}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs font-medium text-warning mt-1 block">
                                Sedang diperiksa oleh guru (Belum dinilai)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Submit / Resubmit Assignment */}
      <Modal
        isOpen={!!submitAssignment}
        onClose={() => setSubmitAssignment(null)}
        title={
          submissionsMap[submitAssignment?.id]
            ? 'Kumpulkan Ulang Berkas Tugas (Revisi)'
            : 'Kumpulkan Berkas Tugas'
        }
        description={`Tugas: ${submitAssignment?.title}`}
      >
        <form onSubmit={handleSubmitWork} className="space-y-4">
          <FileUploadInput
            label="Berkas Jawaban Tugas"
            file={submissionFile}
            onChange={setSubmissionFile}
            required
            helperText="Format: PDF, Word, Excel, Gambar. Maksimal 10MB."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={() => setSubmitAssignment(null)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Kirim Jawaban
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
