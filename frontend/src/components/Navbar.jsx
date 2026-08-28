import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isStudent, isKitchen } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState('');

  // Keep the search box in sync with the URL when on the Menu page
  useEffect(() => {
    if (location.pathname === '/menu') {
      setSearchValue(searchParams.get('q') || '');
    } else {
      setSearchValue('');
    }
  }, [location.pathname, searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/menu');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value.trim()) {
      navigate(`/menu?q=${encodeURIComponent(value)}`, { replace: true });
    } else {
      navigate('/menu', { replace: true });
    }
  };

  return (
    <>
      {/* Top App Header */}
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          <img src="/logo2.png" alt="La Roche Cafe Logo" className="navbar-logo" />
        </Link>

        {!isKitchen && (
          <div className="navbar-search-wrap">
            <span className="navbar-search-icon">🔍</span>
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search pizza, sandwich, coffee..."
              value={searchValue}
              onChange={handleSearchChange}
            />
            {searchValue && (
              <button
                type="button"
                className="navbar-search-clear"
                onClick={() => {
                  setSearchValue('');
                  navigate('/menu', { replace: true });
                }}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Desktop Navigation Links */}
        <div className="navbar-links desktop-nav">
          {!isKitchen && (
            <>
              <Link to="/menu" className={`nav-link ${location.pathname === '/menu' ? 'active' : ''}`}>
                Menu
              </Link>
              <Link to="/cart" className={`navbar-cart ${location.pathname === '/cart' ? 'active' : ''}`}>
                <span>Cart</span>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
              {isStudent && (
                <Link to="/orders" className={`nav-link ${location.pathname.startsWith('/orders') ? 'active' : ''}`}>
                  My Orders
                </Link>
              )}
            </>
          )}

          {isKitchen && (
            <>
              <Link to="/kitchen/dashboard" className="navbar-kitchen-active">
                👨‍🍳 Dashboard
              </Link>
              <Link to="/menu" className="navbar-customer-link">
                Customer Menu
              </Link>
            </>
          )}

          {user ? (
            <div className="navbar-user-wrap">
              <span className="navbar-user-pill" title={user.phone || user.email}>
                <span className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : '👤'}</span>
                <span className="user-name">{user.name?.split(' ')[0] || user.phone?.slice(-4) || 'User'}</span>
              </span>
              <button className="navbar-logout" onClick={handleLogout} title="Sign Out">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar-login">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Header Right Profile / Cart Button */}
        <div className="mobile-header-actions">
          {user ? (
            <button className="mobile-avatar-btn" onClick={handleLogout} title="Tap to Logout">
              <span className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : '👤'}</span>
            </button>
          ) : (
            <Link to="/login" className="mobile-login-pill">
              Sign In
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile App Bottom Navigation Bar */}
      {!isKitchen && (
        <div className="mobile-bottom-nav">
          <Link
            to="/menu"
            className={`bottom-nav-item ${location.pathname === '/menu' ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">🍽️</span>
            <span className="bottom-nav-label">Menu</span>
          </Link>

          <Link
            to="/orders"
            className={`bottom-nav-item ${location.pathname.startsWith('/orders') ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon">📋</span>
            <span className="bottom-nav-label">Orders</span>
          </Link>

          <Link
            to="/cart"
            className={`bottom-nav-item bottom-nav-cart ${location.pathname === '/cart' ? 'active' : ''}`}
          >
            <div className="bottom-cart-icon-wrap">
              <span className="bottom-nav-icon">🛒</span>
              {totalItems > 0 && <span className="bottom-cart-badge">{totalItems}</span>}
            </div>
            <span className="bottom-nav-label">Cart</span>
          </Link>

          {user ? (
            <button
              type="button"
              className="bottom-nav-item"
              onClick={handleLogout}
            >
              <span className="bottom-nav-icon">🚪</span>
              <span className="bottom-nav-label">Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className={`bottom-nav-item ${location.pathname === '/login' ? 'active' : ''}`}
            >
              <span className="bottom-nav-icon">👤</span>
              <span className="bottom-nav-label">Sign In</span>
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;