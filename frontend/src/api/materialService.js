import api from './axiosInstance';

export const materialService = {
  /**
   * Mengunggah file materi kelas (teacher only)
   * @param {number} classId - ID Kelas
   * @param {FormData} formData - Harus memuat field 'file' (Binary) dan opsional 'title'
   * Response: { success: true, message: "Material added successfully", data: { id, title, file_url } }
   */
  async uploadMaterial(classId, formData) {
    const response = await api.post(`/materials/${classId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Mengambil daftar materi pada suatu kelas
   * Catatan Known Quirk Backend:
   * Endpoint GET /api/materials/class/:id mengembalikan array langsung [...]
   * (bukan dibungkus { success, data }), dinormalisasi agar selalu berupa array.
   */
  async getClassMaterials(classId) {
    const response = await api.get(`/materials/class/${classId}`);
    // Normalisasi format respons
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    return [];
  },

  /**
   * Mengunduh berkas materi secara aman dengan header Authorization
   * @param {string} filename - Nama unik file di backend
   * @param {string} [downloadName] - Nama file yang akan tersimpan di perangkat pengguna
   */
  async downloadMaterial(filename, downloadName) {
    const response = await api.get(`/materials/download/${encodeURIComponent(filename)}`, {
      responseType: 'blob',
    });

    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', downloadName || filename);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  },
};
