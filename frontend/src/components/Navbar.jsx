import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, X, ShoppingBag, Clock, User, LogOut, UtensilsCrossed, ChefHat, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isStudent, isKitchen, isCms } = useAuth();
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
      {/* Pinned Frosted Glass Navigation Bar with Safe Area Clearance */}
      <nav className="sticky top-0 z-40 w-full pt-[max(env(safe-area-inset-top),10px)] sm:pt-0 bg-[#F9EAC7]/95 dark:bg-[#1A1A14]/95 backdrop-blur-md border-b border-[#ECD5A5] dark:border-[#3D3D30] px-3 sm:px-6 transition-colors duration-300">
        <div className="max-w-7xl h-[62px] sm:h-[72px] mx-auto flex items-center justify-between gap-3 sm:gap-4">

          {/* Brand Logo & Live Counter */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={isDark ? "/logo.png" : "/logo2.png"}
                alt="La Roche Cafe"
                className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Live Counter Badge */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9EC] dark:bg-[#23231C] border border-[#ECD5A5] dark:border-[#3D3D30] text-[#2A2A22] dark:text-[#F2EDE2] text-xs font-semibold shadow-warm-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Clock className="w-3 h-3 text-[#5A5748] dark:text-[#C4BFB2] ml-0.5" />
              <span>Wait: <strong>~8 mins</strong></span>
            </div>
          </div>

          {/* Search Bar (Menu Page & Public) */}
          {!isKitchen && !isCms && (
            <div className="flex-1 max-w-md relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-[#5A5748] dark:text-[#C4BFB2] absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  className="w-full h-10 pl-10 pr-9 rounded-full bg-[#FFF9EC] dark:bg-[#23231C] border border-[#ECD5A5] dark:border-[#3D3D30] text-[#2A2A22] dark:text-white placeholder:text-[#5A5748]/70 dark:placeholder:text-[#C4BFB2]/70 text-xs sm:text-sm font-medium focus:outline-none focus:border-[#A6472B] focus:ring-2 focus:ring-[#A6472B]/20 shadow-warm-sm transition-all duration-200"
                  placeholder="Search toasties, pizzas, frappes, coffee..."
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 text-[#5A5748] hover:text-[#2A2A22] dark:text-[#C4BFB2] dark:hover:text-white p-0.5 rounded-full hover:bg-[#F9EAC7] dark:hover:bg-[#2F2F26] transition-colors"
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
            {isCms ? (
              <>
                <Link
                  to="/cms/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2A2A22] dark:bg-[#A6472B] text-white text-sm font-bold shadow-warm-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>CMS Portal</span>
                </Link>
                <Link
                  to="/menu"
                  className="px-3.5 py-2 rounded-full text-sm font-bold text-[#5A5748] dark:text-[#C4BFB2] hover:text-[#2A2A22] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#23231C]"
                >
                  Customer Menu
                </Link>
              </>
            ) : isKitchen ? (
              <>
                <Link
                  to="/kitchen/dashboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#A6472B] hover:bg-[#7E351F] text-white text-sm font-bold shadow-glow-terracotta"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Kitchen Dashboard</span>
                </Link>
                <Link
                  to="/menu"
                  className="px-3.5 py-2 rounded-full text-sm font-bold text-[#5A5748] dark:text-[#C4BFB2] hover:text-[#2A2A22] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#23231C]"
                >
                  Customer Menu
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/menu"
                  className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${location.pathname === '/menu'
                    ? 'bg-[#2A2A22] dark:bg-[#A6472B] text-white shadow-warm-sm'
                    : 'text-[#5A5748] dark:text-[#C4BFB2] hover:text-[#2A2A22] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#23231C]'
                    }`}
                >
                  Menu
                </Link>

                {isStudent && (
                  <Link
                    to="/orders"
                    className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${location.pathname.startsWith('/orders')
                      ? 'bg-[#2A2A22] dark:bg-[#A6472B] text-white shadow-warm-sm'
                      : 'text-[#5A5748] dark:text-[#C4BFB2] hover:text-[#2A2A22] dark:hover:text-white hover:bg-white/60 dark:hover:bg-[#23231C]'
                      }`}
                  >
                    My Orders
                  </Link>
                )}

                <Link
                  to="/cart"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${location.pathname === '/cart'
                    ? 'bg-[#A6472B] text-white shadow-glow-terracotta'
                    : 'bg-[#FFF9EC] dark:bg-[#23231C] border border-[#ECD5A5] dark:border-[#3D3D30] text-[#2A2A22] dark:text-[#F2EDE2] shadow-warm-sm hover:border-[#A6472B] hover:text-[#A6472B]'
                    }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cart</span>
                  {totalItems > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#A6472B] text-white text-xs flex items-center justify-center font-extrabold shadow-sm">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </>
            )}

            {/* Dark / Light Mode Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-full border border-[#ECD5A5] dark:border-[#3D3D30] bg-[#FFF9EC] dark:bg-[#23231C] text-[#2A2A22] dark:text-[#F2EDE2] shadow-warm-sm hover:scale-105 active:scale-95 transition-all"
              title={isDark ? 'Switch to Warm Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#ECD5A5] dark:border-[#3D3D30]">
                <Link
                  to={isCms ? '/cms/dashboard' : isKitchen ? '/kitchen/dashboard' : '/orders'}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF9EC] dark:bg-[#23231C] border border-[#ECD5A5] dark:border-[#3D3D30] shadow-warm-sm text-xs font-bold text-[#2A2A22] dark:text-white hover:border-[#A6472B] transition-colors"
                  title={user.email || user.phone || 'My Account'}
                >
                  <div className="w-6 h-6 rounded-full bg-[#A6472B]/15 text-[#A6472B] dark:text-[#E9E0CC] flex items-center justify-center font-extrabold text-[11px]">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{user.name?.split(' ')[0] || user.phone?.slice(-4) || 'User'}</span>
                </Link>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="p-2 rounded-full text-[#5A5748] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#A6472B] hover:bg-[#7E351F] text-white text-sm font-bold shadow-warm-sm transition-all"
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
              className="p-2 rounded-full border border-[#ECD5A5] dark:border-[#3D3D30] bg-[#FFF9EC] dark:bg-[#23231C] text-[#2A2A22] dark:text-[#F2EDE2] shadow-warm-sm transition-all"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {!isKitchen && !isCms && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full bg-[#FFF9EC] dark:bg-[#23231C] border border-[#ECD5A5] dark:border-[#3D3D30] text-[#2A2A22] dark:text-[#F2EDE2] shadow-warm-sm"
                aria-label="Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#A6472B] text-white text-[10px] flex items-center justify-center font-extrabold shadow-sm">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-1.5">
                <Link
                  to={isCms ? '/cms/dashboard' : isKitchen ? '/kitchen/dashboard' : '/orders'}
                  className="w-8 h-8 rounded-full bg-[#A6472B]/15 text-[#A6472B] dark:text-[#E9E0CC] flex items-center justify-center font-bold text-xs border border-[#A6472B]/30 shadow-warm-sm active:scale-95 transition-transform"
                  title="My Account"
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                </Link>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="p-2 rounded-full text-[#5A5748] dark:text-[#C4BFB2] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-[#ECD5A5] dark:border-[#3D3D30] bg-[#FFF9EC] dark:bg-[#23231C] shadow-warm-sm active:scale-95 transition-all"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-full bg-[#A6472B] hover:bg-[#7E351F] text-white text-xs font-bold"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* Mobile App Bottom Floating Bar Navigation */}
      {!isKitchen && !isCms && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#F9EAC7]/95 dark:bg-[#1A1A14]/95 backdrop-blur-lg border-t border-[#ECD5A5] dark:border-[#3D3D30] px-6 py-2 pb-[calc(8px+var(--safe-bottom))] flex items-center justify-around shadow-warm-lg transition-colors">
          <Link
            to="/menu"
            className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${location.pathname === '/menu' ? 'text-[#A6472B]' : 'text-[#5A5748] dark:text-[#C4BFB2]'
              }`}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span>Menu</span>
          </Link>

          <Link
            to="/orders"
            className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${location.pathname.startsWith('/orders') ? 'text-[#A6472B]' : 'text-[#5A5748] dark:text-[#C4BFB2]'
              }`}
          >
            <Clock className="w-5 h-5" />
            <span>Orders</span>
          </Link>

          <Link
            to="/cart"
            className={`relative flex flex-col items-center gap-0.5 text-[11px] font-bold ${location.pathname === '/cart' ? 'text-[#A6472B]' : 'text-[#5A5748] dark:text-[#C4BFB2]'
              }`}
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#A6472B] text-white text-[9px] flex items-center justify-center font-extrabold">
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
              className="flex flex-col items-center gap-0.5 text-[11px] font-bold text-[#5A5748] dark:text-[#C4BFB2] hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${location.pathname === '/login' ? 'text-[#A6472B]' : 'text-[#5A5748] dark:text-[#C4BFB2]'
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
            className="bg-[#FFF9EC] dark:bg-[#23231C] rounded-3xl max-w-sm w-full p-6 text-center shadow-warm-xl border border-[#ECD5A5] dark:border-[#3D3D30] transform transition-all animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#F9EAC7] dark:bg-[#2F2F26] text-[#A6472B] flex items-center justify-center border border-[#ECD5A5] dark:border-[#3D3D30] shadow-warm-sm">
              <LogOut className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h3 className="text-xl font-bold text-[#2A2A22] dark:text-white mb-2">
              Log Out?
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5748] dark:text-[#C4BFB2] mb-6 leading-relaxed">
              Are you sure you want to log out from <strong>La Roche Cafe</strong>? 
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-full border border-[#ECD5A5] dark:border-[#3D3D30] text-[#2A2A22] dark:text-[#E9E0CC] font-bold text-xs sm:text-sm hover:bg-[#F9EAC7] dark:hover:bg-[#2F2F26] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-3 rounded-full bg-[#A6472B] hover:bg-[#7E351F] text-white font-bold text-xs sm:text-sm shadow-glow-terracotta transition-all"
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

