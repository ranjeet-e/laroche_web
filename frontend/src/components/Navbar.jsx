import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Search, X, ShoppingBag, Clock, User, LogOut, UtensilsCrossed, ChefHat } from 'lucide-react';
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

  const clearSearch = () => {
    setSearchValue('');
    navigate('/menu', { replace: true });
  };

  return (
    <>
      {/* Pinned Frosted Glass Navigation Bar */}
      <nav className="sticky top-0 z-40 w-full h-[72px] bg-[#FAF7F2]/90 backdrop-blur-md border-b border-stone-200/60 px-4 sm:px-6 transition-all duration-300">
        <div className="max-w-7xl h-full mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo & Live Counter */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo2.png"
                alt="La Roche Cafe"
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.png';
                }}
              />
              <span className="hidden sm:inline-block font-serif font-black text-xl tracking-tight text-espresso">
                LA ROCHE <span className="font-sans font-medium text-xs tracking-widest text-terracotta uppercase ml-0.5">CAFE</span>
              </span>
            </Link>

            {/* Live Counter Badge */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-stone-200/70 text-espresso text-xs font-semibold shadow-warm-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Clock className="w-3 h-3 text-taupe ml-0.5" />
              <span>Wait: <strong>~8 mins</strong></span>
            </div>
          </div>

          {/* Search Bar (Menu Page & Public) */}
          {!isKitchen && (
            <div className="flex-1 max-w-md relative">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-taupe absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  className="w-full h-10 pl-10 pr-9 rounded-full bg-white border border-stone-200/80 text-espresso placeholder:text-taupe-light text-xs sm:text-sm font-medium focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 shadow-warm-sm transition-all duration-200"
                  placeholder="Search toasties, pizzas, frappes, coffee..."
                  value={searchValue}
                  onChange={handleSearchChange}
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-3 text-taupe hover:text-espresso p-0.5 rounded-full hover:bg-stone-100 transition-colors"
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
                      ? 'bg-espresso text-white shadow-warm-sm'
                      : 'text-taupe hover:text-espresso hover:bg-white/60'
                  }`}
                >
                  Menu
                </Link>

                {isStudent && (
                  <Link
                    to="/orders"
                    className={`px-3.5 py-2 rounded-full text-sm font-bold transition-all ${
                      location.pathname.startsWith('/orders')
                        ? 'bg-espresso text-white shadow-warm-sm'
                        : 'text-taupe hover:text-espresso hover:bg-white/60'
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
                      : 'bg-white border border-stone-200/80 text-espresso shadow-warm-sm hover:border-terracotta hover:text-terracotta'
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
                  className="px-3.5 py-2 rounded-full text-sm font-bold text-taupe hover:text-espresso hover:bg-white/60"
                >
                  Customer Menu
                </Link>
              </>
            )}

            {/* Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200/80 shadow-warm-sm text-xs font-bold text-espresso"
                  title={user.email || user.phone}
                >
                  <div className="w-6 h-6 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-extrabold">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span>{user.name?.split(' ')[0] || user.phone?.slice(-4) || 'User'}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-full text-taupe hover:text-espresso hover:bg-white transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-espresso hover:bg-espresso-light text-white text-sm font-bold shadow-warm-sm transition-all"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Right Action */}
          <div className="flex md:hidden items-center gap-2">
            {!isKitchen && (
              <Link
                to="/cart"
                className="relative p-2.5 rounded-full bg-white border border-stone-200/80 text-espresso shadow-warm-sm"
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
              <button
                type="button"
                onClick={handleLogout}
                className="w-8 h-8 rounded-full bg-terracotta/10 text-terracotta flex items-center justify-center font-bold text-xs border border-terracotta/20"
                title="Tap to logout"
              >
                {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
              </button>
            ) : (
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-full bg-espresso text-white text-xs font-bold"
              >
                Sign In
              </Link>
            )}
          </div>

        </div>
      </nav>

      {/* Mobile App Bottom Floating Bar Navigation */}
      {!isKitchen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-stone-200/70 px-6 py-2 pb-[calc(8px+var(--safe-bottom))] flex items-center justify-around shadow-warm-lg">
          <Link
            to="/menu"
            className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${
              location.pathname === '/menu' ? 'text-terracotta' : 'text-taupe'
            }`}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span>Menu</span>
          </Link>

          <Link
            to="/orders"
            className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${
              location.pathname.startsWith('/orders') ? 'text-terracotta' : 'text-taupe'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span>Orders</span>
          </Link>

          <Link
            to="/cart"
            className={`relative flex flex-col items-center gap-0.5 text-[11px] font-bold ${
              location.pathname === '/cart' ? 'text-terracotta' : 'text-taupe'
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
              onClick={handleLogout}
              className="flex flex-col items-center gap-0.5 text-[11px] font-bold text-taupe"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className={`flex flex-col items-center gap-0.5 text-[11px] font-bold ${
                location.pathname === '/login' ? 'text-terracotta' : 'text-taupe'
              }`}
            >
              <User className="w-5 h-5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      )}
    </>
  );
};

export default Navbar;