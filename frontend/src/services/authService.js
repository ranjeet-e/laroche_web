
import api from './api';

export const sendOtp = async ({ phone }) => {
  const response = await api.post('/auth/send-otp', { phone });
  return response.data;
};

export const verifyOtp = async ({ phone, otp, name }) => {
  const response = await api.post('/auth/verify-otp', { phone, otp, name });
  return response.data;
};

export const signup = async ({ name, email, password, role }) => {
  const response = await api.post('/auth/signup', { name, email, password, role });
  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await api.post('/auth/login', { email, password });
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
