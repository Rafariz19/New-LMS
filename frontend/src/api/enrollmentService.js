import api from './axiosInstance';

export const enrollmentService = {
  /**
   * Mendaftarkan siswa ke kelas dengan mencocokkan nama kelas dan kode kelas
   * @param {{ name: string, code: string }} payload
   * Response: { message: "Enroll successfully" }
   */
  async enroll({ name, code }) {
    const response = await api.post('/students/enroll', { name, code });
    return response.data;
  },

  /**
   * Membatalkan pendaftaran siswa dari kelas tertentu
   * @param {number} classId
   * Response: { message: "Unenroll successfully" }
   */
  async unenroll(classId) {
    const response = await api.delete(`/students/unenroll/${classId}`);
    return response.data;
  },

  /**
   * Menampilkan seluruh siswa yang terdaftar di kelas tertentu
   * @param {number} classId
   * Response: { success: true, data: [...] }
   */
  async getClassStudents(classId) {
    const response = await api.get(`/students/list/${classId}`);
    return response.data;
  },
};
