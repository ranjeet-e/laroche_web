import { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, saveAuthData, logout as logoutService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage only if both user AND token exist
    const storedUser = getCurrentUser();
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(storedUser);
    } else {
      // Clear inconsistent state
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

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isStudent, isKitchen }}>
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
