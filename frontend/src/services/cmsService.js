import api from './api';

// Stats & Overview
export const getStats = async () => {
  const response = await api.get('/cms/stats');
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/cms/categories');
  return response.data;
};

// Menu Item Operations
export const getMenuItems = async (params = {}) => {
  const response = await api.get('/cms/menu', { params });
  return response.data;
};

export const getMenuItem = async (id) => {
  const response = await api.get(`/cms/menu/${id}`);
  return response.data;
};

export const createMenuItem = async (itemData) => {
  const response = await api.post('/cms/menu', itemData);
  return response.data;
};

export const updateMenuItem = async (id, itemData) => {
  const response = await api.put(`/cms/menu/${id}`, itemData);
  return response.data;
};

export const toggleMenuItemAvailability = async (id) => {
  const response = await api.patch(`/cms/menu/${id}/toggle`);
  return response.data;
};

export const deleteMenuItem = async (id) => {
  const response = await api.delete(`/cms/menu/${id}`);
  return response.data;
};

// Banners & Promos
export const getBanners = async () => {
  const response = await api.get('/cms/banners');
  return response.data;
};

export const createBanner = async (bannerData) => {
  const response = await api.post('/cms/banners', bannerData);
  return response.data;
};

export const updateBanner = async (id, bannerData) => {
  const response = await api.put(`/cms/banners/${id}`, bannerData);
  return response.data;
};

export const toggleBanner = async (id) => {
  const response = await api.patch(`/cms/banners/${id}/toggle`);
  return response.data;
};

export const deleteBanner = async (id) => {
  const response = await api.delete(`/cms/banners/${id}`);
  return response.data;
};

// Cafe Settings & Announcements
export const getSettings = async () => {
  const response = await api.get('/cms/settings');
  return response.data;
};

export const updateSetting = async (key, value) => {
  const response = await api.put('/cms/settings', { key, value });
  return response.data;
};

// Image Upload Helper
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
