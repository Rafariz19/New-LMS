import api from './axiosInstance';

export const submissionService = {
  /**
   * Siswa mengunggah berkas jawaban tugas (submit / resubmit upsert)
   * @param {number} assignmentId
   * @param {FormData} formData - WAJIB memuat field 'file_url' (Bukan 'file'!)
   * Response: { message: "Submissions created successfully" }
   */
  async submitAssignment(assignmentId, formData) {
    const response = await api.post(`/submissions/student/${assignmentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Siswa melihat data pengumpulan tugas miliknya pada tugas tertentu
   * @param {number} assignmentId
   * Response: { success: true, data: [...] }
   */
  async getMySubmissionForAssignment(assignmentId) {
    const response = await api.get(`/submissions/student/list/${assignmentId}`);
    return response.data;
  },

  /**
   * Siswa melihat seluruh riwayat pengumpulan tugas di semua kelas
   * Response: { success: true, data: [...] }
   */
  async getMyAllSubmissions() {
    const response = await api.get('/submissions/mysubmissions');
    return response.data;
  },

  /**
   * Guru melihat seluruh pengumpulan tugas di suatu kelas
   * CATATAN PENTING:
   * Sesuai dokumentasi backend, parameter URL :id di endpoint /api/submissions/teacher/:id
   * sebenarnya adalah class_id (bukan assignment_id).
   * @param {number} classId
   * Response: { success: true, data: [...] }
   */
  async getTeacherSubmissions(classId) {
    const response = await api.get(`/submissions/teacher/${classId}`);
    return response.data;
  },

  /**
   * Guru memberikan nilai dan feedback pada pengumpulan tugas
   * @param {number} submissionId
   * @param {{ grade: number, feedback?: string }} payload - grade harus 0 s/d 100
   * Response: { message: "Grade updated successfully", data: {...} }
   */
  async gradeSubmission(submissionId, { grade, feedback }) {
    const response = await api.patch(`/submissions/teacher/grade/${submissionId}`, {
      grade: Number(grade),
      feedback: feedback || '',
    });
    return response.data;
  },
};
