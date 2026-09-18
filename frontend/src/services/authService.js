
import api from './api';

export const sendOtp = async ({ phone, mode }) => {
  const response = await api.post('/auth/send-otp', { phone, mode });
  return response.data;
};

export const verifyOtp = async ({ phone, otp, name }) => {
  const response = await api.post('/auth/verify-otp', { phone, otp, name });
  return response.data;
};

export const signup = async ({ name, phone, email, password, role }) => {
  const response = await api.post('/auth/signup', { name, phone, email, password, role });
  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const googleLogin = async ({ credential }) => {
  const response = await api.post('/auth/google', { credential });
  return response.data;
};

export const forgotPassword = async ({ email }) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const verifyResetOtp = async ({ email, otp }) => {
  const response = await api.post('/auth/verify-reset-otp', { email, otp });
  return response.data;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const response = await api.post('/auth/reset-password', { email, otp, newPassword });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const saveAuthData = ({ token, user }) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

