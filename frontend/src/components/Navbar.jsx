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
            placeholder="Search pizza, sandwich, maggi, coffee..."
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

      <div className="navbar-links">
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
            <span className="navbar-user-pill" title={user.email}>
              <span className="user-avatar">{user.name ? user.name.charAt(0).toUpperCase() : '👤'}</span>
              <span className="user-name">{user.name?.split(' ')[0]}</span>
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
    </nav>
  );
};

export default Navbar;