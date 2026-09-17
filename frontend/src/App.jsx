import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { useState, useEffect } from 'react';
import IntroVideo from './components/IntroVideo';
import SiteLock from './components/SiteLock';
import AddToHomeScreen from './components/AddToHomeScreen';
import Auth from './pages/Auth';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import KitchenLogin from './pages/kitchen/KitchenLogin';
import CmsLogin from './pages/cms/CmsLogin';
import CmsDashboard from './pages/cms/CmsDashboard';

import { theme } from './theme.ts';

// Decides where "/" should redirect to based on auth state
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="route-loading">Loading...</div>;

  if (user?.role === 'kitchen') return <Navigate to="/kitchen/dashboard" replace />;
  if (user?.role === 'cms' || user?.role === 'admin') return <Navigate to="/cms/dashboard" replace />;
  return <Navigate to="/menu" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <AddToHomeScreen />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Auth initialMode="login" />} />
        <Route path="/signup" element={<Auth initialMode="signup" />} />
        <Route path="/kitchen/login" element={<KitchenLogin />} />
        <Route path="/cms/login" element={<CmsLogin />} />

        {/* Student-only routes */}
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <OrderHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <OrderTracking />
            </ProtectedRoute>
          }
        />

        {/* Kitchen-only route */}
        <Route
          path="/kitchen/dashboard"
          element={
            <ProtectedRoute allowedRoles={['kitchen']}>
              <KitchenDashboard />
            </ProtectedRoute>
          }
        />

        {/* CMS-only route */}
        <Route
          path="/cms/dashboard"
          element={
            <ProtectedRoute allowedRoles={['cms', 'admin']}>
              <CmsDashboard />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

const App = () => {
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('introShown');
  });

  // 1-Hour Inactivity Reset: if site closed for > 1 hour, reset session
  useEffect(() => {
    const lastActive = localStorage.getItem('laroche_last_active');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (lastActive && now - parseInt(lastActive, 10) > oneHour) {
      sessionStorage.removeItem('introShown');
      sessionStorage.removeItem('pwa_dismissed');
      setShowIntro(true);
    }

    localStorage.setItem('laroche_last_active', String(now));

    const updateActivity = () => {
      localStorage.setItem('laroche_last_active', String(Date.now()));
    };

    window.addEventListener('click', updateActivity, { passive: true });
    window.addEventListener('scroll', updateActivity, { passive: true });

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  const handleIntroFinish = () => {
    sessionStorage.setItem('introShown', 'true');
    setShowIntro(false);
  };

  return (
    <BrowserRouter>
      <SiteLock>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              {showIntro && <IntroVideo onFinish={handleIntroFinish} />}
              <AppRoutes />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </SiteLock>
    </BrowserRouter>
  );
};

export default App;