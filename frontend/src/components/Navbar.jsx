import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, X, ShoppingBag, Clock, User, LogOut, UtensilsCrossed, ChefHat, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isStudent, isKitchen } = useAuth();
  const { totalItems } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [searchValue, setSearchValue] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Keep search in sync with query parameter
  useEffect(() => {
    if (location.pathname === '/menu') {
      setSearchValue(searchParams.get('q') || '');
    } else {
      setSearchValue('');
    }
  }, [location.pathname, searchParams]);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/menu');
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
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

  const clearSearch = () => {
    setSearchValue('');
    navigate('/menu', { replace: true });
  };

  return (
    <>
      {/* Pinned Frosted Glass Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full h-[72px] bg-[#FAF7F2]/90 dark:bg-[#14100E]/95 backdrop-blur-md border-b border-stone-200/60 dark:border-stone-800/80 px-4 sm:px-6 transition-colors duration-300">
        <div className="max-w-7xl h-full mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo & Live Counter */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo2.png"
                alt="La Roche Cafe"
                className="h-11 w-auto object-contain mix-blend-multiply dark:mix-blend-screen dark:brightness-110 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }}
              />
            </Link>

            {/* Live Counter Badge */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700/70 text-espresso dark:text-stone-200 text-xs font-semibold shadow-warm-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Clock className="w-3 h-3 text-taupe dark:text-stone-400 ml-0.5" />
              <span>Wait: <strong>~8 mins</strong></span>
            </div>
          </div>

          {/* Search Bar (Menu Page & Public) */}
          {!isKitchen && (
            <div className="flex-1 max-w-md relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-taupe dark:text-stone-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  className="w-full h-10 pl-10 pr-9 rounded-full bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-espresso dark:text-stone-100 placeholder:text-taupe-light dark:placeholder:text-stone-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 shadow-warm-sm transition-all duration-200"
                  placeholder="Search toasties, pizzas, frappes, coffee..."
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 text-taupe hover:text-espresso dark:text-stone-400 dark:hover:text-stone-200 p-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Desktop Right Links */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {!isKitchen ? (
              <>
                <Link
                  to="/menu"
                  className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${
                    location.pathname === '/menu'
                      ? 'bg-espresso dark:bg-stone-100 text-white dark:text-stone-900 shadow-warm-sm'
                      : 'text-taupe dark:text-stone-300 hover:text-espresso dark:hover:text-white hover:bg-white/60 dark:hover:bg-stone-800/60'
                  }`}
                >
                  Menu
                </Link>

                {isStudent && (
                  <Link
                    to="/orders"
                    className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${
                      location.pathname.startsWith('/orders')
                        ? 'bg-espresso dark:bg-stone-100 text-white dark:text-stone-900 shadow-warm-sm'
                        : 'text-taupe dark:text-stone-300 hover:text-espresso dark:hover:text-white hover:bg-white/60 dark:hover:bg-stone-800/60'
                    }`}
                  >
                    My Orders
                  </Link>
                )}

                <Link
                  to="/cart"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    location.pathname === '/cart'
                      ? 'bg-terracotta text-white shadow-glow-terracotta'
                      : 'bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-espresso dark:text-stone-200 shadow-warm-sm hover:border-terracotta hover:text-terracotta'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="w-5 h-5 rounded-full bg-terracotta text-white text-xs flex items-center justify-center font-extrabold shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/kitchen/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-terracotta text-white text-sm font-bold shadow-glow-terracotta"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Kitchen Dashboard</span>
                </Link>
                <Link
                  to="/menu"
                  className="px-3.5 py-2 rounded-full text-sm font-bold text-taupe dark:text-stone-300 hover:text-espresso dark:hover:text-white hover:bg-white/60 dark:hover:bg-stone-800/60"
                >
                  Customer Menu
                </Link>
              </>
            )}

            {/* Dark / Light Mode Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-full border border-stone-200/80 dark:border-stone-700 bg-white/80 dark:bg-stone-800 text-espresso dark:text-amber-300 shadow-warm-sm hover:scale-105 active:scale-95 transition-all"
              title={isDark ? 'Switch to Warm Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-stone-700">
                <Link
                  to={isKitchen ? '/kitchen/dashboard' : '/orders'}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 shadow-warm-sm text-xs font-bold text-espresso dark:text-stone-200 hover:border-terracotta transition-colors"
                  title={user.email || user.phone || 'My Account'}
                >
                  <div className="w-6 h-6 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-extrabold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{user.name?.split(' ')[0] || user.phone?.slice(-4) || 'User'}</span>
                </Link>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="p-2 rounded-full text-taupe hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-espresso dark:bg-stone-100 hover:bg-espresso-light text-white dark:text-stone-900 text-sm font-bold shadow-warm-sm transition-all"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Right Action */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-stone-200/80 dark:border-stone-700 bg-white/80 dark:bg-stone-800 text-espresso dark:text-amber-300 shadow-warm-sm transition-all"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {!isKitchen && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-espresso dark:text-stone-200 shadow-warm-sm"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-terracotta text-white text-[10px] flex items-center justify-center font-extrabold shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to={isKitchen ? '/kitchen/dashboard' : '/orders'}
                  className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-xs border border-terracotta/20 shadow-warm-sm active:scale-95 transition-transform"
                  title="My Account"
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </Link>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="p-2 rounded-full text-stone-600 dark:text-stone-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-stone-200/80 dark:border-stone-700 bg-white dark:bg-stone-800 shadow-warm-sm active:scale-95 transition-all"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300 hover:text-red-600" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-full bg-espresso dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-bold"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* Mobile App Bottom Floating Bar Navigation */}
      {!isKitchen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#1A1513]/95 backdrop-blur-lg border-t border-stone-200/70 dark:border-stone-800/80 px-6 py-2 pb-[calc(8px+var(--safe-bottom))] flex items-center justify-around shadow-warm-lg transition-colors">
          <Link
            to="/menu"
            className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${
              location.pathname === '/menu' ? 'text-terracotta' : 'text-taupe dark:text-stone-400'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span>Menu</span>
          </Link>

          <Link
            to="/orders"
            className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${
              location.pathname.startsWith('/orders') ? 'text-terracotta' : 'text-taupe dark:text-stone-400'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Orders</span>
          </Link>

          <Link
            to="/cart"
            className={`relative flex flex-col items-center gap-0.5 text-[11px] font-bold ${
              location.pathname === '/cart' ? 'text-terracotta' : 'text-taupe dark:text-stone-400'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-terracotta text-white text-[9px] flex items-center justify-center font-extrabold">
                  {totalItems}
                </span>
              )}
            </div>
            <span>Cart</span>
          </Link>

          {user ? (
            <button
              type="button"
              onClick={confirmLogout}
              className="flex flex-col items-center gap-0.5 text-[11px] font-bold text-taupe dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${
                location.pathname === '/login' ? 'text-terracotta' : 'text-taupe dark:text-stone-400'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      )}

      {/* Logout Confirmation Modal Popup */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white dark:bg-[#1E1815] rounded-3xl max-w-sm w-full p-6 text-center shadow-warm-xl border border-stone-200/80 dark:border-stone-800 transform transition-all animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-terracotta flex items-center justify-center border border-amber-200/60 dark:border-amber-900/40 shadow-warm-sm">
              <LogOut className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold text-espresso dark:text-stone-100 mb-2">
              Log Out?
            </h3>
            <p className="text-xs sm:text-sm text-taupe dark:text-stone-400 mb-6 leading-relaxed">
              Are you sure you want to log out from <strong>La Roche Cafe</strong>? You will need to verify your number or email when signing back in.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-full border border-stone-200 dark:border-stone-700 text-espresso dark:text-stone-200 font-bold text-xs sm:text-sm hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-3 rounded-full bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs sm:text-sm shadow-glow-terracotta transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

