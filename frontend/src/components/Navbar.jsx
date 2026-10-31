import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, X, ShoppingBag, User, LogOut, Sun, Moon, Menu as MenuIcon } from 'lucide-react';
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
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Dynamic scroll listener: transparent over hero, changes background as user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 120) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sync search input with query parameter on /menu
  useEffect(() => {
    if (location.pathname === '/menu') {
      const q = searchParams.get('q') || '';
      setSearchValue(q);
    } else {
      setSearchValue('');
    }
  }, [location.pathname, searchParams]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/menu');
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/menu?q=${encodeURIComponent(searchValue.trim())}`);
      setShowSearchModal(false);
    } else {
      navigate('/menu');
      setShowSearchModal(false);
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    navigate('/menu');
    setShowSearchModal(false);
  };

  // On the home/menu hero area, the hero section already displays a prominent search bar.
  // The navbar search bar smoothly reveals when scrolled past the hero, on search results, or on other pages.
  const isHeroPage = (location.pathname === '/' || location.pathname === '/menu') && !searchParams.get('q');
  const showNavSearchBar = scrolled || !isHeroPage || Boolean(searchValue);

  return (
    <>
      {/* Sleek, high-contrast dark coffee header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 w-full bg-[#140D0A]/95 dark:bg-[#0E0A08]/98 backdrop-blur-md border-b border-[#3D281E] shadow-warm-lg text-white transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between h-16 sm:h-20">
          
          {/* 1. LEFT SIDE: HOME, MENU, SEARCH BAR */}
          <div className="flex items-center gap-3 sm:gap-6 flex-1 justify-start">
            {/* Mobile Hamburger Drawer Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-white/10 text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>

            {/* Desktop Left Navigation Links */}
            <nav className="hidden md:flex items-center gap-5 lg:gap-7 font-sans font-extrabold text-xs sm:text-[13px] uppercase tracking-[0.16em]">
              <Link
                to="/"
                className={`transition-colors drop-shadow-sm ${
                  location.pathname === '/' ? 'text-[#F7D070]' : 'text-white hover:text-[#F7D070]'
                }`}
              >
                HOME
              </Link>

              <Link
                to="/menu"
                className={`transition-colors drop-shadow-sm ${
                  location.pathname === '/menu' ? 'text-[#F7D070]' : 'text-white hover:text-[#F7D070]'
                }`}
              >
                MENU
              </Link>
            </nav>

            {/* Desktop Visible Search Bar with 1-Click Clear (Reveals smoothly on scroll or search) */}
            <div
              className={`transition-all duration-300 overflow-hidden flex items-center ${
                showNavSearchBar
                  ? 'opacity-100 max-w-[280px] pointer-events-auto'
                  : 'opacity-0 max-w-0 pointer-events-none'
              }`}
            >
              <form
                onSubmit={handleSearchSubmit}
                className="hidden lg:flex items-center relative"
              >
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => {
                    setSearchValue(e.target.value);
                    if (!e.target.value && location.pathname === '/menu') {
                      navigate('/menu');
                    }
                  }}
                  placeholder="Search dishes..."
                  className="w-44 xl:w-56 h-8.5 pl-8 pr-7 rounded-full bg-[#241712] border border-[#4A3225] text-white text-xs placeholder:text-stone-400 focus:outline-none focus:border-[#F7D070] focus:ring-1 focus:ring-[#F7D070]/30 transition-all font-sans font-medium"
                />
                {searchValue ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2 p-0.5 rounded-full text-stone-400 hover:text-white transition-colors cursor-pointer"
                    title="Clear search"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : null}
              </form>
            </div>

            {/* Tablet Search Button */}
            {showNavSearchBar && (
              <button
                type="button"
                onClick={() => setShowSearchModal(true)}
                className="hidden md:inline-flex lg:hidden items-center gap-1.5 text-white hover:text-[#F7D070] transition-colors drop-shadow-sm cursor-pointer p-1"
                title="Search Dishes"
                aria-label="Search Dishes"
              >
                <Search className="w-4 h-4 stroke-[2.2]" />
                <span className="text-[11px] font-bold tracking-wider opacity-90">
                  {searchValue ? `"${searchValue}"` : 'SEARCH'}
                </span>
              </button>
            )}
          </div>

          {/* 2. CENTER: BIGGER LA ROCHE LOGO */}
          <div className="flex items-center justify-center flex-shrink-0 px-2 sm:px-6">
            <Link
              to="/"
              className="flex items-center justify-center group"
              title="La Roche Cafe Home"
            >
              <img
                src="/logo.png"
                alt="La Roche Cafe"
                className="h-11 sm:h-14 lg:h-16 w-auto object-contain brightness-110 drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* 3. RIGHT SIDE: CONTACT, DARK MODE, CART, PROFILE */}
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 flex-1 justify-end">
            {/* Desktop Contact Link */}
            <a
              href="#footer-section"
              className="hidden md:inline-block font-sans font-extrabold text-xs sm:text-[13px] uppercase tracking-[0.16em] text-white hover:text-[#F7D070] transition-colors drop-shadow-sm"
            >
              CONTACT
            </a>

            {/* Mobile Search Icon */}
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="md:hidden p-2 rounded-full hover:bg-white/10 text-white transition-colors drop-shadow-sm"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* DARK MODE SWITCH */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 text-white transition-colors drop-shadow-sm"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-stone-200" />
              )}
            </button>

            {/* CART (Shopping bag with total count badge) */}
            {!isKitchen && !isCms && (
              <Link
                to="/cart"
                className="relative p-2 rounded-full hover:bg-white/10 text-white transition-colors drop-shadow-sm group"
                aria-label="Shopping Cart"
                title="View Cart"
              >
                <ShoppingBag className="w-5 h-5 sm:w-5 sm:h-5 stroke-[1.8]" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#E85D04] text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-md">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* PROFILE / ACCOUNT BUTTON */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={isCms ? '/cms/dashboard' : isKitchen ? '/kitchen/dashboard' : '/orders'}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/30 border border-white/40 flex items-center justify-center text-white transition-all shadow-sm font-extrabold text-xs"
                  title={user.name || user.email || 'My Profile'}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </Link>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="hidden lg:inline-flex p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors drop-shadow-sm flex items-center gap-1.5"
                title="Sign In / Profile"
                aria-label="Profile"
              >
                <User className="w-5 h-5 stroke-[1.8]" />
              </Link>
            )}
          </div>

        </div>

        {/* Quick Search Modal / Overlay */}
        {showSearchModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-md animate-spring-pop">
            <div className="bg-[#140D0A] border border-stone-700/80 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-warm-2xl relative">
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-serif font-bold text-white mb-3">
                Search Menu Items
              </h3>

              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-stone-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  className="w-full h-11 pl-11 pr-24 rounded-xl bg-stone-900 border border-stone-700 text-white placeholder:text-stone-400 text-sm font-medium focus:outline-none focus:border-[#A6472B] focus:ring-2 focus:ring-[#A6472B]/20"
                  placeholder="Toasties, cold brews, pizzas, pasta..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-[#A6472B] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#7E351F] transition-all cursor-pointer"
                >
                  Search
                </button>
              </form>

              {searchValue && (
                <div className="mt-3 flex items-center justify-between text-xs text-stone-400">
                  <span>Current search: <strong>"{searchValue}"</strong></span>
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-amber-400 hover:underline font-bold"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 mx-3 p-4 bg-[#140D0A]/95 dark:bg-[#0E0A08]/98 backdrop-blur-md rounded-2xl border border-stone-800 shadow-2xl flex flex-col gap-2 font-sans font-bold text-xs uppercase tracking-wider text-white animate-spring-pop">
            <Link
              to="/"
              className="px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/menu"
              className="px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              Menu
            </Link>
            <a
              href="#footer-section"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              Contact
            </a>
            {isStudent && (
              <Link
                to="/orders"
                className="px-3 py-2.5 rounded-xl text-[#F7D070] hover:bg-white/10 transition-colors"
              >
                My Orders
              </Link>
            )}
            {isKitchen && (
              <Link
                to="/kitchen/dashboard"
                className="px-3 py-2.5 rounded-xl text-amber-300 hover:bg-white/10 transition-colors"
              >
                Kitchen Dashboard
              </Link>
            )}
            {isCms && (
              <Link
                to="/cms/dashboard"
                className="px-3 py-2.5 rounded-xl text-amber-300 hover:bg-white/10 transition-colors"
              >
                CMS Portal
              </Link>
            )}
            {user ? (
              <button
                type="button"
                onClick={confirmLogout}
                className="px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-950/40 text-left flex items-center gap-2 mt-2 pt-2 border-t border-stone-800"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.name || 'Account'})</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-2.5 rounded-xl bg-[#A6472B] text-white text-center shadow-warm-sm mt-2"
              >
                Sign In / Profile
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FFF9EC] dark:bg-[#23231C] rounded-3xl border border-[#ECD5A5] dark:border-[#3D3D30] max-w-sm w-full p-6 text-center shadow-warm-2xl animate-spring-pop">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-serif font-bold text-[#2A2A22] dark:text-white mb-2">
              Sign out of La Roche?
            </h3>
            <p className="text-xs sm:text-sm text-[#5A5748] dark:text-[#C4BFB2] mb-6 font-sans">
              You will need to sign in again to place preorders and track counter pickups.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-full border border-[#ECD5A5] dark:border-[#3D3D30] text-[#2A2A22] dark:text-white font-bold text-xs hover:bg-[#F9EAC7] dark:hover:bg-[#2F2F26] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-warm-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
