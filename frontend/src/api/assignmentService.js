import api from './axiosInstance';

export const assignmentService = {
  /**
   * Guru membuat tugas baru pada suatu kelas
   * @param {number} classId
   * @param {{ title: string, deadline: string }} payload - format deadline: 'YYYY-MM-DD HH:mm:ss'
   * Response: { message: "Assignment created successfully" }
   */
  async createAssignment(classId, { title, deadline }) {
    const response = await api.post(`/assignments/${classId}`, { title, deadline });
    return response.data;
  },

  /**
   * Mengambil seluruh tugas dalam kelas untuk guru
   * @param {number} classId
   * Response: { success: true, data: [...] }
   */
  async getTeacherAssignments(classId) {
    const response = await api.get(`/assignments/teacher/${classId}`);
    return response.data;
  },

  /**
   * Mengambil seluruh tugas dalam kelas untuk murid ter-enroll
   * @param {number} classId
   * Response: { success: true, data: [...] }
   */
  async getStudentAssignments(classId) {
    const response = await api.get(`/assignments/student/${classId}`);
    return response.data;
  },

  /**
   * Guru memperbarui judul & deadline tugas
   * @param {number} assignmentId
   * @param {{ title: string, deadline: string }} payload
   * Response: { success: true, message: "Update assignment successfully", data: {...} }
   */
  async updateAssignment(assignmentId, { title, deadline }) {
    const response = await api.patch(`/assignments/update/${assignmentId}`, { title, deadline });
    return response.data;
  },

  /**
   * Guru menghapus tugas
   * @param {number} assignmentId
   * Response: { success: true, message: "Delete assignment successfully" }
   */
  async deleteAssignment(assignmentId) {
    const response = await api.delete(`/assignments/delete/${assignmentId}`);
    return response.data;
  },
};
