import api from './axiosInstance';

export const classService = {
  /**
   * Mengambil daftar seluruh kelas (respon dinamis sesuai role pemanggil):
   * - Student: semua kelas dengan kolom is_enrolled (1 / 0)
   * - Teacher: seluruh kelas yang diampu
   * - Admin: seluruh baris kelas di sistem
   * Response: { success: true, data: [...] }
   */
  async getClasses() {
    const response = await api.get('/classes/list');
    return response.data;
  },

  /**
   * Mengambil daftar kelas yang diikuti oleh siswa yang sedang login (student only)
   * Response: { success: true, data: [...] }
   */
  async getMyClasses() {
    const response = await api.get('/classes/myclasses');
    return response.data;
  },

  /**
   * Membuat kelas baru (teacher only, status approved)
   * @param {{ name: string, code: string }} payload
   * Response: { message: "Create class successfully" }
   */
  async createClass({ name, code }) {
    const response = await api.post('/classes/create', { name, code });
    return response.data;
  },

  /**
   * Mengubah nama kelas (teacher only)
   * @param {number} classId
   * @param {{ name: string }} payload
   * Response: { message: "Update class successfully" }
   */
  async updateClass(classId, { name }) {
    const response = await api.patch(`/classes/${classId}`, { name });
    return response.data;
  },

  /**
   * Menghapus kelas (teacher only - cascade delete entitas anak)
   * @param {number} classId
   * Response: { message: "Delete class successfully" }
   */
  async deleteClass(classId) {
    const response = await api.delete(`/classes/${classId}`);
    return response.data;
  },
};
