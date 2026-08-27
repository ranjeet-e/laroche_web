import { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, saveAuthData, logout as logoutService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on app load/refresh
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
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

  const isStudent = user?.role === 'student';
  const isKitchen = user?.role === 'kitchen';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isStudent, isKitchen }}>
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
