import api from './axiosInstance';

export const authService = {
  /**
   * Mendaftarkan pengguna baru (student / teacher)
   * Student payload: { name, email, password, role: 'student', nim, jurusan }
   * Teacher payload: { name, email, password, role: 'teacher' }
   */
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login pengguna
   * Payload: { email, password }
   * Mengembalikan: { message: "Login successful", token: "..." }
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Mengambil detail profil user yang sedang login
   * Catatan Known Issue Backend:
   * Endpoint GET /api/auth/me berpotensi hanging jika role = 'admin' karena
   * backend belum menangani role selain student & teacher di AuthController.me.
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Mengunggah / mengubah foto profil pengguna
   * @param {FormData} formData - Memuat field 'avatar'
   */
  async updateAvatar(formData) {
    const response = await api.patch('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
