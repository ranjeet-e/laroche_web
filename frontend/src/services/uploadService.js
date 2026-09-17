import api from './api';

/**
 * Upload an image file directly via in-house CMS media engine
 * @param {File} file - Image file object from <input type="file">
 * @param {string} folder - Optional folder/category name
 * @returns {Promise<{ url: string, filename: string, provider: string }>}
 */
export const uploadImage = async (file, folder = 'laroche_cafe/menu_items') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);

  try {
    const response = await api.post('/cms/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (err) {
    // Fallback to /upload/image if needed
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
