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
  const [showProfileSheet, setShowProfileSheet] = useState(false);

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
    setShowProfileSheet(false);
    navigate('/menu');
  };

  const confirmLogout = () => {
    setShowProfileSheet(false);
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
      <nav className="sticky top-0 z-40 w-full h-[64px] sm:h-[72px] bg-[#FAF7F2]/95 dark:bg-[#14100E]/95 backdrop-blur-md border-b border-stone-200/70 dark:border-stone-800/80 px-3 sm:px-6 transition-colors duration-300">
        <div className="max-w-7xl h-full mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Live Counter */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={isDark ? "/logo.png" : "/logo2.png"}
                alt="La Roche Cafe"
                className="h-8 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
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

          {/* Expanded Search Bar (Takes maximum available width on mobile & desktop) */}
          {!isKitchen && (
            <div className="flex-1 min-w-0 mx-1 sm:mx-2 max-w-lg relative">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-taupe dark:text-stone-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  className="w-full h-9 sm:h-10 pl-8 sm:pl-10 pr-8 sm:pr-9 rounded-full bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-espresso dark:text-stone-100 placeholder:text-taupe-light dark:placeholder:text-stone-500 text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 shadow-warm-sm transition-all duration-200"
                  placeholder="Search dishes..."
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2.5 text-taupe hover:text-espresso dark:text-stone-400 dark:hover:text-stone-200 p-0.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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

          {/* Clean Mobile Right Action (Cart + Profile Avatar Button) */}
          <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
            {!isKitchen && (
              <Link
                to="/cart"
                className="relative p-2 rounded-full bg-white dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-espresso dark:text-stone-200 shadow-warm-sm"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-terracotta text-white text-[9px] flex items-center justify-center font-extrabold shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Profile Avatar Button (PPF) -> Opens Bottom Sheet with Dark Mode & Signout */}
            <button
              type="button"
              onClick={() => setShowProfileSheet(true)}
              className="w-8 h-8 rounded-full bg-[#9F7A60]/15 dark:bg-stone-800 text-[#9F7A60] dark:text-stone-100 border border-[#9F7A60]/30 dark:border-stone-700 flex items-center justify-center font-extrabold text-xs shadow-warm-sm active:scale-95 transition-transform"
              title="Profile & Settings"
              aria-label="Profile and Settings"
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile Profile & Settings Drawer / Bottom Sheet */}
      {showProfileSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm transition-all p-0 sm:p-4"
          onClick={() => setShowProfileSheet(false)}
        >
          <div
            className="w-full sm:max-w-sm bg-white dark:bg-[#1C1715] rounded-t-3xl sm:rounded-3xl p-6 shadow-warm-xl border-t sm:border border-stone-200/80 dark:border-stone-800 transform transition-all animate-slideUp sm:animate-scaleUp max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Top Handle (Mobile) */}
            <div className="w-12 h-1 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-4 sm:hidden" />

            {/* Header User Card */}
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-terracotta/15 text-terracotta flex items-center justify-center text-lg font-black border border-terracotta/30">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-espresso dark:text-white text-base">
                    {user ? user.name : 'Welcome Guest'}
                  </h3>
                  <p className="text-xs text-taupe dark:text-stone-400">
                    {user ? (user.email || user.phone || 'Campus Member') : 'Sign in for pre-orders & passes'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowProfileSheet(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-taupe dark:text-stone-400"
                aria-label="Close profile drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Action Items */}
            <div className="space-y-2">
              
              {/* 1. Dark Mode Toggle Row (Inside PPF) */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-50 dark:bg-[#28211E] border border-stone-200/60 dark:border-stone-800/80">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-stone-800 text-amber-500 shadow-sm">
                    {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-espresso dark:text-stone-100 block">Dark Mode</span>
                    <span className="text-[11px] text-taupe dark:text-stone-400">{isDark ? 'Dark Mocha Theme' : 'Warm Cream Theme'}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`w-12 h-7 rounded-full transition-colors relative p-1 focus:outline-none ${
                    isDark ? 'bg-terracotta' : 'bg-stone-300'
                  }`}
                  aria-label="Toggle theme"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                      isDark ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* 2. My Orders Link */}
              {user && isStudent && (
                <Link
                  to="/orders"
                  onClick={() => setShowProfileSheet(false)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-[#28211E] text-espresso dark:text-stone-200 font-bold text-xs sm:text-sm transition-colors border border-transparent hover:border-stone-200/60 dark:hover:border-stone-800"
                >
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-terracotta">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>My Active & Past Orders</span>
                </Link>
              )}

              {/* 3. Kitchen Dashboard Link (if kitchen) */}
              {user && isKitchen && (
                <Link
                  to="/kitchen/dashboard"
                  onClick={() => setShowProfileSheet(false)}
                  className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-[#28211E] text-espresso dark:text-stone-200 font-bold text-xs sm:text-sm transition-colors"
                >
                  <div className="p-2 rounded-xl bg-terracotta/15 text-terracotta">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <span>Kitchen Live Dashboard</span>
                </Link>
              )}

              {/* 4. Menu Link */}
              <Link
                to="/menu"
                onClick={() => setShowProfileSheet(false)}
                className="flex items-center gap-3 p-3.5 rounded-2xl hover:bg-stone-50 dark:hover:bg-[#28211E] text-espresso dark:text-stone-200 font-bold text-xs sm:text-sm transition-colors"
              >
                <div className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-espresso dark:text-stone-200">
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                <span>Explore Full Menu</span>
              </Link>
            </div>

            {/* Bottom Auth CTA (Sign Out or Sign In) */}
            <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
              {user ? (
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="w-full py-3 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 border border-red-200/60 dark:border-red-900/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Cafe Account</span>
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setShowProfileSheet(false)}
                  className="w-full py-3 rounded-2xl bg-espresso dark:bg-stone-100 text-white dark:text-stone-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-warm-sm"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>

          </div>
        </div>
      )}

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

