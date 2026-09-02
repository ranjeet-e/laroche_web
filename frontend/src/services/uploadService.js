import api from './api';

/**
 * Upload an image file directly to Cloudinary via backend API
 * @param {File} file - Image file object from <input type="file">
 * @param {string} folder - Optional folder name in Cloudinary
 * @returns {Promise<{ url: string, publicId: string, width: number, height: number, format: string }>}
 */
export const uploadImage = async (file, folder = 'laroche_cafe/menu_items') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};
