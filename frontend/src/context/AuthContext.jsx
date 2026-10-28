import { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, saveAuthData, logout as logoutService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage only if both user AND valid, unexpired token exist
    const storedUser = getCurrentUser();
    const storedToken = localStorage.getItem('token');

    let isValid = false;
    if (storedUser && storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp && payload.exp * 1000 > Date.now()) {
          isValid = true;
          setUser(storedUser);
        }
      } catch (e) {
        isValid = false;
      }
    }

    if (!isValid) {
      // Clear inconsistent or expired state proactively
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = ({ token, user }) => {
    saveAuthData({ token, user });
    setUser(user);
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  const isStudent = user?.role === 'student';
  const isKitchen = user?.role === 'kitchen';
  const isCms = user?.role === 'cms' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isStudent, isKitchen, isCms }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
