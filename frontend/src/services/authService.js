
import api from './api';

export const signup = async ({ name, email, password }) => {
  const response = await api.post('/auth/signup', { name, email, password });
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
