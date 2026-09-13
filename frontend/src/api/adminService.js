import api from './axiosInstance';

export const adminService = {
  /**
   * Mengambil daftar teacher berdasarkan status verifikasi
   * @param {'pending' | 'approved' | 'rejected'} status (Wajib)
   * Response: { success: true, data: [...] }
   */
  async getTeachers(status = 'pending') {
    const response = await api.get('/admin/teachers', {
      params: { status },
    });
    return response.data;
  },

  /**
   * Menyetujui akun teacher
   * @param {number} userId - ID user teacher
   * Response: { success: true, message: "teacher success approved" }
   */
  async approveTeacher(userId) {
    const response = await api.patch(`/admin/teachers/${userId}/approve`);
    return response.data;
  },

  /**
   * Menolak akun teacher
   * @param {number} userId - ID user teacher
   * Response: { success: true, message: "teacher success rejected" }
   */
  async rejectTeacher(userId) {
    const response = await api.patch(`/admin/teachers/${userId}/reject`);
    return response.data;
  },
};
