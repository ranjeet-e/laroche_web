import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import { useState } from 'react';
import IntroVideo from './components/IntroVideo';
import Auth from './pages/Auth';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import KitchenDashboard from './pages/kitchen/KitchenDashboard';

import { theme } from './theme.ts';

// Decides where "/" should redirect to based on auth state
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="route-loading">Loading...</div>;

  if (user?.role === 'kitchen') return <Navigate to="/kitchen/dashboard" replace />;
  return <Navigate to="/menu" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Auth initialMode="login" />} />
        <Route path="/signup" element={<Auth initialMode="signup" />} />

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

  const handleIntroFinish = () => {
    sessionStorage.setItem('introShown', 'true');
    setShowIntro(false);
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          {showIntro && <IntroVideo onFinish={handleIntroFinish} />}
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;